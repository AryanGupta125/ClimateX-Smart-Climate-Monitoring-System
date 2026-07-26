# 🌡️ ClimateX — Smart Climate Monitoring System

ClimateX is a real-time **temperature and humidity monitoring and alert system** built using the **Arduino Nano 33 BLE**, DHT11 sensor, Grove RGB LCD, active buzzer, and a Python-based web dashboard.

The system continuously monitors environmental conditions, displays the readings locally on an LCD, activates an audible alarm when the temperature reaches a predefined threshold, and transfers sensor data from the Arduino to a computer through **USB Serial (COM Port)** for visualization on an interactive localhost web dashboard.

---

## 📌 Project Overview

ClimateX combines embedded hardware with web technologies to provide real-time environmental monitoring.

The system measures:

- 🌡️ Temperature
- 💧 Humidity
- 🔔 High-temperature alarm status
- 🔌 Hardware connection status

When the temperature reaches or exceeds 30°C, the buzzer is activated.

---

## ✨ Features

- Real-time temperature monitoring
- Real-time humidity monitoring
- 16×2 Grove RGB LCD display
- High-temperature buzzer alert
- USB Serial / COM Port communication
- Python-based data acquisition
- Interactive localhost dashboard
- Live connection status
- Temperature and humidity visualization
- Expandable architecture for future IoT applications

---

# 🧰 Hardware Components

| Component | Purpose |
|---|---|
| Arduino Nano 33 BLE | Main microcontroller |
| DHT11 | Temperature and humidity sensing |
| Grove RGB LCD 16×2 | Local display |
| 3-Pin Active Buzzer | Temperature warning alarm |
| USB Cable | Power, programming and COM communication |
| Jumper Wires | Hardware connections |

---

# 🔌 Hardware Connections

## DHT11

For a bare 4-pin DHT11:

| DHT11 | Arduino Nano 33 BLE |
|---|---|
| Pin 1 — VCC | 3.3V |
| Pin 2 — DATA | D12 |
| Pin 3 — NC | Not Connected |
| Pin 4 — GND | GND |

---

## Grove RGB LCD

The Grove RGB LCD communicates using **I²C**.

| LCD | Arduino Nano 33 BLE |
|---|---|
| VCC | Supply |
| GND | GND |
| SDA | SDA |
| SCL | SCL |

The LCD uses two digital communication lines:

- **SDA** — Serial Data
- **SCL** — Serial Clock

---

## Active Buzzer

| Buzzer | Arduino Nano 33 BLE |
|---|---|
| S / Signal | D11 |
| + | Supply |
| - | GND |

The buzzer is used as a high-temperature alarm.

When:

```text
Temperature < 33°C
```

the alarm remains OFF.

When:

```text
Temperature >= 33°C
```

the alarm turns ON.

---

# ⚙️ Working Principle

The overall operation of ClimateX is:

```text
                 DHT11
                   │
                   │ Temperature + Humidity
                   ▼
          Arduino Nano 33 BLE
                   │
          ┌────────┴────────┐
          │                 │
          ▼                 ▼
     Grove RGB LCD       Active Buzzer
                             │
                       Temperature >= 33°C
                             │
                             ▼
                         Alarm ON


          Arduino Nano 33 BLE
                   │
                   │ USB Serial
                   ▼
              COM Port
                   │
                   ▼
             Python Program
                   │
                   ▼
              Flask Server
                   │
                   ▼
          Localhost Dashboard
```

# 🖥️ Software Used

### Arduino Side

- Arduino IDE
- DHT Sensor Library
- Grove RGB LCD Library

### Computer Side

- Python
- PySerial
- Flask
- HTML
- CSS
- JavaScript
- Chart.js

---

# 🚀 Running ClimateX

## Step 1 — Connect Hardware

Connect the Arduino Nano 33 BLE to the computer using USB.

---

## Step 2 — Upload Arduino Code

Open the Arduino sketch in Arduino IDE.

Select:

```text
Board:
Arduino Nano 33 BLE
```

Then select the correct COM port and upload the sketch.

---

## Step 3 — Find COM Port

Check:

```text
Arduino IDE
→ Tools
→ Port
```

Example:

```text
COM5
```

Set the same port in the Python application.

Example:

```python
SERIAL_PORT = "COM5"
```

---

## Step 4 — Install Python Dependencies

```bash
pip install flask pyserial
```

---

## Step 5 — Start Dashboard

Run:

```bash
python app.py
```

---

## Step 6 — Open Browser

Open:

```text
http://localhost:5000
```

The ClimateX dashboard should now display live sensor readings.

---

# 🎯 Applications

ClimateX can be used for:

### 🏠 Smart Homes
Monitoring indoor temperature and humidity and providing high-temperature warnings.

### 🖥️ Server Rooms
Monitoring temperature around servers and networking equipment to detect overheating.

### 🌱 Greenhouses
Monitoring environmental conditions required for plant growth.

### 🧪 Laboratories
Monitoring environmental conditions around experiments and sensitive equipment.

### 📦 Warehouses
Monitoring temperature and humidity in storage environments.

### 🏭 Industrial Monitoring
Can serve as a prototype for monitoring environmental conditions in industrial environments.

---

# 📌 Conclusion

**ClimateX** is a smart environmental monitoring and alert system that integrates embedded hardware with web technologies.

The DHT11 measures temperature and humidity, while the Arduino Nano 33 BLE processes the readings and displays them on a Grove RGB LCD. When the temperature reaches or exceeds **30°C**, the active buzzer provides an immediate warning.

The Arduino also transfers real-time sensor data to a computer through **USB Serial communication using a COM port**. A Python application reads this data and uses Flask to provide it to an interactive localhost dashboard.

ClimateX demonstrates the integration of:

**Sensors + Embedded Systems + I²C + Serial Communication + Python + Web Development**

into a single real-time monitoring system.

---
