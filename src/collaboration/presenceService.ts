import type { Collaborator } from './types';

export const USER_COLORS = [
  '#4f46e5', // Indigo
  '#059669', // Emerald
  '#d97706', // Amber
  '#e11d48', // Rose
  '#7c3aed', // Violet
  '#0891b2', // Cyan
  '#2563eb', // Blue
  '#db2777', // Pink
];

export function getRandomColor(nameOrId: string): string {
  let hash = 0;
  for (let i = 0; i < nameOrId.length; i++) {
    hash = nameOrId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % USER_COLORS.length;
  return USER_COLORS[index];
}

export class PresenceService {
  private currentUser: Collaborator | null = null;
  private collaborators: Map<string, Collaborator> = new Map();
  private listeners: Set<(collaborators: Collaborator[]) => void> = new Set();
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Check stale collaborators every 10 seconds
    if (typeof window !== 'undefined') {
      this.cleanupInterval = setInterval(() => {
        this.pruneStaleUsers();
      }, 10000);
    }
  }

  /**
   * Set local active user
   */
  public setCurrentUser(user: { id: string; name: string; email?: string; avatarUrl?: string }): Collaborator {
    const collaborator: Collaborator = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatarUrl,
      color: getRandomColor(user.id || user.name),
      status: 'online',
      lastActive: Date.now(),
    };

    this.currentUser = collaborator;
    this.collaborators.set(collaborator.id, collaborator);
    this.notify();
    return collaborator;
  }

  public getCurrentUser(): Collaborator | null {
    return this.currentUser;
  }

  /**
   * Handle peer join or presence heartbeat
   */
  public handlePeerPresence(peer: Collaborator): void {
    if (!peer || !peer.id) return;

    // Update or add peer
    const existing = this.collaborators.get(peer.id);
    const updated: Collaborator = {
      ...(existing || {}),
      ...peer,
      lastActive: Date.now(),
      status: 'online',
    };

    this.collaborators.set(peer.id, updated);
    this.notify();
  }

  /**
   * Handle peer leave
   */
  public handlePeerLeave(userId: string): Collaborator | null {
    const removed = this.collaborators.get(userId) || null;
    if (removed) {
      this.collaborators.delete(userId);
      this.notify();
    }
    return removed;
  }

  /**
   * Remove users who haven't sent a presence heartbeat in 25 seconds
   */
  private pruneStaleUsers(): void {
    const now = Date.now();
    let changed = false;

    this.collaborators.forEach((user, id) => {
      // Don't prune current user
      if (this.currentUser && id === this.currentUser.id) return;

      if (now - user.lastActive > 25000) {
        this.collaborators.delete(id);
        changed = true;
      }
    });

    if (changed) {
      this.notify();
    }
  }

  /**
   * Get all active collaborators (current user first)
   */
  public getCollaborators(): Collaborator[] {
    const list = Array.from(this.collaborators.values());
    // Sort current user first, then alphabetically
    return list.sort((a, b) => {
      if (this.currentUser && a.id === this.currentUser.id) return -1;
      if (this.currentUser && b.id === this.currentUser.id) return 1;
      return a.name.localeCompare(b.name);
    });
  }

  /**
   * Subscribe to collaborator list changes
   */
  public subscribe(listener: (collaborators: Collaborator[]) => void): () => void {
    this.listeners.add(listener);
    listener(this.getCollaborators());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    const list = this.getCollaborators();
    this.listeners.forEach((listener) => {
      try {
        listener(list);
      } catch (err) {
        console.error('[PresenceService] Error in presence listener:', err);
      }
    });
  }

  /**
   * Reset / clear presence when leaving room
   */
  public reset(): void {
    this.collaborators.clear();
    if (this.currentUser) {
      this.collaborators.set(this.currentUser.id, this.currentUser);
    }
    this.notify();
  }

  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.collaborators.clear();
    this.listeners.clear();
  }
}

export const presenceService = new PresenceService();
