import React from 'react';
import { AlertTriangle, GitPullRequest, Check, ShieldAlert } from 'lucide-react';

/**
 * ConflictNotification
 * Prominent banner displayed in the document editor when a block conflict is detected.
 * Actions:
 * - Review Changes (opens ConflictResolutionModal)
 * - Keep Mine
 * - Use Latest
 * - Resolve Later
 */
const ConflictNotification = ({
  conflict,
  onReviewChanges,
  onKeepMine,
  onUseLatest,
  onResolveLater,
}) => {
  if (!conflict) return null;

  return (
    <div
      style={{
        backgroundColor: 'rgba(234, 88, 12, 0.12)',
        border: '1px solid rgba(249, 115, 22, 0.4)',
        borderRadius: '12px',
        padding: '16px 20px',
        marginBottom: '20px',
        color: '#f4f4f5',
        boxShadow: '0 4px 15px -2px rgba(234, 88, 12, 0.2)',
      }}
      className="conflict-notification-card"
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
        <div
          style={{
            padding: '8px',
            borderRadius: '10px',
            backgroundColor: 'rgba(249, 115, 22, 0.2)',
            color: '#f97316',
            flexShrink: 0,
          }}
        >
          <AlertTriangle size={22} />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <h4
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: '#fdba74',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              ⚠ Conflict Detected
            </h4>
            <span
              style={{
                fontSize: '0.725rem',
                padding: '2px 8px',
                borderRadius: '999px',
                backgroundColor: 'rgba(249, 115, 22, 0.2)',
                color: '#fed7aa',
                border: '1px solid rgba(249, 115, 22, 0.3)',
              }}
            >
              AST Node Collision (Simulated)
            </span>
          </div>

          <p style={{ fontSize: '0.875rem', color: '#e4e4e7', margin: '6px 0 10px 0', lineHeight: 1.5 }}>
            Another collaborator changed this block while you were editing.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '8px',
              fontSize: '0.8rem',
              backgroundColor: 'rgba(0, 0, 0, 0.25)',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              marginBottom: '14px',
            }}
          >
            <div>
              <span style={{ color: '#a1a1aa' }}>Block: </span>
              <strong style={{ color: '#f4f4f5' }}>{conflict.blockTitle || 'Technical Specification — Section 2'}</strong>
            </div>
            <div>
              <span style={{ color: '#a1a1aa' }}>Changed by: </span>
              <span
                style={{
                  color: '#34d399',
                  fontWeight: 600,
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  padding: '1px 6px',
                  borderRadius: '4px',
                }}
              >
                {conflict.changedBy || 'Arjun'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <button
              onClick={onReviewChanges}
              style={{
                backgroundColor: '#ea580c',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '0.825rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(234, 88, 12, 0.4)',
              }}
            >
              <GitPullRequest size={15} /> Review Changes
            </button>

            <button
              onClick={onKeepMine}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: '#f4f4f5',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '0.825rem',
                cursor: 'pointer',
              }}
            >
              Keep Mine
            </button>

            <button
              onClick={onUseLatest}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: '#f4f4f5',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '0.825rem',
                cursor: 'pointer',
              }}
            >
              Use Latest
            </button>

            <button
              onClick={onResolveLater}
              style={{
                backgroundColor: 'transparent',
                color: '#a1a1aa',
                border: 'none',
                padding: '8px 12px',
                fontSize: '0.825rem',
                cursor: 'pointer',
              }}
            >
              Resolve Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConflictNotification;
