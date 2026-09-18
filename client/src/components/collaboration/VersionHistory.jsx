import React, { useState } from 'react';
import VersionHistoryItem from './VersionHistoryItem';
import { History, X, RotateCcw, FileText, CheckCircle2 } from 'lucide-react';

/**
 * VersionHistory
 * Displays document revision timeline and mock version preview modal.
 * Mock data items:
 * - v1.4: Kirubakar (2 mins ago) Added system architecture
 * - v1.3: Arjun (8 mins ago) Updated code block
 * - v1.2: Priya (15 mins ago) Added technical requirements
 * - v1.1: Kirubakar (20 mins ago) Created document
 */
const VersionHistory = ({
  history = [],
  onRestoreVersion,
}) => {
  const [selectedVersion, setSelectedVersion] = useState(null);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        color: '#f4f4f5',
      }}
      className="version-history-panel"
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '12px',
          marginBottom: '16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <History size={18} color="#818cf8" />
          <h3 style={{ fontSize: '0.925rem', fontWeight: 600, margin: 0 }}>
            Document History
          </h3>
          <span
            style={{
              fontSize: '0.725rem',
              padding: '2px 7px',
              borderRadius: '999px',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              color: '#a5b4fc',
              fontWeight: 600,
            }}
          >
            {history.length} Revisions
          </span>
        </div>
      </div>

      {/* Timeline List */}
      <div
        style={{
          overflowY: 'auto',
          flex: 1,
          paddingRight: '4px',
        }}
      >
        {history.map((item) => (
          <VersionHistoryItem
            key={item.id || item.versionNumber}
            item={item}
            onViewVersion={(v) => setSelectedVersion(v)}
          />
        ))}

        {history.length === 0 && (
          <div style={{ textAlign: 'center', color: '#71717a', padding: '24px 0', fontSize: '0.825rem' }}>
            No revisions recorded yet.
          </div>
        )}
      </div>

      {/* Version Preview Modal */}
      {selectedVersion && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '16px',
          }}
          role="dialog"
          aria-modal="true"
        >
          <div
            style={{
              width: '100%',
              maxWidth: '600px',
              backgroundColor: '#18181b',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} color="#818cf8" />
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#f4f4f5', margin: 0 }}>
                  Snapshot Preview — {selectedVersion.versionNumber}
                </h4>
              </div>
              <button
                onClick={() => setSelectedVersion(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#71717a',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '20px', overflowY: 'auto', maxHeight: '380px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '14px',
                  fontSize: '0.8rem',
                  color: '#a1a1aa',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  padding: '8px 12px',
                  borderRadius: '8px',
                }}
              >
                <span>Author: <strong style={{ color: '#f4f4f5' }}>{selectedVersion.user}</strong></span>
                <span>•</span>
                <span>Timestamp: <strong style={{ color: '#f4f4f5' }}>{selectedVersion.timestamp}</strong></span>
                <span>•</span>
                <span>{selectedVersion.description}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {selectedVersion.previewContent ? (
                  selectedVersion.previewContent.map((blk) => (
                    <div
                      key={blk.id}
                      style={{
                        padding: '10px 14px',
                        backgroundColor: 'rgba(0, 0, 0, 0.25)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: '8px',
                      }}
                    >
                      <div style={{ fontSize: '0.7rem', color: '#818cf8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
                        {blk.type} Block
                      </div>
                      <div
                        style={{
                          fontSize: blk.type === 'heading' ? '1.05rem' : '0.875rem',
                          fontWeight: blk.type === 'heading' ? 700 : 400,
                          fontFamily: blk.type === 'code' ? 'monospace' : 'inherit',
                          color: '#e4e4e7',
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {blk.content}
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#71717a', fontSize: '0.875rem' }}>No block data preview stored for this snapshot.</p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '14px 20px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '0.75rem', color: '#71717a' }}>
                Read-only snapshot preview
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setSelectedVersion(null)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#f4f4f5',
                    cursor: 'pointer',
                    fontSize: '0.8125rem',
                  }}
                >
                  Close Preview
                </button>
                {onRestoreVersion && (
                  <button
                    onClick={() => {
                      onRestoreVersion(selectedVersion);
                      setSelectedVersion(null);
                    }}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '6px',
                      backgroundColor: '#6366f1',
                      border: 'none',
                      color: '#ffffff',
                      cursor: 'pointer',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <RotateCcw size={14} /> Restore This Version
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VersionHistory;
