import React from 'react';

const StatusMessage = ({ type = 'info', message, onRetry }) => {
  if (!message) return null;

  return (
    <div className={`status-message status-message--${type}`}>
      <span>{message}</span>
      {onRetry && (
        <button className="status-message__retry" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
};

export default StatusMessage;