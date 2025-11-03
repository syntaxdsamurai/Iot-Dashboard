import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// We must register the components we are using from Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/**
 * Defines the configuration options for the live chart.
 */
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        color: '#e0e0e0', // Assuming dark mode text
      },
    },
    title: {
      display: true,
      text: 'Live Sensor Telemetry',
      color: '#e0e0e0',
      font: {
        size: 16,
      },
    },
  },
  scales: {
    x: {
      // We will use timestamps for labels
      type: 'category', 
      ticks: {
        color: '#a8a8a8',
        // Only show a few labels to prevent clutter
        maxTicksLimit: 10, 
      },
      grid: {
        color: 'rgba(255, 255, 255, 0.1)',
      },
    },
    y: {
      ticks: {
        color: '#a8a8a8',
      },
      grid: {
        color: 'rgba(255, 255, 255, 0.1)',
      },
    },
  },
  animation: {
    duration: 250, // Short animation for data updates
  },
};

/**
 * Renders a real-time line chart for sensor data.
 *
 * @param {object} props
 * @param {Array<object>} props.data - The array of data points to plot.
 * @param {string} props.deviceName - The name of the device being charted.
 */
const LiveChart = ({ data, deviceName }) => {
  // We need to format our raw data array into the structure
  // that Chart.js expects (labels and datasets).
  
  const formattedData = {
    // Extract timestamps for the x-axis labels
    labels: data.map((d) => new Date(d.timestamp).toLocaleTimeString()),
    
    datasets: [
      {
        label: `Temperature (°C) - ${deviceName}`,
        // Extract temperature values for the y-axis
        data: data.map((d) => d.temperature),
        borderColor: 'rgb(245, 34, 45)',
        backgroundColor: 'rgba(245, 34, 45, 0.2)',
        tension: 0.2,
        fill: true,
      },
      {
        label: `Humidity (%) - ${deviceName}`,
        // Extract humidity values for the y-axis
        data: data.map((d) => d.humidity),
        borderColor: 'rgb(22, 119, 255)',
        backgroundColor: 'rgba(22, 119, 255, 0.2)',
        tension: 0.2,
        fill: true,
      },
    ],
  };

  return <Line options={chartOptions} data={formattedData} />;
};

export default LiveChart;