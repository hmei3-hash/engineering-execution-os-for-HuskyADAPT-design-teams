# HuskyADAPT Walker Proximity Sensor — Project Handbook

**Organization:** HuskyADAPT (Accessible Design And Play Technology), University of Washington  
**Project:** Assistive Proximity Sensor System for Walkers  
**Academic Year:** 2025–26  
**Team:** Inchara Chetan, Rutvi Pota, Chelsea Hom, Thy Dinh, Hongyi Mei, Leo Andrade, Panav Kotha  

---

## 1. Project Overview

### 1.1 Mission Statement

Our team aims to create a small, discreet, and affordable walker-mounted proximity sensor that delivers gentle haptic alerts when others are too close, helping the user maintain safe personal space without drawing attention.

### 1.2 Needs Statement

A way to address unintentional collisions in crowded spaces for individuals using walkers or mobility aids so that they can navigate dynamic environments independently and confidently with fewer incidents.

### 1.3 Problem Background

The target user is a student on the autism spectrum (ASD) who uses a walker and has:
- Difficulty with spatial awareness and impulse control
- Ability to avoid stationary obstacles, but struggles with unintentional contact with moving people
- Limited fine motor skills
- No visual impairments
- A frequently changing walker (cannot permanently modify the device)

Key challenges:
- Crowded, fast-paced school hallways with unpredictable peer movement
- Unintentional bumping causes conflicts and embarrassment
- User wants to lead (be at the front) rather than follow
- Existing solutions are expensive, bulky, or require replacing the entire mobility device

---

## 2. User Profile

| Attribute | Detail |
|---|---|
| Condition | Autism Spectrum Disorder (ASD) |
| Mobility aid | Walker (changes walker frequently — "Tipo All-Terrain Rollator" is current walker) |
| Motor skills | Limited fine motor skills; difficult to attach wristbands or small clips |
| Vision | No visual impairment |
| Primary challenge | Impulse control and spatial awareness in crowded spaces |
| Alert preference | Discreet haptic (vibration) — not auditory |
| Environment | School hallways, classrooms, and other crowded indoor spaces |
| Independence goal | Navigate without relying on caregiver cues |

### 2.1 Current Walker: Tipo All-Terrain Rollator

Important physical constraints for mounting:
- **No central horizontal bar** — limits clamp placement options
- **Front bag** — poses a challenge for sensor/camera placement; vision must not be impeded
- **Bicycle-like tires** — minimize vibrations, which improves camera image quality
- **Tube cross-section** — neither circular nor elliptical; custom clamp geometry required

---

## 3. System Architecture

### 3.1 High-Level Architecture

```
[mmWave Radar Sensor] ──┐
                        ├──▶ [Raspberry Pi 5] ──▶ [Vibration Motor on handlebar]
[Camera + CV model]  ───┘
```

The Raspberry Pi 5 acts as the central processing unit. It fuses data from the mmWave radar and the camera to decide when to trigger the vibration motor alert.

### 3.2 Component List

| Component | Model / Part | Notes |
|---|---|---|
| Main compute | Raspberry Pi 5 (8 GB) | One unit already exists for testing |
| Camera | UVC-compatible USB camera (×3) | Tested: innomaker cam, supports Raspberry Pi |
| Microcontroller | Raspberry Pi Pico | For sensor interfacing and output control |
| Radar sensor | mmWave radar module (e.g., ZORZA presence detection) | Used for human presence detection |
| Vibration motor | DC vibration motor, 9000 RPM | Mounted on walker handlebar clamp |
| Active buzzer | Arduino-compatible buzzer module | Backup / secondary alert option |
| IMU | MPU-6050 (GY-521 breakout) | 6-axis, for motion context |

### 3.3 Communication Architecture (ESP32 Prototype Stage)

During early prototyping, the team used ESP32 boards instead of Raspberry Pi Pico:
- **Two ESP32 boards act as BLE servers** — each collects distance data from ultrasonic sensors
- **One ESP32 acts as BLE client** — receives sensor data, drives output (vibration/buzzer)
- **Library used:** NimBLE Arduino library — enables many-to-many BLE communication
- **Bug (resolved 2026-03-10):** Sensor returns `-1` when distance is invalid; conditional handling for this case has been fixed

In the final design, the Raspberry Pi 5 handles compute-heavy tasks (camera + CV), and the Pico handles low-latency sensor I/O and haptic output.

---

## 4. Sensing Subsystem

### 4.1 Sensor Selection Rationale

**Initial candidate: mmWave Radar**

| Pros | Cons |
|---|---|
| Can detect humans specifically | Uses Doppler shift — hard to distinguish walker motion from people motion |
| Precise velocity, angle, distance measurement | More expensive |
| Works in all lighting conditions | Narrow FOV (60–120°) |
| Minimal signal loss through plexiglass | — |

**Final selection: mmWave Radar + Camera (multi-sensor fusion)**

The final design uses both sensors in combination:
- **mmWave radar** reliably detects human presence and motion; unaffected by lighting
- **Camera + deep learning CV** classifies obstacle types (people vs. objects); estimates distance
- Multi-sensor approach reduces false alarms and missed detections compared to single-sensor systems

**Why not ultrasonic only:**
- Cannot detect through plexiglass enclosure
- Has a "blind zone" too close to the sensor
- Narrow individual FOV (though this can be partially solved with multiple sensors)
- Ultrasonic sensors were tested in early prototyping and validated for distance measurement accuracy; ultimately replaced by mmWave for human-specific detection reliability

### 4.2 Ultrasonic Sensor Testing Results (Early Prototype)

During winter quarter prototyping:
- Distance measurements calibrated for object detection
- Accuracy verified at multiple ranges
- Performance tested through plexiglass enclosure — **ultrasonic does NOT work through plexiglass**
- Response time for moving obstacles evaluated

### 4.3 Camera Testing Criteria

- Image clarity and field of view
- Object detection reliability in various lighting conditions
- Performance for identifying moving objects (people walking)

---

## 5. Mechanical Design

### 5.1 Design Evolution

**Idea 1 (Rectangular clamp):** Box housing with sensor inside, clamp onto vertical tube. Compact but limited adjustability.

**Idea 2 (Circular clamp):** Round housing with ball-and-socket joint, clamp uses elastic strap threading. More adjustable but strap-based retention risked slippage under vibration.

**Final Design (Two-piece split clamp with ball-and-socket):**
- **Base clamp:** Two-piece split clamp that grips the walker tube. Uses clearance holes (top half) and heat-set inserts (bottom half) for reliable fastening. Does not rely on elastic straps.
- **Secondary clamp:** Split clamp forming a ball-and-socket joint. The socket halves compress around the integrated ball on the sensor disk, allowing adjustable sensor orientation. Upper half uses clearance holes; lower half uses heat-set inserts.
- **Sensor disk:** Houses the mmWave radar and camera. Orientation is adjustable.
- **Electronics housing:** Separate enclosure (Raspberry Pi 5 + battery) mounted elsewhere on the walker frame.

### 5.2 Mounting Constraints

- Must be **easily attachable and detachable** — user transfers walker frequently
- Must accommodate **non-circular, non-elliptical tube cross-sections** of the Tipo Rollator
- Camera placement must **not be impeded by the front bag**
- Vibration motors will be clamped onto the **walker handlebars**

### 5.3 Initial CAD Prototype

A physical prototype was fabricated and mounted on a test tube. The housing contains the ESP32 board, ultrasonic sensor, and battery. 3D-printed in black filament. Confirmed structural fit on test tube.

---

## 6. Feedback Subsystem

### 6.1 Alert Type

**Primary:** Vibration motor mounted on handlebar — discreet, haptic  
**Secondary (optional):** Active buzzer — audible beep (user preference may override)

The user and occupational therapist confirmed preference for vibration over sound. Sound was not ruled out but is secondary.

### 6.2 Alert Trigger Logic

1. mmWave radar detects a human within proximity threshold
2. Camera CV model confirms presence of a person (reduces false positives)
3. If both sensors agree → vibration motor activates
4. Threshold distance and timing to be calibrated through user-centered testing

---

## 7. Software

### 7.1 Firmware (Microcontroller)

- Language: Arduino / C++ (ESP32 in prototype; Pico in final)
- BLE library: NimBLE (for ESP32 multi-server, single-client architecture)
- Ultrasonic sensor returns `-1` for invalid distance readings — handled in conditional logic

### 7.2 Computer Vision (Raspberry Pi 5)

- Deep-learning-based object detection for identifying people vs. obstacles
- Camera interface: UVC USB (compatible with standard Linux video stack)
- Processing: Real-time inference on Raspberry Pi 5
- Goal: Classify objects in path and estimate distance to nearest person

### 7.3 Sensor Fusion

- mmWave radar provides: presence, distance, velocity
- Camera provides: object classification, spatial context
- Fusion logic: Both sensors must confirm a human within unsafe range before triggering alert (AND logic to reduce false positives)

---

## 8. Known Issues & Bugs

| ID | Symptom | Root Cause | Fix | Status |
|---|---|---|---|---|
| BUG-01 | Ultrasonic sensor returns `-1` and conditional handling misfires | Invalid distance case not handled in code | Fix conditional check for `-1` return value | Resolved (2026-03-10) |
| BUG-02 | BLE communication between ESP32 boards unreliable with default Arduino BLE | Default Arduino BLE library doesn't support many-to-many | Switched to NimBLE library | Resolved (2026-03-10) |
| NOTE-01 | Ultrasonic sensor does not work through plexiglass | Acoustic signal blocked | Do not use plexiglass cover over ultrasonic transducers; mmWave radar is unaffected | Design constraint |
| NOTE-02 | Strap-based clamp (Idea 2) risks slippage under vibration | Elastic strap loses preload over time | Final design uses rigid split clamp with heat-set inserts | Design decision |

---

## 9. Market Analysis

| Product | Approach | Limitation |
|---|---|---|
| iWalkSafe | Proximity sensors built into walker/wheelchair | User must replace entire device to access the technology |
| Camino Mobility | Multi-sensor perception system with automatic braking and steering | Premium price point; overkill for personal space alerting use case |
| Braze Mobility | Attachable blind-spot sensors; visual + auditory + haptic alerts | Focused on side/rear collisions; limited sensor set |
| **HuskyADAPT (this project)** | Modular, detachable, multi-sensor (mmWave + CV), haptic-only | Designed for ASD user with impulse control challenges; affordable; transferable between walkers |

**Identified gap:** Existing solutions lack affordability, discreetness, and transferability for users who change walkers frequently and need subtle, non-stigmatizing alerts.

---

## 10. Testing Plan

### 10.1 Component-Level Testing

**mmWave Radar:**
- Verify reliable human detection vs. inanimate objects
- Test detection range up to ~10 meters
- Confirm it distinguishes moving people from stationary furniture

**Camera:**
- Evaluate image clarity at the mounted angle
- Test object detection in varying lighting (bright hallway, dim corridor)
- Verify moving person identification reliability

**Vibration Motor:**
- Confirm haptic feedback is noticeable but not overwhelming for the user
- Test different vibration intensities and durations

**3D-Printed Mount:**
- Confirm secure fit on standard walker tubing (Tipo Rollator tube dimensions)
- Verify sensors remain aligned after repeated attachment/detachment cycles

### 10.2 System-Level / User Testing

Key questions for user testing with the Needs Expert and user:
- Is the design easily attachable and detachable?
- Are the sensors able to detect a large enough range in school hallways?
- How accurate is the visual recognition in crowded conditions?
- How discreet is the design? Does the user feel comfortable and confident wearing it?
- Is the haptic alert intensity appropriate — noticeable but not startling?

### 10.3 Calibration

- Vibration alert distance threshold to be calibrated through user-centered testing
- Multiple distance and timing values will be evaluated to find the most reliable activation point

---

## 11. Project Timeline

| Milestone | Target Date |
|---|---|
| Problem statement and background research | By December 13, 2025 |
| Working product | By January 16, 2026 |
| Demo (testing + video + website) | By January 30, 2026 |
| RESNA design brief submission | Winter quarter |
| User testing with Needs Expert | Spring quarter |
| Final design | Spring quarter |

### 11.1 Winter Quarter Goals (Completed)

- Researched and analyzed electronic and mechanical design ideas
- Explored existing solutions (market analysis)
- Developed multiple electronic and mechanical prototype ideas
- Completed initial CAD prototype (mounted on test tube)
- Fixed BLE communication bug using NimBLE
- Completed RESNA design brief

### 11.2 Spring Quarter Next Steps

- User testing with Needs Expert and primary user
- Calibrate vibration alert threshold
- Finalize and validate multi-sensor fusion logic
- Complete 3D-printed two-piece mount for actual Tipo Rollator
- Integrate camera-based CV system with mmWave radar
- Finalize design for RESNA submission

---

## 12. Team

### 12.1 Members and Roles

| Member | Role / Interests |
|---|---|
| Panav Kotha | Sensors, coding |
| Inchara Chetan | CAD design, ideation and documentation |
| Rutvi Pota | Ideation, documentation |
| Leo Andrade | Mechanical design, CAD; completed housing for battery and Raspberry Pi |
| Thy Dinh | Communication, assembly |
| Hongyi Mei | Sensors implementation, coding |
| Chelsea Hom | Assembly, documentation |

Sub-teams: Communication · Sensors Implementation · CAD Design · Ideation & Documentation · Assembly

### 12.2 Advisors and Collaborators

- **Needs Expert:** Occupational therapist working with the student user
- **User:** Student with ASD at a local school

---

## 13. References

- Long N, Wang K, Cheng R, Hu W, Yang K. Low power millimeter wave radar system for the visually impaired. *J Eng.* 2019. doi:10.1049/joe.2019.0037
- Mostofa N, et al. A smart walker for people with both visual and mobility impairment. *Sensors (Basel).* 2021;21(10):3488. doi:10.3390/s21103488
- Klavina A, et al. The use of assistive technology to promote practical skills in persons with ASD. *Digit Health.* 2024. doi:10.1177/20552076241281260
- Applied Behavior Analysis Edu. What is the relationship between autism and impulse control? https://www.appliedbehavioranalysisedu.org/what-is-the-relationship-between-autism-and-impulse-control/
- Dirheimer T, et al. Smart Walker Design: final report. ECE 480 Capstone, Michigan State University, 2015.
