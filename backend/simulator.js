import mqtt from 'mqtt';

// The broker we are connecting to (must be the same as the server)
const BROKER_URL = 'mqtt://broker.hivemq.com';

// The device and site IDs we will simulate
const DEVICES = [
  { deviceId: 'dev-001', siteId: 'site-01' },
  { deviceId: 'dev-002', siteId: 'site-01' },
  { deviceId: 'dev-003', siteId: 'site-02' },
];

// Helper to get a random number in a range
const randomBetween = (min, max) => {
  return Math.random() * (max - min) + min;
};

// 1. Connect to the MQTT broker
const client = mqtt.connect(BROKER_URL, {
  clientId: `sim_${Math.random().toString(16).substr(2, 8)}`,
});

client.on('connect', () => {
  console.log('✅ [Simulator] Connected to MQTT broker.');

  // 2. Start publishing data every 3 seconds
  setInterval(() => {
    // Pick a random device to send data for
    const device = DEVICES[Math.floor(Math.random() * DEVICES.length)];

    // 3. Create the topic string
    const topic = `site/${device.siteId}/device/${device.deviceId}/telemetry`;

    // 4. Create the JSON payload (must match our Joi schema)
    const payload = {
      deviceId: device.deviceId,
      timestamp: new Date().toISOString(),
      data: {
        temperature: parseFloat(randomBetween(18.0, 37.0).toFixed(2)),
        humidity: parseFloat(randomBetween(40.0, 65.0).toFixed(2)),
      },
    };

    // 5. Publish the data
    client.publish(topic, JSON.stringify(payload), { qos: 1 }, (err) => {
      if (err) {
        console.error('[Simulator] Failed to publish:', err);
      } else {
        console.log(`[Simulator] Published to ${topic}: ${JSON.stringify(payload)}`);
      }
    });

  }, 3000); // Publish every 3 seconds
});

client.on('error', (err) => {
  console.error('[Simulator] Error:', err);
});