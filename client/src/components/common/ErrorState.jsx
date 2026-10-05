import React from 'react';

const ErrorState = ({ message, onRetry, onBack }) => (
  <div className="state-box state-box--error" role="alert">
    <h3>Something went wrong</h3>
    <p>{message}</p>
    <div className="state-box__actions">
      {onRetry && <button type="button" onClick={onRetry}>Try again</button>}
      {onBack && <button type="button" onClick={onBack}>← Back to Dashboard</button>}
    </div>
  </div>
);

export default ErrorState;