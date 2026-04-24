# HuskyADAPT Engineering Handbook

## 1. Team & Roles

### 1.1 Active Members
- Alex Chen — Mechanical Lead (frame, actuators, tolerances)
- Jamie Park — Software Lead (control loop, perception pipeline)
- Sam Rivera — Electrical Lead (power distribution, PCB layout)
- Taylor Wu — Project Manager (timeline, sprint planning, budget)

### 1.2 Decision Authority
- Technical decisions: respective lead + one peer review
- Budget decisions: PM approval required above $200
- Architecture changes: all leads must sign off

## 2. Tech Stack

### 2.1 Firmware
- MCU: STM32F4 series
- RTOS: FreeRTOS v10.5
- Motor driver: VNH5019A (dual channel)
- Communication bus: CAN at 1 Mbit/s

### 2.2 Software
- Language: Python 3.11 for perception, C++17 for low-level control
- Perception: YOLOv8 (custom-trained, 320×320 input)
- Platform: Ubuntu 22.04 + ROS2 Humble

### 2.3 Web OS (this repo)
- Next.js 16 with App Router, React 19
- Database: SQLite via Prisma + better-sqlite3
- Styling: Tailwind CSS v4

## 3. Engineering Standards

### 3.1 Code Style
- TypeScript strict mode for all frontend code
- C++: Google style guide, clang-format enforced
- Python: black formatter, type hints required

### 3.2 Git Workflow
- Never push directly to main — all changes via PR
- Branch prefix: feature/, fix/, chore/, hotfix/
- At least one approval required before merge
- Commit format: `type(scope): description`

### 3.3 Testing
- All PRs must pass CI (lint + unit tests)
- Hardware-in-loop tests run every Friday at 4 PM
- Bug regressions must include a new test case

## 4. Budget & Procurement

### 4.1 Phase 1 Budget
- Total allocated: $4,200
- Mechanical components: $1,500
- Electronics & sensors: $1,800
- Miscellaneous / contingency: $900

### 4.2 Procurement Process
1. Log order in the Engineering OS (orders page)
2. Attach source decision or spec as justification
3. PM approves orders above $200
4. Lead engineer approves orders under $200

## 5. Motor & Control

### 5.1 PID Tuning (current)
- Speed controller: Kp = 0.8, Ki = 0.1, Kd = 0.05
- Position controller: Kp = 1.2, Ki = 0.02, Kd = 0.15
- Control loop rate: 1 kHz

### 5.2 Motor Specs
- Model: Maxon EC-i 40 (24V, 70W)
- Max RPM: 7,580 (no load)
- Gear ratio: 14:1 (planetary gearbox)
- Encoder: 1,024 CPR quadrature

## 6. Safety Protocols

### 6.1 Hardware Testing
- Never run motors above 50% power without full safety check
- Emergency stop must be tested before every demo
- Two-person rule: never work alone on high-voltage components

### 6.2 Software Safety
- Watchdog timer must be enabled in all firmware builds
- Motor commands exceeding ±100% are clamped, not ignored
- All sensor readings must pass sanity-check bounds before use

## 7. Coffee Budget

- Weekly coffee allowance: $15 per engineer
- Claim via Taylor Wu (PM)
