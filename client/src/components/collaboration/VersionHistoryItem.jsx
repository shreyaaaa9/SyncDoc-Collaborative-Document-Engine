import React from 'react';
import { Eye, Clock, GitCommit } from 'lucide-react';

/**
 * VersionHistoryItem
 * Renders an entry in the Document History:
 * - Version number (v1.4, v1.3, v1.2, v1.1)
 * - User name + Avatar
 * - Timestamp (e.g. 2 minutes ago)
 * - Change description
 * - "View Version" preview button
 */
const VersionHistoryItem = ({
  item,
  onViewVersion,
}) => {
  const { versionNumber, user, avatar, timestamp, description, isCurrent } = item;

  return (
    <div
      style={{
        position: 'relative',
        paddingLeft: '24px',
        paddingBottom: '20px',
      }}
      className="version-history-item"
    >
      {/* Timeline vertical connector */}
      <div
        style={{
          position: 'absolute',
          left: '7px',
          top: '20px',
          bottom: 0,
          width: '2px',
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
        }}
      />

      {/* Timeline node dot */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: '4px',
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          backgroundColor: isCurrent ? '#6366f1' : '#27272a',
          border: `2px solid ${isCurrent ? '#818cf8' : 'rgba(255, 255, 255, 0.2)'}`,
          boxShadow: isCurrent ? '0 0 8px rgba(99, 102, 241, 0.6)' : 'none',
        }}
      />

      {/* Card Content */}
      <div
        style={{
          backgroundColor: isCurrent ? 'rgba(99, 102, 241, 0.08)' : 'rgba(255, 255, 255, 0.03)',
          border: `1px solid ${isCurrent ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255, 255, 255, 0.06)'}`,
          borderRadius: '10px',
          padding: '12px 14px',
          transition: 'all 0.2s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                color: isCurrent ? '#a5b4fc' : '#f4f4f5',
              }}
            >
              {versionNumber}
            </span>
            {isCurrent && (
              <span
                style={{
                  fontSize: '0.675rem',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(99, 102, 241, 0.25)',
                  color: '#c7d2fe',
                  fontWeight: 600,
                }}
              >
                Current
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.725rem', color: '#71717a' }}>
            <Clock size={11} />
            <span>{timestamp}</span>
          </div>
        </div>

        {/* User info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <div
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: '#3f3f46',
              color: '#f4f4f5',
              fontSize: '0.7rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {avatar || user.charAt(0)}
          </div>
          <span style={{ fontSize: '0.785rem', fontWeight: 500, color: '#d4d4d8' }}>
            {user}
          </span>
        </div>

        {/* Change description */}
        <p style={{ fontSize: '0.8125rem', color: '#a1a1aa', margin: '0 0 10px 0', lineHeight: 1.4 }}>
          {description}
        </p>

        {/* View Version action button */}
        <button
          onClick={() => onViewVersion(item)}
          style={{
            padding: '5px 10px',
            fontSize: '0.75rem',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: '#e4e4e7',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            transition: 'all 0.15s ease',
          }}
          title={`Preview snapshot of ${versionNumber}`}
        >
          <Eye size={13} /> View Version
        </button>
      </div>
    </div>
  );
};

export default VersionHistoryItem;
