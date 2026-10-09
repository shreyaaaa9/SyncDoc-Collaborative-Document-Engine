import { WebSocketService } from '../src/collaboration/websocketService';
import { YjsService } from '../src/collaboration/yjsService';
import { PresenceService } from '../src/collaboration/presenceService';
import { CollaborationService } from '../src/collaboration/collaborationService';
import { COLLABORATION_PERSONAS } from '../src/data/personas';

// Setup Mock WebSocket for multi-client bus in test environment
class VirtualNetworkHub {
  private clients: Set<VirtualSocket> = new Set();

  public register(sock: VirtualSocket) {
    this.clients.add(sock);
  }

  public unregister(sock: VirtualSocket) {
    this.clients.delete(sock);
  }

  public broadcast(sender: VirtualSocket, data: string) {
    for (const client of this.clients) {
      if (client !== sender && client.readyState === 1) {
        client.onmessage?.({ data });
      }
    }
  }
}

const networkHub = new VirtualNetworkHub();

class VirtualSocket {
  public static OPEN = 1;
  public readyState = 1;
  public onopen: (() => void) | null = null;
  public onclose: ((event: any) => void) | null = null;
  public onerror: ((error: any) => void) | null = null;
  public onmessage: ((event: any) => void) | null = null;

  constructor(public url: string) {
    networkHub.register(this);
    setTimeout(() => {
      this.onopen?.();
    }, 10);
  }

  public send(data: string) {
    networkHub.broadcast(this, data);
  }

  public close() {
    this.readyState = 3;
    networkHub.unregister(this);
    this.onclose?.({ code: 1000 });
  }
}

(globalThis as any).WebSocket = VirtualSocket;

async function run4WayCollaborationTests() {
  console.log('=== 4-Way Multi-User Real-Time Collaboration Test ===\n');

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

  const docId = 'doc-test-4way';
  const initialContent = '<h1>System Specifications</h1><p>Base architecture.</p>';

  // Create 4 isolated collaboration services for 4 distinct users
  const clients = COLLABORATION_PERSONAS.map((persona) => {
    const ws = new WebSocketService('ws://mock-hub');
    const yjs = new YjsService();
    const presence = new PresenceService();
    const collab = new CollaborationService(ws, yjs, presence);

    let latestContent = initialContent;
    collab.onContentChange((html) => {
      latestContent = html;
    });

    return {
      persona,
      ws,
      yjs,
      presence,
      collab,
      getContent: () => latestContent,
    };
  });

  // Step 1: All 4 clients join the room
  for (const client of clients) {
    client.collab.joinDocument(docId, client.persona, initialContent);
  }

  await new Promise((r) => setTimeout(r, 100));

  assert(clients.length === 4, '4 Clients successfully initialized');

  // Step 2: User 1 (Kirubakar) edits the document
  console.log('\n--- Test 1: User 1 (Kirubakar) edits document ---');
  const user1Edit = '<h1>System Specifications</h1><p>Base architecture updated by Kirubakar.</p>';
  clients[0].collab.updateContent(user1Edit);

  await new Promise((r) => setTimeout(r, 100));

  assert(clients[0].getContent() === user1Edit, 'User 1 local content updated');
  assert(clients[1].getContent() === user1Edit, 'User 2 (Sarah Chen) automatically received User 1 edit');
  assert(clients[2].getContent() === user1Edit, 'User 3 (Alex Dev) automatically received User 1 edit');
  assert(clients[3].getContent() === user1Edit, 'User 4 (Elena Rostova) automatically received User 1 edit');

  // Step 3: User 2 (Sarah Chen) makes concurrent change
  console.log('\n--- Test 2: User 2 (Sarah Chen) edits document ---');
  const user2Edit = '<h1>System Specifications</h1><p>Sarah Chen added microservices section.</p>';
  clients[1].collab.updateContent(user2Edit);

  await new Promise((r) => setTimeout(r, 100));

  assert(clients[0].getContent() === user2Edit, 'User 1 (Kirubakar) automatically received User 2 edit');
  assert(clients[1].getContent() === user2Edit, 'User 2 local content updated');
  assert(clients[2].getContent() === user2Edit, 'User 3 (Alex Dev) automatically received User 2 edit');
  assert(clients[3].getContent() === user2Edit, 'User 4 (Elena Rostova) automatically received User 2 edit');

  // Step 4: User 3 (Alex Dev) makes change
  console.log('\n--- Test 3: User 3 (Alex Dev) edits document ---');
  const user3Edit = '<h1>System Specifications</h1><p>Alex Dev added AST parser benchmark specs.</p>';
  clients[2].collab.updateContent(user3Edit);

  await new Promise((r) => setTimeout(r, 100));

  assert(clients[0].getContent() === user3Edit, 'User 1 automatically received User 3 edit');
  assert(clients[1].getContent() === user3Edit, 'User 2 automatically received User 3 edit');
  assert(clients[2].getContent() === user3Edit, 'User 3 local content updated');
  assert(clients[3].getContent() === user3Edit, 'User 4 automatically received User 3 edit');

  // Step 5: User 4 (Elena Rostova) makes change
  console.log('\n--- Test 4: User 4 (Elena Rostova) edits document ---');
  const user4Edit = '<h1>System Specifications</h1><p>Elena Rostova finalized security and TLS policies.</p>';
  clients[3].collab.updateContent(user4Edit);

  await new Promise((r) => setTimeout(r, 100));

  assert(clients[0].getContent() === user4Edit, 'User 1 automatically received User 4 edit');
  assert(clients[1].getContent() === user4Edit, 'User 2 automatically received User 4 edit');
  assert(clients[2].getContent() === user4Edit, 'User 3 automatically received User 4 edit');
  assert(clients[3].getContent() === user4Edit, 'User 4 local content updated');

  // Clean up
  for (const client of clients) {
    client.collab.leaveDocument();
    client.ws.destroy();
  }

  console.log(`\n=== 4-Way Collaboration Test Result: ${passed} Passed, ${failed} Failed ===`);
  if (failed > 0) process.exit(1);
}

run4WayCollaborationTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
