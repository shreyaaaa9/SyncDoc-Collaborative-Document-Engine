import React, { useCallback, useEffect, useState } from 'react';
import {
  fetchDocuments,
  createDocument,
  deleteDocument,
  getErrorMessage,
} from '../api/documentApi';
import StatusMessage from './common/StatusMessage';
import Loader from './common/Loader';

const MAX_TITLE_LENGTH = 150;

const formatDate = (value) => {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString();
};

const Dashboard = ({ onOpenDocument }) => {
  const [documents, setDocuments] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [actionError, setActionError] = useState(null);

  const loadDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const docs = await fetchDocuments();
      setDocuments(docs);
      setLoadError(null);
    } catch (err) {
      setLoadError(getErrorMessage(err, 'Failed to load documents.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleCreate = async () => {
    const title = newTitle.trim();
    if (!title) {
      setActionError('Please enter a document title.');
      return;
    }
    try {
      setCreating(true);
      setActionError(null);
      const doc = await createDocument(title);
      setNewTitle('');
      if (doc?._id) {
        onOpenDocument(doc._id);
        return;
      }
      await loadDocuments();
    } catch (err) {
      setActionError(getErrorMessage(err, 'Failed to create document.'));
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (doc) => {
    if (!window.confirm(`Delete "${doc.title}"? This cannot be undone.`)) return;
    try {
      setDeletingId(doc._id);
      setActionError(null);
      await deleteDocument(doc._id);
      setDocuments((prev) => prev.filter((d) => d._id !== doc._id));
    } catch (err) {
      setActionError(getErrorMessage(err, 'Failed to delete document.'));
    } finally {
      setDeletingId(null);
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
          maxLength={MAX_TITLE_LENGTH}
        />
        <button type="button" onClick={handleCreate} disabled={creating}>
          {creating ? 'Creating...' : '+ New Document'}
        </button>
      </div>

      <StatusMessage type="error" message={loadError} onRetry={loadDocuments} />
      <StatusMessage type="error" message={actionError} />

      {loading ? (
        <Loader text="Loading documents..." />
      ) : loadError ? null : documents.length === 0 ? (
        <p>No documents yet. Create one above.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {documents.map((doc) => (
            <li key={doc._id} className="doc-list-item">
              <div className="doc-info">
                <button
                  type="button"
                  className="doc-link"
                  onClick={() => onOpenDocument(doc._id)}
                >
                  {doc.title || 'Untitled document'}
                </button>
                {formatDate(doc.updatedAt) && (
                  <small className="doc-date">Updated {formatDate(doc.updatedAt)}</small>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleDelete(doc)}
                disabled={deletingId === doc._id}
              >
                {deletingId === doc._id ? 'Deleting...' : 'Delete'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dashboard;