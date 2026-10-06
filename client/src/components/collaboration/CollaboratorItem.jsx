import React from 'react';
import PresenceIndicator from './PresenceIndicator';

/**
 * CollaboratorItem
 * Renders an individual collaborator in the Collaborators Panel:
 * - Avatar with colored ring
 * - Name + Role badge (You / Collaborator / Viewer)
 * - Online/offline status dot
 * - Current activity & active block label
 */
const CollaboratorItem = ({ collaborator }) => {
  const { name, avatar, role, status, activity, currentBlockId, color, isSelf } = collaborator;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 12px',
        borderRadius: '10px',
        backgroundColor: isSelf ? 'rgba(99, 102, 241, 0.08)' : 'rgba(255, 255, 255, 0.03)',
        border: `1px solid ${isSelf ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255, 255, 255, 0.06)'}`,
        transition: 'all 0.2s ease',
        marginBottom: '8px',
      }}
      className="collaborator-item-row"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Avatar with status indicator ring */}
        <div style={{ position: 'relative' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: color || '#6366f1',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '0.875rem',
              boxShadow: `0 2px 8px ${color}44`,
            }}
          >
            {avatar || name.charAt(0)}
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: '-2px',
              right: '-2px',
              backgroundColor: '#18181b',
              borderRadius: '50%',
              padding: '1px',
            }}
          >
            <PresenceIndicator status={status} size="sm" pulse={status === 'online'} />
          </div>
        </div>

        {/* Name and role */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                fontWeight: 600,
                fontSize: '0.875rem',
                color: '#f4f4f5',
              }}
            >
              {name}
            </span>
            {isSelf && (
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '2px 6px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(99, 102, 241, 0.2)',
                  color: '#a5b4fc',
                  fontWeight: 600,
                }}
              >
                You
              </span>
            )}
          </div>
          <div
            style={{
              fontSize: '0.75rem',
              color: '#a1a1aa',
              marginTop: '2px',
            }}
          >
            {activity}
          </div>
        </div>
      </div>

      {/* Right side: Block being edited or status badge */}
      <div style={{ textAlign: 'right' }}>
        {currentBlockId ? (
          <span
            style={{
              fontSize: '0.7rem',
              padding: '3px 8px',
              borderRadius: '6px',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              color: '#c7d2fe',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
            title={`Editing block: ${currentBlockId}`}
          >
            <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#818cf8' }} />
            {activity.includes('Paragraph') ? 'Paragraph 2' : activity.includes('Code') ? 'Code Block' : currentBlockId}
          </span>
        ) : (
          <span
            style={{
              fontSize: '0.725rem',
              color: status === 'offline' ? '#71717a' : '#a1a1aa',
            }}
          >
            {status === 'offline' ? 'Offline' : 'Idle'}
          </span>
        )}
      </div>
    </div>
  );
};

export default CollaboratorItem;
