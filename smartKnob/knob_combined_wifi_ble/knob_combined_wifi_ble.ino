/*
 * Smart Knob - Combined WiFi Button + Bluetooth Scroll
 * Features:
 * - Green button on screen sends WiFi signal to Mac
 * - Physical knob rotation scrolls via Bluetooth
 */

#include "lcd_bsp.h"
#include "cst816.h"
#include "lcd_bl_pwm_bsp.h"
#include "lcd_config.h"
#include <WiFi.h>
#include <HTTPClient.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include <BLEHIDDevice.h>

// ==================== WiFi Configuration ====================
const char* WIFI_SSID = "SETUP-959D";
const char* WIFI_PASSWORD = "booth1214canvas";
const char* MAC_URL = "http://192.168.0.65:8080/api/knob/trigger";

// ==================== Encoder Configuration ====================
#define ENCODER_A_PIN 8
#define ENCODER_B_PIN 7

// ==================== LVGL UI Objects ====================
lv_obj_t *btn;
lv_obj_t *label;
lv_obj_t *statusLabel;

// ==================== Bluetooth HID Objects ====================
BLEHIDDevice* hid;
BLECharacteristic* input;
bool bleConnected = false;

// ==================== Encoder State ====================
volatile int lastEncoded = 0;
volatile long encoderValue = 0;
long lastEncoderValue = 0;

// ==================== Forward Declarations ====================
void updateStatusLabel();

// ==================== HID Report Descriptor ====================
const uint8_t hidReportDescriptor[] = {
  0x05, 0x01,        // Usage Page (Generic Desktop Ctrls)
  0x09, 0x02,        // Usage (Mouse)
  0xA1, 0x01,        // Collection (Application)
  0x09, 0x01,        //   Usage (Pointer)
  0xA1, 0x00,        //   Collection (Physical)
  0x05, 0x09,        //     Usage Page (Button)
  0x19, 0x01,        //     Usage Minimum (0x01)
  0x29, 0x03,        //     Usage Maximum (0x03)
  0x15, 0x00,        //     Logical Minimum (0)
  0x25, 0x01,        //     Logical Maximum (1)
  0x95, 0x03,        //     Report Count (3)
  0x75, 0x01,        //     Report Size (1)
  0x81, 0x02,        //     Input (Data,Var,Abs)
  0x95, 0x01,        //     Report Count (1)
  0x75, 0x05,        //     Report Size (5)
  0x81, 0x03,        //     Input (Const,Var,Abs)
  0x05, 0x01,        //     Usage Page (Generic Desktop Ctrls)
  0x09, 0x30,        //     Usage (X)
  0x09, 0x31,        //     Usage (Y)
  0x09, 0x38,        //     Usage (Wheel)
  0x15, 0x81,        //     Logical Minimum (-127)
  0x25, 0x7F,        //     Logical Maximum (127)
  0x75, 0x08,        //     Report Size (8)
  0x95, 0x03,        //     Report Count (3)
  0x81, 0x06,        //     Input (Data,Var,Rel)
  0xC0,              //   End Collection
  0xC0,              // End Collection
};

// ==================== Bluetooth Callbacks ====================
class MyServerCallbacks: public BLEServerCallbacks {
  void onConnect(BLEServer* pServer) {
    bleConnected = true;
    Serial.println("✅ Bluetooth connected!");

    // Workaround for macOS reconnection stability
    BLEDescriptor *desc = input->getDescriptorByUUID(BLEUUID((uint16_t)0x2902));
    uint8_t val[] = {0x01, 0x00};
    desc->setValue(val, 2);

    updateStatusLabel();
  }

  void onDisconnect(BLEServer* pServer) {
    bleConnected = false;
    Serial.println("❌ Bluetooth disconnected");
    BLEDevice::startAdvertising();
    Serial.println("⏳ Advertising...");
    updateStatusLabel();
  }
};

// ==================== Encoder Interrupt ====================
void IRAM_ATTR updateEncoder() {
  int MSB = digitalRead(ENCODER_A_PIN);
  int LSB = digitalRead(ENCODER_B_PIN);

  int encoded = (MSB << 1) | LSB;
  int sum = (lastEncoded << 2) | encoded;

  // Clockwise rotation (scroll up)
  if (sum == 0b1101 || sum == 0b0100 || sum == 0b0010 || sum == 0b1011) {
    encoderValue++;
  }
  // Counter-clockwise rotation (scroll down)
  if (sum == 0b1110 || sum == 0b0111 || sum == 0b0001 || sum == 0b1000) {
    encoderValue--;
  }

  lastEncoded = encoded;
}

// ==================== UI Functions ====================
static void btn_event_cb(lv_event_t * e) {
  lv_event_code_t code = lv_event_get_code(e);

  if(code == LV_EVENT_CLICKED) {
    Serial.println("🔘 Button tapped on screen!");

    // Change button color to show it was pressed
    lv_obj_set_style_bg_color(btn, lv_palette_main(LV_PALETTE_LIGHT_GREEN), 0);
    lv_label_set_text(label, "SENDING...");

    // Send to Mac
    sendToMac();

    // Reset after 1 second
    lv_timer_t *timer = lv_timer_create([](lv_timer_t *t) {
      lv_obj_set_style_bg_color(btn, lv_palette_main(LV_PALETTE_GREEN), 0);
      lv_label_set_text(label, "TAP ME!");
      lv_timer_del(t);
    }, 1000, NULL);
  }
}

void createUI() {
  // Create a big green button in the center
  btn = lv_btn_create(lv_scr_act());
  lv_obj_set_size(btn, 200, 100);
  lv_obj_align(btn, LV_ALIGN_CENTER, 0, 0);
  lv_obj_set_style_bg_color(btn, lv_palette_main(LV_PALETTE_GREEN), 0);
  lv_obj_set_style_shadow_width(btn, 10, 0);
  lv_obj_add_event_cb(btn, btn_event_cb, LV_EVENT_ALL, NULL);

  // Add label to button
  label = lv_label_create(btn);
  lv_label_set_text(label, "TAP ME!");
  lv_obj_set_style_text_font(label, &lv_font_montserrat_14, 0);
  lv_obj_center(label);

  // Add status label at top
  statusLabel = lv_label_create(lv_scr_act());
  lv_label_set_text(statusLabel, "Starting...");
  lv_obj_set_style_text_font(statusLabel, &lv_font_montserrat_14, 0);
  lv_obj_align(statusLabel, LV_ALIGN_TOP_MID, 0, 5);
}

void updateStatusLabel() {
  String status = "";
  if (WiFi.status() == WL_CONNECTED) status += "WiFi ";
  if (bleConnected) status += "BLE ";
  if (status == "") status = "Disconnected";
  lv_label_set_text(statusLabel, status.c_str());
}

// ==================== Network Functions ====================
void sendToMac() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ No WiFi - can't send");
    return;
  }

  HTTPClient http;
  http.begin(MAC_URL);
  http.addHeader("Content-Type", "application/json");

  String payload = "{\"state\":\"tapped\"}";
  int httpCode = http.POST(payload);

  if (httpCode == HTTP_CODE_OK) {
    Serial.println("✅ Sent to Mac - check browser!");
  } else {
    Serial.printf("⚠️ HTTP %d\n", httpCode);
  }

  http.end();
}

void sendScroll(int8_t scroll) {
  if (!bleConnected) return;

  // HID report: [buttons, x, y, wheel]
  uint8_t report[] = {0, 0, 0, scroll};
  input->setValue(report, sizeof(report));
  input->notify();
}

// ==================== Setup ====================
void setup() {
  Serial.begin(115200);
  Serial.println("\n🎛️ Smart Knob - WiFi Button + BLE Scroll");
  Serial.println("================================================");

  // Initialize display and touch
  Touch_Init();
  lcd_lvgl_Init();
  lcd_bl_pwm_bsp_init(LCD_PWM_MODE_255);

  // Create UI
  createUI();

  // Setup encoder pins
  pinMode(ENCODER_A_PIN, INPUT_PULLUP);
  pinMode(ENCODER_B_PIN, INPUT_PULLUP);
  lastEncoded = (digitalRead(ENCODER_A_PIN) << 1) | digitalRead(ENCODER_B_PIN);

  // Attach encoder interrupts
  attachInterrupt(digitalPinToInterrupt(ENCODER_A_PIN), updateEncoder, CHANGE);
  attachInterrupt(digitalPinToInterrupt(ENCODER_B_PIN), updateEncoder, CHANGE);

  // Connect to WiFi
  Serial.print("Connecting to WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi connected!");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n⚠️ WiFi failed - will work offline");
  }

  // Initialize Bluetooth HID
  Serial.println("🔵 Initializing Bluetooth HID...");
  BLEDevice::init("Smart Knob");

  BLEServer* server = BLEDevice::createServer();
  server->setCallbacks(new MyServerCallbacks());

  // Create HID device
  hid = new BLEHIDDevice(server);
  input = hid->inputReport(1);

  // Set HID information
  hid->manufacturer()->setValue("Tomodachi");
  hid->pnp(0x02, 0xe502, 0xa111, 0x0210);
  hid->hidInfo(0x00, 0x01);
  hid->reportMap((uint8_t*)hidReportDescriptor, sizeof(hidReportDescriptor));
  hid->startServices();

  // Setup BLE advertising
  BLESecurity *security = new BLESecurity();
  security->setAuthenticationMode(ESP_LE_AUTH_BOND);

  BLEAdvertising *advertising = BLEDevice::getAdvertising();
  advertising->setAppearance(HID_MOUSE);
  advertising->addServiceUUID(hid->hidService()->getUUID());
  advertising->start();

  Serial.println("✅ Bluetooth HID started!");
  Serial.println("\n================================================");
  Serial.println("Ready!");
  Serial.println("📱 Tap screen button to send WiFi signal");
  Serial.println("🎛️  Turn knob to scroll (pair Bluetooth first)");
  Serial.println("================================================\n");

  updateStatusLabel();
}

// ==================== Main Loop ====================
void loop() {
  // Handle LVGL UI updates
  lv_timer_handler();

  // Handle Bluetooth scroll
  if (bleConnected && encoderValue != lastEncoderValue) {
    long diff = encoderValue - lastEncoderValue;

    if (diff != 0) {
      // Send scroll (positive = up, negative = down)
      int8_t scrollAmount = constrain(diff, -127, 127);
      sendScroll(scrollAmount);

      // Debug output
      if (scrollAmount > 0) {
        Serial.print("↑ Scroll UP   | ");
      } else {
        Serial.print("↓ Scroll DOWN | ");
      }
      Serial.println(abs(scrollAmount));
    }

    lastEncoderValue = encoderValue;
  }

  delay(5);
}
