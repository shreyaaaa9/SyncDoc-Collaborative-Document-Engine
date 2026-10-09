const { WebSocketServer, WebSocket } = require('ws');
const http = require('http');

const PORT = process.env.VITE_WS_PORT || process.env.PORT || 3001;

const server = http.createServer((req, res) => {
  if (req.url === '/health' || req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'SyncDoc WebSocket Server', port: PORT }));
  } else {
    res.writeHead(404);
    res.end();
  }
});

const wss = new WebSocketServer({ server });
const rooms = new Map(); // documentId -> Set<WebSocket>
const clientDocs = new Map(); // ws -> Set<documentId>

wss.on('connection', (ws, req) => {
  clientDocs.set(ws, new Set());
  console.log(`[SyncDoc WS Server] Client connected from ${req.socket.remoteAddress}`);

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      const { type, documentId } = msg;

      if (documentId) {
        if (!rooms.has(documentId)) {
          rooms.set(documentId, new Set());
        }
        rooms.get(documentId).add(ws);
        clientDocs.get(ws)?.add(documentId);

        // Broadcast to all other peers in the room
        const room = rooms.get(documentId);
        if (room) {
          for (const client of room) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(raw.toString());
            }
          }
        }
      } else {
        // Broadcast global messages to all connected peers
        for (const client of wss.clients) {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(raw.toString());
          }
        }
      }
    } catch (err) {
      console.error('[SyncDoc WS Server] Failed to process message:', err.message);
    }
  });

  ws.on('close', () => {
    const docs = clientDocs.get(ws);
    if (docs) {
      for (const docId of docs) {
        const room = rooms.get(docId);
        if (room) {
          room.delete(ws);
          if (room.size === 0) {
            rooms.delete(docId);
          }
        }
      }
      clientDocs.delete(ws);
    }
    console.log('[SyncDoc WS Server] Client disconnected');
  });

  ws.on('error', (err) => {
    console.warn('[SyncDoc WS Server] Client error:', err.message);
  });
});

server.listen(PORT, () => {
  console.log(`[SyncDoc WS Server] Real-time collaboration WebSocket server running on ws://localhost:${PORT}`);
});
