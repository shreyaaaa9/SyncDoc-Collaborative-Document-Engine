import React from 'react';
import { GitBranch, ShieldCheck, CheckCircle2, Lock, Cpu, X } from 'lucide-react';

const AstTreeViewer = ({ isOpen, onClose, doc, collaborators }) => {
  if (!isOpen || !doc) return null;

  return (
    <aside
      style={{
        width: '340px',
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
          <GitBranch size={18} color="var(--primary)" />
          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Live AST Tree Visualizer</span>
        </div>
        <button onClick={onClose} className="btn-ghost" style={{ padding: '4px' }}>
          <X size={16} />
        </button>
      </div>

      {/* AST Protection Notice */}
      <div
        style={{
          padding: '12px 14px',
          backgroundColor: 'rgba(99, 102, 241, 0.08)',
          borderBottom: '1px solid rgba(99, 102, 241, 0.2)',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          lineHeight: '1.4',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontWeight: 600, marginBottom: '4px' }}>
          <ShieldCheck size={15} />
          <span>AST Structural Conflict Engine</span>
        </div>
        Plain text line-merging fails on structural documents. SyncDoc models each block as an independent AST node, ensuring User A's paragraph and User B's code block never cause destructive overwrites.
      </div>

      {/* Tree Node List */}
      <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Document Root: <code>DocAST ({doc.blocks.length} nodes)</code>
        </div>

        {doc.blocks.map((block, index) => {
          // Check active user on this node
          const activeUser = collaborators.find((u) => u.currentBlockId === block.id);

          return (
            <div
              key={block.id}
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                border: `1px solid ${activeUser ? activeUser.color.bg : 'var(--border-medium)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '10px 12px',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Cpu size={13} color="var(--primary)" />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {block.type === 'heading' ? 'HeadingNode' : block.type === 'code' ? 'CodeBlockNode' : 'ParagraphNode'}
                  </span>
                </div>
                <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  #{index + 1}
                </span>
              </div>

              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>
                id: {block.id}
              </div>

              {/* Node State & Lock status */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px', paddingTop: '6px', borderTop: '1px solid var(--border-subtle)' }}>
                {activeUser ? (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      color: activeUser.color.bg,
                      background: activeUser.color.light,
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                    }}
                  >
                    <Lock size={10} />
                    <span>Locked by {activeUser.name.split(' ')[0]}</span>
                  </span>
                ) : (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.7rem',
                      color: 'var(--success)',
                      fontWeight: 500,
                    }}
                  >
                    <CheckCircle2 size={12} />
                    <span>Synchronized</span>
                  </span>
                )}

                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  v1.2
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default AstTreeViewer;
