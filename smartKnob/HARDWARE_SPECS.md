# ESP32-S3 Smart Knob Hardware Specifications

**Product:** Waveshare ESP32-S3-Knob-Touch-LCD-1.8

**Official Documentation:** https://www.waveshare.com/wiki/ESP32-S3-Knob-Touch-LCD-1.8

---

## Hardware Architecture

### Dual MCU System
- **ESP32-S3R8** (Primary)
  - Wi-Fi and Bluetooth SoC
  - 240MHz operating frequency
  - 8MB PSRAM
  - Used for: Display, WiFi, main application logic

- **ESP32-U4WDH** (Secondary)
  - Wi-Fi and classic Bluetooth
  - 240MHz operating frequency
  - 4MB Flash
  - Used for: Audio processing, encoder handling

### Memory & Storage
- 512KB SRAM
- 384KB ROM
- 16MB Flash expansion
- 8MB PSRAM
- TF card slot for additional storage

---

## Display & Input

### Screen
- **Size:** 1.8-inch LCD
- **Touchscreen:** I2C control
- **Library:** LVGL 8.3.11 (use v8.4.0 for new projects)

### Controls
- Dual rotary encoders
- Capacitive touch screen (CST816 driver)

---

## Audio Components

### Output
- **DAC:** PCM5100A stereo DAC
- **Interface:** I2S
- **Jack:** 3.5mm headphone output

### Input
- **Microphone:** Digital microphone (onboard)
- **Interface:** I2S
- **Use Case:** Voice input for Tomo AI

---

## Other Hardware

### Haptic Feedback
- **Driver:** DRV2605 vibration motor driver
- **Interface:** I2C
- **Status:** Available but not yet integrated

### Power
- **USB:** Type-C (bidirectional switchable between ESP32-S3/ESP32)
- **Battery:** MX1.25 lithium socket with charging management
- **Note:** Ensure correct COM port selection when flashing different MCUs

---

## Development Setup

### Arduino IDE (Recommended for This Project)
```
Board Manager: esp32 by Espressif Systems (v3.2.0 or higher)
Required Libraries:
  - SensorLib v0.3.1
  - lvgl v8.4.0 (we use v8.3.11)
```

**Board Settings:**
- Board: "ESP32S3 Dev Module"
- Partition Scheme: "Default 4MB with spiffs"
- USB CDC On Boot: "Enabled" (required for Serial Monitor)

### ESP-IDF (Advanced)
- Visual Studio Code with Espressif IDF Plugin
- Required for lower-level hardware control

---

## Important Notes

### Dual MCU Flashing
⚠️ The board contains TWO ESP32 processors. Make sure to:
1. Select the correct board type in Arduino IDE
2. Choose the right COM port for the target MCU
3. Flash firmware to the appropriate processor for your use case

### Current Project Usage
- **Primary MCU (ESP32-S3R8):** Running LVGL UI, WiFi, button/touch handling
- **Secondary MCU:** Not currently used (available for future audio processing)

---

## Pin Configuration Reference

See sample code folders for specific pin configurations:
- `01_ADC_Test/` - ADC pins
- `04_Encoder_Test/` - Encoder pins
- `07_Audio_Test/` - I2S audio pins
- `08_LVGL_Test/` - Display and touch pins

**ESP32-S3 Compatible GPIO Notes:**
- Avoid using GPIO 25 for I2S (not available on ESP32-S3)
- Use GPIOs 4, 5, 6 for I2S instead
- Check `lcd_config.h` for display pin mappings

---

## Resources

- **Official Wiki:** https://www.waveshare.com/wiki/ESP32-S3-Knob-Touch-LCD-1.8
- **Sample Code:** Located in `smartKnob/01-08_*_Test/` folders
- **Working Example:** `smartKnob/knob_button_test/` (LVGL button with WiFi)
