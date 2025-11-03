import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

// We will create these hooks and components in the next steps
import { useSocket } from '../hooks/useSocket';
import { useApi } from '../hooks/useApi';
import LiveChart from '../components/LiveChart';
import DeviceStatus from '../components/DeviceStatus';
import HistoryControls from '../components/HistoryControls';

import './Dashboard.css';

/**
 * The main dashboard page component.
 * It ties together all the a-sync data (WebSockets, API)
 * and all the UI components.
 */
function Dashboard() {
  // --- State Management ---
  
  // State to hold the array of data for the chart.
  // We'll limit it to the last 20 data points.
  const [chartData, setChartData] = useState([]);
  
  // State for the selected device (for filtering)
  const [selectedDevice, setSelectedDevice] = useState('all');
  
  // State for the device presence list (online/offline)
  const [devicePresence, setDevicePresence] = useState({});

  // --- Data Hooks ---

  // Connect to the WebSocket server
  const { isConnected, latestTelemetry } = useSocket(selectedDevice);
  
  // Get functions to fetch historical data
  const { fetchHistory, fetchAggregates } = useApi();

  // --- Effects ---

  // This effect runs every time 'latestTelemetry' data arrives
  useEffect(() => {
    if (latestTelemetry) {
      // 1. Handle Alerts
      // We'll assume the server adds an 'alert' field to the payload
      if (latestTelemetry.alert) {
        toast.warn(latestTelemetry.alert.message, {
          toastId: latestTelemetry.deviceId, // Prevents duplicate toasts
        });
      }

      // 2. Update Chart Data
      // Add new data point to the end, and remove the oldest if > 20
      setChartData((prevData) => {
        const updatedData = [...prevData, latestTelemetry.data];
        if (updatedData.length > 20) {
          return updatedData.slice(1); // Keep only the last 20
        }
        return updatedData;
      });

      // 3. Update Device Presence
      // (This is a simplified presence logic. LWT is more robust)
      setDevicePresence((prevPresence) => ({
        ...prevPresence,
        [latestTelemetry.deviceId]: {
          status: 'online',
          lastSeen: Date.now(),
        },
      }));
    }
  }, [latestTelemetry]); // Dependency: only re-run when new data arrives

  // --- Handlers ---

  /**
   * Called by HistoryControls when the user requests historical data.
   */
  const onFetchHistory = async (timeRange) => {
    console.log(`Fetching history for ${selectedDevice} in range: ${timeRange}`);
    try {
      // Fetch historical data and update the chart
      const historyData = await fetchHistory(selectedDevice, timeRange);
      setChartData(historyData); // Replace live data with historical
    } catch (error) {
      toast.error('Failed to fetch history: ' + error.message);
    }
  };

  // --- Render ---

  return (
    <main className="dashboard-layout">
      <header className="dashboard-header">
        <h1>IoT Dashboard</h1>
        <div className="status-indicator">
          <strong>Status:</strong>
          <span className={isConnected ? 'connected' : 'disconnected'}>
            {isConnected ? 'LIVE' : 'DISCONNECTED'}
          </span>
        </div>
      </header>

      <aside className="dashboard-sidebar">
        <h2>Devices</h2>
        <DeviceStatus
          presence={devicePresence}
          onSelectDevice={setSelectedDevice}
          selectedDevice={selectedDevice}
        />
      </aside>

      <section className="dashboard-main">
        <div className="dashboard-controls">
          <HistoryControls onFetchHistory={onFetchHistory} />
        </div>
        <div className="dashboard-chart-container">
          <LiveChart
            data={chartData}
            deviceName={
              selectedDevice === 'all' ? 'All Devices' : selectedDevice
            }
          />
        </div>
      </section>
    </main>
  );
}

export default Dashboard;