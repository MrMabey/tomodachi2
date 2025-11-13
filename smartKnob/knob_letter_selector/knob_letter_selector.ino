/*
 * Smart Knob - Letter Selector
 * Features:
 * - Turn knob to select letters (A-Z, Space, Backspace)
 * - Tap screen to confirm/save the selected letter
 * - Display shows current letter and word being built
 */

#include "lcd_bsp.h"
#include "cst816.h"
#include "lcd_bl_pwm_bsp.h"
#include "lcd_config.h"

// ==================== Encoder Configuration ====================
#define ENCODER_A_PIN 8
#define ENCODER_B_PIN 7

// ==================== Letter Selection Configuration ====================
const char LETTERS[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZ _<"; // _ = space, < = backspace
const int NUM_LETTERS = sizeof(LETTERS) - 1; // -1 for null terminator
const int MAX_WORD_LENGTH = 20;

// ==================== LVGL UI Objects ====================
lv_obj_t *letterLabel;        // Shows current letter
lv_obj_t *wordLabel;          // Shows word being built
lv_obj_t *instructionLabel;   // Shows instructions
lv_obj_t *touchArea;          // Invisible touch area covering screen

// ==================== State Variables ====================
volatile int lastEncoded = 0;
volatile long encoderValue = 0;
long lastEncoderValue = 0;
int currentLetterIndex = 0;
char currentWord[MAX_WORD_LENGTH + 1] = "";
int wordLength = 0;

// ==================== Forward Declarations ====================
void updateLetterDisplay();
void addLetterToWord();
void updateWordDisplay();

// ==================== Encoder Interrupt ====================
void IRAM_ATTR updateEncoder() {
  int MSB = digitalRead(ENCODER_A_PIN);
  int LSB = digitalRead(ENCODER_B_PIN);

  int encoded = (MSB << 1) | LSB;
  int sum = (lastEncoded << 2) | encoded;

  // Clockwise rotation (next letter)
  if (sum == 0b1101 || sum == 0b0100 || sum == 0b0010 || sum == 0b1011) {
    encoderValue++;
  }
  // Counter-clockwise rotation (previous letter)
  if (sum == 0b1110 || sum == 0b0111 || sum == 0b0001 || sum == 0b1000) {
    encoderValue--;
  }

  lastEncoded = encoded;
}

// ==================== UI Event Handlers ====================
static void screen_tap_event_cb(lv_event_t * e) {
  lv_event_code_t code = lv_event_get_code(e);

  if(code == LV_EVENT_CLICKED) {
    Serial.println("🔘 Screen tapped - saving letter!");
    addLetterToWord();
  }
}

// ==================== UI Creation ====================
void createUI() {
  lv_obj_t *scr = lv_scr_act();

  // Create invisible full-screen touch area
  touchArea = lv_obj_create(scr);
  lv_obj_set_size(touchArea, LV_HOR_RES, LV_VER_RES);
  lv_obj_set_pos(touchArea, 0, 0);
  lv_obj_set_style_bg_opa(touchArea, LV_OPA_TRANSP, 0);
  lv_obj_set_style_border_width(touchArea, 0, 0);
  lv_obj_add_flag(touchArea, LV_OBJ_FLAG_CLICKABLE);
  lv_obj_add_event_cb(touchArea, screen_tap_event_cb, LV_EVENT_ALL, NULL);

  // Create instruction label at top
  instructionLabel = lv_label_create(scr);
  lv_label_set_text(instructionLabel, "Turn: Select | Tap: Save");
  lv_obj_set_style_text_font(instructionLabel, &lv_font_montserrat_12, 0);
  lv_obj_set_style_text_color(instructionLabel, lv_color_hex(0x888888), 0);
  lv_obj_align(instructionLabel, LV_ALIGN_TOP_MID, 0, 5);

  // Create large letter display in center
  letterLabel = lv_label_create(scr);
  lv_label_set_text(letterLabel, "A");
  lv_obj_set_style_text_font(letterLabel, &lv_font_montserrat_48, 0);
  lv_obj_set_style_text_color(letterLabel, lv_color_hex(0x00FF00), 0);
  lv_obj_align(letterLabel, LV_ALIGN_CENTER, 0, 0);

  // Create word display at bottom
  wordLabel = lv_label_create(scr);
  lv_label_set_text(wordLabel, "");
  lv_obj_set_style_text_font(wordLabel, &lv_font_montserrat_14, 0);
  lv_obj_set_style_text_color(wordLabel, lv_color_hex(0xFFFFFF), 0);
  lv_obj_align(wordLabel, LV_ALIGN_BOTTOM_MID, 0, -10);
  lv_label_set_long_mode(wordLabel, LV_LABEL_LONG_SCROLL_CIRCULAR);
  lv_obj_set_width(wordLabel, LV_HOR_RES - 20);
}

// ==================== Letter Selection Functions ====================
void updateLetterDisplay() {
  // Wrap around the letter index
  currentLetterIndex = encoderValue % NUM_LETTERS;
  if (currentLetterIndex < 0) {
    currentLetterIndex += NUM_LETTERS;
  }

  char currentLetter = LETTERS[currentLetterIndex];

  // Display special characters with names
  if (currentLetter == ' ') {
    lv_label_set_text(letterLabel, "[SPC]");
  } else if (currentLetter == '_') {
    lv_label_set_text(letterLabel, "[SPC]");
  } else if (currentLetter == '<') {
    lv_label_set_text(letterLabel, "[DEL]");
  } else {
    char letterStr[2] = {currentLetter, '\0'};
    lv_label_set_text(letterLabel, letterStr);
  }

  // Visual feedback - flash the letter briefly
  lv_obj_set_style_text_color(letterLabel, lv_color_hex(0x00FFFF), 0);
  lv_timer_t *timer = lv_timer_create([](lv_timer_t *t) {
    lv_obj_set_style_text_color(letterLabel, lv_color_hex(0x00FF00), 0);
    lv_timer_del(t);
  }, 50, NULL);
}

void addLetterToWord() {
  char selectedLetter = LETTERS[currentLetterIndex];

  // Handle backspace
  if (selectedLetter == '<') {
    if (wordLength > 0) {
      wordLength--;
      currentWord[wordLength] = '\0';
      Serial.print("⌫ Backspace - Word: ");
      Serial.println(currentWord);
    }
  }
  // Handle space (both ' ' and '_')
  else if (selectedLetter == ' ' || selectedLetter == '_') {
    if (wordLength < MAX_WORD_LENGTH) {
      currentWord[wordLength] = ' ';
      wordLength++;
      currentWord[wordLength] = '\0';
      Serial.print("␣ Space added - Word: ");
      Serial.println(currentWord);
    }
  }
  // Handle regular letters
  else {
    if (wordLength < MAX_WORD_LENGTH) {
      currentWord[wordLength] = selectedLetter;
      wordLength++;
      currentWord[wordLength] = '\0';
      Serial.print("✓ Added '");
      Serial.print(selectedLetter);
      Serial.print("' - Word: ");
      Serial.println(currentWord);
    } else {
      Serial.println("⚠️ Word is full!");
    }
  }

  updateWordDisplay();

  // Visual feedback - flash the entire screen briefly
  lv_obj_set_style_bg_color(lv_scr_act(), lv_color_hex(0x111111), 0);
  lv_timer_t *timer = lv_timer_create([](lv_timer_t *t) {
    lv_obj_set_style_bg_color(lv_scr_act(), lv_color_hex(0x000000), 0);
    lv_timer_del(t);
  }, 100, NULL);
}

void updateWordDisplay() {
  if (wordLength == 0) {
    lv_label_set_text(wordLabel, "[empty]");
    lv_obj_set_style_text_color(wordLabel, lv_color_hex(0x666666), 0);
  } else {
    lv_label_set_text(wordLabel, currentWord);
    lv_obj_set_style_text_color(wordLabel, lv_color_hex(0xFFFFFF), 0);
  }
}

// ==================== Setup ====================
void setup() {
  Serial.begin(115200);
  Serial.println("\n✏️ Smart Knob - Letter Selector");
  Serial.println("================================================");
  Serial.println("Turn the knob to select letters");
  Serial.println("Tap the screen to save the selected letter");
  Serial.println("================================================\n");

  // Initialize display and touch
  Touch_Init();
  lcd_lvgl_Init();
  lcd_bl_pwm_bsp_init(LCD_PWM_MODE_255);

  // Create UI
  createUI();
  updateWordDisplay();

  // Setup encoder pins
  pinMode(ENCODER_A_PIN, INPUT_PULLUP);
  pinMode(ENCODER_B_PIN, INPUT_PULLUP);
  lastEncoded = (digitalRead(ENCODER_A_PIN) << 1) | digitalRead(ENCODER_B_PIN);

  // Attach encoder interrupts
  attachInterrupt(digitalPinToInterrupt(ENCODER_A_PIN), updateEncoder, CHANGE);
  attachInterrupt(digitalPinToInterrupt(ENCODER_B_PIN), updateEncoder, CHANGE);

  Serial.println("✅ Ready! Start spelling!");
  Serial.println("Current letter: A\n");
}

// ==================== Main Loop ====================
void loop() {
  // Handle LVGL UI updates
  lv_timer_handler();

  // Handle encoder changes
  if (encoderValue != lastEncoderValue) {
    updateLetterDisplay();

    char currentLetter = LETTERS[currentLetterIndex];
    Serial.print("🎛️  Letter: ");
    if (currentLetter == ' ' || currentLetter == '_') {
      Serial.println("[SPACE]");
    } else if (currentLetter == '<') {
      Serial.println("[BACKSPACE]");
    } else {
      Serial.println(currentLetter);
    }

    lastEncoderValue = encoderValue;
  }

  delay(5);
}
