import React, { useState } from 'react';
import './HistoryControls.css';

// Define the available time range options
const TIME_RANGES = [
  { label: '1 Hour', value: '1h' },
  { label: '6 Hours', value: '6h' },
  { label: '24 Hours', value: '24h' },
];

/**
 * Renders buttons to fetch historical data for different time ranges.
 *
 * @param {object} props
 * @param {Function} props.onFetchHistory - Callback function to execute
 * when a time range is selected.
 */
const HistoryControls = ({ onFetchHistory }) => {
  const [activeRange, setActiveRange] = useState(null);

  const handleClick = (rangeValue) => {
    setActiveRange(rangeValue);
    onFetchHistory(rangeValue);
  };

  return (
    <div className="history-controls">
      <span className="controls-label">Load History:</span>
      <div className="button-group">
        {TIME_RANGES.map((range) => (
          <button
            key={range.value}
            className={`control-button ${
              activeRange === range.value ? 'active' : ''
            }`}
            onClick={() => handleClick(range.value)}
          >
            {range.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default HistoryControls;