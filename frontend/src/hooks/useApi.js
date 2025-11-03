import { useState } from 'react';
import { fetchHistory, fetchAggregates } from '../services/api';

/**
 * A custom hook to interact with the telemetry API.
 * It encapsulates the API call logic and manages
 * loading and error states.
 *
 * @returns {object} An object containing API functions and their states.
 */
export const useApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * A generic handler to wrap async API calls
   * and manage loading/error states.
   *
   * @param {Function} apiCall - The async API function to execute.
   * @param  {...any} args - Arguments to pass to the API function.
   * @returns {Promise<any>} The data from the API call.
   */
  const handleApiCall = async (apiCall, ...args) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiCall(...args);
      setIsLoading(false);
      return data;
    } catch (err) {
      setError(err);
      setIsLoading(false);
      // Re-throw the error so the calling component can also catch it
      throw err;
    }
  };

  // --- Public Functions ---

  /**
   * Fetches historical data.
   */
  const getHistory = (deviceId, timeRange) => {
    return handleApiCall(fetchHistory, deviceId, timeRange);
  };

  /**
   * Fetches aggregate data.
   */
  const getAggregates = (deviceId, timeRange) => {
    return handleApiCall(fetchAggregates, deviceId, timeRange);
  };

  return {
    // State
    isLoading,
    error,

    // Functions
    fetchHistory: getHistory,
    fetchAggregates: getAggregates,
  };
};