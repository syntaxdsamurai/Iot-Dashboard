import Telemetry from '../models/telemetryModel.js';

/**
 * A simple utility to wrap async route handlers
 * and catch errors, passing them to the error middleware.
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/**
 * Calculates the start date based on a time range string.
 * @param {string} range - e.g., '1h', '6h', '24h'
 * @returns {Date} The calculated start date.
 */
const getStartDateFromRange = (range) => {
  const now = new Date();
  let hoursToSubtract = 1; // Default to 1 hour

  switch (range) {
    case '6h':
      hoursToSubtract = 6;
      break;
    case '24h':
      hoursToSubtract = 24;
      break;
    case '1h':
    default:
      hoursToSubtract = 1;
      break;
  }

  return new Date(now.getTime() - hoursToSubtract * 60 * 60 * 1000);
};

// --- Controller Functions ---

/**
 * @desc    Get raw historical telemetry data
 * @route   GET /api/telemetry/history
 */
export const getTelemetryHistory = asyncHandler(async (req, res) => {
  const { device: deviceId, range = '1h' } = req.query;

  const startDate = getStartDateFromRange(range);

  // 1. Build the query
  const query = {
    sensorTimestamp: { $gte: startDate },
  };
  if (deviceId && deviceId !== 'all') {
    query.deviceId = deviceId;
  }

  // 2. Execute the query
  // Find, sort by most recent, and limit to 1000 docs
  const history = await Telemetry.find(query)
    .sort({ sensorTimestamp: -1 })
    .limit(1000)
    .select('data sensorTimestamp deviceId'); // Only select needed fields

  // 3. Format data to match chart data structure
  const formattedHistory = history.map(item => ({
    ...item.data,
    timestamp: item.sensorTimestamp,
    deviceId: item.deviceId
  })).reverse(); // Reverse to get chronological order for chart

  res.status(200).json(formattedHistory);
});

/**
 * @desc    Get aggregate (min, max, avg) telemetry data
 * @route   GET /api/telemetry/aggregates
 */
export const getTelemetryAggregates = asyncHandler(async (req, res) => {
  const { device: deviceId, range = '1h' } = req.query;

  const startDate = getStartDateFromRange(range);

  // 1. Build the $match stage
  const matchStage = {
    sensorTimestamp: { $gte: startDate },
  };
  if (deviceId && deviceId !== 'all') {
    matchStage.deviceId = deviceId;
  }

  // 2. Define the aggregation pipeline
  const pipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: null, // Group all matched documents together
        avgTemp: { $avg: '$data.temperature' },
        minTemp: { $min: '$data.temperature' },
        maxTemp: { $max: '$data.temperature' },
        avgHumidity: { $avg: '$data.humidity' },
        minHumidity: { $min: '$data.humidity' },
        maxHumidity: { $max: '$data.humidity' },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0, // Exclude the _id field
        count: 1,
        temperature: {
          avg: '$avgTemp',
          min: '$minTemp',
          max: '$maxTemp',
        },
        humidity: {
          avg: '$avgHumidity',
          min: '$minHumidity',
          max: '$maxHumidity',
        },
      },
    },
  ];

  // 3. Execute the aggregation
  const aggregates = await Telemetry.aggregate(pipeline);

  if (aggregates.length === 0) {
    // Return empty aggregates if no data is found
    return res.status(200).json({
      count: 0,
      temperature: { avg: 0, min: 0, max: 0 },
      humidity: { avg: 0, min: 0, max: 0 },
    });
  }

  res.status(200).json(aggregates[0]);
});