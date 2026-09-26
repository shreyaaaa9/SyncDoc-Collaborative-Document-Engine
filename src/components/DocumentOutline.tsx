import React from 'react';
import { AlignLeft, ChevronRight, ChevronLeft, Hash } from 'lucide-react';
import { OUTLINE_ITEMS } from '../data/mockDocuments';

interface DocumentOutlineProps {
  activeId?: string;
  onSelectSection?: (id: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const DocumentOutline: React.FC<DocumentOutlineProps> = ({
  activeId = 'system-overview',
  onSelectSection,
  isCollapsed,
  onToggleCollapse,
}) => {


  const handleClick = (id: string) => {
    if (onSelectSection) {
      onSelectSection(id);
    } else {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  if (isCollapsed) {
    return (
      <aside className="w-12 bg-white border-r border-slate-200 flex flex-col items-center py-4 transition-all duration-300">
        <button
          onClick={onToggleCollapse}
          title="Expand Document Outline"
          className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Expand outline"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </aside>
    );
  }

  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col h-[calc(100vh-4rem-41px)] sticky top-[105px] transition-all duration-300 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <AlignLeft className="w-4 h-4 text-indigo-600" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Document Outline
          </h4>
        </div>
        <button
          onClick={onToggleCollapse}
          title="Collapse Outline"
          className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100 transition-colors"
          aria-label="Collapse outline"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation List */}
      <nav className="p-2 space-y-1">
        {OUTLINE_ITEMS.map((item) => {
          const isActive = activeId === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleClick(item.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 flex items-center gap-2 ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 font-semibold border-l-2 border-indigo-600 pl-2.5'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Hash className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span className="truncate">{item.title}</span>
            </button>
          );
        })}
      </nav>

      {/* Helper notice */}
      <div className="mt-auto p-3 m-3 rounded-lg bg-slate-50 border border-slate-200/70 text-[11px] text-slate-500 leading-relaxed">
        <p className="font-semibold text-slate-700 mb-0.5">Quick Navigation</p>
        Click any section to instantly jump to its heading.
      </div>
    </aside>
  );
};
