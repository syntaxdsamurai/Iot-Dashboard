import React from 'react';
import './AlertBadge.css';

/**
 * A simple, reusable badge component to indicate an alert status.
 *
 * @param {object} props
 * @param {string} props.type - The type of alert (e.g., 'warning', 'error').
 * @param {string} props.message - The text to display in the badge.
 */
const AlertBadge = ({ type = 'warning', message }) => {
  // We can add more types (like 'info', 'success') later if needed.
  const badgeClass = `alert-badge ${type}`;

  return (
    <div className={badgeClass}>
      <span className="alert-icon">!</span>
      <span className="alert-message">{message}</span>
    </div>
  );
};

export default AlertBadge;