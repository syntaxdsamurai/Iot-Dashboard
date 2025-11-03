import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

import { useSocket } from '../hooks/useSocket';
import { useApi } from '../hooks/useApi';
import LiveChart from '../components/LiveChart';
import DeviceStatus from '../components/DeviceStatus';
import HistoryControls from '../components/HistoryControls';

import './Dashboard.css';

// Helper function to add data to our state object
// and keep it limited to 20 data points.
const addDataToDevice = (prevData, deviceId, newDataPoint) => {
  const deviceData = prevData[deviceId] ? [...prevData[deviceId]] : [];
  deviceData.push(newDataPoint);
  if (deviceData.length > 20) {
    deviceData.shift(); // Remove the oldest data point
  }
  return {
    ...prevData,
    [deviceId]: deviceData,
  };
};

function Dashboard() {
  // --- NEW STATE LOGIC ---
  // We now store data in an object, with one array per device.
  // This prevents the "blanking" issue when switching.
  const [chartData, setChartData] = useState({
    all: [],
    'dev-001': [],
    'dev-002': [],
    'dev-003': [],
  });
  const [selectedDevice, setSelectedDevice] = useState('all');
  const [devicePresence, setDevicePresence] = useState({});

  const { isConnected, latestTelemetry, devicePresence: socketPresence } = useSocket(selectedDevice);
  const { fetchHistory } = useApi();

  // Update presence state when it arrives from the socket
  useEffect(() => {
    if (socketPresence) {
      setDevicePresence(socketPresence);
    }
  }, [socketPresence]);

  // This effect runs every time 'latestTelemetry' data arrives
  useEffect(() => {
    if (latestTelemetry) {
      // 1. Handle Alerts
      if (latestTelemetry.alert) {
        toast.warn(latestTelemetry.alert.message, {
          toastId: latestTelemetry.deviceId,
        });
      }

      // 2. Create the new data point
      const newDataPoint = {
        ...latestTelemetry.data,
        timestamp: latestTelemetry.sensorTimestamp, // Use the correct timestamp
      };

      // 3. Update Chart Data state
      setChartData((prevData) => {
        let updatedData = prevData;

        // Add data to the 'all' list
        updatedData = addDataToDevice(updatedData, 'all', newDataPoint);

        // Add data to the specific device's list
        updatedData = addDataToDevice(
            updatedData,
            latestTelemetry.deviceId,
            newDataPoint
        );

        return updatedData;
      });

      // 4. Update Device Presence
      setDevicePresence((prevPresence) => ({
        ...prevPresence,
        [latestTelemetry.deviceId]: {
          status: 'online',
          lastSeen: Date.now(),
        },
      }));
    }
  }, [latestTelemetry]);

  const onFetchHistory = async (timeRange) => {
    console.log(`Fetching history for ${selectedDevice} in range: ${timeRange}`);
    try {
      const historyData = await fetchHistory(selectedDevice, timeRange);
      // When history loads, we only update the chart for
      // the currently selected device.
      setChartData(prevData => ({
        ...prevData,
        [selectedDevice]: historyData,
      }));
    } catch (error) {
      toast.error('Failed to fetch history: ' + error.message);
    }
  };

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

        //made with love form otter

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
                // --- THE FINAL FIX ---
                // We pass the correct data array from our state
                // object based on which device is selected.
                data={chartData[selectedDevice]}
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

