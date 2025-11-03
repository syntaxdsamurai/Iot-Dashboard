import { useState, useEffect } from 'react';
import { socket } from '../services/socket';

/**
 * A custom hook to manage the WebSocket connection and real-time data flow.
 *
 * @param {string} selectedDevice - The ID of the device to filter by (or 'all').
 * @returns {object} An object containing connection status and real-time data.
 */
export const useSocket = (selectedDevice) => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [latestTelemetry, setLatestTelemetry] = useState(null);
  const [devicePresence, setDevicePresence] = useState({});

  // This effect manages joining/leaving WebSocket rooms on the server
  useEffect(() => {
    if (isConnected) {
      // Tell the server which "room" we want to join
      socket.emit('join-room', selectedDevice);
      console.log(`Joined room: ${selectedDevice}`);
    }
    // This runs when selectedDevice changes
  }, [selectedDevice, isConnected]);

  // This effect manages the socket connection and event listeners
  useEffect(() => {
    // --- Event Handlers ---
    
    function onConnect() {
      console.log('✅ Socket connected:', socket.id);
      setIsConnected(true);
      // Re-join the correct room on reconnection
      socket.emit('join-room', selectedDevice);
    }

    function onDisconnect() {
      console.log('❌ Socket disconnected');
      setIsConnected(false);
    }

    /**
     * Handles incoming telemetry data from the server.
     * This is our main data-pushing event.
     */
    function onNewTelemetry(data) {
      setLatestTelemetry(data);
    }

    /**
     * Handles updates to the device presence list.
     * (e.g., from MQTT Last Will and Testament)
     */
    function onDeviceStatus(presenceData) {
      console.log('Received device status update:', presenceData);
      setDevicePresence(presenceData);
    }

    // --- Register Listeners ---
    
    // Listen for standard connection events
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    
    // Listen for our custom application events
    socket.on('new-telemetry', onNewTelemetry);
    socket.on('device-status-update', onDeviceStatus);

    // --- Connect ---
    
    // Manually initiate the connection if not already connected.
    if (!socket.connected) {
      socket.connect();
    }

    // --- Cleanup ---
    
    // This function is returned by the effect and runs
    // when the component unmounts.
    return () => {
      console.log('Cleaning up socket listeners...');
      // Remove all event listeners to prevent memory leaks
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('new-telemetry', onNewTelemetry);
      socket.off('device-status-update', onDeviceStatus);
      
      // We don't disconnect here, as the socket is shared.
      // We only leave the room.
      socket.emit('leave-room', selectedDevice);
    };
  }, [selectedDevice]); // Re-run if selectedDevice changes

  return { isConnected, latestTelemetry, devicePresence };
};