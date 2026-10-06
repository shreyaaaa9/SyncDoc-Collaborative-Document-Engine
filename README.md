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

## 📌 Project Status

🚧 **Currently in Development**

**Current Phase:** Week 3 — Advanced Editor + Conflict/Version UI

---

## 🖥️ Frontend Member 1 — Work Summary (Week 1 to Week 3)

**Role:** Main UI + Document Editor + Backend API Integration

### Week 1 — Main UI + Document Editor Foundation

- Set up the frontend project using **React + Vite** in the `client/` folder.
- Created the main application layout (`Layout.jsx`) with the app header.
- Created the **Dashboard** page with a document list.
- Added **Create Document** (title input + `+ New Document` button) and **Open Document** (click a document title).
- Built the basic **Document Editor** page with a document title input, editor area, toolbar and Save button.
- Added global styling (`index.css`) and editor styling (`editor.css`) with a responsive layout for small screens.
- Created reusable components such as `StatusMessage`, `Loader` and `ErrorState`.
- Prepared the frontend structure (`api/`, `components/`, `hooks/`, `utils/`) for backend API integration.

**Flow:** `Dashboard → Create / Open Document → Document Editor → Title + Editor Area + Save`

### Week 2 — Editor + Backend API Integration

- Created reusable API service functions in `api/documentApi.js` using Axios (fetch, fetch by id, create, update, delete).
- Connected **Create Document** and **Open Document** with the backend API.
- Fetched and displayed documents on the Dashboard.
- Connected the Document Editor with document data (title and blocks) from the backend.
- Added **loading states** for the Dashboard and for opening a document.
- Implemented **save / update** functionality using `PUT /api/documents/:id`.
- Added **save feedback** (Saving..., All changes saved, Save failed).
- Handled **API errors** in the UI with error messages and a **Retry** option.
- Handled **document loading failures** gracefully with an error screen that has *Try again* and *Back to Dashboard* buttons.
- Added **Delete Document** support on the Dashboard.
- Moved the API URL to an environment variable (`VITE_API_URL`).

**Flow:** `Dashboard → Fetch Documents → Open Document → Edit → Save / Update → Backend API → Database`

### Week 3 — Advanced Document Editor

- Rebuilt the editor as a **block-based editor** (`BlockEditor`, `BlockItem`).
- Added support for these block types:
  - Heading (H1, H2, H3 with a level selector)
  - Paragraph (press Enter to add a new paragraph below)
  - List (bulleted or numbered, one item per line, switchable)
  - Quote
  - Code (with a language selector)
- Improved the toolbar (`EditorToolbar`) to add any block type below the active block.
- Added block controls: move up, move down and delete.
- Moved all editor state and save logic into a reusable hook, `useDocumentEditor`.
- Added **version information** in the editor using a `VersionBadge` (shows version and last updated time).
- Added **save / sync status** (`SaveStatus`): saved, unsaved, saving, error.
- Added an **unsaved-changes indicator** and a browser warning when closing or refreshing the tab with unsaved changes.
- Added a safe **Back** button that saves first and asks for confirmation if saving fails.
- Added a footer with **block count and word count**.
- Improved loading and error states with `Loader` and `ErrorState`.
- Improved responsive behavior of the editor screens.
- Refactored repeated UI code into reusable components.
- Tested the editor with different document sizes using a dev-only **test content generator** (Small: 20, Medium: 200, Large: 500 blocks).
- Used `useDeferredValue` and `memo` to keep typing smooth in large documents.

**Flow:** `Document Editor → Toolbar + Content Editor + Save / Sync Status → Document Version`

### Upcoming — Week 4

- Complete frontend testing (Dashboard, Create/Open Document, Editor, Save/Update).
- Test frontend-backend integration, loading and error states, and responsive layouts.
- Fix UI and integration bugs and remove code duplication.
- Make sure environment values are handled safely.
- Prepare the frontend for the final demonstration.

---

## 🖥️ Frontend (client/)

Built with React + Vite.

### Setup

```bash
cd client
npm install
npm run dev
```

Create a `.env` file inside `client/`:

```
VITE_API_URL=http://localhost:5001
```

The app runs at `http://localhost:5173`. It expects the backend API at `http://localhost:5001/api/documents`, so start the backend first.

> The `.env` file is not committed. It is listed in `.gitignore`.

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
│   ├── common/          # Loader, ErrorState, StatusMessage
│   ├── editor/          # EditorToolbar, SaveStatus, VersionBadge
│   ├── Dashboard.jsx    # Document list, create, open, delete
│   └── Layout.jsx       # Main app layout
├── hooks/               # useDocumentEditor (editor state and save logic)
├── styles/              # editor.css
└── utils/               # blockUtils, generateTestBlocks (dev test content)
```

### Supported Block Types

| Block | Notes |
|---|---|
| Heading | H1, H2, H3 |
| Paragraph | Press Enter to add a new paragraph below |
| List | Bulleted or numbered, one item per line |
| Quote | Block quote |
| Code | Language selector (JavaScript, Python, Java, C++, HTML, CSS, JSON, Bash) |

### API Used by the Frontend

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/documents` | List documents for the Dashboard |
| GET | `/api/documents/:id` | Open a document |
| POST | `/api/documents` | Create a document (`title`, `blocks`) |
| PUT | `/api/documents/:id` | Save title and blocks |
| DELETE | `/api/documents/:id` | Delete a document |

For the editor to show version information, the document response should include `version` (or `__v`) and `updatedAt`.

### Responsibility Boundaries

- Frontend Member 1 handles the Dashboard, Document Editor and backend API integration.
- Frontend Member 2 handles the collaboration experience (presence, connection status, conflict UI, version history UI).
- The WebSocket/Yjs synchronization engine is a **backend** responsibility.
- AST generation, AST comparison and the conflict-resolution algorithm are **backend** responsibilities. The frontend only displays and interacts with their results.

---

## 📄 License

This project is licensed under the terms of the LICENSE file included in this repository.