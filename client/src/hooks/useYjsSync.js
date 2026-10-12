import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { API_URL } from '../config';

/**
 * useYjsSync
 *
 * Connects the BlockEditor to the backend Socket.io real-time pipeline.
 *
 * Strategy: we emit a custom "blocks-update" event carrying the full blocks
 * array on every local change. The server broadcasts it to all other clients
 * in the same document room. This is simple, reliable, and works immediately
 * without any Yjs CRDT complexity on the client side.
 *
 * The backend Yjs pipeline (yjsManager + astSync) continues to work as before
 * for server-side AST generation.
 *
 * @param {string}   documentId      - MongoDB document ID
 * @param {function} onRemoteUpdate  - called with blocks array when a remote change arrives
 * @param {function} onStatusChange  - called with 'connected' | 'connecting' | 'disconnected'
 */
const useYjsSync = (documentId, onRemoteUpdate, onStatusChange) => {
  const socketRef        = useRef(null);
  const onRemoteRef      = useRef(onRemoteUpdate);
  const onStatusRef      = useRef(onStatusChange);
  const isUnmountedRef   = useRef(false);

  // Keep callback refs fresh without re-running the effect
  useEffect(() => { onRemoteRef.current = onRemoteUpdate; }, [onRemoteUpdate]);
  useEffect(() => { onStatusRef.current = onStatusChange; }, [onStatusChange]);

  useEffect(() => {
    if (!documentId) return;
    isUnmountedRef.current = false;

    // ── 1. Connect to Socket.io backend ──────────────────────────────────────
    const socket = io(API_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    if (onStatusRef.current) onStatusRef.current('connecting');

    // ── 2. On connect: join the document room ─────────────────────────────────
    socket.on('connect', () => {
      console.log('[SyncDoc] Socket connected:', socket.id);
      if (onStatusRef.current) onStatusRef.current('connected');
      socket.emit('join-document', documentId);
    });

    socket.on('disconnect', () => {
      console.log('[SyncDoc] Socket disconnected');
      if (onStatusRef.current) onStatusRef.current('disconnected');
    });

    socket.on('connect_error', (err) => {
      console.warn('[SyncDoc] Connection error:', err.message);
      if (onStatusRef.current) onStatusRef.current('disconnected');
    });

    socket.on('reconnect', () => {
      if (onStatusRef.current) onStatusRef.current('connected');
      socket.emit('join-document', documentId);
    });

    // ── 3. Receive real-time block updates from other clients ─────────────────
    socket.on('blocks-update', ({ documentId: incomingDocId, blocks }) => {
      if (isUnmountedRef.current) return;
      if (incomingDocId !== documentId) return;
      if (!Array.isArray(blocks)) return;

      console.log('[SyncDoc] Received blocks-update, block count:', blocks.length);
      if (onRemoteRef.current) onRemoteRef.current(blocks);
    });

    // ── 4. Cleanup on unmount ─────────────────────────────────────────────────
    return () => {
      isUnmountedRef.current = true;
      socket.emit('leave-document', documentId);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [documentId]);

  /**
   * broadcastBlocks
   * Call this on every local document change.
   * Emits the full blocks array to all other clients in the same room.
   *
   * @param {Array} blocks - current blocks array
   */
  const broadcastBlocks = useCallback((blocks) => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) {
      console.warn('[SyncDoc] broadcastBlocks called but socket not connected');
      return;
    }
    console.log('[SyncDoc] Broadcasting blocks, count:', blocks.length);
    socket.emit('blocks-update', { documentId, blocks });
  }, [documentId]);

  return { broadcastBlocks };
};

export default useYjsSync;
