import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

import { useSocket } from '../hooks/useSocket';
import { useApi } from '../hooks/useApi';
import LiveChart from '../components/LiveChart';
import DeviceStatus from '../components/DeviceStatus';
import HistoryControls from '../components/HistoryControls';

import './Dashboard.css';

function Dashboard() {
  const [chartData, setChartData] = useState([]);
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

      // 2. Update Chart Data
      setChartData((prevData) => {
        // --- THIS IS THE FIX ---
        // We now combine the data (temp, humidity) with
        // the timestamp into a single object.
        const newDataPoint = {
          ...latestTelemetry.data,
          timestamp: latestTelemetry.timestamp,
        };
        // --- END OF FIX ---

        const updatedData = [...prevData, newDataPoint];
        if (updatedData.length > 20) {
          return updatedData.slice(1); // Keep only the last 20
        }
        return updatedData;
      });

      // 3. Update Device Presence
      // This is a simplified presence logic
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
      // The backend already formats history data correctly, so this works
      setChartData(historyData);
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
