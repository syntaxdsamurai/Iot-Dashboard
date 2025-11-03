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

  // This effect manages joining/leaving WebSocket rooms on the server
  // It runs whenever selectedDevice changes.
  useEffect(() => {
    if (isConnected) {
      // Tell the server which "room" we want to join
      console.log(`Emitting join-room: ${selectedDevice}`);
      socket.emit('join-room', selectedDevice);
    }
  }, [selectedDevice, isConnected]);

  // This effect manages the socket connection and event listeners
  // It should only run ONCE when the component mounts.
  useEffect(() => {
    // --- Event Handlers ---

    function onConnect() {
      console.log('✅ Socket connected:', socket.id);
      setIsConnected(true);
      // On connection (or re-connection), join the
      // currently selected room.
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
      // This state update will be picked up by Dashboard.jsx
      setLatestTelemetry(data);
    }

    // --- Register Listeners ---

    // Listen for standard connection events
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // Listen for our custom application event
    socket.on('new-telemetry', onNewTelemetry);

    // --- Connect ---

    // Manually initiate the connection if not already connected.
    if (!socket.connected) {
      socket.connect();
    }

    // --- Cleanup ---

    // This function is returned by the effect and runs
    // when the component unmounts (e.g., user leaves page).
    return () => {
      console.log('Cleaning up socket listeners...');
      // Remove all event listeners to prevent memory leaks
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('new-telemetry', onNewTelemetry);

      // We can also disconnect the socket
      socket.disconnect();
    };
  }, []); // <-- THIS IS THE FIX
  // The empty array [] means this effect runs only ONCE.
  // We will no longer tear down the 'new-telemetry' listener.

  return { isConnected, latestTelemetry };
};
