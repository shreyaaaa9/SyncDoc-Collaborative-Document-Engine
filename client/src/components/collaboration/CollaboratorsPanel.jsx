import React from 'react';
import { Users, UserPlus, Circle, Sparkles, X } from 'lucide-react';
import { PresenceStatus } from '../../types/collaboration';

const CollaboratorsPanel = ({
  collaborators,
  isOpen,
  onClose,
  onInvite,
}) => {
  if (!isOpen) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case PresenceStatus.ACTIVE:
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--success)', fontSize: '0.72rem' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)' }} />
            Active
          </span>
        );
      case PresenceStatus.IDLE:
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--warning)', fontSize: '0.72rem' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--warning)' }} />
            Idle
          </span>
        );
      default:
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '0.72rem' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-muted)' }} />
            Away
          </span>
        );
    }
  };

  return (
    <aside
      style={{
        width: '300px',
        backgroundColor: 'var(--bg-secondary)',
        borderLeft: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflowY: 'auto',
        transition: 'width var(--transition-normal)',
      }}
    >
      {/* Panel Header */}
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={18} color="var(--primary)" />
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Collaborators</span>
          <span
            style={{
              background: 'var(--bg-tertiary)',
              color: 'var(--text-secondary)',
              fontSize: '0.72rem',
              padding: '1px 6px',
              borderRadius: 'var(--radius-full)',
            }}
          >
            {collaborators.length}
          </span>
        </div>
        <button
          onClick={onClose}
          className="btn-ghost"
          style={{ padding: '4px' }}
          title="Close sidebar"
        >
          <X size={16} />
        </button>
      </div>

      {/* Invite Button */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
        <button
          onClick={onInvite}
          className="btn-secondary"
          style={{ width: '100%', fontSize: '0.8rem', padding: '6px 12px' }}
        >
          <UserPlus size={14} />
          <span>Invite Teammate</span>
        </button>
      </div>

      {/* Collaborator List */}
      <div style={{ flex: 1, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          In This Document ({collaborators.filter((u) => u.status === PresenceStatus.ACTIVE).length} Active)
        </div>

        {collaborators.map((user) => (
          <div
            key={user.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 10px',
              borderRadius: 'var(--radius-sm)',
              background: user.isSelf ? 'var(--bg-tertiary)' : 'transparent',
              border: `1px solid ${user.isSelf ? 'var(--border-medium)' : 'transparent'}`,
              transition: 'background var(--transition-fast)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Avatar circle with user's assigned cursor color */}
              <div
                style={{
                  position: 'relative',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: user.color.bg,
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  boxShadow: `0 0 0 2px ${user.color.bg}33`,
                }}
              >
                {user.name.slice(0, 2).toUpperCase()}
                <span
                  style={{
                    position: 'absolute',
                    bottom: '-1px',
                    right: '-1px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    border: '1.5px solid var(--bg-secondary)',
                    backgroundColor:
                      user.status === PresenceStatus.ACTIVE
                        ? 'var(--success)'
                        : user.status === PresenceStatus.IDLE
                        ? 'var(--warning)'
                        : 'var(--text-muted)',
                  }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.825rem', fontWeight: 500 }}>
                    {user.name}
                  </span>
                  {user.isSelf && (
                    <span
                      style={{
                        fontSize: '0.65rem',
                        padding: '0 4px',
                        borderRadius: '4px',
                        background: 'var(--primary-light)',
                        color: 'var(--primary)',
                        fontWeight: 600,
                      }}
                    >
                      YOU
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {user.currentBlockId ? (
                    <span style={{ color: user.color.text, fontWeight: 500 }}>
                      Editing Block
                    </span>
                  ) : (
                    getStatusBadge(user.status)
                  )}
                </div>
              </div>
            </div>

            <span
              style={{
                fontSize: '0.68rem',
                color: 'var(--text-muted)',
                background: 'var(--bg-tertiary)',
                padding: '2px 6px',
                borderRadius: '4px',
              }}
            >
              {user.role}
            </span>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.7rem',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <Sparkles size={13} color="var(--primary)" />
        <span>Real-time presence synchronized</span>
      </div>
    </aside>
  );
};

export default CollaboratorsPanel;
