/*
 * Tomo Face - Animated Avatar for Waveshare ESP32-S3 1.8" Knob
 *
 * Features:
 * - Vector-style blinking eyes (like Anki Vector)
 * - Smooth mood transitions
 * - Minimal CPU usage with LVGL
 * - MQTT/ESP-NOW ready for Raspberry Pi commands
 */

#include <Arduino.h>
#include "lcd_bsp.h"
#include "lcd_bl_pwm_bsp.h"
#include "lcd_config.h"

// ============================
// CONFIGURATION
// ============================
#define SCREEN_WIDTH 360
#define SCREEN_HEIGHT 360
#define FACE_CENTER_X (SCREEN_WIDTH / 2)
#define FACE_CENTER_Y (SCREEN_HEIGHT / 2)

// Eye positions
#define LEFT_EYE_X 120
#define LEFT_EYE_Y 140
#define RIGHT_EYE_X 240
#define RIGHT_EYE_Y 140

// Eye sizes
#define EYE_OUTER_RADIUS 30
#define IRIS_RADIUS 20
#define PUPIL_RADIUS 10

// Mouth position
#define MOUTH_X FACE_CENTER_X
#define MOUTH_Y 240

// ============================
// MOOD DEFINITIONS
// ============================
enum TomoMood {
    MOOD_FOCUSED = 0,   // (o_o) Blue, steady
    MOOD_CREATIVE,      // (^-^) Purple, squinted
    MOOD_HELPFUL,       // (^_~) Green, winking
    MOOD_LISTENING,     // (◉_◉) Cyan, wide
    MOOD_THINKING,      // (º_º) Yellow, looking up
    MOOD_SUCCESS,       // (^_^) Bright green, happy
    MOOD_ERROR,         // (×_×) Red, X eyes
    MOOD_SLEEPING,      // (-_-) Closed eyes
    MOOD_PHONE_HOME     // (→_→) Magenta, looking right
};

// ============================
// GLOBAL STATE
// ============================
struct FaceState {
    TomoMood current_mood;
    lv_color_t iris_color;

    // Blink animation (0.0 = open, 1.0 = closed)
    float blink_progress;
    unsigned long last_blink_time;

    // Pupil position (-1.0 to 1.0 for each axis)
    float pupil_offset_x;
    float pupil_offset_y;

    // Mood-specific flags
    bool eyes_squinted;
    bool right_eye_wink;
    bool show_thinking_spinner;

    // Animation frame counter
    unsigned long frame_count;
} face_state;

// LVGL objects
lv_obj_t* canvas;
lv_draw_ctx_t* draw_ctx;

// ============================
// HELPER FUNCTIONS
// ============================

lv_color_t getMoodColor(TomoMood mood) {
    switch(mood) {
        case MOOD_FOCUSED:    return lv_color_hex(0x4A90E2); // Blue
        case MOOD_CREATIVE:   return lv_color_hex(0xA78BFA); // Purple
        case MOOD_HELPFUL:    return lv_color_hex(0x10B981); // Green
        case MOOD_LISTENING:  return lv_color_hex(0x06B6D4); // Cyan
        case MOOD_THINKING:   return lv_color_hex(0xF59E0B); // Yellow
        case MOOD_SUCCESS:    return lv_color_hex(0x22C55E); // Bright green
        case MOOD_ERROR:      return lv_color_hex(0xEF4444); // Red
        case MOOD_SLEEPING:   return lv_color_hex(0x6B7280); // Gray
        case MOOD_PHONE_HOME: return lv_color_hex(0xEC4899); // Magenta
        default:              return lv_color_hex(0x4A90E2);
    }
}

float easeInOutSine(float t) {
    return -(cos(PI * t) - 1) / 2;
}

// ============================
// DRAWING FUNCTIONS
// ============================

void drawEye(int center_x, int center_y, bool is_winking) {
    lv_color_t bg_color = lv_color_hex(0x1a1a2e); // Dark background
    lv_color_t white = lv_color_white();
    lv_color_t black = lv_color_black();

    int eyelid_close = (int)(EYE_OUTER_RADIUS * face_state.blink_progress);

    // If winking, use full closure for this eye
    if (is_winking) {
        eyelid_close = EYE_OUTER_RADIUS;
    }

    // If eyes are squinted (creative mode)
    if (face_state.eyes_squinted && !is_winking) {
        eyelid_close = EYE_OUTER_RADIUS * 0.4; // 40% closed
    }

    // Draw white sclera (outer eye)
    lv_draw_rect_dsc_t rect_dsc;
    lv_draw_rect_dsc_init(&rect_dsc);
    rect_dsc.bg_color = white;
    rect_dsc.radius = EYE_OUTER_RADIUS;

    lv_area_t eye_area = {
        center_x - EYE_OUTER_RADIUS,
        center_y - EYE_OUTER_RADIUS + eyelid_close,
        center_x + EYE_OUTER_RADIUS,
        center_y + EYE_OUTER_RADIUS - eyelid_close
    };

    lv_draw_rect(draw_ctx, &rect_dsc, &eye_area);

    // If eye is fully closed, skip iris/pupil
    if (eyelid_close >= EYE_OUTER_RADIUS) {
        return;
    }

    // Draw colored iris
    int iris_x = center_x + (int)(face_state.pupil_offset_x * 8);
    int iris_y = center_y + (int)(face_state.pupil_offset_y * 8);

    lv_area_t iris_area = {
        iris_x - IRIS_RADIUS,
        iris_y - IRIS_RADIUS,
        iris_x + IRIS_RADIUS,
        iris_y + IRIS_RADIUS
    };

    rect_dsc.bg_color = face_state.iris_color;
    rect_dsc.radius = IRIS_RADIUS;
    lv_draw_rect(draw_ctx, &rect_dsc, &iris_area);

    // Draw black pupil
    lv_area_t pupil_area = {
        iris_x - PUPIL_RADIUS,
        iris_y - PUPIL_RADIUS,
        iris_x + PUPIL_RADIUS,
        iris_y + PUPIL_RADIUS
    };

    rect_dsc.bg_color = black;
    rect_dsc.radius = PUPIL_RADIUS;
    lv_draw_rect(draw_ctx, &rect_dsc, &pupil_area);
}

void drawMouth() {
    lv_color_t mouth_color = lv_color_white();
    lv_draw_line_dsc_t line_dsc;
    lv_draw_line_dsc_init(&line_dsc);
    line_dsc.color = mouth_color;
    line_dsc.width = 3;

    lv_point_t mouth_points[2];

    if (face_state.current_mood == MOOD_SUCCESS || face_state.current_mood == MOOD_CREATIVE) {
        // Draw smile arc (3 line segments approximation)
        mouth_points[0] = {MOUTH_X - 30, MOUTH_Y};
        mouth_points[1] = {MOUTH_X, MOUTH_Y + 15};
        lv_draw_line(draw_ctx, &line_dsc, &mouth_points[0], &mouth_points[1]);

        mouth_points[0] = {MOUTH_X, MOUTH_Y + 15};
        mouth_points[1] = {MOUTH_X + 30, MOUTH_Y};
        lv_draw_line(draw_ctx, &line_dsc, &mouth_points[0], &mouth_points[1]);
    }
    else if (face_state.current_mood == MOOD_ERROR) {
        // Draw frown
        mouth_points[0] = {MOUTH_X - 30, MOUTH_Y + 15};
        mouth_points[1] = {MOUTH_X, MOUTH_Y};
        lv_draw_line(draw_ctx, &line_dsc, &mouth_points[0], &mouth_points[1]);

        mouth_points[0] = {MOUTH_X, MOUTH_Y};
        mouth_points[1] = {MOUTH_X + 30, MOUTH_Y + 15};
        lv_draw_line(draw_ctx, &line_dsc, &mouth_points[0], &mouth_points[1]);
    }
    else {
        // Draw simple line
        mouth_points[0] = {MOUTH_X - 25, MOUTH_Y};
        mouth_points[1] = {MOUTH_X + 25, MOUTH_Y};
        lv_draw_line(draw_ctx, &line_dsc, &mouth_points[0], &mouth_points[1]);
    }
}

void drawThinkingSpinner() {
    if (!face_state.show_thinking_spinner) return;

    int spinner_radius = 60;
    float angle = (face_state.frame_count * 0.1); // Rotate over time

    lv_color_t dot_color = lv_color_hex(0xF59E0B);

    for(int i = 0; i < 3; i++) {
        float dot_angle = angle + (i * 2.0 * PI / 3.0);
        int dot_x = FACE_CENTER_X + cos(dot_angle) * spinner_radius;
        int dot_y = 80 + sin(dot_angle) * 20;

        lv_draw_rect_dsc_t rect_dsc;
        lv_draw_rect_dsc_init(&rect_dsc);
        rect_dsc.bg_color = dot_color;
        rect_dsc.radius = 6;

        lv_area_t dot_area = {dot_x - 6, dot_y - 6, dot_x + 6, dot_y + 6};
        lv_draw_rect(draw_ctx, &rect_dsc, &dot_area);
    }
}

void drawFace() {
    // Clear canvas
    lv_color_t bg_color = lv_color_hex(0x0f1621); // Dark background
    lv_canvas_fill_bg(canvas, bg_color, LV_OPA_COVER);

    // Draw thinking spinner (if active)
    drawThinkingSpinner();

    // Draw eyes
    drawEye(LEFT_EYE_X, LEFT_EYE_Y, false);
    drawEye(RIGHT_EYE_X, RIGHT_EYE_Y, face_state.right_eye_wink);

    // Draw mouth
    drawMouth();
}

// ============================
// ANIMATION & STATE
// ============================

void updateBlinkAnimation() {
    unsigned long current_time = millis();
    unsigned long time_since_blink = current_time - face_state.last_blink_time;

    // Random blink interval (3-5 seconds)
    if (time_since_blink > random(3000, 5000) && face_state.blink_progress == 0.0) {
        face_state.last_blink_time = current_time;
    }

    // Animate blink (300ms total: 150ms close + 150ms open)
    unsigned long blink_phase = (current_time - face_state.last_blink_time);

    if (blink_phase < 150) {
        // Closing
        face_state.blink_progress = easeInOutSine(blink_phase / 150.0);
    }
    else if (blink_phase < 300) {
        // Opening
        face_state.blink_progress = easeInOutSine(1.0 - ((blink_phase - 150) / 150.0));
    }
    else {
        face_state.blink_progress = 0.0;
    }
}

void setMood(TomoMood new_mood) {
    face_state.current_mood = new_mood;
    face_state.iris_color = getMoodColor(new_mood);

    // Reset flags
    face_state.eyes_squinted = false;
    face_state.right_eye_wink = false;
    face_state.show_thinking_spinner = false;
    face_state.pupil_offset_x = 0.0;
    face_state.pupil_offset_y = 0.0;

    // Set mood-specific flags
    switch(new_mood) {
        case MOOD_CREATIVE:
            face_state.eyes_squinted = true;
            break;
        case MOOD_HELPFUL:
            face_state.right_eye_wink = true;
            break;
        case MOOD_THINKING:
            face_state.show_thinking_spinner = true;
            face_state.pupil_offset_y = -0.5; // Look up
            face_state.pupil_offset_x = 0.5;  // Look right
            break;
        case MOOD_PHONE_HOME:
            face_state.pupil_offset_x = 1.0; // Look right
            break;
        default:
            break;
    }
}

// ============================
// FREERTOS TASKS
// ============================

void animation_task(void* param) {
    while(1) {
        updateBlinkAnimation();
        drawFace();

        face_state.frame_count++;
        vTaskDelay(pdMS_TO_TICKS(16)); // ~60fps
    }
}

void lvgl_task(void* param) {
    while(1) {
        lv_timer_handler();
        vTaskDelay(pdMS_TO_TICKS(5));
    }
}

// ============================
// SETUP & LOOP
// ============================

void setup() {
    Serial.begin(115200);
    Serial.println("Tomo Face Initializing...");

    // Initialize LCD and LVGL
    lcd_lvgl_Init();
    lcd_bl_pwm_bsp_init(200); // Brightness 0-255

    // Create canvas
    static lv_color_t cbuf[SCREEN_WIDTH * 10]; // Line buffer
    canvas = lv_canvas_create(lv_scr_act());
    lv_canvas_set_buffer(canvas, cbuf, SCREEN_WIDTH, SCREEN_HEIGHT, LV_IMG_CF_TRUE_COLOR);
    lv_obj_center(canvas);

    // Initialize face state
    face_state.current_mood = MOOD_FOCUSED;
    face_state.iris_color = getMoodColor(MOOD_FOCUSED);
    face_state.blink_progress = 0.0;
    face_state.last_blink_time = millis();
    face_state.pupil_offset_x = 0.0;
    face_state.pupil_offset_y = 0.0;
    face_state.eyes_squinted = false;
    face_state.right_eye_wink = false;
    face_state.show_thinking_spinner = false;
    face_state.frame_count = 0;

    // Start animation tasks
    xTaskCreate(animation_task, "Animation", 4096, NULL, 2, NULL);
    xTaskCreate(lvgl_task, "LVGL", 4096, NULL, 1, NULL);

    Serial.println("Tomo Face Ready!");
}

void loop() {
    // Demo: Cycle through moods every 5 seconds
    static unsigned long last_mood_change = 0;
    static int mood_index = 0;

    if (millis() - last_mood_change > 5000) {
        mood_index = (mood_index + 1) % 9;
        setMood((TomoMood)mood_index);
        Serial.print("Mood changed to: ");
        Serial.println(mood_index);
        last_mood_change = millis();
    }

    delay(100);
}
