import mqtt from 'mqtt';
import Joi from 'joi';
import Telemetry from '../models/telemetryModel.js';
import { getIO } from './socketService.js';

export let mqttClient = null;

// Define the expected JSON payload schema using Joi
const telemetrySchema = Joi.object({
  deviceId: Joi.string().required(),
  timestamp: Joi.date().iso().required(),
  data: Joi.object({
    temperature: Joi.number().required(),
    humidity: Joi.number().required(),
    pressure: Joi.number().optional(),
  }).required(),
});

/**
 * Validates and processes an incoming MQTT message.
 * @param {string} topic - The topic the message was received on.
 * @param {Buffer} payload - The raw message payload.
 */
const handleIncomingMessage = async (topic, payload) => {
  const io = getIO();
  let message;

  // 1. Parse Topic
  // Topic structure: site/{siteId}/device/{deviceId}/telemetry
  const topicParts = topic.split('/');
  if (topicParts.length !== 5 || topicParts[4] !== 'telemetry') {
    console.warn(`[MQTT] Received message on invalid topic: ${topic}`);
    return;
  }
  const siteId = topicParts[1];
  const deviceIdFromTopic = topicParts[3];

  // 2. Parse and Validate Payload
  try {
    message = JSON.parse(payload.toString());
    
    // Ensure deviceId in payload matches topic
    if (message.deviceId !== deviceIdFromTopic) {
      throw new Error('DeviceId in payload does not match topic');
    }

    // Validate the schema
    const { error } = telemetrySchema.validate(message);
    if (error) {
      throw new Error(`Payload validation failed: ${error.message}`);
    }
  } catch (err) {
    console.error(`[MQTT] Failed to parse/validate payload from ${topic}: ${err.message}`);
    return; // Discard malformed message
  }

  // 3. Prepare data for storage and broadcast
  const dataToStore = {
    deviceId: message.deviceId,
    siteId: siteId,
    data: message.data,
    sensorTimestamp: message.timestamp,
  };
  
  // 4. Check for Alerts
  let alert = null;
  if (message.data.temperature > 35) { // Example alert threshold
    alert = {
      type: 'warning',
      message: `Device ${message.deviceId} high temperature: ${message.data.temperature}°C`,
    };
  }
  
  // 5. Save to Database (asynchronously)
  try {
    const newTelemetry = new Telemetry(dataToStore);
    await newTelemetry.save();
  } catch (err) {
    console.error(`[MongoDB] Failed to save telemetry: ${err.message}`);
  }

  // 6. Broadcast via Socket.IO
  const dataToBroadcast = {
    ...dataToStore,
    alert: alert,
    timestamp: new Date().toISOString() // Add server ingest time
  };

  // Broadcast to the 'all' room
  io.to('all').emit('new-telemetry', dataToBroadcast);
  
  // Broadcast to the specific device room
  io.to(message.deviceId).emit('new-telemetry', dataToBroadcast);
};

/**
 * Connects to the MQTT broker and subscribes to topics.
 * @param {object} io - The Socket.IO server instance.
 */
export const connectToMQTT = (io) => {
  if (!process.env.MQTT_BROKER_URL) {
    throw new Error('MQTT_BROKER_URL is not defined in .env file');
  }

  const options = {
    clientId: `iot_backend_${Math.random().toString(16).substr(2, 8)}`,
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
    connectTimeout: 4000,
    reconnectPeriod: 1000,
  };

  mqttClient = mqtt.connect(process.env.MQTT_BROKER_URL, options);

  // --- MQTT Event Handlers ---

  mqttClient.on('connect', () => {
    console.log('[MQTT] Connected to broker');
    // Subscribe to all telemetry topics using a wildcard
    // QoS 1: At least once delivery
    const topic = 'site/+/device/+/telemetry';
    mqttClient.subscribe(topic, { qos: 1 }, (err) => {
      if (!err) {
        console.log(`[MQTT] Subscribed to: ${topic}`);
      } else {
        console.error(`[MQTT] Subscription failed: ${err.message}`);
      }
    });
  });

  mqttClient.on('message', handleIncomingMessage);

  mqttClient.on('error', (err) => {
    console.error(`[MQTT] Client error: ${err.message}`);
  });

  mqttClient.on('reconnect', () => {
    console.log('[MQTT] Reconnecting to broker...');
  });

  mqttClient.on('offline', () => {
    console.log('[MQTT] Client is offline');
  });
};