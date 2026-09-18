import React from 'react';
import { Edit3, Lock, ShieldCheck } from 'lucide-react';

const RemoteCursorOverlay = ({ blockId, collaborators, isSelfActive }) => {
  // Find other collaborators actively focused on this block
  const activeUsersOnBlock = collaborators.filter(
    (u) => !u.isSelf && u.currentBlockId === blockId
  );

  if (activeUsersOnBlock.length === 0 && !isSelfActive) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '8px',
        paddingBottom: '4px',
        borderBottom: '1px dashed rgba(255, 255, 255, 0.08)',
        animation: 'fadeIn 150ms ease-out',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        {/* Remote Collaborators on this block */}
        {activeUsersOnBlock.map((user) => (
          <div
            key={user.id}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: user.color.bg,
              color: '#ffffff',
              padding: '3px 10px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.72rem',
              fontWeight: 700,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <Lock size={11} />
            <span>{user.name} is editing</span>
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                animation: 'pulse-dot 1.2s infinite ease-in-out',
              }}
            />
          </div>
        ))}

        {/* Self Active Indicator */}
        {isSelfActive && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.7rem',
              fontWeight: 600,
            }}
          >
            <Edit3 size={11} />
            <span>User A (You) editing</span>
          </div>
        )}
      </div>

      {/* AST Safety Badge */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '0.68rem',
          color: 'var(--success)',
          fontFamily: 'var(--font-mono)',
        }}
      >
        <ShieldCheck size={12} />
        <span>AST Node Lock Active</span>
      </div>
    </div>
  );
};

export default RemoteCursorOverlay;
