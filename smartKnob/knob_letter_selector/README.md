# Smart Knob Letter Selector

An ESP32-S3 application that turns your smart knob into a text input device! Rotate the knob to select letters and tap the screen to spell out words.

## Features

- **Letter Selection**: Turn the knob clockwise/counter-clockwise to cycle through letters A-Z
- **Special Characters**:
  - `[SPC]` - Add a space
  - `[DEL]` - Backspace/delete last character
- **Tap to Save**: Tap anywhere on the screen to add the selected letter to your word
- **Visual Feedback**:
  - Large letter display shows current selection
  - Word display at bottom shows what you've typed
  - Flash effects when selecting and saving letters
- **Serial Monitor**: Watch your progress in real-time via Serial output

## Hardware Requirements

- Waveshare ESP32-S3-Knob-Touch-LCD-1.8
  - ESP32-S3R8 MCU
  - 1.8" LCD display (240x280)
  - Capacitive touch screen (CST816)
  - Rotary encoder (pins 7 & 8)

## How to Use

1. **Upload the code** to your ESP32-S3 smart knob
2. **Open Serial Monitor** at 115200 baud to see debug output
3. **Turn the knob** to cycle through letters (A-Z, SPACE, BACKSPACE)
4. **Tap the screen** to add the current letter to your word
5. **Watch the display**:
   - Top: Instructions
   - Center: Current letter (large, green)
   - Bottom: Word you're building

## Controls

| Action | Result |
|--------|--------|
| Turn knob clockwise | Next letter |
| Turn knob counter-clockwise | Previous letter |
| Tap screen | Save current letter to word |
| Select `[DEL]` and tap | Delete last character |
| Select `[SPC]` and tap | Add a space |

## Display Layout

```
┌─────────────────────────────┐
│  Turn: Select │ Tap: Save   │  ← Instructions
│                             │
│            A                │  ← Current Letter (48pt)
│                             │
│         HELLO               │  ← Your Word (14pt)
└─────────────────────────────┘
```

## Configuration

### Encoder Pins
```cpp
#define ENCODER_A_PIN 8
#define ENCODER_B_PIN 7
```

### Character Set
Letters available: `ABCDEFGHIJKLMNOPQRSTUVWXYZ _<`
- `_` = SPACE
- `<` = BACKSPACE

### Max Word Length
Default: 20 characters (configurable via `MAX_WORD_LENGTH`)

## Serial Output Examples

```
✏️ Smart Knob - Letter Selector
================================================
Turn the knob to select letters
Tap the screen to save the selected letter
================================================

✅ Ready! Start spelling!
Current letter: A

🎛️  Letter: B
🎛️  Letter: C
🔘 Screen tapped - saving letter!
✓ Added 'C' - Word: C
🎛️  Letter: A
🔘 Screen tapped - saving letter!
✓ Added 'A' - Word: CA
🎛️  Letter: T
🔘 Screen tapped - saving letter!
✓ Added 'T' - Word: CAT
```

## Code Structure

- **Encoder handling**: Interrupt-based rotary encoder reading
- **Letter cycling**: Modulo arithmetic for wrapping around character set
- **Touch detection**: LVGL event callbacks for screen taps
- **Display updates**: LVGL labels with custom fonts and colors
- **State management**: Tracks current letter index and word being built

## Dependencies

The project uses the following libraries and components:
- LVGL 8.3.11 (graphics library)
- ESP32-S3 Arduino framework
- LCD driver (SH8601)
- Touch driver (CST816)
- PWM backlight control

## Customization Ideas

- Add lowercase letters
- Add numbers and symbols
- Implement word suggestions
- Save words to SD card
- Send words via WiFi/Bluetooth
- Add haptic feedback on letter change
- Implement different input modes (T9, etc.)

## Troubleshooting

**Display not working?**
- Check LCD connections
- Verify SPI configuration in `lcd_config.h`

**Touch not responding?**
- Ensure touch controller is initialized (`Touch_Init()`)
- Check I2C connections to CST816

**Encoder not detecting turns?**
- Verify encoder pins (7 and 8)
- Check pull-up resistors are enabled
- Monitor Serial output for encoder values

## License

Based on Espressif and Waveshare example code.
