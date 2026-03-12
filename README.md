# 🦯 Blind Assist Monitoring Dashboard

A professional, real-time caretaker monitoring dashboard for a Raspberry Pi-based Blind Assistance System. Built with **Next.js 14**, **Tailwind CSS**, **Framer Motion**, and **Recharts**.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 Login System | Caretaker authentication with name, email, phone, role |
| 📡 System Status | Live SAFE/WARNING indicator with object detection data |
| 🗺️ Location Panel | Interactive OpenStreetMap with real-time user tracking |
| 🎧 Audio Guidance | Live display of what the blind user hears via headphones |
| 🚨 Emergency Controls | Call, voice message, buzzer alert with glowing UI |
| 📋 Live Logs | Scrolling real-time system log feed |
| 📊 Analytics Charts | Obstacle detections, distances, alert frequency charts |
| 🍓 Pi Integration | Auto-connects to Raspberry Pi API, falls back to simulation |

---

## 🚀 Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment (optional)

```bash
cp .env.local.example .env.local
# Edit .env.local and set your Raspberry Pi IP:
# NEXT_PUBLIC_PI_URL=http://192.168.1.100:5000
```

### 3. Run the development server

```bash
npm run dev
```

### 4. Open in browser

```
http://localhost:3000
```

---

## 🏗️ Build for Production

```bash
npm run build
npm run start
```

---

## 📁 Project Structure

```
blind-assist-dashboard/
├── pages/
│   ├── _app.js              # Next.js app wrapper
│   ├── _document.js         # HTML head (fonts, Leaflet CSS)
│   ├── index.js             # Login page
│   └── dashboard.js         # Main monitoring dashboard
├── components/
│   ├── TopNavBar.js          # Top navigation bar
│   ├── CaretakerProfileCard.js  # Logged-in caretaker info
│   ├── SystemStatusPanel.js  # SAFE/WARNING + sensor stats
│   ├── AudioGuidancePanel.js # Live headphone feed display
│   ├── EmergencyControlPanel.js # Emergency action buttons
│   ├── LocationPanel.js      # Leaflet map with live tracking
│   ├── LogsPanel.js          # Scrolling event logs
│   └── ChartsPanel.js        # Recharts analytics
├── utils/
│   └── simulation.js         # Sensor simulation + Pi API fetch
├── styles/
│   └── globals.css           # Global styles, dark theme, animations
├── public/                   # Static assets
├── pi_server.py              # 🍓 Raspberry Pi Flask API server
├── .env.local.example        # Environment variable template
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

---

## 🍓 Raspberry Pi Integration

### On the Raspberry Pi

**Install Python dependencies:**
```bash
pip install flask flask-cors
```

**Run the Pi server:**
```bash
python3 pi_server.py
```

The server starts on `http://0.0.0.0:5000` and exposes:
- `GET /status` — Returns current sensor data
- `GET /health` — Server health check

**Expected JSON response:**
```json
{
  "status": "WARNING",
  "object": "person",
  "distance": 1.2,
  "audio_message": "Obstacle ahead, slow down",
  "processing_speed": 28,
  "confidence": 91.4,
  "battery": 78,
  "timestamp": "2025-01-01T12:00:00Z"
}
```

### Connecting the Dashboard

Set the Pi's IP in `.env.local`:
```env
NEXT_PUBLIC_PI_URL=http://192.168.1.100:5000
```

The dashboard polls `/status` every **3.5 seconds** and:
- Shows **live data** when Pi is reachable
- Falls back to **simulation mode** if Pi is offline or unreachable

### How Audio Guidance is Displayed

When the Pi's `audio_message` field changes, the **Audio Guidance Panel** automatically:
1. Animates the waveform bars
2. Updates the displayed message (same text being spoken in the headphones)
3. Adds the message to the recent history feed

This means the caretaker always knows exactly what the blind user is hearing.

---

## 🔧 Customizing the Pi Server

Edit `pi_server.py` to replace the simulated sensor reads with real hardware:

```python
# Example: HC-SR04 ultrasonic distance reading
import RPi.GPIO as GPIO
import time

TRIG = 23
ECHO = 24

def get_distance():
    GPIO.output(TRIG, True)
    time.sleep(0.00001)
    GPIO.output(TRIG, False)
    # ... pulse timing logic
    return distance_cm / 100  # return in meters
```

---

## 🎨 Design System

| Element | Value |
|---|---|
| Background | `#050a14` (deep navy) |
| Cards | `#0d1a2e` with glass blur |
| Accent | `#22d3ee` (cyan) |
| Warning | `#f59e0b` (amber) |
| Alert | `#ef4444` (red) |
| Safe | `#22c55e` (green) |
| Display Font | Syne (bold headers) |
| Body Font | DM Sans |
| Mono Font | JetBrains Mono |

---

## 📋 Requirements

- Node.js 18+
- npm 9+
- Modern browser (Chrome, Firefox, Edge)

---

## 🎓 University Project Notes

This dashboard is designed for a **Raspberry Pi Blind Assistance System** project featuring:
- **Camera** + **YOLOv8** for object detection
- **HC-SR04** ultrasonic sensor for distance measurement
- **Text-to-speech** audio output via headphones
- **Flask API** on Raspberry Pi for data streaming
- **Next.js dashboard** for real-time caretaker monitoring

---

*Built with ❤️ for accessibility technology research*
