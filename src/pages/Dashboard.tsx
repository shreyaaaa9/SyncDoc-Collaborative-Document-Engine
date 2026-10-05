import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  FileText,
  Sparkles,
  RotateCcw,
} from 'lucide-react';

import { useDocuments } from '../context/DocumentContext';
import { Navbar } from '../components/Navbar';
import { DocumentCard } from '../components/DocumentCard';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    documents,
    searchQuery,
    setSearchQuery,
    createDocument,
    resetToDefault,
  } = useDocuments();

  const [activeFilter, setActiveFilter] = useState<'all' | 'Draft' | 'Active'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [newDocDesc, setNewDocDesc] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);

  // Filter documents based on search query and status filter
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.tags && doc.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesStatus = activeFilter === 'all' || doc.status === activeFilter;

    return matchesSearch && matchesStatus;
  });

  const draftCount = documents.filter((d) => d.status === 'Draft').length;
  const activeCount = documents.filter((d) => d.status === 'Active').length;

  const handleQuickCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim()) {
      setModalError('Document name is required');
      return;
    }
    const newId = createDocument(newDocName, newDocDesc);
    setIsModalOpen(false);
    setNewDocName('');
    setNewDocDesc('');
    setModalError(null);
    navigate(`/editor/${newId}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden font-sans">
      {/* Dynamic Animated Ambient Glow Orbs */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-[750px] h-[400px] bg-gradient-to-tr from-indigo-500/15 via-blue-500/10 to-transparent rounded-full blur-[130px] pointer-events-none animate-float-slow" />
      <div className="absolute top-20 right-[-5%] w-[600px] h-[350px] bg-gradient-to-bl from-purple-500/15 via-indigo-500/10 to-transparent rounded-full blur-[130px] pointer-events-none animate-float-reverse" />
      <div className="absolute bottom-10 left-1/3 w-[500px] h-[300px] bg-gradient-to-r from-cyan-500/5 via-indigo-500/5 to-transparent rounded-full blur-[140px] pointer-events-none" />

      {/* Layered Engineering Grid Patterns */}
      <div className="absolute inset-0 bg-tech-grid-light opacity-40 pointer-events-none [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_65%,transparent_100%)]" />
      <div className="absolute inset-0 bg-dots-light opacity-30 pointer-events-none [mask-image:radial-gradient(ellipse_70%_50%_at_50%_20%,#000_50%,transparent_100%)]" />

      {/* Top Navbar */}
      <Navbar onOpenCreateModal={() => setIsModalOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
        {/* Hero Section with Glowing Border Halo */}
        <div className="relative group">
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-indigo-500/25 via-purple-500/20 to-blue-500/25 blur-xl opacity-75 group-hover:opacity-100 transition-opacity pointer-events-none" />

          <section className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-slate-800/90 relative overflow-hidden backdrop-blur-xl">
            {/* Subtle background graphics */}
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500/15 via-purple-500/5 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-tech-grid-dark opacity-20 pointer-events-none" />
            
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-mono">
                  <Sparkles className="w-3.5 h-3.5" /> Modern Engineering Documentation
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Welcome to SyncDoc
                </h1>
                <p className="text-sm sm:text-base text-slate-300 font-normal">
                  Create, review, and synchronize high-performance technical specifications.
                </p>
              </div>

              <div className="flex-shrink-0">
                <Button
                  variant="primary"
                  size="lg"
                  icon={<Plus className="w-5 h-5 stroke-[2.5]" />}
                  onClick={() => setIsModalOpen(true)}
                  className="w-full sm:w-auto bg-indigo-500 hover:bg-indigo-600 shadow-lg shadow-indigo-600/30 font-semibold cursor-pointer"
                >
                  + Create Document
                </Button>
              </div>
            </div>

            {/* Quick Metrics with Glassmorphic Tiles */}
            <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white/[0.04] backdrop-blur-sm rounded-2xl p-3 border border-white/5 hover:border-white/10 transition-colors">
                <span className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Total Specs</span>
                <span className="text-2xl font-bold font-mono text-white mt-1 block">{documents.length}</span>
              </div>
              <div className="bg-white/[0.04] backdrop-blur-sm rounded-2xl p-3 border border-white/5 hover:border-white/10 transition-colors">
                <span className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Active Specs</span>
                <span className="text-2xl font-bold font-mono text-emerald-400 mt-1 block flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {activeCount}
                </span>
              </div>
              <div className="bg-white/[0.04] backdrop-blur-sm rounded-2xl p-3 border border-white/5 hover:border-white/10 transition-colors">
                <span className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Drafts</span>
                <span className="text-2xl font-bold font-mono text-amber-400 mt-1 block">{draftCount}</span>
              </div>
              <div className="bg-white/[0.04] backdrop-blur-sm rounded-2xl p-3 border border-white/5 hover:border-white/10 transition-colors">
                <span className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Collaborators</span>
                <span className="text-2xl font-bold font-mono text-indigo-300 mt-1 block flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  Live Sync
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* Filter Bar & Document Count */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              All Documents ({documents.length})
            </button>
            <button
              onClick={() => setActiveFilter('Draft')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeFilter === 'Draft'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Drafts ({draftCount})
            </button>
            <button
              onClick={() => setActiveFilter('Active')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeFilter === 'Active'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Active Specs ({activeCount})
            </button>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {documents.length < 3 && (
              <Button
                variant="ghost"
                size="sm"
                icon={<RotateCcw className="w-3.5 h-3.5" />}
                onClick={resetToDefault}
                className="text-xs text-slate-500"
              >
                Reset Demo Docs
              </Button>
            )}
            <span className="text-xs text-slate-500">
              Showing <strong className="text-slate-800">{filteredDocuments.length}</strong> of {documents.length} documents
            </span>
          </div>
        </section>

        {/* Document Grid */}
        {filteredDocuments.length > 0 ? (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDocuments.map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </section>
        ) : (
          /* Empty State */
          <section className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-sm">
            <div className="w-14 h-14 rounded-full bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-600 mx-auto mb-4">
              <FileText className="w-7 h-7 stroke-[1.8]" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {searchQuery ? 'No matching technical documents' : 'No documents in this view'}
            </h3>
            <p className="mt-1.5 text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery
                ? `No documents matched "${searchQuery}". Try adjusting your search query or reset filters.`
                : 'Get started by creating your first technical document specification.'}
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              {searchQuery ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                >
                  Clear Search
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={() => setIsModalOpen(true)}
                >
                  Create Document
                </Button>
              )}
            </div>
          </section>
        )}
      </main>

      {/* Quick Create Document Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setModalError(null);
        }}
        title="Create New Technical Document"
      >
        <form onSubmit={handleQuickCreate} className="space-y-4">
          {modalError && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              {modalError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Document Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={newDocName}
              onChange={(e) => {
                setNewDocName(e.target.value);
                if (modalError) setModalError(null);
              }}
              placeholder="e.g. Distributed Edge Gateway Architecture"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={newDocDesc}
              onChange={(e) => setNewDocDesc(e.target.value)}
              placeholder="Brief description of the document goals and specifications..."
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsModalOpen(false);
                setModalError(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
            >
              Create Document
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
