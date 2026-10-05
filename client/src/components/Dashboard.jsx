import React, { useEffect, useState } from 'react';
import { fetchDocuments, createDocument, deleteDocument } from '../api/documentApi';
import { FileText, Plus, Trash2, Users, Layers, Sparkles, Clock, ArrowRight } from 'lucide-react';

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
      if (doc && doc._id) onOpenDocument(doc._id);
    } catch (err) {
      setError('Failed to create document.');
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await deleteDocument(id);
      loadDocuments();
    } catch (err) {
      setError('Failed to delete document.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', padding: '40px 20px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                }}
              >
                <Layers size={16} />
              </div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                SyncDoc
              </h1>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                AST Collaboration Engine
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Real-time multi-user document engine with AST conflict resolution
            </p>
          </div>
        </div>

        {/* Create Document Section */}
        <div
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            marginBottom: '32px',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <h2 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '12px', color: 'var(--text-primary)' }}>
            Start a Collaborative Session
          </h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Enter document title (e.g. System Design Specification)..."
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              style={{ flex: 1 }}
            />
            <button onClick={handleCreate} className="btn-primary" style={{ padding: '8px 16px' }}>
              <Plus size={16} />
              <span>Create Document</span>
            </button>
          </div>
          {error && <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '8px' }}>{error}</p>}
        </div>

        {/* Documents Grid */}
        <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Your Documents ({documents.length})
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Changes synchronized across team members
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
            <p>Loading collaborative documents...</p>
          </div>
        ) : documents.length === 0 ? (
          <div
            style={{
              padding: '48px',
              textAlign: 'center',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px dashed var(--border-medium)',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <FileText size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px auto' }} />
            <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>No documents found</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Create your first document above to test multi-user editing and conflict resolution.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '16px' }}>
            {documents.map((doc) => (
              <div
                key={doc._id}
                onClick={() => onOpenDocument(doc._id)}
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '18px',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '140px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-focus)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                    <h4
                      style={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        marginBottom: '6px',
                        lineHeight: '1.3',
                      }}
                    >
                      {doc.title}
                    </h4>
                    <button
                      onClick={(e) => handleDelete(e, doc._id)}
                      className="btn-ghost"
                      style={{ padding: '4px', color: 'var(--text-muted)' }}
                      title="Delete document"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    <span>{doc.blocks ? doc.blocks.length : 0} AST Blocks</span>
                    <span>•</span>
                    <span style={{ color: 'var(--success)' }}>🟢 Real-time ready</span>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '16px',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--border-subtle)',
                  }}
                >
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    ID: {doc._id.slice(0, 10)}...
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600 }}>
                    <span>Open Editor</span>
                    <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
