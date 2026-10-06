import React from 'react';

const LABELS = {
  saved: 'All changes saved',
  unsaved: 'Unsaved changes',
  saving: 'Saving...',
  error: 'Save failed',
};

const SaveStatus = ({ status, lastSavedAt, error }) => {
  const time = lastSavedAt
    ? new Date(lastSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div className={`save-status save-status--${status}`} role="status" aria-live="polite" title={error || undefined}>
      <span className="save-status__dot" />
      <span>
        {LABELS[status] || ''}
        {status === 'saved' && time ? ` at ${time}` : ''}
      </span>
    </div>
  );
};

export default SaveStatus;