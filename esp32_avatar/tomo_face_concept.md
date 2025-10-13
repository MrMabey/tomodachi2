# Tomo Avatar Concept for Waveshare ESP32-S3 Knob

## Technical Stack
- **Display:** 360x360 LCD (SH8601 driver)
- **Graphics:** LVGL 8.x
- **Framework:** Arduino + FreeRTOS
- **Language:** C/C++

---

## Design Philosophy: Vector-Style with Smooth Animations

Inspired by Vector robot, we'll use:
1. **Parametric shapes** (circles, arcs) - no bitmaps needed
2. **Smooth interpolation** for blinking and expressions
3. **Minimal CPU usage** - runs at 60fps on one core

---

## Face Components

### Base Layout (360x360)
```
     ┌────────────────┐
     │                │
     │   👁️      👁️   │  ← Eyes (animated)
     │                │
     │       👄       │  ← Mouth (changes with mood)
     │                │
     └────────────────┘
```

### Eye Structure
Each eye is composed of:
- **Outer circle** (white sclera) - 60px diameter
- **Inner circle** (iris) - 40px diameter, colored by mood
- **Pupil** (black circle) - 20px diameter
- **Eyelid** (arc overlay) - for blinking

**Eye positions:**
- Left eye: (120, 120)
- Right eye: (240, 120)

---

## Animation States

### 1. **Idle Blink** (Vector-style)
- Blink every 3-5 seconds (random)
- Eyelid closes from top and bottom simultaneously
- Duration: 150ms close + 150ms open
- Uses sine easing for natural motion

```cpp
// Pseudo-code
float blink_progress = 0.0; // 0.0 = open, 1.0 = closed
if (blinking) {
    blink_progress = sin(time * PI); // smooth curve
    eyelid_height = 60 * blink_progress;
}
```

### 2. **Mood States** (Matching Fine-Tuned Personas)

#### **Focused (o_o)**
- Eyes: Wide open, steady
- Iris: Blue (#4A90E2)
- Pupil: Slightly enlarged
- Blink: Normal rate (every 4s)
- Mouth: Small line `─`

#### **Creative (^-^)**
- Eyes: Squinted (eyelids at 40% closed)
- Iris: Purple (#A78BFA)
- Pupil: Small
- Blink: Slower (every 6s)
- Mouth: Smile arc `◡`

#### **Helpful (^_~)**
- Eyes: Left squinted, right winking
- Iris: Green (#10B981)
- Wink: Alternates every 2s
- Mouth: Asymmetric smile

#### **Listening (◉_◉)**
- Eyes: Extra wide (70px outer diameter)
- Iris: Cyan (#06B6D4)
- Pupil: Dilated (follows sound direction)
- Blink: Suppressed
- Mouth: Small "o" shape
- **Extra:** Concentric circles pulse outward (sound waves)

#### **Thinking (º_º)**
- Eyes: Normal size
- Iris: Yellow (#F59E0B)
- Pupil: Looking up-right
- Blink: Rapid (every 2s)
- Mouth: Wavy line `~`
- **Extra:** Spinning dots above head (3 dots in circle)

#### **Success (^_^)b**
- Eyes: Happy squint
- Iris: Bright green (#22C55E)
- Blink: Single slow blink
- Mouth: Big smile with thumbs up emoji to the right
- **Animation:** Bounce entire face up 20px and back

#### **Error (×_×)**
- Eyes: X shapes instead of circles
- Color: Red (#EF4444)
- Blink: None (frozen)
- Mouth: Frown arc `n`
- **Animation:** Shake face left-right 10px, 3 times

#### **Sleeping (-_-)**
- Eyes: Horizontal lines (fully closed)
- Iris: Hidden
- Blink: None (eyes stay closed)
- Mouth: Relaxed line with "Z" floating up

#### **Phone Home (→_→)**
- Eyes: Looking right
- Iris: Magenta (#EC4899)
- Pupil: Moves smoothly from center to right
- Blink: Normal
- Mouth: Small "o"
- **Extra:** Signal waves `)))` emanate to the right

---

## Implementation Strategy

### Component Structure
```cpp
class TomoFace {
    private:
        lv_obj_t* canvas;

        // Eye parameters
        int left_eye_x, left_eye_y;
        int right_eye_x, right_eye_y;
        float blink_state; // 0.0-1.0
        float pupil_offset_x, pupil_offset_y;

        // Mood parameters
        lv_color_t iris_color;
        int mouth_type; // 0=line, 1=smile, 2=frown, etc.

        // Animation state
        unsigned long last_blink_time;
        int current_mood;

    public:
        void init();
        void setMood(int mood);
        void update(); // Called every frame
        void drawEye(int x, int y, bool is_left);
        void drawMouth();
        void startBlink();
};
```

### Drawing Functions

#### Eye Drawing (Vector style)
```cpp
void TomoFace::drawEye(int x, int y, bool is_left) {
    // Calculate blink closure
    int eyelid_offset = blink_state * 30; // Max 30px from top/bottom

    // Draw white sclera (background)
    lv_draw_circle(canvas, x, y, 30, lv_color_white());

    // Draw colored iris
    lv_draw_circle(canvas,
                   x + pupil_offset_x,
                   y + pupil_offset_y,
                   20,
                   iris_color);

    // Draw black pupil
    lv_draw_circle(canvas,
                   x + pupil_offset_x,
                   y + pupil_offset_y,
                   10,
                   lv_color_black());

    // Draw eyelids (arcs that cover from top and bottom)
    if (blink_state > 0) {
        lv_draw_arc(canvas, x, y - eyelid_offset, 30, 0, 180, skin_color);
        lv_draw_arc(canvas, x, y + eyelid_offset, 30, 180, 360, skin_color);
    }
}
```

#### Blink Animation (FreeRTOS Task)
```cpp
void blink_animation_task(void* param) {
    TomoFace* face = (TomoFace*)param;

    while(1) {
        // Random blink interval
        int wait_ms = random(3000, 5000);
        vTaskDelay(pdMS_TO_TICKS(wait_ms));

        // Close eyes (150ms)
        for(int i=0; i<15; i++) {
            face->blink_state = sin((i/15.0) * PI/2); // Ease in
            vTaskDelay(pdMS_TO_TICKS(10));
        }

        // Open eyes (150ms)
        for(int i=15; i>0; i--) {
            face->blink_state = sin((i/15.0) * PI/2); // Ease out
            vTaskDelay(pdMS_TO_TICKS(10));
        }

        face->blink_state = 0.0;
    }
}
```

---

## Mood Transition System

When receiving a command from Raspberry Pi via MQTT/ESP-NOW:

```cpp
void TomoFace::setMood(int new_mood) {
    // Smooth color transition
    lv_color_t target_color = getMoodColor(new_mood);

    // Animate iris color over 500ms
    for(int i=0; i<50; i++) {
        iris_color = lv_color_mix(target_color, iris_color, i*5); // 0-255
        vTaskDelay(pdMS_TO_TICKS(10));
    }

    current_mood = new_mood;
}
```

---

## Performance Optimization

1. **Use LVGL Canvas** - Pre-render face to buffer
2. **Dirty Regions** - Only redraw changed areas (eyes, mouth)
3. **Task Priorities:**
   - Display update: Priority 2 (16ms / 60fps)
   - Blink animation: Priority 1
   - MQTT listener: Priority 3

4. **Memory:**
   - Canvas buffer: 360x360x2 bytes = 259KB (fits in PSRAM)
   - Eye sprites: Can be drawn parametrically (no storage)

---

## Next Steps to Prototype

1. **Setup Arduino environment** with LVGL
2. **Create basic eye drawing** function
3. **Implement blink animation** loop
4. **Test mood color transitions**
5. **Add MQTT/ESP-NOW listener** for Pi commands
6. **Optional:** Add mouth expressions and extras

Want me to generate the actual Arduino sketch to get started?
