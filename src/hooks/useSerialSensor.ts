import { useState, useCallback, useRef, useEffect } from 'react';
import '../types/web-serial.d.ts';

export interface SensorReading {
  temperature: number;
  humidity: number;
  timestamp: number;
}

export interface SerialSensorState {
  currentTemp: number;
  currentHum: number;
  history: SensorReading[];
  alarmState: boolean;
  serialConnected: boolean;
  serialConnecting: boolean;
  sensorError: boolean;
  minTemp: number;
  maxTemp: number;
  avgTemp: number;
  minHum: number;
  maxHum: number;
  avgHum: number;
  portInfo: string | null;
  error: string | null;
  rawLogs: string[];
}

const TEMP_THRESHOLD = 33.0;
const MAX_HISTORY = 120;
const MAX_LOGS = 50;
const BAUD_RATE = 115200;

export function useSerialSensor() {
  const [state, setState] = useState<SerialSensorState>({
    currentTemp: 0,
    currentHum: 0,
    history: [],
    alarmState: false,
    serialConnected: false,
    serialConnecting: false,
    sensorError: false,
    minTemp: 0,
    maxTemp: 0,
    avgTemp: 0,
    minHum: 0,
    maxHum: 0,
    avgHum: 0,
    portInfo: null,
    error: null,
    rawLogs: [],
  });

  const portRef = useRef<SerialPort | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const isReadingRef = useRef(false);

  // ────────────────────────────────────────────────
  // Ref-based line handler (avoids stale closures)
  // ────────────────────────────────────────────────
  const onLineRef = useRef<(line: string) => void>(() => {});

  // Keep the ref always pointing to the latest handler
  useEffect(() => {
    onLineRef.current = (line: string) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // Push raw log
      setState(prev => ({
        ...prev,
        rawLogs: [
          ...prev.rawLogs,
          `[${new Date().toLocaleTimeString('en-US', { hour12: false })}] ${trimmed}`,
        ].slice(-MAX_LOGS),
      }));

      // Check sensor error
      if (trimmed.includes('Failed to read DHT11') || trimmed.includes('Sensor Error')) {
        setState(prev => ({ ...prev, sensorError: true }));
        return;
      }

      // Parse: "Temperature : 26.5 C   Humidity : 55.0 %"
      const tempMatch = trimmed.match(/Temperature\s*:\s*([\d.]+)/i);
      const humMatch = trimmed.match(/Humidity\s*:\s*([\d.]+)/i);

      if (tempMatch && humMatch) {
        const temp = parseFloat(tempMatch[1]);
        const hum = parseFloat(humMatch[1]);

        if (isNaN(temp) || isNaN(hum)) {
          setState(prev => ({ ...prev, sensorError: true }));
          return;
        }

        const reading: SensorReading = {
          temperature: temp,
          humidity: hum,
          timestamp: Date.now(),
        };

        setState(prev => {
          const newHistory = [...prev.history, reading].slice(-MAX_HISTORY);
          const temps = newHistory.map(r => r.temperature);
          const hums = newHistory.map(r => r.humidity);

          return {
            ...prev,
            currentTemp: temp,
            currentHum: hum,
            history: newHistory,
            alarmState: temp >= TEMP_THRESHOLD,
            sensorError: false,
            minTemp: Math.min(...temps),
            maxTemp: Math.max(...temps),
            avgTemp: Math.round((temps.reduce((a, b) => a + b, 0) / temps.length) * 10) / 10,
            minHum: Math.min(...hums),
            maxHum: Math.max(...hums),
            avgHum: Math.round((hums.reduce((a, b) => a + b, 0) / hums.length) * 10) / 10,
          };
        });
      }
    };
  }); // runs every render → ref always fresh

  // ────────────────────────────────────────────────
  // Read loop (uses ref, never goes stale)
  // ────────────────────────────────────────────────
  const readLoop = useCallback(async () => {
    if (!portRef.current?.readable) return;

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      readerRef.current = portRef.current.readable.getReader();
      isReadingRef.current = true;

      while (isReadingRef.current) {
        const { value, done } = await readerRef.current.read();

        if (done) break;

        if (value) {
          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            onLineRef.current(line);          // ← ref call, always latest
          }
        }
      }
    } catch (error) {
      if (isReadingRef.current) {
        console.error('Read error:', error);
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Read error',
        }));
      }
    } finally {
      if (readerRef.current) {
        readerRef.current.releaseLock();
        readerRef.current = null;
      }
    }
  }, []);                                      // ← no deps needed

  // ────────────────────────────────────────────────
  // Connect
  // ────────────────────────────────────────────────
  const connect = useCallback(async () => {
    if (!navigator.serial) {
      setState(prev => ({
        ...prev,
        error: 'Web Serial is not supported in this browser. Use Chrome or Edge.',
      }));
      return;
    }

    setState(prev => ({ ...prev, serialConnecting: true, error: null, rawLogs: [] }));

    try {
      const port = await navigator.serial.requestPort();
      portRef.current = port;

      const info = port.getInfo();
      const portInfo = `USB ${info.usbVendorId ? `(VID:0x${info.usbVendorId.toString(16).toUpperCase()})` : ''}`;

      await port.open({
        baudRate: BAUD_RATE,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        flowControl: 'none',
      });

      setState(prev => ({
        ...prev,
        serialConnected: true,
        serialConnecting: false,
        portInfo,
        error: null,
        rawLogs: [
          '--- Serial Connection Established ---',
          `Baud Rate: ${BAUD_RATE}`,
          'Waiting for sensor data...',
        ],
      }));

      readLoop();
    } catch (error) {
      console.error('Serial connection error:', error);
      setState(prev => ({
        ...prev,
        serialConnected: false,
        serialConnecting: false,
        error: error instanceof Error ? error.message : 'Failed to connect',
      }));
    }
  }, [readLoop]);

  // ────────────────────────────────────────────────
  // Disconnect
  // ────────────────────────────────────────────────
  const disconnect = useCallback(async () => {
    isReadingRef.current = false;

    try {
      if (readerRef.current) {
        await readerRef.current.cancel();
        readerRef.current.releaseLock();
        readerRef.current = null;
      }
      if (portRef.current) {
        await portRef.current.close();
        portRef.current = null;
      }
    } catch (error) {
      console.error('Disconnect error:', error);
    }

    setState(prev => ({
      ...prev,
      serialConnected: false,
      portInfo: null,
      rawLogs: [...prev.rawLogs, '--- Disconnected ---'],
    }));
  }, []);

  return {
    ...state,
    connect,
    disconnect,
    isSupported: typeof navigator !== 'undefined' && !!navigator.serial,
  };
}
