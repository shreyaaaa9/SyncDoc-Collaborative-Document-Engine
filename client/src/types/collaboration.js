/**
 * SyncDoc Collaboration Engine — Types & Data Contracts
 * Focused on: AST-based structural conflict resolution and multi-user live block state indicators.
 * 
 * Problem Statement:
 * Multi-user text editors frequently suffer from destructive overwrites and sync conflicts.
 * Plain text merging is insufficient for complex structural documents, leading to lost work
 * when multiple users edit the same document simultaneously.
 * 
 * Use Case:
 * Two engineers open a technical spec in "SyncDoc". As User A types a new paragraph,
 * User B concurrently adds a code block lower down the page. The system's AST conflict
 * resolution ensures neither edit is lost. Both users see live visual block state indicators
 * showing who is editing what, preventing layout-destructive overwrites in real-time.
 */

export const PresenceStatus = {
  ACTIVE: 'active',   // actively typing / cursor focused
  IDLE: 'idle',       // document open, no interaction in > 1 minute
  AWAY: 'away',       // document unfocused / tab switched
};

export const ConnectionState = {
  CONNECTED: 'connected',
  RECONNECTING: 'reconnecting',
  DISCONNECTED: 'disconnected',
};

export const UserRoles = {
  OWNER: 'Lead Engineer (User A)',
  COLLABORATOR: 'Collaborating Engineer (User B)',
  REVIEWER: 'Reviewer',
};

export const BlockLockState = {
  UNLOCKED: 'unlocked',
  LOCKED_BY_SELF: 'locked_by_self',
  LOCKED_BY_OTHER: 'locked_by_other',
};

export const COLLABORATOR_COLORS = [
  { name: 'Indigo (User A)', bg: '#4f46e5', light: '#e0e7ff', text: '#3730a3', border: '#6366f1' },
  { name: 'Emerald (User B)', bg: '#059669', light: '#d1fae5', text: '#065f46', border: '#10b981' },
  { name: 'Amber', bg: '#d97706', light: '#fef3c7', text: '#92400e', border: '#f59e0b' },
  { name: 'Rose', bg: '#e11d48', light: '#ffe4e6', text: '#9f1239', border: '#f43f5e' },
  { name: 'Cyan', bg: '#0891b2', light: '#cffafe', text: '#155e75', border: '#06b6d4' },
];

export const INITIAL_COLLABORATORS = [
  {
    id: 'user_a',
    name: 'User A (You - Kirub)',
    email: 'engineerA@syncdoc.dev',
    role: 'Lead Engineer (User A)',
    status: PresenceStatus.ACTIVE,
    color: COLLABORATOR_COLORS[0],
    currentBlockId: 'blk_para_spec',
    lastActive: new Date().toISOString(),
    isSelf: true,
  },
  {
    id: 'user_b',
    name: 'User B (Engineer 2 - Shreya)',
    email: 'engineerB@syncdoc.dev',
    role: 'Collaborating Engineer (User B)',
    status: PresenceStatus.ACTIVE,
    color: COLLABORATOR_COLORS[1],
    currentBlockId: 'blk_code_spec',
    lastActive: new Date().toISOString(),
    isSelf: false,
  },
];

export const INITIAL_HISTORY = [
  {
    versionId: 'v_3',
    versionNumber: 'AST Snapshot v1.2',
    timestamp: 'Just now (Synced)',
    author: 'AST Engine (SyncDoc)',
    summary: 'Merged concurrent mutations: User A ParagraphNode + User B CodeNode',
    blocksCount: 4,
    isCurrent: true,
  },
  {
    versionId: 'v_2',
    versionNumber: 'AST Snapshot v1.1',
    timestamp: '8 minutes ago',
    author: 'User B (Engineer 2)',
    summary: 'Added Distributed Cache AST CodeBlock specification',
    blocksCount: 3,
    isCurrent: false,
  },
  {
    versionId: 'v_1',
    versionNumber: 'AST Snapshot v1.0',
    timestamp: '25 minutes ago',
    author: 'User A (You)',
    summary: 'Initial technical spec document outline and requirements',
    blocksCount: 2,
    isCurrent: false,
  },
];
