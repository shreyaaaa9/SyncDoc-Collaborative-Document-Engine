import React from 'react';
import { Clock, RotateCcw, PlusCircle, CheckCircle, ChevronRight, X, GitCommit } from 'lucide-react';

const VersionHistoryDrawer = ({
  isOpen,
  onClose,
  history,
  onRestore,
  onCreateSnapshot,
}) => {
  if (!isOpen) return null;

  return (
    <aside
      style={{
        width: '320px',
        backgroundColor: 'var(--bg-secondary)',
        borderLeft: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflowY: 'auto',
        boxShadow: 'var(--shadow-xl)',
        zIndex: 60,
      }}
    >
      {/* Header */}
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
          <Clock size={18} color="var(--primary)" />
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Document History</span>
        </div>
        <button onClick={onClose} className="btn-ghost" style={{ padding: '4px' }}>
          <X size={16} />
        </button>
      </div>

      {/* Snapshot Action */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
        <button
          onClick={() => {
            const note = window.prompt('Enter revision note for this snapshot:');
            onCreateSnapshot(note);
          }}
          className="btn-primary"
          style={{ width: '100%', fontSize: '0.8rem', padding: '6px 12px' }}
        >
          <PlusCircle size={14} />
          <span>Save Version Snapshot</span>
        </button>
      </div>

      {/* Timeline List */}
      <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Revision Timeline ({history.length})
        </div>

        {history.map((rev, index) => (
          <div
            key={rev.versionId}
            style={{
              display: 'flex',
              gap: '12px',
              position: 'relative',
            }}
          >
            {/* Timeline track line */}
            {index !== history.length - 1 && (
              <div
                style={{
                  position: 'absolute',
                  top: '24px',
                  left: '11px',
                  bottom: '-14px',
                  width: '2px',
                  backgroundColor: 'var(--border-medium)',
                }}
              />
            )}

            {/* Timeline node */}
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: rev.isCurrent ? 'var(--primary)' : 'var(--bg-tertiary)',
                border: `2px solid ${rev.isCurrent ? 'var(--primary-hover)' : 'var(--border-medium)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1,
                flexShrink: 0,
              }}
            >
              {rev.isCurrent ? (
                <CheckCircle size={12} color="#ffffff" />
              ) : (
                <GitCommit size={12} color="var(--text-muted)" />
              )}
            </div>

            {/* Version Card */}
            <div
              style={{
                flex: 1,
                backgroundColor: rev.isCurrent ? 'var(--bg-tertiary)' : 'var(--bg-elevated)',
                border: `1px solid ${rev.isCurrent ? 'var(--primary)' : 'var(--border-subtle)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '10px 12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: rev.isCurrent ? 'var(--primary)' : 'var(--text-primary)',
                  }}
                >
                  {rev.versionNumber}
                </span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  {rev.timestamp}
                </span>
              </div>

              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                by <strong>{rev.author}</strong>
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-primary)', marginTop: '6px', lineHeight: '1.4' }}>
                {rev.summary}
              </div>

              <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  {rev.blocksCount || '—'} AST Blocks
                </span>

                {!rev.isCurrent && (
                  <button
                    onClick={() => onRestore(rev)}
                    className="btn-ghost"
                    style={{
                      padding: '2px 6px',
                      fontSize: '0.72rem',
                      color: 'var(--primary)',
                    }}
                    title="Restore this version"
                  >
                    <RotateCcw size={12} />
                    <span>Restore</span>
                  </button>
                )}
                {rev.isCurrent && (
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      color: 'var(--success)',
                      background: 'var(--success-light)',
                      padding: '1px 6px',
                      borderRadius: 'var(--radius-full)',
                    }}
                  >
                    Current
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default VersionHistoryDrawer;
