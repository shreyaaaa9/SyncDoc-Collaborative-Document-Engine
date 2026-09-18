import React from 'react';
import { ArrowLeft, Clock, Users, Save, ShieldCheck } from 'lucide-react';
import ConnectionStatusBadge from './ConnectionStatusBadge';

const CollaborationHeader = ({
  docTitle,
  onBack,
  connection,
  collaborators,
  isSaving,
  onSave,
  onToggleHistory,
  onToggleCollaborators,
  historyCount,
}) => {
  // Max avatars to show in stack before +N counter
  const maxAvatars = 3;
  const visibleUsers = collaborators.slice(0, maxAvatars);
  const extraUsersCount = Math.max(0, collaborators.length - maxAvatars);

  return (
    <header
      style={{
        height: '60px',
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        gap: '16px',
        zIndex: 50,
        position: 'sticky',
        top: 0,
      }}
    >
      {/* Left section: Back button & Document Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button
          onClick={onBack}
          className="btn-ghost"
          style={{ padding: '6px 10px', fontSize: '0.8rem' }}
          title="Back to Dashboard"
        >
          <ArrowLeft size={16} />
          <span>Dashboard</span>
        </button>

        <div style={{ height: '20px', width: '1px', backgroundColor: 'var(--border-medium)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h1
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              maxWidth: '300px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {docTitle || 'Untitled Document'}
          </h1>
          <span
            style={{
              fontSize: '0.68rem',
              background: 'rgba(99, 102, 241, 0.1)',
              color: 'var(--primary)',
              padding: '2px 6px',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 600,
            }}
          >
            AST-Synced
          </span>
        </div>
      </div>

      {/* Center section: Real-time Connection Status */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <ConnectionStatusBadge connection={connection} />
      </div>

      {/* Right section: Avatars Stack, History, and Panel Toggles */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Collaborators Avatar Stack */}
        <div
          onClick={onToggleCollaborators}
          style={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            padding: '4px 6px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-medium)',
            transition: 'border-color var(--transition-fast)',
          }}
          title="Click to view all active collaborators"
        >
          <div style={{ display: 'flex', alignItems: 'center', marginLeft: '4px' }}>
            {visibleUsers.map((user, idx) => (
              <div
                key={user.id}
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  backgroundColor: user.color.bg,
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  marginLeft: idx === 0 ? 0 : '-8px',
                  border: '2px solid var(--bg-secondary)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                {user.name.slice(0, 2).toUpperCase()}
              </div>
            ))}

            {extraUsersCount > 0 && (
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-elevated)',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  marginLeft: '-8px',
                  border: '2px solid var(--bg-secondary)',
                }}
              >
                +{extraUsersCount}
              </div>
            )}
          </div>

          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              margin: '0 8px 0 6px',
              fontWeight: 500,
            }}
          >
            {collaborators.length}
          </span>
        </div>

        {/* Version History Button */}
        <button
          onClick={onToggleHistory}
          className="btn-secondary"
          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
          title="View Version Timeline"
        >
          <Clock size={14} />
          <span>History</span>
          {historyCount > 0 && (
            <span
              style={{
                fontSize: '0.68rem',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                padding: '1px 5px',
                borderRadius: 'var(--radius-full)',
                fontWeight: 600,
              }}
            >
              {historyCount}
            </span>
          )}
        </button>

        {/* Save Document Button */}
        <button
          onClick={onSave}
          disabled={isSaving}
          className="btn-primary"
          style={{ padding: '6px 14px', fontSize: '0.8rem' }}
        >
          <Save size={14} />
          <span>{isSaving ? 'Syncing...' : 'Save'}</span>
        </button>
      </div>
    </header>
  );
};

export default CollaborationHeader;
