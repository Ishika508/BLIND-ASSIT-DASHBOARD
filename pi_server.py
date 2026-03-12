#!/usr/bin/env python3
"""
Raspberry Pi Flask API Server for Blind Assist System
======================================================
Run this on your Raspberry Pi to stream sensor data to the dashboard.

Requirements:
  pip install flask flask-cors

Usage:
  python3 pi_server.py

The server will listen on port 5000 and serve the /status endpoint.
"""

from flask import Flask, jsonify
from flask_cors import CORS
import time
import threading
import random

# ── Import your actual sensor modules here ───────────────────────────────────
# from picamera2 import Picamera2
# import RPi.GPIO as GPIO
# import ultralytics  # YOLOv8 for object detection
# ─────────────────────────────────────────────────────────────────────────────

app = Flask(__name__)
CORS(app)  # Allow dashboard to access the API from any origin

# Shared state updated by sensor thread
sensor_state = {
    "status": "SAFE",
    "object": "none",
    "distance": 5.0,
    "audio_message": "Path is clear, continue forward",
    "processing_speed": 28,
    "confidence": 92.0,
    "battery": 85,
    "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
}

# ── Replace this function with real sensor reading logic ─────────────────────
def read_sensors():
    """
    REPLACE THIS with actual sensor logic:
      1. Read distance from HC-SR04 ultrasonic sensor
      2. Capture frame from Pi Camera
      3. Run YOLOv8 object detection
      4. Generate audio guidance message
      5. Send audio via headphone jack using espeak or pyttsx3
    """
    global sensor_state

    # --- Simulate distance reading (replace with GPIO/HC-SR04 code) ---
    distance = round(random.uniform(0.3, 5.5), 2)
    
    # --- Simulate object detection (replace with YOLOv8/OpenCV code) ---
    objects = ["person", "wall", "chair", "door", "stairs", "none", "none"]
    detected = random.choice(objects) if distance < 2.0 else "none"
    
    # --- Determine status and audio message ---
    is_warning = detected != "none" or distance < 1.5
    
    audio_messages = {
        "person":  "Person ahead, slow down",
        "wall":    "Wall detected, turn around",
        "chair":   "Chair detected, navigate around",
        "door":    "Door on your right",
        "stairs":  "Stairs detected ahead, step carefully",
        "none":    "Path is clear, continue forward",
    }
    
    sensor_state = {
        "status":           "WARNING" if is_warning else "SAFE",
        "object":           detected,
        "distance":         distance,
        "audio_message":    audio_messages.get(detected, "Proceed with caution"),
        "processing_speed": random.randint(22, 32),
        "confidence":       round(random.uniform(82, 97), 1),
        "battery":          sensor_state["battery"],  # read from actual battery monitor
        "timestamp":        time.strftime("%Y-%m-%dT%H:%M:%SZ"),
    }

def sensor_loop():
    """Background thread that reads sensors continuously."""
    while True:
        try:
            read_sensors()
        except Exception as e:
            print(f"Sensor read error: {e}")
        time.sleep(0.5)  # 2Hz update rate

# ── API Endpoint ──────────────────────────────────────────────────────────────
@app.route("/status")
def status():
    """Returns current sensor state as JSON."""
    return jsonify(sensor_state)

@app.route("/health")
def health():
    return jsonify({"status": "ok", "uptime": time.time()})

# ── Main ──────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("=" * 50)
    print("  Blind Assist Pi Server Starting...")
    print("  Dashboard: http://<your-pi-ip>:5000/status")
    print("=" * 50)
    
    # Start sensor reading in background thread
    t = threading.Thread(target=sensor_loop, daemon=True)
    t.start()
    
    # Start Flask server
    app.run(host="0.0.0.0", port=5000, debug=False)
