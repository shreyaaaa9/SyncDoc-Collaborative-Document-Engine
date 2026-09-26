# SyncDoc: Collaborative Document Engine with AST Conflict Resolution

## 📌 Project Problem Statement & Use Case

### Problem Statement
> Multi-user text editors frequently suffer from destructive overwrites and sync conflicts. Plain text merging is insufficient for complex structural documents, leading to lost work when multiple users edit the same document simultaneously.

### Core Use Case
> Two engineers open a technical spec in **"SyncDoc"**. As **User A** types a new paragraph, **User B** concurrently adds a code block lower down the page. The system's AST conflict resolution ensures neither edit is lost. Both users see live visual block state indicators showing who is editing what, preventing layout-destructive overwrites in real-time.

## 🎯 Project Objectives

- Develop a web-based collaborative document editor.
- Enable multiple users to collaborate on documents.
- Synchronize document changes between users in real time.
- Detect and handle conflicting changes.
- Use Abstract Syntax Trees (AST) and Yjs CRDTs for structured document representation and conflict resolution.
- Maintain document versions and changes.
- Develop a responsive and maintainable web application.

## 🛠️ Planned Technology Stack

- **Frontend**: React.js, TypeScript, Vite, TailwindCSS, Yjs (CRDT)
- **Backend**: Node.js / Express.js / WebSocket Server
- **Database**: PostgreSQL
- **Real-time Communication**: Native WebSocket + Yjs State Synchronization
- **Version Control**: Git & GitHub

## 👥 Team & Roles

- **Shreya Sharma**: Project Lead / Architecture & Backend Integration
- **Rupam Day**: Frontend Member 1 — Block Editor & Core Document Layout
- **Kirub (Kirups)**: Frontend Member 2 — Collaboration UI Foundation, Real-Time Client Sync & Modernized UX
- **Archana IT**: Backend / AST Database & Conflict Resolution Engine

## 📅 Development Plan

### Week 1 — Phase 1
- Project setup & repository foundation
- **Frontend Member 1**: Block editor structure, Heading/Paragraph/Code components, Dashboard
- **Frontend Member 2 (Completed)**: Collaboration UI Foundation (Connection badge, Collaborators panel, Presence indicators, Conflict resolution modal, Version history drawer, Real-time abstraction hooks, Simulation toolbar)
- **Backend**: Express server, AST comparison prototype & schema planning

### Week 2 — Phase 2 (Completed)
- **Frontend Real-time Collaboration Integration (Kirups)**:
  - Native WebSocket & Yjs CRDT synchronization layer (`src/collaboration/`)
  - Multi-peer awareness, live presence heartbeats & cursor/color assignment
  - Reactive connection status badge with offline simulation and reconnect
  - Caret-preserving DOM updates in the editor
  - Modernized Login & Dashboard backgrounds with cyber tech grids and ambient aurora glows
- Core document functionality & real-time synchronization

### Week 3 — Phase 3
- Conflict detection
- AST-based processing
- Conflict resolution

### Week 4 — Phase 4
- Testing and debugging
- Final integration
- Documentation
- Deployment and demonstration

## 📌 Project Status

🚧 **Currently in Development**

**Current Phase:** Week 2 — Real-Time Collaboration & Synchronization Client Complete
