# SyncDoc — Collaboration UI Foundation (Week 1 Guide)
**Role:** Frontend Member 2  
**Module:** Collaboration UI Foundation & Real-time Integration Layer  
**Branch:** `Kirups`

---

## 📌 Project Problem Statement & Core Use Case

### Problem Statement:
> Multi-user text editors frequently suffer from **destructive overwrites** and **sync conflicts**.  
> Plain text line/character merging is insufficient for complex structural documents, leading to lost work and corrupted layouts when multiple users edit the same document simultaneously.

### Use Case:
> Two engineers open a technical spec in **"SyncDoc"**.  
> As **User A** types a new paragraph, **User B** concurrently adds a code block lower down the page.  
> The system's **AST conflict resolution** ensures neither edit is lost.  
> Both users see **live visual block state indicators** showing who is editing what, preventing layout-destructive overwrites in real-time.

---

## 🎯 Week 1 Frontend Member 2 Deliverables Completed

As Frontend Member 2, your role is to deliver the complete visual and interactive collaboration layer that embodies this exact use case:

1. **Live Visual Block State Indicators**:
   - Every block features an AST Node badge (e.g. `<AST:ParagraphNode #spec>` or `<AST:CodeBlockNode #code>`).
   - Dynamic Lock Status: Shows `[User A (You) editing]` vs `[User B (Engineer 2) is editing...]` with assigned colors and animated pulse dots.
   - Prevents layout-destructive overwrites by clearly signaling which AST node is actively being modified.

2. **AST Structural Tree Viewer (`AstTreeViewer.jsx`)**:
   - Inspect the live AST tree hierarchy of the document in real time.
   - Visually displays node locks and synchronization state for each node.

3. **Two Engineers Live Use Case Simulation Runner**:
   - Built directly into the **Dev Simulation Bar** at the bottom: click **"Simulate Two Engineers Use Case"**.
   - User A is focused on the technical spec paragraph while User B concurrently adds and edits a TypeScript Code Block lower down the page.
   - Both edits merge seamlessly into the AST tree with zero lost work!

4. **AST Conflict Resolution Modal (`ConflictResolutionModal.jsx`)**:
   - When concurrent edits target the *same* AST node, the modal triggers a side-by-side diff: *"Your Local Version"* vs *"Remote Version (User B)"*.
   - Resolution choices: `Keep Mine`, `Accept Remote`, or `Smart Merge Both`.

5. **Connection & Presence Systems**:
   - Real-time Connection Status Badge (🟢 Connected / 🟡 Reconnecting / 🔴 Offline with retry).
   - Collaborators Panel displaying active engineers, roles, and current block focus.
   - Document Revision History Drawer with snapshot checkpoints and rollback.

---

## 🚀 How to Run & Verify

1. The development server runs on:
   ```bash
   http://localhost:3000/
   ```
2. **Test the Exact Use Case:**
   - Look at the bottom toolbar and click **"Simulate Two Engineers Use Case"**.
   - Notice User A's paragraph active indicator, User B's concurrent code block injection, and the AST notification confirming neither edit was overwritten!
   - Click **"AST Tree"** to view the structural node hierarchy.
   - Click **"Simulate AST Conflict"** to test conflict resolution on conflicting block edits.
