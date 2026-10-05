# SyncDoc: Collaborative Document Engine with AST Conflict Resolution

## 📌 Project Overview

SyncDoc is a collaborative document engine designed to allow multiple users to work on the same document while handling simultaneous edits and conflicts.

The project focuses on collaborative document editing, real-time synchronization, document structure representation, and AST-based conflict resolution.

This project is being developed as part of the Web Development Internship at Infotact Solutions.

## 🎯 Project Objectives

- Develop a web-based collaborative document editor.
- Enable multiple users to collaborate on documents.
- Synchronize document changes between users.
- Detect and handle conflicting changes.
- Use Abstract Syntax Trees (AST) for structured document representation and conflict resolution.
- Maintain document versions and changes.
- Develop a responsive and maintainable web application.

## 🛠️ Technology Stack

- Frontend: React.js (Vite), Axios
- Backend: Node.js / Express.js
- Database: PostgreSQL
- Real-time Communication: WebSocket
- Version Control: Git & GitHub

## 👥 Team

- Frontend Member 1: Rupam Dey (Main UI + Document Editor)

## 📅 Development Plan

### Week 1 — Phase 1
- Project setup
- System architecture
- Frontend and backend foundation
- Database planning
- AST and conflict-resolution research

### Week 2 — Phase 2
- Core document functionality
- Frontend-backend integration
- Real-time synchronization

### Week 3 — Phase 3
- Conflict detection
- AST-based processing
- Conflict resolution
- Advanced document editor

### Week 4 — Phase 4
- Testing and debugging
- Final integration
- Documentation
- Deployment and demonstration

## 📌 Project Status

🚧 **Currently in Development**

**Current Phase:** Week 3 — Advanced Editor + Conflict/Version UI

## 🖥️ Frontend (client/)

Built with React + Vite.

### Setup

```bash
cd client
npm install
npm run dev
```

The app runs at `http://localhost:5173`. It expects the backend API at `http://localhost:5000/api/documents`, so start the backend first.

To create a production build:

```bash
npm run build
```

### Folder Structure

```
client/src
├── api/                 # API service functions (documentApi.js)
├── components/
│   ├── blocks/          # BlockEditor, BlockItem and block components
│   ├── common/          # Loader, ErrorState (reusable states)
│   ├── editor/          # EditorToolbar, SaveStatus, VersionBadge
│   ├── Dashboard.jsx    # Document list, create, open, delete
│   └── Layout.jsx       # Main app layout
├── hooks/               # useDocumentEditor (editor state and save logic)
├── styles/              # editor.css
└── utils/               # generateTestBlocks (dev test content)
```

### Supported Block Types

| Block | Notes |
|---|---|
| Heading | H1, H2, H3 |
| Paragraph | Press Enter to add a new paragraph below |
| List | Bulleted or numbered, one item per line |
| Quote | Block quote |
| Code | Language selector |

### API Used by the Frontend

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/documents` | List documents for the Dashboard |
| GET | `/api/documents/:id` | Open a document |
| POST | `/api/documents` | Create a document |
| PUT | `/api/documents/:id` | Save title and blocks |
| DELETE | `/api/documents/:id` | Delete a document |

For the editor to show version information, the document response should include `version` and `updatedAt`. The backend must also accept the `quote` and `list` block types (list blocks carry an `ordered` field).

### Frontend Progress (Week 1 — Member 1)
- [x] Project structure (Vite setup)
- [x] Main layout and Dashboard page
- [x] Create / Open document flow
- [x] Document editor with title, toolbar and Save button
- [x] Reusable block components
- [x] Responsive layout
- [x] API service prepared for backend integration

### Frontend Progress (Week 2 — Member 1)
- [x] Create Document and Open Document connected to the backend API
- [x] Dashboard fetches and displays documents from the backend
- [x] Document Editor loads title and blocks from the backend
- [x] Loading states for API requests
- [x] Save / update functionality with success feedback
- [x] API error handling and graceful document loading failure
- [x] Reusable API service functions for document operations
- [ ] Complete frontend-to-backend flow test (Dashboard → Open → Edit → Save)

### Frontend Progress (Week 3 — Member 1)
- [x] Improved editor layout with sticky header and toolbar
- [x] Toolbar to add headings (H1-H3), paragraphs, lists, quotes and code blocks
- [x] Better editing experience: move up/down, delete, Enter adds a paragraph below
- [x] Document version badge (version and last updated) in the editor
- [x] Save/sync status indicator (saved, unsaved, saving, error) with retry
- [x] Unsaved-change warning when leaving the editor or closing the tab
- [x] Reusable loading and error state components
- [x] Editor logic moved into the `useDocumentEditor` hook
- [x] Responsive editor layout for mobile screens
- [x] Dev-only test content loader to check different document sizes
- [ ] Fix frontend issues found during collaborative testing