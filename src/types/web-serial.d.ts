// Web Serial API Type Definitions

interface SerialPortInfo {
  usbVendorId?: number;
  usbProductId?: number;
}

interface SerialOptions {
  baudRate: number;
  dataBits?: 7 | 8;
  stopBits?: 1 | 2;
  parity?: 'none' | 'even' | 'odd';
  bufferSize?: number;
  flowControl?: 'none' | 'hardware';
}

interface SerialPort extends EventTarget {
  readonly readable: ReadableStream<Uint8Array> | null;
  readonly writable: WritableStream<Uint8Array> | null;
  getInfo(): SerialPortInfo;
  open(options: SerialOptions): Promise<void>;
  close(): Promise<void>;
  setSignals(signals: SerialOutputSignals): Promise<void>;
  getSignals(): Promise<SerialInputSignals>;
  addEventListener(type: 'connect', listener: (event: Event) => void): void;
  addEventListener(type: 'disconnect', listener: (event: Event) => void): void;
  removeEventListener(type: 'connect', listener: (event: Event) => void): void;
  removeEventListener(type: 'disconnect', listener: (event: Event) => void): void;
}

interface SerialOutputSignals {
  dataTerminalReady?: boolean;
  requestToSend?: boolean;
  break?: boolean;
}

interface SerialInputSignals {
  dataCarrierDetect: boolean;
  clearToSend: boolean;
  ringIndicator: boolean;
  dataSetReady: boolean;
}

interface SerialPortRequestOptions {
  filters?: SerialPortFilter[];
}

interface SerialPortFilter {
  usbVendorId?: number;
  usbProductId?: number;
}

interface Serial extends EventTarget {
  getPorts(): Promise<SerialPort[]>;
  requestPort(options?: SerialPortRequestOptions): Promise<SerialPort>;
  addEventListener(type: 'connect', listener: (event: Event) => void): void;
  addEventListener(type: 'disconnect', listener: (event: Event) => void): void;
  removeEventListener(type: 'connect', listener: (event: Event) => void): void;
  removeEventListener(type: 'disconnect', listener: (event: Event) => void): void;
}

interface Navigator {
  serial?: Serial;
}
