import React from 'react';
import './DeviceStatus.css';

/**
 * Displays a list of devices and their connection status.
 * Allows for selecting a device to filter the dashboard.
 *
 * @param {object} props
 * @param {object} props.presence - An object where keys are device IDs
 * and values are { status, lastSeen }.
 * @param {string} props.selectedDevice - The currently active device ID.
 * @param {Function} props.onSelectDevice - Callback to update the selected device.
 */
const DeviceStatus = ({ presence, selectedDevice, onSelectDevice }) => {
  // Get an array of device IDs from the presence object
  const deviceIds = Object.keys(presence);

  // Helper to format the 'lastSeen' timestamp
  const formatLastSeen = (timestamp) => {
    if (!timestamp) return 'Never';
    const now = new Date();
    const lastSeen = new Date(timestamp);
    const diffSeconds = Math.round((now - lastSeen) / 1000);

    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    return lastSeen.toLocaleTimeString();
  };

  return (
    <div className="device-status-list">
      {/* 'All Devices' Button */}
      <button
        className={`device-item ${
          selectedDevice === 'all' ? 'selected' : ''
        }`}
        onClick={() => onSelectDevice('all')}
      >
        <span className="device-name">All Devices</span>
        <span className="device-status-indicator online"></span>
      </button>

      {/* List of individual devices */}
      {deviceIds.length > 0 ? (
        deviceIds.map((deviceId) => {
          const device = presence[deviceId];
          const isOnline = device.status === 'online';

          return (
            <button
              key={deviceId}
              className={`device-item ${
                selectedDevice === deviceId ? 'selected' : ''
              }`}
              onClick={() => onSelectDevice(deviceId)}
            >
              <div className="device-info">
                <span className="device-name">{deviceId}</span>
                <span className="device-last-seen">
                  {isOnline ? 'Online' : `Last seen: ${formatLastSeen(device.lastSeen)}`}
                </span>
              </div>
              <span
                className={`device-status-indicator ${
                  isOnline ? 'online' : 'offline'
                }`}
              ></span>
            </button>
          );
        })
      ) : (
        <p className="no-devices-msg">Waiting for devices...</p>
      )}
    </div>
  );
};

export default DeviceStatus;