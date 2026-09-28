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
