import React, { useState, useEffect } from 'react';
import { useSerialSensor } from './hooks/useSerialSensor';
import GaugeChart from './components/GaugeChart';
import LiveChart from './components/LiveChart';
import StatusCard from './components/StatusCard';
import StatCard from './components/StatCard';
import LCDDisplay from './components/LCDDisplay';
import SerialMonitor from './components/SerialMonitor';
import {
  Thermometer,
  Droplets,
  Usb,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Activity,
  Cpu,
  Wifi,
  Bell,
  Power,
  Loader2,
  Unplug,
  ExternalLink,
  Monitor,
} from 'lucide-react';

// Detect if running inside an iframe
function useIsIframe() {
  const [isIframe, setIsIframe] = useState(false);
  useEffect(() => {
    try {
      setIsIframe(window.self !== window.top);
    } catch {
      setIsIframe(true); // cross-origin iframe
    }
  }, []);
  return isIframe;
}

// Iframe blocker overlay
const IframeBlocker: React.FC = () => {
  const handleOpenNewTab = () => {
    // Get the current page URL and open it directly in a new tab
    const url = window.location.href;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center p-6">
      <div className="max-w-lg w-full">
        <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-8 md:p-10 text-center">
          {/* Icon */}
          <div className="w-20 h-20 mx-auto mb-6 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20">
            <Monitor className="w-10 h-10 text-amber-400" />
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold mb-3 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Open in New Tab
          </h1>

          {/* Explanation */}
          <p className="text-slate-400 mb-2">
            The <span className="text-green-400 font-mono text-sm">Web Serial API</span> requires a direct browser window to access your COM port.
          </p>
          <p className="text-slate-500 text-sm mb-8">
            Embedded iframes block serial port permissions for security. Click below to open this dashboard in a new tab where it works perfectly.
          </p>

          {/* Open Button */}
          <button
            onClick={handleOpenNewTab}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold px-8 py-4 rounded-xl transition-all duration-200 shadow-lg shadow-green-500/20 hover:shadow-green-500/40 text-lg mb-4"
          >
            <ExternalLink className="w-5 h-5" />
            Open in New Tab
          </button>

          {/* Steps */}
          <div className="bg-slate-900/60 rounded-xl p-4 text-left space-y-2">
            <p className="text-slate-500 text-xs uppercase tracking-wider mb-3 text-center">Then in the new tab:</p>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 text-xs flex items-center justify-center font-bold shrink-0">1</span>
              <p className="text-slate-400 text-sm">Click <span className="text-green-400 font-medium">"Connect COM Port"</span></p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 text-xs flex items-center justify-center font-bold shrink-0">2</span>
              <p className="text-slate-400 text-sm">Select <span className="text-cyan-400 font-mono">COM14</span> from the popup</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 text-xs flex items-center justify-center font-bold shrink-0">3</span>
              <p className="text-slate-400 text-sm">Watch live data from your Arduino! 🎉</p>
            </div>
          </div>

          {/* Note */}
          <p className="text-slate-600 text-xs mt-4">
            ⚠️ Close Arduino IDE Serial Monitor before connecting — only one app can use the COM port at a time.
          </p>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const isIframe = useIsIframe();
  const sensor = useSerialSensor();

  // If inside iframe, show blocker with "Open in New Tab" button
  if (isIframe) {
    return <IframeBlocker />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10 blur-3xl transition-colors duration-1000"
          style={{ backgroundColor: sensor.alarmState ? '#ef4444' : '#06b6d4' }}
        />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500 rounded-full opacity-10 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-6 md:py-10">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                  <Cpu className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Smart Climate Monitor
                </h1>
              </div>
              <p className="text-slate-400 text-sm ml-[52px]">
                Arduino Nano 33 BLE • DHT11 Sensor • USB Serial Connection
              </p>
            </div>
            <div className="flex items-center gap-3 ml-[52px] md:ml-0">
              {/* Serial Connect Button */}
              {!sensor.serialConnected ? (
                <button
                  onClick={sensor.connect}
                  disabled={sensor.serialConnecting || !sensor.isSupported}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium px-4 py-2 rounded-full transition-all duration-200 shadow-lg shadow-green-500/20 hover:shadow-green-500/40"
                >
                  {sensor.serialConnecting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Usb className="w-4 h-4" />
                      Connect COM Port
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={sensor.disconnect}
                  className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-medium px-4 py-2 rounded-full transition-all duration-200"
                >
                  <Unplug className="w-4 h-4" />
                  Disconnect
                </button>
              )}
              <div className="flex items-center gap-2 bg-slate-800/60 rounded-full px-4 py-2 border border-slate-700/50">
                <span
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{
                    backgroundColor: sensor.sensorError ? '#ef4444' : sensor.serialConnected ? '#22c55e' : '#f59e0b',
                    boxShadow: `0 0 8px ${sensor.sensorError ? '#ef4444' : sensor.serialConnected ? '#22c55e' : '#f59e0b'}`,
                  }}
                />
                <span className="text-sm text-slate-300">
                  {sensor.sensorError ? 'Sensor Error' : sensor.serialConnected ? 'Live • COM' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Connection Card - Show when not connected */}
        {!sensor.serialConnected && (
          <div className="mb-6 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-20 h-20 bg-green-500/10 rounded-2xl flex items-center justify-center">
                <Usb className="w-10 h-10 text-green-400" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-xl font-bold text-white mb-2">Connect via USB Serial (COM Port)</h2>
                <p className="text-slate-400 mb-4">
                  Click "Connect COM Port" and select <span className="text-green-400 font-mono">COM14</span> from the popup.
                  Make sure your Arduino Nano 33 BLE is connected via USB.
                </p>
                {sensor.error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2 text-red-400 text-sm mb-4">
                    ⚠️ {sensor.error}
                  </div>
                )}
                {!sensor.isSupported && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-2 text-yellow-400 text-sm">
                    ⚠️ Web Serial is not supported in this browser. Please use Chrome or Edge.
                  </div>
                )}
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    Baud Rate: 115200
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full" />
                    Data Bits: 8
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    No Parity
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                    1 Stop Bit
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <button
                  onClick={sensor.connect}
                  disabled={sensor.serialConnecting || !sensor.isSupported}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold px-8 py-4 rounded-xl transition-all duration-200 shadow-lg shadow-green-500/20 hover:shadow-green-500/40 text-lg"
                >
                  {sensor.serialConnecting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Power className="w-5 h-5" />
                      Connect COM14
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Alarm Banner */}
        {sensor.alarmState && sensor.serialConnected && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center gap-4 animate-pulse">
            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <p className="text-red-400 font-bold text-lg">⚠️ Temperature Alarm Active</p>
              <p className="text-red-300/70 text-sm">
                Temperature ({sensor.currentTemp.toFixed(1)}°C) exceeds threshold of 33.0°C — Buzzer is ON
              </p>
            </div>
          </div>
        )}

        {/* Gauges + Status Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Temperature Gauge */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
            <div className="flex items-center gap-2 mb-2">
              <Thermometer className="w-5 h-5 text-cyan-400" />
              <h3 className="text-white font-semibold">Temperature</h3>
            </div>
            <GaugeChart
              value={sensor.currentTemp}
              min={0}
              max={50}
              unit="°C"
              label="DHT11 Sensor"
              color="#06b6d4"
              warningThreshold={28}
              dangerThreshold={33}
            />
            <div className="grid grid-cols-3 gap-2 mt-4">
              <StatCard
                label="Min"
                value={`${sensor.minTemp.toFixed(1)}°`}
                icon={<TrendingDown className="w-4 h-4" />}
                color="#22d3ee"
              />
              <StatCard
                label="Avg"
                value={`${sensor.avgTemp.toFixed(1)}°`}
                icon={<Activity className="w-4 h-4" />}
                color="#06b6d4"
              />
              <StatCard
                label="Max"
                value={`${sensor.maxTemp.toFixed(1)}°`}
                icon={<TrendingUp className="w-4 h-4" />}
                color="#0891b2"
              />
            </div>
          </div>

          {/* Humidity Gauge */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="w-5 h-5 text-blue-400" />
              <h3 className="text-white font-semibold">Humidity</h3>
            </div>
            <GaugeChart
              value={sensor.currentHum}
              min={0}
              max={100}
              unit="%"
              label="Relative Humidity"
              color="#3b82f6"
              warningThreshold={70}
              dangerThreshold={85}
            />
            <div className="grid grid-cols-3 gap-2 mt-4">
              <StatCard
                label="Min"
                value={`${sensor.minHum.toFixed(1)}%`}
                icon={<TrendingDown className="w-4 h-4" />}
                color="#60a5fa"
              />
              <StatCard
                label="Avg"
                value={`${sensor.avgHum.toFixed(1)}%`}
                icon={<Activity className="w-4 h-4" />}
                color="#3b82f6"
              />
              <StatCard
                label="Max"
                value={`${sensor.maxHum.toFixed(1)}%`}
                icon={<TrendingUp className="w-4 h-4" />}
                color="#2563eb"
              />
            </div>
          </div>

          {/* Status Panel */}
          <div className="flex flex-col gap-4">
            <StatusCard
              icon={<Usb className="w-5 h-5" />}
              label="Serial Connection"
              value={sensor.serialConnected ? 'Connected • COM Port' : 'Not Connected'}
              active={sensor.serialConnected}
              activeColor="#22c55e"
            />
            <StatusCard
              icon={<Bell className="w-5 h-5" />}
              label="Temperature Alarm"
              value={sensor.alarmState ? 'ACTIVE — Buzzer ON' : 'Normal'}
              active={sensor.alarmState}
              activeColor="#ef4444"
            />
            <StatusCard
              icon={<Wifi className="w-5 h-5" />}
              label="Sensor Status"
              value={sensor.sensorError ? 'DHT11 Error' : sensor.serialConnected ? 'Receiving Data' : 'Waiting'}
              active={sensor.serialConnected && !sensor.sensorError}
              activeColor="#22c55e"
            />
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-4">
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">Device Info</p>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Board</span>
                  <span className="text-slate-200 font-mono text-xs">Nano 33 BLE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Sensor</span>
                  <span className="text-slate-200 font-mono text-xs">DHT11</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Threshold</span>
                  <span className="text-red-400 font-mono text-xs">33.0°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Baud Rate</span>
                  <span className="text-green-400 font-mono text-xs">115200</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Readings</span>
                  <span className="text-cyan-400 font-mono text-xs">{sensor.history.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <LiveChart
            data={sensor.history}
            dataKey="temperature"
            color="#06b6d4"
            gradientId="tempGradient"
            label="Temperature History"
            unit="°C"
            referenceLine={33}
            referenceLabel="Alarm"
          />
          <LiveChart
            data={sensor.history}
            dataKey="humidity"
            color="#3b82f6"
            gradientId="humGradient"
            label="Humidity History"
            unit="%"
          />
        </div>

        {/* LCD + Serial Monitor */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <LCDDisplay
            temperature={sensor.currentTemp}
            humidity={sensor.currentHum}
            alarmState={sensor.alarmState}
            bleConnected={sensor.serialConnected}
            sensorError={sensor.sensorError}
          />
          <SerialMonitor
            history={sensor.history}
            rawLogs={sensor.rawLogs}
            serialConnected={sensor.serialConnected}
            alarmState={sensor.alarmState}
          />
        </div>

        {/* Circuit Info Footer */}
        <footer className="text-center py-6 border-t border-slate-800">
          <div className="flex flex-wrap justify-center gap-6 mb-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              DHT11 → Pin D12
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
              Buzzer → Pin D11
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              RGB LCD → I2C (SDA/SCL)
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              USB Serial → COM14
            </div>
          </div>
          <p className="text-slate-600 text-xs">
            Smart Climate Monitor Dashboard • Real-time Serial data from Arduino Nano 33 BLE @ 115200 baud
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;
