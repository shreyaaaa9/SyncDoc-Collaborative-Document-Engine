/**
 * Centralized Mock Collaboration Data for SyncDoc — Frontend Member 2 (Week 1)
 *
 * This mock data powers the Collaboration UI Foundation without requiring
 * an active WebSocket backend or AST conflict-resolution server.
 */

export const PresenceStatus = {
  ONLINE: 'online',
  EDITING: 'editing',
  VIEWING: 'viewing',
  AWAY: 'away',
  OFFLINE: 'offline',
};

export const ConnectionState = {
  CONNECTED: 'connected',
  CONNECTING: 'connecting',
  DISCONNECTED: 'disconnected',
};

export const mockCollaborators = [
  {
    id: 'user-kirubakar',
    name: 'Kirubakar',
    avatar: 'K',
    role: 'You',
    status: PresenceStatus.ONLINE,
    activity: 'Editing Paragraph 2',
    currentBlockId: 'blk_para_2',
    color: '#6366f1', // Indigo
    isSelf: true,
  },
  {
    id: 'user-arjun',
    name: 'Arjun',
    avatar: 'A',
    role: 'Collaborator',
    status: PresenceStatus.ONLINE,
    activity: 'Editing Code Block',
    currentBlockId: 'blk_code_1',
    color: '#10b981', // Emerald
    isSelf: false,
  },
  {
    id: 'user-priya',
    name: 'Priya',
    avatar: 'P',
    role: 'Viewer',
    status: PresenceStatus.VIEWING,
    activity: 'Viewing',
    currentBlockId: null,
    color: '#f59e0b', // Amber
    isSelf: false,
  },
  {
    id: 'user-rahul',
    name: 'Rahul',
    avatar: 'R',
    role: 'Collaborator',
    status: PresenceStatus.OFFLINE,
    activity: 'Offline',
    currentBlockId: null,
    color: '#64748b', // Slate Gray
    isSelf: false,
  },
];

export const mockConnectionInfo = {
  status: ConnectionState.CONNECTED,
  lastSynchronized: 'Just now',
  latencyMs: 34,
  socketId: 'ws_syncdoc_mock_8892',
};

export const mockNotifications = [
  {
    id: 'notif_1',
    type: 'success',
    title: 'User joined',
    message: 'Arjun joined the document',
    timestamp: '2m ago',
  },
  {
    id: 'notif_2',
    type: 'info',
    title: 'Editing',
    message: 'Arjun is editing Code Block 3',
    timestamp: '1m ago',
  },
  {
    id: 'notif_3',
    type: 'conflict',
    title: 'Conflict',
    message: 'A possible editing conflict was detected',
    timestamp: 'Just now',
  },
];

export const mockActiveConflict = {
  id: 'conflict_sec2',
  blockId: 'blk_para_2',
  blockTitle: 'Technical Specification — Section 2',
  blockType: 'Paragraph Block (System Architecture)',
  changedBy: 'Arjun',
  detectedAt: 'Just now',
  yourVersion: 'NodeMCU communicates with the server using Wi-Fi.',
  latestVersion: 'ESP8266 communicates with the server using Wi-Fi.',
};

export const mockVersionHistory = [
  {
    id: 'v1.4',
    versionNumber: 'v1.4',
    user: 'Kirubakar',
    avatar: 'K',
    timestamp: '2 minutes ago',
    description: 'Added system architecture',
    isCurrent: true,
    previewContent: [
      { id: 'blk_h1', type: 'heading', level: 1, content: 'SyncDoc Technical Architecture' },
      { id: 'blk_para_1', type: 'paragraph', content: 'SyncDoc is a collaborative technical document engine with block-level structure.' },
      { id: 'blk_para_2', type: 'paragraph', content: 'NodeMCU communicates with the server using Wi-Fi.' },
      { id: 'blk_code_1', type: 'code', language: 'javascript', content: 'const client = new SyncDocClient({ endpoint: "ws://localhost:5000" });' },
    ],
  },
  {
    id: 'v1.3',
    versionNumber: 'v1.3',
    user: 'Arjun',
    avatar: 'A',
    timestamp: '8 minutes ago',
    description: 'Updated code block',
    isCurrent: false,
    previewContent: [
      { id: 'blk_h1', type: 'heading', level: 1, content: 'SyncDoc Technical Architecture' },
      { id: 'blk_para_1', type: 'paragraph', content: 'SyncDoc is a collaborative technical document engine with block-level structure.' },
      { id: 'blk_code_1', type: 'code', language: 'javascript', content: '// Arjun updated network adapter config\nconst adapter = new WiFiAdapter();' },
    ],
  },
  {
    id: 'v1.2',
    versionNumber: 'v1.2',
    user: 'Priya',
    avatar: 'P',
    timestamp: '15 minutes ago',
    description: 'Added technical requirements',
    isCurrent: false,
    previewContent: [
      { id: 'blk_h1', type: 'heading', level: 1, content: 'SyncDoc Technical Architecture' },
      { id: 'blk_para_1', type: 'paragraph', content: 'SyncDoc is a collaborative technical document engine with block-level structure.' },
    ],
  },
  {
    id: 'v1.1',
    versionNumber: 'v1.1',
    user: 'Kirubakar',
    avatar: 'K',
    timestamp: '20 minutes ago',
    description: 'Created document',
    isCurrent: false,
    previewContent: [
      { id: 'blk_h1', type: 'heading', level: 1, content: 'SyncDoc Technical Architecture' },
    ],
  },
];
