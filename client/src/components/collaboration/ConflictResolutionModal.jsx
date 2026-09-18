import React from 'react';
import { AlertTriangle, Check, ArrowRight, GitMerge, X, ShieldAlert } from 'lucide-react';

const ConflictResolutionModal = ({
  conflict,
  onKeepLocal,
  onAcceptRemote,
  onMergeBoth,
  onDismiss,
}) => {
  if (!conflict) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '680px',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--warning)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'fadeIn 200ms ease-out',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            borderBottom: '1px solid rgba(245, 158, 11, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={20} color="var(--warning)" />
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Concurrent AST Edit Conflict Detected
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--warning)', marginTop: '2px' }}>
                Block <code style={{ fontFamily: 'var(--font-mono)' }}>{conflict.blockId}</code> was modified simultaneously
              </p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="btn-ghost"
            style={{ padding: '4px' }}
            title="Dismiss notification"
          >
            <X size={18} />
          </button>
        </div>

        {/* Diff Comparison Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <strong>{conflict.remoteAuthor}</strong> submitted changes to this block at{' '}
            <span style={{ color: 'var(--text-primary)' }}>{conflict.timestamp}</span> while you were editing. Choose how you want to resolve this conflict:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {/* Local Version Column */}
            <div
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                  paddingBottom: '6px',
                  borderBottom: '1px solid var(--border-subtle)',
                }}
              >
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>
                  Your Local Version
                </span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Uncommitted</span>
              </div>
              <div
                style={{
                  fontSize: '0.825rem',
                  fontFamily: conflict.blockType === 'code' ? 'var(--font-mono)' : 'var(--font-sans)',
                  color: 'var(--text-primary)',
                  whiteSpace: 'pre-wrap',
                  minHeight: '80px',
                  maxHeight: '180px',
                  overflowY: 'auto',
                  lineHeight: '1.5',
                }}
              >
                {conflict.localContent || <em>(Empty content)</em>}
              </div>
              <button
                onClick={onKeepLocal}
                className="btn-primary"
                style={{ marginTop: '12px', width: '100%', fontSize: '0.78rem', padding: '6px 10px' }}
              >
                <Check size={14} />
                <span>Keep Mine</span>
              </button>
            </div>

            {/* Remote Version Column */}
            <div
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                  paddingBottom: '6px',
                  borderBottom: '1px solid var(--border-subtle)',
                }}
              >
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--warning)' }}>
                  Remote ({conflict.remoteAuthor})
                </span>
                <span style={{ fontSize: '0.68rem', color: 'var(--warning)' }}>AST Incoming</span>
              </div>
              <div
                style={{
                  fontSize: '0.825rem',
                  fontFamily: conflict.blockType === 'code' ? 'var(--font-mono)' : 'var(--font-sans)',
                  color: 'var(--text-primary)',
                  whiteSpace: 'pre-wrap',
                  minHeight: '80px',
                  maxHeight: '180px',
                  overflowY: 'auto',
                  lineHeight: '1.5',
                }}
              >
                {conflict.remoteContent || <em>(Empty content)</em>}
              </div>
              <button
                onClick={onAcceptRemote}
                className="btn-secondary"
                style={{
                  marginTop: '12px',
                  width: '100%',
                  fontSize: '0.78rem',
                  padding: '6px 10px',
                  borderColor: 'rgba(245, 158, 11, 0.5)',
                }}
              >
                <ArrowRight size={14} color="var(--warning)" />
                <span>Accept Remote</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '12px 20px',
            backgroundColor: 'var(--bg-tertiary)',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <ShieldAlert size={14} color="var(--warning)" />
            <span>AST tree preserved without document corruption</span>
          </div>

          <button
            onClick={onMergeBoth}
            className="btn-secondary"
            style={{
              fontSize: '0.8rem',
              padding: '6px 14px',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              borderColor: 'var(--primary)',
            }}
          >
            <GitMerge size={14} />
            <span>Smart Merge Both</span>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default ConflictResolutionModal;
