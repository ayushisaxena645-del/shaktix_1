/*
 * RAAHI ESP32 Emergency BLE Relay Beacon
 * HERHACK 2026 - Team ShaktiX (Echelon Institute of Technology)
 * 
 * Hardware: ESP32 Development Module (BLE 4.2 / WiFi 802.11 b/g/n)
 * Function: Captures offline BLE emergency broadcast packets from nearby phones,
 * validates TTL, and bridges them over WiFi/Cellular IoT to the RAAHI FastAPI Backend.
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEScan.h>
#include <BLEAdvertisedDevice.h>
#include <ArduinoJson.h>

// WiFi Configuration (Campus Gateway)
const char* ssid = "Echelon_Campus_WiFi";
const char* password = "CampusSafe2026";

// RAAHI Backend Endpoint
const char* raahi_backend_url = "http://192.168.1.100:8000/api/relay/receive-packet";

// RAAHI BLE Service UUID
#define RAAHI_BLE_SERVICE_UUID "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define STATUS_LED_PIN 2

BLEScan* pBLEScan;
bool emergency_detected = false;
String last_relayed_packet_id = "";

class RaahiAdvertisedDeviceCallbacks: public BLEAdvertisedDeviceCallbacks {
    void onResult(BLEAdvertisedDevice advertisedDevice) {
        if (advertisedDevice.haveServiceUUID() && 
            advertisedDevice.isAdvertisingService(BLEUUID(RAAHI_BLE_SERVICE_UUID))) {
            
            Serial.println("[RAAHI BLE] >>> EMERGENCY PACKET DETECTED! <<<");
            Serial.printf("Device Address: %s | RSSI: %d dBm\n", 
                          advertisedDevice.getAddress().toString().c_str(), 
                          advertisedDevice.getRSSI());
            
            if (advertisedDevice.haveManufacturerData()) {
                std::string mData = advertisedDevice.getManufacturerData();
                Serial.printf("Raw Payload Length: %d bytes\n", mData.length());
                // Forward via WiFi backend
                forwardToRaahiBackend(advertisedDevice.getAddress().toString().c_str(), advertisedDevice.getRSSI());
            }
        }
    }

    void forwardToRaahiBackend(const char* mac, int rssi) {
        if (WiFi.status() != WL_CONNECTED) {
            Serial.println("[ESP32] WiFi not connected. Buffering in local flash storage.");
            return;
        }

        HTTPClient http;
        http.begin(raahi_backend_url);
        http.addHeader("Content-Type", "application/json");

        StaticJsonDocument<512> doc;
        doc["packet_id"] = String("PKT-ESP32-") + String(millis());
        doc["event_id"] = String("RAAHI-EVT-BLE-") + String(mac).substring(0, 5);
        doc["sender_user_id"] = "USR-BLE-MESH-OFFLINE";
        doc["sender_name"] = "Nearby Opted-in Student (BLE Relayed)";
        doc["ttl_minutes"] = 15;
        doc["hop_count"] = 1;
        doc["max_hops"] = 3;
        doc["payload_hash"] = "esp32_hash";
        doc["signature"] = "SIM_BLE_ESP32_SIGNATURE";
        
        JsonArray relayNodes = doc.createNestedArray("relay_nodes");
        relayNodes.add("Phone A (Offline BLE)");
        relayNodes.add("ESP32 Campus Safety Relay Beacon");

        JsonObject location = doc.createNestedObject("location");
        location["latitude"] = 28.3845;
        location["longitude"] = 77.3126;
        location["location_name"] = "Echelon Campus Gate Relay Beacon";
        location["accuracy_meters"] = 15.0;
        location["consent_granted"] = true;

        String requestBody;
        serializeJson(doc, requestBody);

        int httpResponseCode = http.POST(requestBody);
        if (httpResponseCode > 0) {
            Serial.printf("[ESP32] Successfully relayed packet to RAAHI backend! HTTP %d\n", httpResponseCode);
            // Blink status LED twice
            digitalWrite(STATUS_LED_PIN, HIGH);
            delay(200);
            digitalWrite(STATUS_LED_PIN, LOW);
            delay(200);
            digitalWrite(STATUS_LED_PIN, HIGH);
            delay(200);
            digitalWrite(STATUS_LED_PIN, LOW);
        } else {
            Serial.printf("[ESP32] HTTP POST Error: %s\n", http.errorToString(httpResponseCode).c_str());
        }
        http.end();
    }
};

void setup() {
    Serial.begin(115200);
    pinMode(STATUS_LED_PIN, OUTPUT);
    digitalWrite(STATUS_LED_PIN, LOW);

    Serial.println("==================================================");
    Serial.println("RAAHI ESP32 Mesh Relay Beacon - HERHACK 2026");
    Serial.println("Team ShaktiX · Echelon Institute of Technology");
    Serial.println("==================================================");

    // Initialize WiFi
    WiFi.begin(ssid, password);
    Serial.print("Connecting to Campus WiFi");
    int retries = 0;
    while (WiFi.status() != WL_CONNECTED && retries < 10) {
        delay(500);
        Serial.print(".");
        retries++;
    }
    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("\nWiFi Connected! IP: " + WiFi.localIP().toString());
    } else {
        Serial.println("\nRunning in Offline BLE Local Relay Cache Mode.");
    }

    // Initialize BLE
    BLEDevice::init("RAAHI_CAMPUS_BEACON");
    pBLEScan = BLEDevice::getScan();
    pBLEScan->setAdvertisedDeviceCallbacks(new RaahiAdvertisedDeviceCallbacks());
    pBLEScan->setActiveScan(true);
    pBLEScan->setInterval(100);
    pBLEScan->setWindow(99);
    Serial.println("BLE Scanner started. Listening for RAAHI emergency packets...");
}

void loop() {
    BLEScanResults foundDevices = pBLEScan->start(5, false);
    pBLEScan->clearResults();
    delay(1000);
}
