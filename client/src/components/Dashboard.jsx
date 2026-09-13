import React, { useEffect, useState } from 'react';
import { fetchDocuments, createDocument, deleteDocument } from '../api/documentApi';

const Dashboard = ({ onOpenDocument }) => {
  const [documents, setDocuments] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(true);
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
      const doc = await createDocument(newTitle.trim());
      setNewTitle('');
      await loadDocuments();
      if (doc._id) onOpenDocument(doc._id);
    } catch (err) {
      setError('Failed to create document.');
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
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 20 }}>
      <h1>SyncDoc Dashboard</h1>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="New document title"
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
        />
        <button onClick={handleCreate}>+ New Document</button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : documents.length === 0 ? (
        <p>No documents yet. Create one above.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {documents.map((doc) => (
            <li
              key={doc._id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                border: '1px solid #ddd',
                padding: 10,
                marginBottom: 8,
                borderRadius: 6,
              }}
            >
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