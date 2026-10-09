import React, { useState, useRef, useEffect } from 'react';
import { Users, ExternalLink, Check, Copy } from 'lucide-react';
import type { Collaborator } from '../collaboration/types';

import { COLLABORATION_PERSONAS } from '../data/personas';

interface CollaboratorsProps {
  collaborators: Collaborator[];
  currentUserId?: string;
  documentId?: string;
}

export const Collaborators: React.FC<CollaboratorsProps> = ({
  collaborators,
  currentUserId,
  documentId,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Close panel on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const maxVisible = 4;
  const visibleUsers = collaborators.slice(0, maxVisible);
  const overflowCount = Math.max(0, collaborators.length - maxVisible);

  const getPersonaUrl = (personaId: string, name: string) => {
    const url = new URL(window.location.origin + window.location.pathname);
    if (documentId) {
      url.pathname = `/editor/${documentId}`;
    }
    url.searchParams.set('id', personaId);
    url.searchParams.set('user', name);
    return url.toString();
  };

  const handleCopyLink = (personaId: string, name: string) => {
    navigator.clipboard.writeText(getPersonaUrl(personaId, name));
    setCopiedId(personaId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenWindow = (personaId: string, name: string) => {
    window.open(getPersonaUrl(personaId, name), '_blank', 'width=1000,height=800');
  };

  return (
    <div className="relative inline-flex items-center" ref={panelRef}>
      {/* Avatars Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center -space-x-2 overflow-hidden hover:opacity-95 transition-opacity focus:outline-none focus:ring-2 focus:ring-indigo-500/20 p-1 rounded-full bg-slate-50 border border-slate-200"
        title="View active collaborators"
      >
        {visibleUsers.map((user) => {
          const isMe = user.id === currentUserId;
          return (
            <div
              key={user.id}
              className="relative inline-block"
              title={`${user.name} ${isMe ? '(You)' : ''} - Online`}
            >
              <div
                className="w-7 h-7 rounded-full ring-2 ring-white flex items-center justify-center text-white text-xs font-bold uppercase shadow-xs transition-transform hover:scale-110 hover:z-10"
                style={{ backgroundColor: user.color }}
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  user.name.charAt(0)
                )}
              </div>
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white" />
            </div>
          );
        })}

        {overflowCount > 0 && (
          <div
            className="w-7 h-7 rounded-full ring-2 ring-white bg-slate-700 text-white text-[11px] font-semibold flex items-center justify-center shadow-xs"
            title={`${overflowCount} more collaborators`}
          >
            +{overflowCount}
          </div>
        )}

        {collaborators.length === 0 && (
          <div className="flex items-center gap-1 px-2 text-xs text-slate-500">
            <Users className="w-3.5 h-3.5" />
            <span>0</span>
          </div>
        )}
      </button>

      {/* 25. Collaboration Panel / Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200/80 p-4 z-50 text-left animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Active Collaborators ({collaborators.length})
              </h4>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Live</span>
          </div>

          <div className="mt-3 max-h-60 overflow-y-auto space-y-2 divide-y divide-slate-50">
            {collaborators.map((user) => {
              const isMe = user.id === currentUserId;
              return (
                <div key={user.id} className="pt-2 first:pt-0 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative flex-shrink-0">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold uppercase shadow-xs"
                        style={{ backgroundColor: user.color }}
                      >
                        {user.name.charAt(0)}
                      </div>
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate flex items-center gap-1.5">
                        {user.name}
                        {isMe && (
                          <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-600 font-mono">
                            You
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {isMe ? 'Editing document' : 'Online'}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] text-emerald-600 font-medium px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 flex-shrink-0">
                    Active
                  </span>
                </div>
              );
            })}
          </div>

          {/* Quick Actions for Testing 2, 3, or 4 Browser Windows */}
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-slate-700">
                Test with 2 to 4 Collaborator IDs:
              </p>
              <button
                onClick={() => {
                  COLLABORATION_PERSONAS.filter((p) => p.id !== currentUserId).forEach((p, idx) => {
                    setTimeout(() => {
                      window.open(getPersonaUrl(p.id, p.name), '_blank', 'width=950,height=750');
                    }, idx * 250);
                  });
                }}
                className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded transition-colors"
                title="Open windows for all other collaborators simultaneously"
              >
                ⚡ Launch All 4
              </button>
            </div>

            <div className="space-y-1.5">
              {COLLABORATION_PERSONAS.map((persona) => {
                const isMe = persona.id === currentUserId;
                return (
                  <div
                    key={persona.id}
                    className={`flex items-center justify-between p-1.5 rounded-lg border text-xs transition-colors ${
                      isMe ? 'bg-slate-50/70 border-slate-200' : 'hover:bg-slate-50 border-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                        style={{ backgroundColor: persona.color }}
                      >
                        {persona.initials}
                      </div>
                      <span className="font-medium text-slate-800 truncate">
                        {persona.name}
                      </span>
                      {isMe && (
                        <span className="text-[9px] bg-indigo-50 text-indigo-600 font-mono px-1 py-0.2 rounded">
                          Current
                        </span>
                      )}
                    </div>

                    {!isMe && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => handleOpenWindow(persona.id, persona.name)}
                          className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[11px] font-medium flex items-center gap-1 transition-colors"
                          title={`Open ${persona.name} in a new window`}
                        >
                          <ExternalLink className="w-3 h-3" />
                          Launch
                        </button>
                        <button
                          onClick={() => handleCopyLink(persona.id, persona.name)}
                          className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors"
                          title="Copy link"
                        >
                          {copiedId === persona.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
