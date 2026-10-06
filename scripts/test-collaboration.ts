import { WebSocketService } from '../src/collaboration/websocketService';
import { YjsService } from '../src/collaboration/yjsService';
import { PresenceService } from '../src/collaboration/presenceService';
import { CollaborationService } from '../src/collaboration/collaborationService';

// Provide global WebSocket mock for Node test environment
if (typeof globalThis.WebSocket === 'undefined') {
  class MockWebSocket {
    public static CONNECTING = 0;
    public static OPEN = 1;
    public static CLOSING = 2;
    public static CLOSED = 3;

    public readyState = MockWebSocket.CONNECTING;
    public onopen: (() => void) | null = null;
    public onclose: ((event: any) => void) | null = null;
    public onerror: ((error: any) => void) | null = null;
    public onmessage: ((event: any) => void) | null = null;

    constructor(public url: string) {
      setTimeout(() => {
        this.readyState = MockWebSocket.OPEN;
        if (this.onopen) this.onopen();
      }, 50);
    }

    public send(_data: string) {
      // Mock echo / no-op
    }

    public close(code = 1000, reason = '') {
      this.readyState = MockWebSocket.CLOSED;
      if (this.onclose) this.onclose({ code, reason });
    }
  }

  (globalThis as any).WebSocket = MockWebSocket;
}

async function runTests() {
  console.log('=== SyncDoc Collaboration Integration Test Suite ===\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      failed++;
    }
  }

  // 1. Test YjsService Document Synchronization
  console.log('\n--- 1. Testing Yjs Synchronization ---');
  const yjsA = new YjsService();
  const yjsB = new YjsService();

  const docId = 'doc_test_101';
  yjsA.initializeDocument(docId, '<p>Initial specification</p>');
  yjsB.initializeDocument(docId, '');

  assert(yjsA.getContent() === '<p>Initial specification</p>', 'User A initializes with document content');

  // User A edits content
  let updateFromA: string = '';
  yjsA.onUpdate((event) => {
    if (!event.isRemote) {
      updateFromA = event.updateBase64;
    }
  });

  yjsA.setLocalContent('<p>Testing real-time collaboration</p>');
  assert(yjsA.getContent() === '<p>Testing real-time collaboration</p>', 'User A sets local content');
  assert(updateFromA.length > 0, 'User A generates base64 Yjs update');

  // User B receives User A update
  yjsB.applyRemoteUpdate(updateFromA, '<p>Testing real-time collaboration</p>');
  assert(yjsB.getContent() === '<p>Testing real-time collaboration</p>', 'User B receives User A update in real time');

  // User B edits content
  let updateFromB: string = '';
  yjsB.onUpdate((event) => {
    if (!event.isRemote) {
      updateFromB = event.updateBase64;
    }
  });

  yjsB.setLocalContent('<p>Testing real-time collaboration - Update from User B</p>');
  assert(updateFromB.length > 0, 'User B generates local update');

  // User A receives User B update
  yjsA.applyRemoteUpdate(updateFromB, '<p>Testing real-time collaboration - Update from User B</p>');
  assert(yjsA.getContent() === '<p>Testing real-time collaboration - Update from User B</p>', 'User A receives User B update in real time');

  // 2. Test PresenceService
  console.log('\n--- 2. Testing Presence Service ---');
  const presenceA = new PresenceService();
  presenceA.setCurrentUser({
    id: 'user_a',
    name: 'Kirubakar',
    email: 'kirubakar@engineering.org',
  });

  assert(presenceA.getCollaborators().length === 1, 'User A has 1 active collaborator (themselves)');
  assert(presenceA.getCollaborators()[0].name === 'Kirubakar', 'Current user is Kirubakar');

  // User B presence arrives
  presenceA.handlePeerPresence({
    id: 'user_b',
    name: 'Sarah Chen',
    color: '#059669',
    status: 'online',
    lastActive: Date.now(),
  });

  assert(presenceA.getCollaborators().length === 2, 'Active collaborator count updates to 2 when User B joins');
  assert(presenceA.getCollaborators().some((u) => u.name === 'Sarah Chen'), 'User B appears in collaborator list');

  // User B leaves
  presenceA.handlePeerLeave('user_b');
  assert(presenceA.getCollaborators().length === 1, 'Active collaborator count drops back to 1 when User B leaves');

  // 3. Test Full CollaborationService Coordination
  console.log('\n--- 3. Testing CollaborationService Multi-Client Flow ---');
  const wsMockA = new WebSocketService('ws://127.0.0.1:9999');
  const wsMockB = new WebSocketService('ws://127.0.0.1:9999');

  const collabA = new CollaborationService(wsMockA, yjsA, presenceA);
  const collabB = new CollaborationService(wsMockB, yjsB, new PresenceService());

  let notifA: string[] = [];
  collabA.onNotification((n) => {
    notifA.push(n.message);
  });

  collabA.joinDocument('doc_shared', { id: 'user_a', name: 'Kirubakar' }, 'Initial Spec');
  collabB.joinDocument('doc_shared', { id: 'user_b', name: 'Alex Dev' }, '');

  assert(collabA.getCurrentUser()?.name === 'Kirubakar', 'Client A initialized as Kirubakar');
  assert(collabB.getCurrentUser()?.name === 'Alex Dev', 'Client B initialized as Alex Dev');

  // Test Disconnect / Reconnect Simulation
  console.log('\n--- 4. Testing Connection Status & Reconnect ---');
  assert(wsMockA.getStatus() !== undefined, 'Connection status is queryable');
  wsMockA.simulateConnectionToggle(false);
  assert(wsMockA.getStatus() === 'disconnected', 'Status correctly transitions to disconnected on offline toggle');

  wsMockA.simulateConnectionToggle(true);
  assert(
    wsMockA.getStatus() === 'connecting' ||
      wsMockA.getStatus() === 'connected' ||
      wsMockA.getStatus() === 'reconnecting',
    'Status transitions towards reconnecting/connecting on restore'
  );

  // Wait for open
  await new Promise((resolve) => setTimeout(resolve, 100));
  assert(wsMockA.getStatus() === 'connected', 'Status reaches connected once socket opens');

  // Cleanup
  collabA.leaveDocument();
  collabB.leaveDocument();
  wsMockA.destroy();
  wsMockB.destroy();
  yjsA.destroy();
  yjsB.destroy();

  console.log(`\n=== Test Results: ${passed} Passed, ${failed} Failed ===`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test crashed:', err);
  process.exit(1);
});
