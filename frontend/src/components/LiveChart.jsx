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
 * A helper function to get unique, tonal colors for each device.
 * @param {string} deviceName - The name of the device.
 * @returns {object} An object with color strings.
 */
const getDeviceColors = (deviceName) => {
  let tempColor, tempBg, humidColor, humidBg;

  switch (deviceName) {
    case 'dev-001':
      // Lighter Red / Lighter Blue
      tempColor = 'rgb(248, 113, 113)'; // tailwind-red-400
      tempBg = 'rgba(248, 113, 113, 0.2)';
      humidColor = 'rgb(96, 165, 250)'; // tailwind-blue-400
      humidBg = 'rgba(96, 165, 250, 0.2)';
      break;
    case 'dev-002':
      // Brighter Red / Deeper Blue
      tempColor = 'rgb(220, 38, 38)'; // tailwind-red-600
      tempBg = 'rgba(220, 38, 38, 0.2)';
      humidColor = 'rgb(37, 99, 235)'; // tailwind-blue-600
      humidBg = 'rgba(37, 99, 235, 0.2)';
      break;
    case 'dev-003':
      // Orange-Red / Sky Blue
      tempColor = 'rgb(249, 115, 22)'; // tailwind-orange-500
      tempBg = 'rgba(249, 115, 22, 0.2)';
      humidColor = 'rgb(14, 165, 233)'; // tailwind-sky-500
      humidBg = 'rgba(14, 165, 233, 0.2)';
      break;
    default:
      // Default "All Devices" colors
      tempColor = 'rgb(239, 68, 68)'; // tailwind-red-500
      tempBg = 'rgba(239, 68, 68, 0.2)';
      humidColor = 'rgb(59, 130, 246)'; // tailwind-blue-500
      humidBg = 'rgba(59, 130, 246, 0.2)';
  }

  return { tempColor, tempBg, humidColor, humidBg };
};

/**
 * Renders a real-time line chart for sensor data.
 */
const LiveChart = ({ data, deviceName }) => {
  // Get the dynamic colors based on the selected device
  const { tempColor, tempBg, humidColor, humidBg } =
      getDeviceColors(deviceName);

  // --- Chart Configuration ---
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#e0e0e0',
        },
      },
      title: {
        display: true,
        text: `Live Telemetry: ${deviceName}`, // Title now updates
        color: '#e0e0e0',
        font: {
          size: 16,
        },
      },
    },
    scales: {
      x: {
        type: 'category',
        ticks: {
          color: '#a8a8a8',
          maxTicksLimit: 10,
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      // Y-Axis for Temperature (Left Side)
      'y-axis-temp': {
        type: 'linear',
        position: 'left',
        ticks: {
          color: tempColor,
        },
        grid: {
          drawOnChartArea: false, // Only show grid for humidity
        },
        // --- THIS IS THE FIX ---
        // By removing suggestedMin/Max, we let Chart.js
        // auto-scale the axis to fit the data, "zooming in".
      },
      // Y-Axis for Humidity (Right Side)
      'y-axis-humidity': {
        type: 'linear',
        position: 'right',
        ticks: {
          color: humidColor,
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        // --- THIS IS THE FIX ---
        // Auto-scaling now also applies to humidity.
      },
    },
    animation: {
      duration: 250,
    },
  };

  const formattedData = {
    labels: data.map((d) => new Date(d.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: `Temperature (°C)`,
        data: data.map((d) => d.temperature),
        borderColor: tempColor,
        backgroundColor: tempBg,
        tension: 0.4, // Smoother lines
        fill: true,
        yAxisID: 'y-axis-temp', // Link to the left Y-axis
      },
      {
        label: `Humidity (%)`,
        data: data.map((d) => d.humidity),
        borderColor: humidColor,
        backgroundColor: humidBg,
        tension: 0.4, // Smoother lines
        fill: true,
        yAxisID: 'y-axis-humidity', // Link to the right Y-axis
      },
    ],
  };

  return <Line options={chartOptions} data={formattedData} />;
};

export default LiveChart;

