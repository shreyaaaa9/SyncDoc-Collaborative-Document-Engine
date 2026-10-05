import React from 'react';
import CollaborationNotification from './CollaborationNotification';

/**
 * NotificationList
 * Renders a stacked list of active collaboration toasts.
 */
const NotificationList = ({ notifications = [], onDismiss }) => {
  if (!notifications || notifications.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        zIndex: 9999,
      }}
      aria-label="Collaboration notifications"
    >
      {notifications.map((notif) => (
        <CollaborationNotification
          key={notif.id}
          notification={notif}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
};

export default NotificationList;
