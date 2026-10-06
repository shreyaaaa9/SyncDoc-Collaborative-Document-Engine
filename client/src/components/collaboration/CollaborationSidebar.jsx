import React, { useState } from 'react';
import CollaboratorsPanel from './CollaboratorsPanel';
import VersionHistory from './VersionHistory';
import ConnectionStatus from './ConnectionStatus';
import { Users, History, ChevronRight, ChevronLeft, X, Sparkles, Wifi } from 'lucide-react';

/**
 * CollaborationSidebar
 * Responsive, collapsible collaboration sidebar:
 * - Desktop: Docked right panel with toggle button
 * - Mobile / Tablet: Slide-out drawer overlay
 * - Tabs: Collaborators and Document History
 * - Shows connection status and active collaborator counts
 */
const CollaborationSidebar = ({
  isOpen,
  onToggle,
  collaborators = [],
  versionHistory = [],
  connectionStatus = 'connected',
  lastSynchronized = 'Just now',
  latencyMs = 34,
  onChangeConnectionStatus,
  onSimulateJoin,
  onRestoreVersion,
}) => {
  const [activeTab, setActiveTab] = useState('collaborators'); // 'collaborators' | 'history'

  const onlineCount = collaborators.filter((c) => c.status !== 'offline').length;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onToggle}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 40,
            display: 'block',
          }}
          className="sidebar-backdrop-mobile"
        />
      )}

      {/* Sidebar Container */}
      <aside
        style={{
          width: isOpen ? '340px' : '0px',
          minWidth: isOpen ? '340px' : '0px',
          height: '100%',
          backgroundColor: '#18181b',
          borderLeft: isOpen ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 45,
        }}
        className={`collaboration-sidebar ${isOpen ? 'open' : 'closed'}`}
        aria-label="Collaboration Sidebar"
      >
        {isOpen && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              width: '340px',
              padding: '16px',
            }}
          >
            {/* Top Toolbar / Close button for mobile */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '12px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                marginBottom: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#a1a1aa',
                  }}
                >
                  Collaboration
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Collapse Toggle Button */}
                <button
                  onClick={onToggle}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#a1a1aa',
                    padding: '5px 8px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title="Collapse sidebar"
                  aria-label="Collapse sidebar"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Connection Overview Card */}
            <div
              style={{
                padding: '10px 12px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: connectionStatus === 'connected' ? '#10b981' : connectionStatus === 'connecting' ? '#f59e0b' : '#ef4444',
                    boxShadow: `0 0 6px ${connectionStatus === 'connected' ? '#10b981' : '#ef4444'}`,
                  }}
                />
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f4f4f5' }}>
                  {connectionStatus === 'connected' ? 'Connected' : connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
                </span>
              </div>

              <span style={{ fontSize: '0.725rem', color: '#71717a' }}>
                {lastSynchronized}
              </span>
            </div>

            {/* Navigation Tabs */}
            <div
              style={{
                display: 'flex',
                backgroundColor: 'rgba(0, 0, 0, 0.25)',
                padding: '3px',
                borderRadius: '8px',
                marginBottom: '14px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <button
                onClick={() => setActiveTab('collaborators')}
                style={{
                  flex: 1,
                  padding: '6px 10px',
                  fontSize: '0.785rem',
                  fontWeight: 600,
                  backgroundColor: activeTab === 'collaborators' ? '#27272a' : 'transparent',
                  color: activeTab === 'collaborators' ? '#f4f4f5' : '#71717a',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                }}
              >
                <Users size={14} />
                <span>Collaborators</span>
                <span
                  style={{
                    fontSize: '0.675rem',
                    padding: '1px 5px',
                    borderRadius: '999px',
                    backgroundColor: activeTab === 'collaborators' ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255, 255, 255, 0.08)',
                    color: activeTab === 'collaborators' ? '#a5b4fc' : '#a1a1aa',
                  }}
                >
                  {onlineCount}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('history')}
                style={{
                  flex: 1,
                  padding: '6px 10px',
                  fontSize: '0.785rem',
                  fontWeight: 600,
                  backgroundColor: activeTab === 'history' ? '#27272a' : 'transparent',
                  color: activeTab === 'history' ? '#f4f4f5' : '#71717a',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                }}
              >
                <History size={14} />
                <span>History</span>
                <span
                  style={{
                    fontSize: '0.675rem',
                    padding: '1px 5px',
                    borderRadius: '999px',
                    backgroundColor: activeTab === 'history' ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255, 255, 255, 0.08)',
                    color: activeTab === 'history' ? '#a5b4fc' : '#a1a1aa',
                  }}
                >
                  {versionHistory.length}
                </span>
              </button>
            </div>

            {/* Tab Content */}
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {activeTab === 'collaborators' ? (
                <CollaboratorsPanel
                  collaborators={collaborators}
                  onSimulateJoin={onSimulateJoin}
                />
              ) : (
                <VersionHistory
                  history={versionHistory}
                  onRestoreVersion={onRestoreVersion}
                />
              )}
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default CollaborationSidebar;
