# IoT Real-Time Dashboard

A full-stack IoT monitoring system that displays real-time sensor telemetry data from multiple devices. Built with React, Node.js, Express, MongoDB, MQTT, and Socket.IO.

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [MQTT Topics](#mqtt-topics)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

- **Real-Time Data Visualization**: Live charts displaying temperature and humidity from multiple IoT devices
- **Multi-Device Support**: Monitor and filter data by specific devices or view all devices simultaneously
- **Historical Data**: Fetch and display historical telemetry data for 1 hour, 6 hours, or 24 hours
- **Device Presence Tracking**: Real-time online/offline status for each device
- **Alert System**: Toast notifications for threshold violations (e.g., high temperature)
- **Responsive Design**: Modern, dark-themed UI that works on all screen sizes
- **Auto-scaling Charts**: Dynamic chart axes that adjust to actual data ranges
- **Data Persistence**: MongoDB storage with automatic 30-day TTL (Time-To-Live)

## 🏗️ Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   MQTT      │ ──MQTT──│   Backend    │ ──HTTP──│   Frontend  │
│  Broker     │         │  (Node.js)   │         │   (React)   │
│ (HiveMQ)    │         │              │         │             │
└─────────────┘         │  - Express   │         │  - Vite     │
                        │  - Socket.IO │◄─WS────│  - Chart.js │
                        │  - MongoDB   │         │  - Axios    │
                        └──────────────┘         └─────────────┘
                               │
                               ▼
                        ┌──────────────┐
                        │   MongoDB    │
                        │   Database   │
                        └──────────────┘
```

### Data Flow

1. **MQTT Devices** → Publish telemetry to MQTT broker
2. **Backend** → Subscribes to MQTT topics, validates data
3. **MongoDB** → Stores validated telemetry data
4. **Socket.IO** → Broadcasts real-time data to connected clients
5. **Frontend** → Displays live charts and device status

## 🛠️ Tech Stack

### Backend
- **Node.js** (v18+) - Runtime environment
- **Express.js** - Web framework
- **MongoDB** (v8+) - Database
- **Mongoose** - MongoDB ODM
- **MQTT.js** - MQTT client
- **Socket.IO** - WebSocket server
- **Joi** - Data validation
- **Helmet** - Security middleware
- **Morgan** - HTTP logger

### Frontend
- **React** (v19+) - UI framework
- **Vite** - Build tool
- **Chart.js** - Data visualization
- **Socket.IO Client** - WebSocket client
- **Axios** - HTTP client
- **React Toastify** - Notifications

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **MongoDB** (v8.0.0 or higher) - Local or cloud instance
- **Git** - For cloning the repository

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/iot-dashboard.git
cd iot-dashboard
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

## ⚙️ Configuration

### Backend Configuration

Create a `.env` file in the `backend` directory:

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173

# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/iot_dashboard

# MQTT Broker Configuration
MQTT_BROKER_URL=mqtt://broker.hivemq.com
MQTT_USERNAME=
MQTT_PASSWORD=

# JWT Secret (for future authentication)
JWT_SECRET=your_secret_key_here
```

### Frontend Configuration

Create a `.env` file in the `frontend` directory:

```bash
cd frontend
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Backend Server URL
VITE_SERVER_URL=http://localhost:3001
```

### MongoDB Setup

#### Option 1: Local MongoDB

```bash
# Install MongoDB (Ubuntu/Debian)
sudo apt-get install mongodb

# Start MongoDB service
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

#### Option 2: MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `MONGO_URI` in backend `.env`

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/iot_dashboard
```

## 🏃 Running the Application

### Development Mode

#### 1. Start the Backend Server

```bash
cd backend
npm run dev
```

The backend will start on `http://localhost:3001`

#### 2. Start the Frontend Development Server

Open a new terminal:

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

#### 3. (Optional) Run the Device Simulator

Open a third terminal to simulate IoT devices:

```bash
cd backend
node simulator.js
```

This will simulate 3 devices sending telemetry data every 3 seconds:
- `dev-001` - Server Room (Hot & Dry)
- `dev-002` - Main Office (Cool & Stable)
- `dev-003` - Storage Area (Cold & Humid)

### Production Mode

#### Build the Frontend

```bash
cd frontend
npm run build
```

#### Start the Backend

```bash
cd backend
npm start
```

## 📁 Project Structure

```
iot-dashboard/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # MongoDB connection
│   │   ├── controllers/
│   │   │   └── telemetryController.js # API route handlers
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js     # JWT authentication
│   │   │   └── errorMiddleware.js    # Error handling
│   │   ├── models/
│   │   │   └── telemetryModel.js     # Mongoose schema
│   │   ├── routes/
│   │   │   └── telemetryRoutes.js    # API routes
│   │   ├── services/
│   │   │   ├── mqttService.js        # MQTT client
│   │   │   └── socketService.js      # Socket.IO server
│   │   └── app.js                    # Express app
│   ├── .env                          # Environment variables
│   ├── .env.example                  # Environment template
│   ├── server.js                     # Entry point
│   ├── simulator.js                  # Device simulator
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AlertBadge.jsx        # Alert display
│   │   │   ├── DeviceStatus.jsx      # Device list
│   │   │   ├── HistoryControls.jsx   # Time range controls
│   │   │   └── LiveChart.jsx         # Chart component
│   │   ├── hooks/
│   │   │   ├── useApi.js             # API hook
│   │   │   └── useSocket.js          # WebSocket hook
│   │   ├── pages/
│   │   │   └── Dashboard.jsx         # Main dashboard
│   │   ├── services/
│   │   │   ├── api.js                # HTTP client
│   │   │   └── socket.js             # WebSocket client
│   │   ├── App.jsx                   # Root component
│   │   ├── main.jsx                  # Entry point
│   │   └── index.css                 # Global styles
│   ├── .env                          # Environment variables
│   ├── .env.example                  # Environment template
│   ├── vite.config.js                # Vite configuration
│   └── package.json
├── .gitignore
└── README.md
```

## 📡 API Documentation

### Base URL

```
http://localhost:3001/api
```

### Endpoints

#### 1. Get Historical Telemetry

```http
GET /telemetry/history?device={deviceId}&range={timeRange}
```

**Query Parameters:**
- `device` (string): Device ID or "all" for all devices
- `range` (string): Time range - "1h", "6h", or "24h"

**Response:**

```json
[
  {
    "temperature": 25.5,
    "humidity": 60.2,
    "timestamp": "2025-01-10T12:00:00.000Z",
    "deviceId": "dev-001"
  }
]
```

#### 2. Get Aggregate Data

```http
GET /telemetry/aggregates?device={deviceId}&range={timeRange}
```

**Query Parameters:**
- `device` (string): Device ID or "all"
- `range` (string): "1h", "6h", or "24h"

**Response:**

```json
{
  "count": 100,
  "temperature": {
    "avg": 25.5,
    "min": 20.1,
    "max": 30.8
  },
  "humidity": {
    "avg": 60.2,
    "min": 55.0,
    "max": 65.5
  }
}
```

### WebSocket Events

#### Client → Server

**Join Room:**
```javascript
socket.emit('join-room', 'dev-001');
socket.emit('join-room', 'all');
```

**Leave Room:**
```javascript
socket.emit('leave-room', 'dev-001');
```

#### Server → Client

**New Telemetry:**
```javascript
socket.on('new-telemetry', (data) => {
  console.log(data);
  // {
  //   deviceId: 'dev-001',
  //   siteId: 'site-01',
  //   data: { temperature: 25.5, humidity: 60.2 },
  //   sensorTimestamp: '2025-01-10T12:00:00.000Z',
  //   alert: { type: 'warning', message: 'High temperature' }
  // }
});
```

## 📨 MQTT Topics

### Topic Structure

```
site/{siteId}/device/{deviceId}/telemetry
```

**Example:**
```
site/site-01/device/dev-001/telemetry
```

### Message Format

```json
{
  "deviceId": "dev-001",
  "timestamp": "2025-01-10T12:00:00.000Z",
  "data": {
    "temperature": 25.5,
    "humidity": 60.2,
    "pressure": 1013.25
  }
}
```

### Publishing Test Data

Using MQTT.fx or mosquitto_pub:

```bash
mosquitto_pub -h broker.hivemq.com -t "site/site-01/device/dev-001/telemetry" -m '{
  "deviceId": "dev-001",
  "timestamp": "2025-01-10T12:00:00.000Z",
  "data": {
    "temperature": 25.5,
    "humidity": 60.2
  }
}'
```

## 🧪 Testing

### Test with Simulator

The included simulator generates realistic test data:

```bash
cd backend
node simulator.js
```

### Manual Testing

1. **Backend Health Check:**
```bash
curl http://localhost:3001/
```

2. **Fetch Historical Data:**
```bash
curl "http://localhost:3001/api/telemetry/history?device=all&range=1h"
```

3. **WebSocket Connection:**
Open browser console on `http://localhost:5173` and check for:
```
✅ Socket connected: <socket-id>
```

## 🔒 Security Features

- **Helmet.js** - Sets security HTTP headers
- **CORS** - Configured for specific origins
- **Input Validation** - Joi schema validation
- **Error Handling** - Centralized error middleware
- **MongoDB Injection Protection** - Mongoose sanitization
- **Rate Limiting** - (Recommended for production)

## 🌐 Deployment

### Backend (Render/Heroku)

1. Set environment variables in hosting platform
2. Update `MONGO_URI` with production database
3. Update `CLIENT_URL` with frontend URL
4. Deploy from Git repository

### Frontend (Vercel/Netlify)

1. Set `VITE_SERVER_URL` environment variable
2. Run build command: `npm run build`
3. Deploy `dist` folder

### Environment Variables for Production

**Backend:**
```env
NODE_ENV=production
PORT=3001
CLIENT_URL=https://your-frontend-domain.com
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/iot_dashboard
MQTT_BROKER_URL=mqtt://broker.hivemq.com
JWT_SECRET=your-production-secret
```

**Frontend:**
```env
VITE_SERVER_URL=https://your-backend-domain.com
```

## 🐛 Troubleshooting

### Backend Won't Start

**Issue:** MongoDB connection error

**Solution:**
```bash
# Check if MongoDB is running
sudo systemctl status mongodb

# Check connection string in .env
# Verify database user permissions
```

### Frontend Can't Connect to Backend

**Issue:** CORS or connection refused

**Solution:**
1. Verify `VITE_SERVER_URL` in frontend `.env`
2. Check `CLIENT_URL` in backend `.env`
3. Ensure backend is running on correct port

### No Real-Time Data

**Issue:** Socket.IO not connecting

**Solution:**
```javascript
// Check browser console for:
// ✅ Socket connected: <socket-id>

// Verify MQTT simulator is running
// Check network tab for WebSocket connection
```

### Chart Not Displaying

**Issue:** Data format mismatch

**Solution:**
- Verify timestamp format is ISO 8601
- Check Chart.js console errors
- Ensure data array has temperature/humidity fields

## 📝 License

This project is licensed under the ISC License.

## 👤 Author

Your Name
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- MQTT broker provided by [HiveMQ](https://www.hivemq.com/)
- Icons from [Lucide React](https://lucide.dev/)
- Charts powered by [Chart.js](https://www.chartjs.org/)

---

⭐️ If you found this project helpful, please give it a star!
