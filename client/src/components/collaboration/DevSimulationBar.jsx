import React, { useState } from 'react';
import { Play, Wifi, Users, AlertTriangle, PlusCircle, ChevronUp, ChevronDown, Sparkles, GitBranch } from 'lucide-react';

const DevSimulationBar = ({
  onToggleConnection,
  isConnected,
  onRunTwoEngineersUseCase,
  onTriggerConflict,
  onSaveSnapshot,
  onToggleCollaboratorsPanel,
  onToggleHistory,
  onToggleAstTree,
}) => {
  const [minimized, setMinimized] = useState(false);

  return (
    <aside
      aria-label="Collaboration Simulation Panel"
      style={{
        position: 'fixed',
        bottom: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 900,
        backgroundColor: 'var(--bg-glass)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-xl)',
        padding: minimized ? '6px 14px' : '10px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        transition: 'all var(--transition-normal)',
        maxWidth: '96vw',
        overflowX: 'auto',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--primary)',
            background: 'var(--primary-light)',
            padding: '3px 8px',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          <Sparkles size={13} />
          <span>SyncDoc AST Simulation</span>
        </div>
      </div>

      {!minimized && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Primary Use Case Runner */}
          <button
            onClick={onRunTwoEngineersUseCase}
            className="btn-primary"
            style={{
              padding: '5px 12px',
              fontSize: '0.75rem',
              fontWeight: 700,
              backgroundColor: '#10b981',
              boxShadow: '0 0 10px rgba(16, 185, 129, 0.4)',
            }}
            title="Demonstrate: User A edits Paragraph while User B concurrently adds Code Block without overwrite"
          >
            <Play size={13} />
            <span>Simulate Two Engineers Use Case</span>
          </button>

          {/* Simulate Overlapping Conflict */}
          <button
            onClick={onTriggerConflict}
            className="btn-secondary"
            style={{
              padding: '4px 10px',
              fontSize: '0.75rem',
              color: 'var(--warning)',
              borderColor: 'rgba(245, 158, 11, 0.4)',
            }}
            title="Demonstrate AST Conflict Resolution when both engineers edit the same node"
          >
            <AlertTriangle size={13} />
            <span>Simulate AST Conflict</span>
          </button>

          {/* Toggle Online / Offline */}
          <button
            onClick={onToggleConnection}
            className="btn-secondary"
            style={{
              padding: '4px 10px',
              fontSize: '0.75rem',
              color: isConnected ? 'var(--danger)' : 'var(--success)',
              borderColor: isConnected ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)',
            }}
            title="Simulate network connection drops and reconnects"
          >
            <Wifi size={13} />
            <span>{isConnected ? 'Disconnect' : 'Reconnect'}</span>
          </button>

          {/* AST Tree Visualizer Toggle */}
          <button
            onClick={onToggleAstTree}
            className="btn-secondary"
            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
            title="View Live Document AST nodes and lock hierarchy"
          >
            <GitBranch size={13} color="var(--primary)" />
            <span>AST Tree</span>
          </button>

          {/* Revisions History Drawer */}
          <button
            onClick={onToggleHistory}
            className="btn-secondary"
            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
          >
            <span>History</span>
          </button>
        </div>
      )}

      {/* Minimize / Expand Toggle */}
      <button
        onClick={() => setMinimized(!minimized)}
        className="btn-ghost"
        style={{ padding: '2px', color: 'var(--text-muted)' }}
        title={minimized ? 'Expand simulation toolbar' : 'Minimize simulation toolbar'}
      >
        {minimized ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
    </aside>
  );
};

export default DevSimulationBar;
