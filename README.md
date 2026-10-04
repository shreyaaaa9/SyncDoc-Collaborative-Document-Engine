# SyncDoc — Collaborative Document Engine

A real-time collaborative document editor with AST-based conflict resolution, CRDT sync via Yjs, and a block-based React UI.

---

## Project Structure

```
SyncDoc-Collaborative-Document-Engine/
├── server/                  ← Backend (Node.js + Express + MongoDB)
│   ├── config/
│   │   └── db.js            ← MongoDB connection
│   ├── controllers/
│   │   └── documentController.js
│   ├── middleware/
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── Document.js      ← AST-based document schema
│   │   ├── User.js
│   │   └── Version.js       ← Document version history
│   ├── routes/
│   │   └── documentRoutes.js
│   ├── .env.example         ← Environment variable template
│   └── server.js            ← Entry point
```

---

## Backend Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas account

### Installation

```bash
cd server
npm install
```

### Environment Variables

Create a `.env` file inside the `server/` folder based on `.env.example`:

```
PORT=3000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/syncdoc?appName=Cluster0
```

### Running the Server

```bash
# Development (auto-restart)
npm run dev

# Production
npm start
```

---

## API Documentation

Base URL: `http://localhost:3000/api`

### Documents

#### Create a Document
```
POST /api/documents
```
**Request Body:**
```json
{
  "title": "My Document",
  "content": [],
  "isPublic": false
}
```
**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "title": "My Document",
    "content": [],
    "isPublic": false,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

#### Get All Documents
```
GET /api/documents
```
**Response:** `200 OK`
```json
{
  "success": true,
  "count": 1,
  "data": [...]
}
```

---

#### Get a Document by ID
```
GET /api/documents/:id
```
**Response:** `200 OK`
```json
{
  "success": true,
  "data": { ... }
}
```

---

#### Update a Document
```
PUT /api/documents/:id
```
**Request Body** (any fields to update):
```json
{
  "title": "New Title"
}
```
**Response:** `200 OK` — returns updated document. Also auto-saves a version snapshot.

---

#### Delete a Document
```
DELETE /api/documents/:id
```
**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

---

## Database Schemas

### Document
| Field | Type | Description |
|-------|------|-------------|
| title | String | Required, max 200 chars |
| content | AST Node[] | Block-based AST content |
| owner | ObjectId | Ref to User |
| collaborators | ObjectId[] | Refs to Users |
| isPublic | Boolean | Default false |

### Version
| Field | Type | Description |
|-------|------|-------------|
| document | ObjectId | Ref to Document |
| versionNumber | Number | Auto-incremented |
| content | Mixed | Snapshot of AST content |
| changeDescription | String | Auto-saved version |

---

## Security
- API secrets are stored in `.env` and never committed to GitHub
- `.env` is listed in `.gitignore`
- Use `.env.example` as a template when setting up the project
# SyncDoc-Collaborative-Document-Engine
# SyncDoc-AST-Collaborative-Editor
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

## 🛠️ Planned Technology Stack

- Frontend: React.js
- Backend: Node.js / Express.js
- Database: PostgreSQL
- Real-time Communication: WebSocket
- Version Control: Git & GitHub

## 👥 Team



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

### Week 4 — Phase 4
- Testing and debugging
- Final integration
- Documentation
- Deployment and demonstration

## 📌 Project Status

🚧 **Currently in Development**

**Current Phase:** Week 1 — Implementation Phase 1

## 🖥️ Frontend (client/)

Built with React + Vite.

### Setup
```bash
cd client
npm install
npm run dev
```
App runs at `http://localhost:5173`. Expects the backend API at `http://localhost:5000/api/documents`.

### Frontend Progress (Week 1 — Member 1)
- [x] Main layout + Dashboard page
- [x] Create / Open document flow
- [x] Document editor with title, toolbar, save button
- [x] Reusable block components
- [x] Responsive layout
- [x] Project structure (Vite setup)
