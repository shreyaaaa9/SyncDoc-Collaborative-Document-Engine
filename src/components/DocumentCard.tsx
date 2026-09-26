import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileCode, Clock, User, ArrowRight, Trash2 } from 'lucide-react';
import type { Document } from '../types/document';
import { useDocuments } from '../context/DocumentContext';

interface DocumentCardProps {
  document: Document;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ document }) => {
  const navigate = useNavigate();
  const { deleteDocument } = useDocuments();

  const handleCardClick = () => {
    navigate(`/editor/${document.id}`);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Delete "${document.title}"? This is frontend-only for now.`)) {
      deleteDocument(document.id);
    }
  };

  const statusConfig = {
    Active: {
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      dot: 'bg-emerald-500',
    },
    Draft: {
      badge: 'bg-amber-50 text-amber-700 border-amber-200/80',
      dot: 'bg-amber-500',
    },
    Archived: {
      badge: 'bg-slate-100 text-slate-700 border-slate-200',
      dot: 'bg-slate-400',
    },
  };

  const currentStatus = statusConfig[document.status] || statusConfig.Draft;

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col justify-between bg-white rounded-xl border border-slate-200/90 hover:border-indigo-400/80 p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden text-left"
    >
      {/* Top Bar: Icon + Status */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="w-10 h-10 rounded-lg bg-slate-100 group-hover:bg-indigo-50 border border-slate-200/80 group-hover:border-indigo-200 flex items-center justify-center text-slate-700 group-hover:text-indigo-600 transition-colors">
            <FileCode className="w-5 h-5 stroke-[1.8]" />
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${currentStatus.badge}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${currentStatus.dot}`} />
              {document.status}
            </span>

            <button
              onClick={handleDelete}
              title="Delete Document"
              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold text-slate-900 group-hover:text-indigo-600 line-clamp-1 transition-colors">
          {document.title}
        </h3>

        {/* Description */}
        <p className="mt-1.5 text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {document.description}
        </p>

        {/* Tags */}
        {document.tags && document.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {document.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-200"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Meta */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-slate-600 font-medium">
            <User className="w-3.5 h-3.5 text-slate-400" />
            {document.owner}
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            {document.lastEdited}
          </span>
        </div>

        <div className="flex items-center text-indigo-600 font-medium text-xs opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all">
          Open <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
        </div>
      </div>
    </div>
  );
};
