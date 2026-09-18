import React, { useEffect } from 'react';
import { GitMerge, X, User, Check, ArrowRight, ShieldAlert } from 'lucide-react';

/**
 * ConflictResolutionModal
 * Professional conflict review modal displaying side-by-side versions:
 * - Block: System Architecture
 * - Your Version: NodeMCU communicates with the server using Wi-Fi.
 * - Latest Version — Arjun: ESP8266 communicates with the server using Wi-Fi.
 * - Resolutions: [ Keep My Version ], [ Use Latest Version ], [ Review Later ]
 * Updates mock frontend state and displays: "Conflict marked as resolved."
 */
const ConflictResolutionModal = ({
  isOpen,
  conflict,
  onClose,
  onResolve,
}) => {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !conflict) return null;

  const handleAction = (resolutionChoice) => {
    onResolve(conflict.blockId, resolutionChoice);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '16px',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="conflict-modal-title"
    >
      <div
        style={{
          width: '100%',
          maxWidth: '680px',
          backgroundColor: '#18181b',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: 'rgba(234, 88, 12, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(249, 115, 22, 0.2)',
                color: '#f97316',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <GitMerge size={18} />
            </div>
            <div>
              <h3 id="conflict-modal-title" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f4f4f5', margin: 0 }}>
                Conflict Detected
              </h3>
              <p style={{ fontSize: '0.785rem', color: '#a1a1aa', margin: 0 }}>
                Block: <strong style={{ color: '#fed7aa' }}>{conflict.blockTitle || 'System Architecture'}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#71717a',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
            }}
            title="Close modal (Esc)"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body: Comparison */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ fontSize: '0.875rem', color: '#d4d4d8', lineHeight: 1.5 }}>
            Another collaborator updated this block concurrently. Choose which version you want to keep or review later.
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px',
            }}
          >
            {/* Your Version */}
            <div
              style={{
                borderRadius: '12px',
                backgroundColor: 'rgba(99, 102, 241, 0.06)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                  paddingBottom: '8px',
                  borderBottom: '1px solid rgba(99, 102, 241, 0.2)',
                }}
              >
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#a5b4fc' }}>
                  Your Version (Local)
                </span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(99, 102, 241, 0.2)',
                    color: '#c7d2fe',
                    fontWeight: 600,
                  }}
                >
                  Kirubakar (You)
                </span>
              </div>

              <div
                style={{
                  flex: 1,
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  lineHeight: 1.6,
                  color: '#e0e7ff',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  padding: '14px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  minHeight: '80px',
                }}
              >
                {conflict.yourVersion || 'NodeMCU communicates with the server using Wi-Fi.'}
              </div>

              <button
                onClick={() => handleAction('mine')}
                style={{
                  marginTop: '14px',
                  padding: '9px 14px',
                  backgroundColor: 'rgba(99, 102, 241, 0.2)',
                  color: '#c7d2fe',
                  border: '1px solid rgba(99, 102, 241, 0.4)',
                  borderRadius: '8px',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Check size={14} /> Keep My Version
              </button>
            </div>

            {/* Latest Version — Arjun */}
            <div
              style={{
                borderRadius: '12px',
                backgroundColor: 'rgba(16, 185, 129, 0.06)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                  paddingBottom: '8px',
                  borderBottom: '1px solid rgba(16, 185, 129, 0.2)',
                }}
              >
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#6ee7b7' }}>
                  Latest Version — {conflict.changedBy || 'Arjun'}
                </span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    color: '#a7f3d0',
                    fontWeight: 600,
                  }}
                >
                  Incoming
                </span>
              </div>

              <div
                style={{
                  flex: 1,
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  lineHeight: 1.6,
                  color: '#d1fae5',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  padding: '14px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  minHeight: '80px',
                }}
              >
                {conflict.latestVersion || 'ESP8266 communicates with the server using Wi-Fi.'}
              </div>

              <button
                onClick={() => handleAction('latest')}
                style={{
                  marginTop: '14px',
                  padding: '9px 14px',
                  backgroundColor: 'rgba(16, 185, 129, 0.25)',
                  color: '#a7f3d0',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  borderRadius: '8px',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Check size={14} /> Use Latest Version
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: '0.75rem', color: '#71717a' }}>
            UI Prototype — Updates mock state upon resolution
          </span>

          <button
            onClick={() => handleAction('later')}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              color: '#a1a1aa',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              fontSize: '0.825rem',
              cursor: 'pointer',
            }}
          >
            Review Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConflictResolutionModal;
