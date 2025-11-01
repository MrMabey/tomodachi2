/*
 * Smart Knob - Bluetooth HID Mouse Scroll Wheel (Native BLE)
 * Turn the knob to scroll up/down via Bluetooth
 * Uses ESP32's native BLE libraries (no external dependencies)
 */

#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include <BLEHIDDevice.h>

// Encoder pins (based on your hardware specs)
#define ENCODER_A_PIN 8
#define ENCODER_B_PIN 7

// BLE HID objects
BLEHIDDevice* hid;
BLECharacteristic* input;
bool connected = false;

// Encoder state tracking
volatile int lastEncoded = 0;
volatile long encoderValue = 0;
long lastEncoderValue = 0;

// HID Report Descriptor for a simple mouse with scroll wheel
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
  0x81, 0x02,        //     Input (Data,Var,Abs,No Wrap,Linear,Preferred State,No Null Position)
  0x95, 0x01,        //     Report Count (1)
  0x75, 0x05,        //     Report Size (5)
  0x81, 0x03,        //     Input (Const,Var,Abs,No Wrap,Linear,Preferred State,No Null Position)
  0x05, 0x01,        //     Usage Page (Generic Desktop Ctrls)
  0x09, 0x30,        //     Usage (X)
  0x09, 0x31,        //     Usage (Y)
  0x09, 0x38,        //     Usage (Wheel)
  0x15, 0x81,        //     Logical Minimum (-127)
  0x25, 0x7F,        //     Logical Maximum (127)
  0x75, 0x08,        //     Report Size (8)
  0x95, 0x03,        //     Report Count (3)
  0x81, 0x06,        //     Input (Data,Var,Rel,No Wrap,Linear,Preferred State,No Null Position)
  0xC0,              //   End Collection
  0xC0,              // End Collection
};

class MyServerCallbacks: public BLEServerCallbacks {
  void onConnect(BLEServer* pServer) {
    connected = true;
    Serial.println("✅ Bluetooth connected!");
  }

  void onDisconnect(BLEServer* pServer) {
    connected = false;
    Serial.println("❌ Bluetooth disconnected");
    // Restart advertising
    BLEDevice::startAdvertising();
    Serial.println("⏳ Advertising...");
  }
};

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

void setup() {
  Serial.begin(115200);
  Serial.println("\n🎛️ Smart Knob - Bluetooth Mouse Scroll (Native)");
  Serial.println("================================================");

  // Setup encoder pins
  pinMode(ENCODER_A_PIN, INPUT_PULLUP);
  pinMode(ENCODER_B_PIN, INPUT_PULLUP);
  lastEncoded = (digitalRead(ENCODER_A_PIN) << 1) | digitalRead(ENCODER_B_PIN);

  // Attach interrupts
  attachInterrupt(digitalPinToInterrupt(ENCODER_A_PIN), updateEncoder, CHANGE);
  attachInterrupt(digitalPinToInterrupt(ENCODER_B_PIN), updateEncoder, CHANGE);

  // Initialize BLE
  Serial.println("🔵 Initializing Bluetooth...");
  BLEDevice::init("Smart Knob Scroll");

  BLEServer* server = BLEDevice::createServer();
  server->setCallbacks(new MyServerCallbacks());

  // Create HID device
  hid = new BLEHIDDevice(server);
  input = hid->inputReport(1); // Report ID 1

  // Set HID information
  hid->manufacturer()->setValue("Tomodachi");
  hid->pnp(0x02, 0xe502, 0xa111, 0x0210);
  hid->hidInfo(0x00, 0x01);
  hid->reportMap((uint8_t*)hidReportDescriptor, sizeof(hidReportDescriptor));
  hid->startServices();

  // Setup advertising
  BLESecurity *security = new BLESecurity();
  security->setAuthenticationMode(ESP_LE_AUTH_BOND);

  BLEAdvertising *advertising = BLEDevice::getAdvertising();
  advertising->setAppearance(HID_MOUSE);
  advertising->addServiceUUID(hid->hidService()->getUUID());
  advertising->start();

  Serial.println("\n✅ Ready!");
  Serial.println("📱 Pair 'Smart Knob Scroll' in Bluetooth settings");
  Serial.println("🎛️  Turn the knob to scroll up/down");
  Serial.println("================================================\n");
}

void sendScroll(int8_t scroll) {
  if (!connected) return;

  // HID report: [buttons, x, y, wheel]
  uint8_t report[] = {0, 0, 0, scroll};
  input->setValue(report, sizeof(report));
  input->notify();
}

void loop() {
  if (connected) {
    // Check if encoder position changed
    if (encoderValue != lastEncoderValue) {
      long diff = encoderValue - lastEncoderValue;

      if (diff != 0) {
        // Send scroll (positive = up, negative = down)
        int8_t scrollAmount = constrain(diff, -127, 127);
        sendScroll(scrollAmount);

        // Debug output
        if (scrollAmount > 0) {
          Serial.print("↑ Scroll UP   | Amount: ");
        } else {
          Serial.print("↓ Scroll DOWN | Amount: ");
        }
        Serial.println(abs(scrollAmount));
      }

      lastEncoderValue = encoderValue;
    }
  } else {
    // Not connected - show waiting message occasionally
    static unsigned long lastPrint = 0;
    if (millis() - lastPrint > 3000) {
      Serial.println("⏳ Waiting for Bluetooth connection...");
      lastPrint = millis();
    }
  }

  delay(5);
}
