/*
 * Smart Knob - Button on Screen Test
 * Tap the green button on the knob's display to send signal to Mac
 */

#include "lcd_bsp.h"
#include "cst816.h"
#include "lcd_bl_pwm_bsp.h"
#include "lcd_config.h"
#include <WiFi.h>
#include <HTTPClient.h>

// WiFi credentials
const char* WIFI_SSID = "SETUP-959D";
const char* WIFI_PASSWORD = "booth1214canvas";
const char* MAC_URL = "http://192.168.0.65:8080/api/knob/trigger";

// LVGL button object
lv_obj_t *btn;
lv_obj_t *label;

// Button event callback
static void btn_event_cb(lv_event_t * e)
{
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

void createButton() {
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
}

void setup() {
    Serial.begin(115200);
    Serial.println("\n🎛️ Smart Knob - Button Test");

    // Initialize display and touch
    Touch_Init();
    lcd_lvgl_Init();
    lcd_bl_pwm_bsp_init(LCD_PWM_MODE_255);

    // Create button UI
    createButton();

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

    Serial.println("\nTap the green button on screen!");
}

void loop() {
    lv_timer_handler();
    delay(5);
}

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
