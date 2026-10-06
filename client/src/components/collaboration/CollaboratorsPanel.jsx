import React from 'react';
import CollaboratorItem from './CollaboratorItem';
import { Users, Plus, UserCheck } from 'lucide-react';

/**
 * CollaboratorsPanel
 * Displays all collaborators currently active or registered on the document.
 * Follows Week 1 specifications:
 * - Kirubakar (You, Editing Paragraph 2)
 * - Arjun (Editing, Code Block)
 * - Priya (Viewing)
 * - Rahul (Offline)
 */
const CollaboratorsPanel = ({
  collaborators = [],
  onSimulateJoin,
  onSimulateLeave,
}) => {
  const onlineCount = collaborators.filter((c) => c.status !== 'offline').length;
  const totalCount = collaborators.length;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        color: '#f4f4f5',
      }}
      className="collaborators-panel"
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '12px',
          marginBottom: '12px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={18} color="#818cf8" />
          <h3 style={{ fontSize: '0.925rem', fontWeight: 600, margin: 0 }}>
            Collaborators
          </h3>
          <span
            style={{
              fontSize: '0.725rem',
              padding: '2px 7px',
              borderRadius: '999px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
              fontWeight: 600,
            }}
          >
            {onlineCount} Online
          </span>
        </div>

        {onSimulateJoin && (
          <button
            onClick={onSimulateJoin}
            style={{
              padding: '4px 8px',
              fontSize: '0.725rem',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              color: '#a5b4fc',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
            title="Simulate a new collaborator joining"
          >
            <Plus size={12} /> Add Mock
          </button>
        )}
      </div>

      {/* Collaborator List */}
      <div
        style={{
          overflowY: 'auto',
          flex: 1,
          paddingRight: '4px',
        }}
      >
        {collaborators.map((collaborator) => (
          <CollaboratorItem key={collaborator.id} collaborator={collaborator} />
        ))}

        {collaborators.length === 0 && (
          <div
            style={{
              padding: '24px 16px',
              textAlign: 'center',
              color: '#71717a',
              fontSize: '0.825rem',
            }}
          >
            No collaborators active on this document.
          </div>
        )}
      </div>

      {/* Footer Info for Week 1 preparation */}
      <div
        style={{
          marginTop: '12px',
          paddingTop: '10px',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          fontSize: '0.725rem',
          color: '#71717a',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <UserCheck size={13} color="#94a3b8" />
        <span>Ready for WebSocket user presence broadcast</span>
      </div>
    </div>
  );
};

export default CollaboratorsPanel;
