import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowLeft, Plus, Sparkles, AlertCircle } from 'lucide-react';
import { useDocuments } from '../context/DocumentContext';
import { Button } from '../components/Button';
import { Navbar } from '../components/Navbar';

export const CreateDocument: React.FC = () => {
  const navigate = useNavigate();
  const { createDocument } = useDocuments();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState('tech-spec');

  const templates = [
    {
      id: 'tech-spec',
      name: 'Technical Specification',
      desc: 'System Overview, Architecture, Requirements, Implementation, Testing',
    },
    {
      id: 'architecture',
      name: 'Architecture Blueprint',
      desc: 'High-level topology, component diagrams, throughput & interfaces',
    },
    {
      id: 'blank',
      name: 'Blank Document',
      desc: 'Start with a clean document for customized documentation',
    },
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a valid document name before proceeding.');
      return;
    }
    setError(null);

    // Create temporary frontend document
    const newDocId = createDocument(name, description);

    // Navigate to Editor
    navigate(`/editor/${newDocId}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar showSearch={false} />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-10">
        {/* Navigation Breadcrumb */}
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Dashboard
        </button>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-6 sm:px-8 py-6 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Create Technical Document
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Initialize a new engineering specification or architecture document.
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleCreate} className="p-6 sm:p-8 space-y-6">
            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2.5 text-xs text-red-700 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Document Name */}
            <div>
              <label htmlFor="doc-name" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Document Name <span className="text-red-500">*</span>
              </label>
              <input
                id="doc-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="e.g. Distributed Edge Gateway Architecture"
                className={`mt-2 w-full px-4 py-2.5 bg-white border rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                  error ? 'border-red-400 focus:ring-red-500' : 'border-slate-300'
                }`}
                autoFocus
              />
              <p className="mt-1.5 text-[11px] text-slate-500">
                Use a descriptive technical title following team naming conventions.
              </p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="doc-desc" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Description
              </label>
              <textarea
                id="doc-desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of document goals, target subsystems, and interface boundaries..."
                className="mt-2 w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            {/* Template Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Starter Template
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {templates.map((tpl) => (
                  <div
                    key={tpl.id}
                    onClick={() => setSelectedTemplate(tpl.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      selectedTemplate === tpl.id
                        ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-600'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-900">{tpl.name}</span>
                      {selectedTemplate === tpl.id && (
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-normal">{tpl.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                icon={<Plus className="w-4 h-4" />}
              >
                Create Document
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};
