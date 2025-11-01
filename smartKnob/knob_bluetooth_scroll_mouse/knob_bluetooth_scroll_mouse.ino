/*
 * Smart Knob - Bluetooth HID Mouse Scroll Wheel
 * Turn the knob to scroll up/down via Bluetooth
 * Uses proper mouse wheel HID reports for smooth scrolling
 */

#include <BleMouse.h>

// Encoder pins (based on your hardware specs)
#define ENCODER_A_PIN 8
#define ENCODER_B_PIN 7

// Create Bluetooth Mouse object
BleMouse bleMouse("Smart Knob Scroll", "Tomodachi", 100);

// Encoder state tracking
volatile int lastEncoded = 0;
volatile long encoderValue = 0;
long lastEncoderValue = 0;

// Scroll sensitivity (adjust this to control scroll speed)
#define SCROLL_MULTIPLIER 1  // Increase for faster scrolling

void IRAM_ATTR updateEncoder() {
  int MSB = digitalRead(ENCODER_A_PIN); // MSB = most significant bit
  int LSB = digitalRead(ENCODER_B_PIN); // LSB = least significant bit

  int encoded = (MSB << 1) | LSB; // Convert the 2 pin value to single number
  int sum = (lastEncoded << 2) | encoded; // Add it to the previous encoded value

  // Determine direction based on state transitions
  // Clockwise rotation (scroll up)
  if (sum == 0b1101 || sum == 0b0100 || sum == 0b0010 || sum == 0b1011) {
    encoderValue++;
  }
  // Counter-clockwise rotation (scroll down)
  if (sum == 0b1110 || sum == 0b0111 || sum == 0b0001 || sum == 0b1000) {
    encoderValue--;
  }

  lastEncoded = encoded; // Store this value for next time
}

void setup() {
  Serial.begin(115200);
  Serial.println("\n🎛️ Smart Knob - Bluetooth Mouse Scroll Mode");
  Serial.println("================================================");

  // Setup encoder pins with pull-ups
  pinMode(ENCODER_A_PIN, INPUT_PULLUP);
  pinMode(ENCODER_B_PIN, INPUT_PULLUP);

  // Read initial state
  lastEncoded = (digitalRead(ENCODER_A_PIN) << 1) | digitalRead(ENCODER_B_PIN);

  // Attach interrupts for encoder (trigger on any change)
  attachInterrupt(digitalPinToInterrupt(ENCODER_A_PIN), updateEncoder, CHANGE);
  attachInterrupt(digitalPinToInterrupt(ENCODER_B_PIN), updateEncoder, CHANGE);

  // Start Bluetooth HID Mouse
  Serial.println("🔵 Starting Bluetooth HID Mouse...");
  bleMouse.begin();

  Serial.println("\n✅ Ready!");
  Serial.println("📱 Pair 'Smart Knob Scroll' in Bluetooth settings");
  Serial.println("🎛️  Turn the knob to scroll up/down");
  Serial.println("================================================\n");
}

void loop() {
  if (bleMouse.isConnected()) {
    // Check if encoder position changed
    if (encoderValue != lastEncoderValue) {
      long diff = encoderValue - lastEncoderValue;

      // Apply scroll multiplier
      signed char scrollAmount = diff * SCROLL_MULTIPLIER;

      if (scrollAmount != 0) {
        // Send mouse wheel scroll
        // Positive values scroll up, negative scroll down
        bleMouse.move(0, 0, scrollAmount);

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
      Serial.println("   Make sure to pair in System Settings > Bluetooth");
      lastPrint = millis();
    }
  }

  delay(5); // Small delay for stability
}
