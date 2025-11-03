import express from 'express';
import {
  getTelemetryHistory,
  getTelemetryAggregates,
} from '../controllers/telemetryController.js';

// We can add authMiddleware here later
// import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- Telemetry API Routes ---

/**
 * @route   GET /api/telemetry/history
 * @desc    Get raw historical telemetry data
 * @access  Public (for now, will be Private)
 * @query   ?device=deviceId&range=1h
 */
router.route('/telemetry/history').get(getTelemetryHistory);

/**
 * @route   GET /api/telemetry/aggregates
 * @desc    Get aggregate (min, max, avg) telemetry data
 * @access  Public (for now, will be Private)
 * @query   ?device=deviceId&range=1h
 */
router.route('/telemetry/aggregates').get(getTelemetryAggregates);

export default router;