import axios from 'axios';

// Get the base URL for our API from environment variables,
// defaulting to localhost:3001 for development.
const API_BASE_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

// Log the API base URL for debugging (helpful during deployment)
console.log('🌐 API Base URL:', API_BASE_URL);

/**
 * Create a pre-configured instance of axios.
 * All API requests will go through this instance.
 *
 * We can set the baseURL here, and in the future,
 * we could also add interceptors to automatically
 * attach authentication tokens (like JWTs) to every request.
 */
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`, // All routes will be prefixed with /api
  timeout: 10000, // Request times out after 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Fetches raw historical telemetry data for a specific device
 * within a given time range.
 *
 * @param {string} deviceId - The ID of the device (or 'all').
 * @param {string} timeRange - A string like '1h', '6h', '24h'.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of data points.
 */
export const fetchHistory = async (deviceId, timeRange) => {
  try {
    const response = await apiClient.get('/telemetry/history', {
      params: {
        device: deviceId,
        range: timeRange,
      },
    });
    // The actual data is expected to be on response.data
    return response.data;
  } catch (error) {
    console.error('Error fetching historical data:', error);
    // Re-throw the error so the component can catch it
    throw new Error(error.response?.data?.message || 'Failed to fetch history');
  }
};

/**
 * Fetches aggregated data (min, max, avg) for a device.
 *
 * @param {string} deviceId - The ID of the device (or 'all').
 * @param {string} timeRange - A string like '1h', '6h', '24h'.
 * @returns {Promise<object>} A promise that resolves to an aggregates object.
 */
export const fetchAggregates = async (deviceId, timeRange) => {
  try {
    const response = await apiClient.get('/telemetry/aggregates', {
      params: {
        device: deviceId,
        range: timeRange,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching aggregate data:', error);
    throw new Error(
        error.response?.data?.message || 'Failed to fetch aggregates'
    );
  }
};