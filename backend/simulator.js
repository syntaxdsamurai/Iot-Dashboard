import mqtt from 'mqtt';

// The broker we are connecting to (must be the same as the server)
const BROKER_URL = 'mqtt://broker.hivemq.com';

// --- NEW "SMART" SIMULATOR LOGIC ---

// Define the unique profiles for each device
const devices = {
  'dev-001': {
    siteId: 'site-01',
    name: 'Server Room',
    // Hot and Dry
    temp: { base: 30, variance: 5 }, // 25 to 35°C
    humid: { base: 30, variance: 5 }, // 25 to 35%
  },
  'dev-002': {
    siteId: 'site-01',
    name: 'Main Office',
    // Cool and Stable
    temp: { base: 22, variance: 2 }, // 20 to 24°C
    humid: { base: 45, variance: 3 }, // 42 to 48%
  },
  'dev-003': {
    siteId: 'site-02',
    name: 'Storage Area',
    // Cold and Humid
    temp: { base: 15, variance: 3 }, // 12 to 18°C
    humid: { base: 65, variance: 5 }, // 60 to 70%
  },
};

// Helper to get a random number around a base value
const fluctuate = (base, variance) => {
  const value = base + (Math.random() * variance * 2 - variance);
  return parseFloat(value.toFixed(2));
};

// 1. Connect to the MQTT broker
const client = mqtt.connect(BROKER_URL, {
  clientId: `sim_smart_${Math.random().toString(16).substr(2, 8)}`,
});

client.on('connect', () => {
  console.log('✅ [Simulator] Connected to MQTT broker.');

  // 2. Start publishing data every 3 seconds
  setInterval(() => {
    // Loop through each device and send an update
    for (const deviceId in devices) {
      const device = devices[deviceId];

      // 3. Create the topic string
      const topic = `site/${device.siteId}/device/${deviceId}/telemetry`;

      // 4. Create the JSON payload from the device's unique profile
      const payload = {
        deviceId: deviceId,
        timestamp: new Date().toISOString(), // This is the correct timestamp
        data: {
          temperature: fluctuate(device.temp.base, device.temp.variance),
          humidity: fluctuate(device.humid.base, device.humid.variance),
        },
      };

      // 5. Publish the data
      client.publish(topic, JSON.stringify(payload), { qos: 1 }, (err) => {
        if (err) {
          console.error(`[Simulator] Failed to publish for ${deviceId}:`, err);
        }
      });
    }
    console.log('[Simulator] Published new data for all 3 devices.');
  }, 3000); // Publish every 3 seconds
});

client.on('error', (err) => {
  console.error('[Simulator] Error:', err);
});

