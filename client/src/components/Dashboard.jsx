import React, { useEffect, useState } from 'react';
import { fetchDocuments, createDocument, deleteDocument } from '../api/documentApi';
import StatusMessage from './common/StatusMessage';

const Dashboard = ({ onOpenDocument }) => {
  const [documents, setDocuments] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const docs = await fetchDocuments();
      setDocuments(docs);
      setError(null);
    } catch (err) {
      setError('Failed to load documents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    try {
      setCreating(true);
      setError(null);
      const doc = await createDocument(newTitle.trim());
      setNewTitle('');
      await loadDocuments();
      if (doc._id) onOpenDocument(doc._id);
    } catch (err) {
      setError('Failed to create document.');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDocument(id);
      loadDocuments();
    } catch (err) {
      setError('Failed to delete document.');
    }
  };

  return (
    <div>
      <h2>Dashboard</h2>

      <div className="toolbar">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="New document title"
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          disabled={creating}
        />
        <button onClick={handleCreate} disabled={creating}>
          {creating ? 'Creating...' : '+ New Document'}
        </button>
      </div>

      <StatusMessage type="error" message={error} onRetry={loadDocuments} />

      {loading ? (
        <p>Loading...</p>
      ) : documents.length === 0 ? (
        <p>No documents yet. Create one above.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {documents.map((doc) => (
            <li key={doc._id} className="doc-list-item">
              <span onClick={() => onOpenDocument(doc._id)} style={{ cursor: 'pointer' }}>
                {doc.title}
              </span>
              <button onClick={() => handleDelete(doc._id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dashboard;