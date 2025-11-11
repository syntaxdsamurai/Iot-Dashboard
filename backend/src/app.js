import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware.js';
import telemetryRoutes from './routes/telemetryRoutes.js';

// Create the Express app instance
const app = express();

// --- Core Middleware ---

// 1. Configure CORS
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true, // Allow credentials (cookies, authorization headers)
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// 2. Set various security HTTP headers
app.use(helmet());

// 3. Parse incoming JSON payloads
app.use(express.json());

// 4. Parse URL-encoded payloads
app.use(express.urlencoded({ extended: true }));

// 5. Log HTTP requests in 'dev' format
app.use(morgan('dev'));

// --- API Routes ---

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'IoT Backend Service is running',
    timestamp: new Date().toISOString(),
  });
});

// All telemetry-related routes will be prefixed with /api
app.use('/api', telemetryRoutes);

// --- Error Handling Middleware ---

// 404 Not Found handler
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

export default app;