# HuskyADAPT Test Handbook (for Copilot RAG testing)

## 1. Robot Name & Identity

- Official robot name: ADAPT-1
- Chassis type: differential drive
- Wheel diameter: 150 mm
- Wheelbase: 320 mm

## 2. Sensors

### 2.1 Perception
- Primary camera: Intel RealSense D435i (depth + RGB)
- Lidar: RPLidar A2 (12 m range, 10 Hz)
- IMU: ICM-42688-P (6-axis, 32 kHz ODR)

### 2.2 Known Sensor Issues
- D435i depth drops to zero below 0.3 m — apply min-distance clamp
- RPLidar A2 spins at incorrect speed if USB power drops below 4.8V — use powered hub

## 3. Network & Communication

- Robot IP: 192.168.1.100 (static, LAN only)
- SSH port: 22, username: adapt
- ROS2 domain ID: 42
- Topic for velocity commands: /cmd_vel (Twist message)

## 4. Known Bugs

### 4.1 Motor Jitter at Low Speed
- Symptom: motor output oscillates ±5% below 10% duty cycle
- Root cause: PWM resolution (8-bit) insufficient at low speed
- Fix: switch to 16-bit PWM timer, increase frequency to 20 kHz
- Status: RESOLVED as of 2026-03-10

### 4.2 ROS2 Node Crash on Reconnect
- Symptom: perception node crashes when camera is unplugged and replugged
- Root cause: no device-lost callback handler in driver
- Fix: wrap camera init in retry loop with 3s timeout
- Status: OPEN

## 5. Calibration Values

- Camera intrinsics (D435i): fx=614.3, fy=614.3, cx=320.0, cy=240.0
- Lidar-to-camera extrinsic: x=0.05m, y=0.0m, z=0.1m, roll=0, pitch=0, yaw=0
- Wheel odometry scale factor: 1.023 (empirically calibrated 2026-02-14)
