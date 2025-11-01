/*
 * Smart Knob - Bluetooth HID Scroll Wheel
 * Turn the knob to scroll up/down via Bluetooth
 * Works like a mouse scroll wheel on your Mac
 */

#include <BleKeyboard.h>

// Encoder pins (based on your hardware)
#define ENCODER_A_PIN 8
#define ENCODER_B_PIN 7

// Create Bluetooth Keyboard object (includes media keys)
BleKeyboard bleKeyboard("Smart Knob", "Tomodachi", 100);

// Encoder state tracking
volatile int lastEncoded = 0;
volatile long encoderValue = 0;
long lastEncoderValue = 0;

void IRAM_ATTR updateEncoder() {
  int MSB = digitalRead(ENCODER_A_PIN); // MSB = most significant bit
  int LSB = digitalRead(ENCODER_B_PIN); // LSB = least significant bit

  int encoded = (MSB << 1) | LSB; // Convert the 2 pin value to single number
  int sum = (lastEncoded << 2) | encoded; // Add it to the previous encoded value

  // Determine direction based on state transitions
  if (sum == 0b1101 || sum == 0b0100 || sum == 0b0010 || sum == 0b1011) {
    encoderValue++;
  }
  if (sum == 0b1110 || sum == 0b0111 || sum == 0b0001 || sum == 0b1000) {
    encoderValue--;
  }

  lastEncoded = encoded; // Store this value for next time
}

void setup() {
  Serial.begin(115200);
  Serial.println("\n🎛️ Smart Knob - Bluetooth Scroll Mode");

  // Setup encoder pins
  pinMode(ENCODER_A_PIN, INPUT_PULLUP);
  pinMode(ENCODER_B_PIN, INPUT_PULLUP);

  // Attach interrupts for encoder
  attachInterrupt(digitalPinToInterrupt(ENCODER_A_PIN), updateEncoder, CHANGE);
  attachInterrupt(digitalPinToInterrupt(ENCODER_B_PIN), updateEncoder, CHANGE);

  // Start Bluetooth HID
  Serial.println("Starting Bluetooth...");
  bleKeyboard.begin();

  Serial.println("✅ Bluetooth HID started!");
  Serial.println("Pair 'Smart Knob' in your Bluetooth settings");
  Serial.println("Turn the knob to scroll!");
}

void loop() {
  if (bleKeyboard.isConnected()) {
    // Check if encoder position changed
    if (encoderValue != lastEncoderValue) {
      long diff = encoderValue - lastEncoderValue;

      if (diff > 0) {
        // Scroll up (positive direction)
        Serial.print("↑ Scroll UP (");
        Serial.print(diff);
        Serial.println(")");

        // Send scroll up - each click scrolls by 1 unit
        for (int i = 0; i < abs(diff); i++) {
          bleKeyboard.write(KEY_UP_ARROW);  // Alternative: use mouse scroll
          delay(20);
        }
      }
      else if (diff < 0) {
        // Scroll down (negative direction)
        Serial.print("↓ Scroll DOWN (");
        Serial.print(abs(diff));
        Serial.println(")");

        // Send scroll down
        for (int i = 0; i < abs(diff); i++) {
          bleKeyboard.write(KEY_DOWN_ARROW);
          delay(20);
        }
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

  delay(10); // Small delay to prevent overwhelming the BLE connection
}
