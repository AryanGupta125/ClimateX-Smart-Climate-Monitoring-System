#include <Arduino.h>
#include <Wire.h>
#include <rgb_lcd.h>
#include <DHT.h>
#include <ArduinoBLE.h>

//==================================================
// Pin Definitions
//==================================================

#define DHT_PIN      12
#define BUZZER_PIN   11

#define DHTTYPE DHT11

//==================================================
// Objects
//==================================================

rgb_lcd lcd;
DHT dht(DHT_PIN, DHTTYPE);

//==================================================
// BLE Service
//==================================================

BLEService climateService("19B10000-E8F2-537E-4F6C-D104768A1214");

BLEFloatCharacteristic tempCharacteristic(
    "19B10001-E8F2-537E-4F6C-D104768A1214",
    BLERead | BLENotify);

BLEFloatCharacteristic humCharacteristic(
    "19B10002-E8F2-537E-4F6C-D104768A1214",
    BLERead | BLENotify);

//==================================================
// Variables
//==================================================

float temperature = NAN;
float humidity = NAN;

const float TEMP_THRESHOLD = 33.0;

bool bleConnected = false;
bool alarmState = false;

unsigned long lastSensorRead = 0;
unsigned long lastDisplayChange = 0;

const unsigned long SENSOR_INTERVAL = 2000;
const unsigned long DISPLAY_INTERVAL = 3000;

int currentScreen = 0;

//==================================================
// Function Prototypes
//==================================================

void setupBLE();
void readSensor();
void updateBuzzer();
void updateDisplay();

//==================================================
// Setup
//==================================================

void setup()
{
    Serial.begin(115200);

    Wire.begin();

    dht.begin();

    pinMode(BUZZER_PIN, OUTPUT);

    digitalWrite(BUZZER_PIN, LOW);

    lcd.begin(16,2);

    lcd.setRGB(0,255,255);

    lcd.clear();

    lcd.setCursor(0,0);
    lcd.print("Smart Climate");

    lcd.setCursor(0,1);
    lcd.print("Initializing");

    delay(2000);

    setupBLE();

    updateDisplay();
}

//==================================================
// Main Loop
//==================================================

void loop()
{
    BLE.poll();

    BLEDevice central = BLE.central();

    if (central)
        bleConnected = central.connected();
    else
        bleConnected = false;

    if (millis() - lastSensorRead >= SENSOR_INTERVAL)
    {
        lastSensorRead = millis();

        readSensor();

        updateBuzzer();

        updateDisplay();
    }

    if (millis() - lastDisplayChange >= DISPLAY_INTERVAL)
    {
        lastDisplayChange = millis();

        currentScreen++;

        if(currentScreen > 1)
            currentScreen = 0;

        updateDisplay();
    }
}

//==================================================
// Read DHT11
//==================================================

void readSensor()
{
    float t = dht.readTemperature();
    float h = dht.readHumidity();

    if (isnan(t) || isnan(h))
    {
        Serial.println("Failed to read DHT11");

        temperature = NAN;
        humidity = NAN;

        return;
    }

    temperature = t;
    humidity = h;

    Serial.print("Temperature : ");
    Serial.print(temperature);
    Serial.print(" C   ");

    Serial.print("Humidity : ");
    Serial.print(humidity);
    Serial.println(" %");

    tempCharacteristic.writeValue(temperature);
    humCharacteristic.writeValue(humidity);
}

//==================================================
// Buzzer Control
//==================================================

void updateBuzzer()
{
    if (isnan(temperature))
    {
        digitalWrite(BUZZER_PIN, LOW);
        alarmState = false;
        return;
    }

    if (temperature >= TEMP_THRESHOLD)
    {
        digitalWrite(BUZZER_PIN, HIGH);
        alarmState = true;
    }
    else
    {
        digitalWrite(BUZZER_PIN, LOW);
        alarmState = false;
    }
}
//==================================================
// BLE Setup
//==================================================

void setupBLE()
{
    if (!BLE.begin())
    {
        Serial.println("BLE Initialization Failed!");

        lcd.clear();
        lcd.setRGB(255,0,0);

        lcd.setCursor(0,0);
        lcd.print("BLE FAILED");

        while (1);
    }

    BLE.setLocalName("Nano33_Climate");

    BLE.setAdvertisedService(climateService);

    climateService.addCharacteristic(tempCharacteristic);
    climateService.addCharacteristic(humCharacteristic);

    BLE.addService(climateService);

    tempCharacteristic.writeValue(0.0f);
    humCharacteristic.writeValue(0.0f);

    BLE.advertise();

    Serial.println("BLE Advertising Started");

    lcd.clear();
    lcd.setRGB(0,255,0);

    lcd.setCursor(0,0);
    lcd.print("BLE Ready");

    lcd.setCursor(0,1);
    lcd.print("Advertising");

    delay(2000);
}

//==================================================
// LCD Display
//==================================================

void updateDisplay()
{
    lcd.clear();

    // ---------------- SENSOR ERROR ----------------

    if (isnan(temperature) || isnan(humidity))
    {
        lcd.setRGB(255,0,0);

        lcd.setCursor(0,0);
        lcd.print("Sensor Error");

        lcd.setCursor(0,1);
        lcd.print("Check DHT11");

        return;
    }

    // ---------------- SCREEN 1 ----------------

    if(currentScreen == 0)
    {
        lcd.setRGB(0,255,255);

        lcd.setCursor(0,0);
        lcd.print("Temp:");
        lcd.print(temperature,1);
        lcd.print((char)223);
        lcd.print("C");

        lcd.setCursor(0,1);
        lcd.print("Hum :");
        lcd.print(humidity,1);
        lcd.print("%");
    }

    // ---------------- SCREEN 2 ----------------

    else
    {
        if(alarmState)
            lcd.setRGB(255,0,0);
        else
            lcd.setRGB(0,255,0);

        lcd.setCursor(0,0);
        lcd.print("BLE:");

        if(bleConnected)
            lcd.print("Connected");
        else
            lcd.print("Waiting");

        lcd.setCursor(0,1);
        lcd.print("Alarm:");

        if(alarmState)
            lcd.print("ON ");
        else
            lcd.print("OFF");
    }
}