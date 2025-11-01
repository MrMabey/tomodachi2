/*
 * Minimal test to verify basic functionality
 */

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n\n=================================");
  Serial.println("MINIMAL TEST - If you see this, Serial works!");
  Serial.println("=================================\n");
}

void loop() {
  Serial.println("Loop running...");
  delay(2000);
}
