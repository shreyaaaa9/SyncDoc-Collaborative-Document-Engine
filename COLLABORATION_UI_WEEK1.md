# SyncDoc — Collaboration UI Foundation (Week 1)

## Module Overview
* **Module:** Collaboration UI Foundation
* **Developer:** Frontend Member 2
* **Project:** SyncDoc (Collaborative Technical Document Engine)
* **Status:** Complete (Week 1 Frontend Foundation)

---

## Purpose & Scope
SyncDoc is a multi-user technical document editor structured around modular AST blocks (paragraphs, headings, code blocks, etc.). Multi-user text editors can suffer from destructive overwrites and synchronization conflicts when multiple users edit concurrently.

In **Week 1**, the objective of **Frontend Member 2** is to build the visual collaboration layer and state abstractions, preparing the user interface and frontend data contracts for future real-time collaboration without touching the backend or implementing the AST merge algorithms prematurely.

---

## Architecture & Visual Hierarchy

```text
                             SyncDoc
                                │
                         Document Editor
                                │
        ┌───────────────────────┴───────────────────────┐
        │                                               │
 Collaborators Panel                               Connection Status
        │                                               │
        ↓                                               ↓
 Presence Indicators                           Connected / Disconnected
        │
        ↓
 Collaboration Notifications
        │
        ↓
 Conflict Notification
        │
        ↓
 Conflict Resolution UI
        │
        ↓
 Version / History UI
```

---

## Completed Features (Week 1)

### 1. Collaborators Panel (`CollaboratorsPanel.jsx`, `CollaboratorItem.jsx`)
* Displays users currently active or connected to the document:
  * **🟢 Kirubakar** — You (Editing Paragraph 2)
  * **🟢 Arjun** — Collaborator (Editing Code Block)
  * **🟡 Priya** — Viewer (Viewing)
  * **🔴 Rahul** — Collaborator (Offline)
* Each collaborator item displays:
  * User avatar with initials and distinctive color branding
  * Full name and role tag (You, Collaborator, Viewer)
  * Live status dot with pulse animation
  * Activity description and active block tag (e.g., `Paragraph 2`, `Code Block`)
  * Filter/count badge showing online users vs offline users

### 2. User Presence Indicators (`PresenceIndicator.jsx`)
* Visual status indicator dots:
  * 🟢 **Online** (Green dot with radial ping animation)
  * 🟡 **Away / Viewing** (Amber dot)
  * 🔴 / ⚪ **Offline** (Muted gray/red dot)
  * 🟣 / 🔵 **Active Editing** (Indigo highlight)
* In-editor block presence indicators showing live activity:
  * Paragraph Block: `Arjun is editing this block` with distinctive green border glow.
  * Code Block: `🟢 Priya is editing` with amber indicator.
  * Active user: `Editing (You)` focus indicator.

### 3. Connection Status (`ConnectionStatus.jsx`)
* Positioned in the top-right area of the document editor toolbar.
* States supported through reactive state and props:
  * 🟢 **Connected**
  * 🟡 **Connecting...** (with spinner)
  * 🔴 **Disconnected**
* Interactive details popover on click:
  * Current status indicator: `● Connected`
  * Last synchronized timestamp: `Just now`
  * Latency (ping): `34ms`
  * Quick simulation buttons to switch states for manual testing.

### 4. Collaboration Notifications (`CollaborationNotification.jsx`, `NotificationList.jsx`)
* Notification system and toast stack supporting:
  * **User joined:** `🟢 Arjun joined the document`
  * **User left:** `⚪ Priya left the document`
  * **Editing:** `🔵 Arjun is editing Code Block 3`
  * **Conflict:** `🟠 A possible editing conflict was detected`
  * **Resolved:** `🟢 Conflict resolved`
* Color-coded toast cards for `success`, `info`, `warning`, and `conflict`.
* Automatic dismiss timer with manual dismiss button.

### 5. Conflict Notification UI (`ConflictNotification.jsx`)
* Prominent in-editor conflict detection card:
  * Title: `⚠ Conflict Detected`
  * Subtitle: `Another collaborator changed this block while you were editing.`
  * Block: `Technical Specification — Section 2`
  * Changed by: `Arjun`
  * Action buttons:
    * `[Review Changes]` (opens Conflict Resolution Modal)
    * `[Keep Mine]`
    * `[Use Latest]`
    * `[Resolve Later]`

### 6. Conflict Resolution Modal (`ConflictResolutionModal.jsx`)
* Professional side-by-side comparison modal:
  * Block title: `System Architecture`
  * **Your Version:** `NodeMCU communicates with the server using Wi-Fi.`
  * **Latest Version — Arjun:** `ESP8266 communicates with the server using Wi-Fi.`
  * Resolution actions:
    * `[ Keep My Version ]`
    * `[ Use Latest Version ]`
    * `[ Review Later ]`
* Updating mock state triggers confirmation: *"Conflict marked as resolved."*

### 7. Document Version / History UI (`VersionHistory.jsx`, `VersionHistoryItem.jsx`)
* Chronological version history timeline with snapshots:
  * **v1.4** — Kirubakar (2 minutes ago) — Added system architecture
  * **v1.3** — Arjun (8 minutes ago) — Updated code block
  * **v1.2** — Priya (15 minutes ago) — Added technical requirements
  * **v1.1** — Kirubakar (20 minutes ago) — Created document
* Displays version tag, author name, timestamp, and change summary.
* Interactive **"View Version"** button opens a read-only snapshot preview modal with block contents and restore capability.

### 8. Responsive Collaboration Sidebar (`CollaborationSidebar.jsx`)
* **Desktop:** Docked sidebar on the right with smooth collapse/expand toggle.
* **Tablet / Mobile:** Responsive slide-out drawer overlay that leaves the document editor completely usable without horizontal scrollbars.
* Tabs: **Collaborators** and **History** with live item count counters.

### 9. Mock Data & Future Integration Layer (`mockCollaborationData.js`, `collaborationService.js`, `useCollaboration.js`)
* Centralized mock state repository storing collaborators, connection status, conflict details, version history, and notifications.
* `useCollaboration()` hook providing full reactive state and simulation methods.
* `collaborationService` event-bus pattern ready for WebSocket subscriptions.

---

## Out of Scope / Not Implemented in Week 1

As explicitly instructed for Frontend Member 2 in Week 1, the following are **not** implemented:
* WebSocket backend / Socket.io server
* Actual real-time multi-client synchronization
* AST conflict-resolution merge algorithm
* Database integration / PostgreSQL storage
* Backend authentication APIs

---

## Future Integration Guide (Weeks 2 & 3)

When the backend WebSocket and AST conflict resolution modules are ready, connect them into the collaboration frontend as follows:

```text
              WebSocket / Socket.io Backend
                          │
                          ▼
             collaborationService.js
                          │
                          ▼
                 useCollaboration() Hook
                          │
       ┌──────────────────┼──────────────────┐
       │                  │                  │
       ▼                  ▼                  ▼
CollaboratorsPanel   ConnectionStatus   ConflictNotification
(Presence broadcast) (Heartbeat/Ping)   (AST node conflicts)
       │                                     │
       ▼                                     ▼
In-Block Presence                     ConflictResolutionModal
(Active editing tags)                 (Diff preview & patch)
```

### Key Integration Points:
1. **Presence Updates:** Replace `simulateUserPresence()` in `collaborationService.js` with `socket.on('user_presence', handlePresence)`.
2. **Conflict Events:** Replace `mockActiveConflict` with `socket.on('ast_conflict_detected', (payload) => setActiveConflict(payload))`.
3. **Conflict Resolution:** Send resolution choice payload back to backend via `socket.emit('resolve_ast_conflict', { blockId, versionChoice })`.
4. **History Revisions:** Wire `fetchRevisions(docId)` to the backend REST/GraphQL API to populate `versionHistory`.

---

## Verification & Testing Performed
* Verified component tree compiles with zero Vite errors (`npm run build`).
* Verified responsive behavior across desktop (>1024px) and mobile drawer views (<=1024px).
* Verified interactive conflict trigger, comparison review modal, and resolution feedback.
* Verified version history timeline and snapshot preview modal.
* Verified Member 1 editor features remain 100% intact (adding/editing headings, paragraphs, code blocks, saving, dashboard navigation).
