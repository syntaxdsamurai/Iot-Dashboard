import 'dotenv/config'; // Load .env file at the very top
import http from 'http';
import app from './src/app.js';
import { connectDB } from './src/config/db.js';
import { initSocketService } from './src/services/socketService.js';
import { mqttClient, connectToMQTT } from './src/services/mqttService.js';

const PORT = process.env.PORT || 3001;

// Create the main HTTP server
const server = http.createServer(app);

// Initialize Socket.IO service and attach to the server
const io = initSocketService(server);

// --- Main Application Start ---

const startServer = async () => {
  try {
    // 1. Connect to MongoDB
    await connectDB();
    console.log('✅ Successfully connected to MongoDB');

    // 2. Connect to MQTT Broker
    // We pass 'io' so the MQTT service can broadcast messages
    await connectToMQTT(io);
    console.log('✅ Successfully connected to MQTT Broker');

    // 3. Start the Express server
    server.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nGracefully shutting down...');
  mqttClient.end(false, () => {
    console.log('MQTT client disconnected.');
    server.close(() => {
      console.log('Server shut down.');
      process.exit(0);
    });
  });
});

startServer();