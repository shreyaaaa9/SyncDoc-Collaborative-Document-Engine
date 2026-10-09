import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  PanelLeft,
  Download,
  Check,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';

import { useDocuments } from '../context/DocumentContext';
import { EditorToolbar } from '../components/EditorToolbar';
import { EditorArea } from '../components/EditorArea';
import { DocumentOutline } from '../components/DocumentOutline';
import { SaveButton } from '../components/SaveButton';

// Real-Time Collaboration Components and Hooks
import { useCollaboration } from '../hooks/useCollaboration';
import { ConnectionStatus } from '../components/ConnectionStatus';
import { Collaborators } from '../components/Collaborators';
import { CollaborationNotification } from '../components/CollaborationNotification';
import { PresenceIndicator } from '../components/PresenceIndicator';

import { COLLABORATION_PERSONAS, type CollaboratorPersona } from '../data/personas';

export const Editor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { documents, getDocument, saveDocument, user, setUser } = useDocuments();

  // Find document or fallback to first available
  const activeDocument = id ? getDocument(id) : documents[0];

  // Resolve user identity (supports ?id=user_2 or ?user=Sarah for instant multi-window testing)
  const queryUser = searchParams.get('user') || searchParams.get('name');
  const queryId = searchParams.get('id') || searchParams.get('userId');

  const effectiveUser = useMemo(() => {
    if (queryId) {
      const match = COLLABORATION_PERSONAS.find((p) => p.id === queryId);
      if (match) {
        return {
          id: match.id,
          name: match.name,
          email: match.email,
          role: match.role,
        };
      }
    }
    if (queryUser) {
      const match = COLLABORATION_PERSONAS.find(
        (p) =>
          p.name.toLowerCase().includes(queryUser.toLowerCase()) ||
          queryUser.toLowerCase().includes(p.name.toLowerCase().split(' ')[0])
      );
      if (match) {
        return {
          id: match.id,
          name: match.name,
          email: match.email,
          role: match.role,
        };
      }
      return {
        ...user,
        id: `user_${queryUser.toLowerCase().replace(/\s+/g, '_')}`,
        name: queryUser,
        email: `${queryUser.toLowerCase().replace(/\s+/g, '.')}@engineering.org`,
      };
    }
    return user;
  }, [queryUser, queryId, user]);

  const [title, setTitle] = useState(activeDocument?.title || 'Untitled Specification');
  const [content, setContent] = useState(activeDocument?.content || '');
  const [isOutlineCollapsed, setIsOutlineCollapsed] = useState(false);
  const [mobileOutlineOpen, setMobileOutlineOpen] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState('system-overview');
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [isPersonaMenuOpen, setIsPersonaMenuOpen] = useState(false);
  const personaMenuRef = useRef<HTMLDivElement | null>(null);

  const editorRef = useRef<HTMLDivElement | null>(null);

  // Close persona dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (personaMenuRef.current && !personaMenuRef.current.contains(e.target as Node)) {
        setIsPersonaMenuOpen(false);
      }
    };
    if (isPersonaMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPersonaMenuOpen]);

  // Real-Time Collaboration Hook
  const {
    connectionStatus,
    collaborators,
    documentContent,
    notifications,
    dismissNotification,
    sendUpdate,
    reconnect,
  } = useCollaboration({
    documentId: activeDocument?.id,
    initialContent: activeDocument?.content,
    user: effectiveUser,
  });

  // Keep local state in sync when remote real-time edits arrive
  useEffect(() => {
    if (documentContent) {
      setContent(documentContent);
    }
  }, [documentContent]);

  const handleSwitchTabPersona = (p: CollaboratorPersona) => {
    setUser({
      id: p.id,
      name: p.name,
      email: p.email,
      role: p.role,
    });
    const params = new URLSearchParams(searchParams);
    params.set('id', p.id);
    params.set('user', p.name);
    setSearchParams(params, { replace: true });
    setIsPersonaMenuOpen(false);
  };

  const handleLaunchWindow = (p: CollaboratorPersona) => {
    const url = new URL(window.location.origin + window.location.pathname);
    if (activeDocument?.id) {
      url.pathname = `/editor/${activeDocument.id}`;
    }
    url.searchParams.set('id', p.id);
    url.searchParams.set('user', p.name);
    window.open(url.toString(), '_blank', 'width=1000,height=800');
    setIsPersonaMenuOpen(false);
  };

  const handleLaunchAllFour = () => {
    COLLABORATION_PERSONAS.forEach((p, idx) => {
      if (p.id !== effectiveUser.id) {
        setTimeout(() => {
          const url = new URL(window.location.origin + window.location.pathname);
          if (activeDocument?.id) {
            url.pathname = `/editor/${activeDocument.id}`;
          }
          url.searchParams.set('id', p.id);
          url.searchParams.set('user', p.name);
          window.open(url.toString(), '_blank', 'width=950,height=750');
        }, idx * 250);
      }
    });
    setIsPersonaMenuOpen(false);
  };

  // Sync state if active document changes
  useEffect(() => {
    if (activeDocument) {
      setTitle(activeDocument.title);
      setContent(activeDocument.content);
      if (editorRef.current) {
        editorRef.current.innerHTML = activeDocument.content;
      }
    }
  }, [activeDocument]);

  // Handle local typing / editor edits
  const handleContentChange = (newHtml: string) => {
    setContent(newHtml);
    sendUpdate(newHtml);
  };

  // Handle Save
  const handleSave = async () => {
    if (activeDocument) {
      const currentHtml = editorRef.current?.innerHTML || content;
      // TODO: Connect to backend API - persist document content
      await saveDocument(activeDocument.id, currentHtml, title);
    }
  };

  // Handle Editor Formatting Commands
  const handleFormat = (command: string, value?: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();

    if (command === 'codeBlock') {
      const selection = window.getSelection();
      const selectedText = selection?.toString() || 'console.log("SyncDoc technical spec");';
      document.execCommand(
        'insertHTML',
        false,
        `<pre><code>${selectedText}</code></pre><p><br></p>`
      );
    } else if (command === 'inlineCode') {
      const selection = window.getSelection();
      const selectedText = selection?.toString() || 'code';
      document.execCommand('insertHTML', false, `<code>${selectedText}</code>`);
    } else if (command === 'insertTable') {
      const tableHtml = `
        <table>
          <thead>
            <tr><th>Parameter</th><th>Type</th><th>Description</th></tr>
          </thead>
          <tbody>
            <tr><td>buffer_size</td><td>uint32_t</td><td>Ring buffer allocation size</td></tr>
            <tr><td>baud_rate</td><td>uint32_t</td><td>Serial UART communications rate</td></tr>
          </tbody>
        </table>
        <p><br></p>
      `;
      document.execCommand('insertHTML', false, tableHtml);
    } else if (command === 'formatBlock' && value) {
      document.execCommand('formatBlock', false, `<${value}>`);
    } else {
      document.execCommand(command, false, value);
    }

    // Sync content locally and broadcast update to collaborators
    if (editorRef.current) {
      const newHtml = editorRef.current.innerHTML;
      setContent(newHtml);
      sendUpdate(newHtml);
    }
  };

  // Scroll to section from Outline
  const handleScrollToSection = (sectionId: string) => {
    setActiveSectionId(sectionId);
    setMobileOutlineOpen(false);

    // Try finding element by ID inside editor
    let target = editorRef.current?.querySelector(`#${sectionId}`);
    if (!target) {
      // Fallback: search headings by text
      const headings = editorRef.current?.querySelectorAll('h1, h2, h3');
      if (headings) {
        headings.forEach((h) => {
          if (h.textContent?.toLowerCase().includes(sectionId.replace('-', ' '))) {
            target = h;
          }
        });
      }
    }

    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Add subtle flash animation
      target.classList.add('bg-indigo-50/80', 'transition-colors', 'duration-500');
      setTimeout(() => {
        target?.classList.remove('bg-indigo-50/80');
      }, 1000);
    }
  };

  const handleExport = (type: 'Markdown' | 'PDF') => {
    setExportNotice(`Exported ${type} spec successfully (Mock)`);
    setTimeout(() => setExportNotice(null), 3000);
  };

  if (!activeDocument) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
        <h2 className="text-xl font-bold text-slate-800">Document not found</h2>
        <p className="text-sm text-slate-500 mt-1 mb-4">
          The requested document could not be loaded from local storage.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col overflow-x-hidden">
      {/* Top Header */}
      <header className="sticky top-0 z-30 w-full bg-white border-b border-slate-200 px-3 sm:px-6 h-16 flex items-center justify-between gap-2 shadow-xs">
        {/* Left: Back to Dashboard & Brand & Title & Status */}
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>

          <div className="h-5 w-px bg-slate-200 hidden sm:block flex-shrink-0" />

          {/* SyncDoc Logo icon */}
          <div className="hidden md:flex w-7 h-7 rounded-lg bg-indigo-600 text-white items-center justify-center shadow-xs flex-shrink-0">
            <FileText className="w-4 h-4" />
          </div>

          {/* Document Title Input & Real-Time Connection Status */}
          <div className="flex items-center gap-2 flex-1 max-w-xl min-w-0">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-sm sm:text-base font-bold text-slate-900 bg-transparent hover:bg-slate-100 focus:bg-white px-2 py-1 rounded border border-transparent hover:border-slate-200 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-all truncate"
              title="Click to rename document"
            />

            {/* 6. Real Connection Status Component */}
            <ConnectionStatus status={connectionStatus} onReconnect={reconnect} />

            <span className="hidden lg:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200 flex-shrink-0">
              {activeDocument.status}
            </span>
          </div>
        </div>

        {/* Right: Real Active Collaborators, Export, Save, User */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* 9 & 24 & 25: Real Active Collaborators Avatars & Presence Dropdown */}
          <Collaborators
            collaborators={collaborators}
            currentUserId={effectiveUser.id}
            documentId={activeDocument.id}
          />

          {/* Export button */}
          <div className="hidden md:flex items-center gap-1">
            <button
              onClick={() => handleExport('Markdown')}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg text-xs flex items-center gap-1 transition-colors"
              title="Export as Markdown"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="text-[11px]">Export</span>
            </button>
          </div>

          {/* Outline Toggle on Mobile */}
          <button
            onClick={() => setMobileOutlineOpen(!mobileOutlineOpen)}
            className="md:hidden p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
            title="Toggle Outline"
          >
            <PanelLeft className="w-4 h-4" />
          </button>

          {/* Save Button */}
          <SaveButton onSave={handleSave} />

          {/* User Persona & Multi-Window Switcher */}
          <div className="relative" ref={personaMenuRef}>
            <button
              onClick={() => setIsPersonaMenuOpen(!isPersonaMenuOpen)}
              className="flex items-center gap-1.5 p-1 pl-1.5 pr-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-all text-xs font-medium text-slate-700 shadow-2xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              title="Change active persona or launch multiple windows"
            >
              <div
                className="w-6 h-6 rounded-full text-white flex items-center justify-center text-xs font-bold shadow-xs"
                style={{
                  backgroundColor:
                    COLLABORATION_PERSONAS.find((p) => p.id === effectiveUser.id)?.color || '#4f46e5',
                }}
              >
                {effectiveUser.name.charAt(0)}
              </div>
              <span className="hidden sm:inline font-semibold text-slate-800 text-[11px] max-w-[90px] truncate">
                {effectiveUser.name.split(' ')[0]}
              </span>
              <span className="text-[10px] text-indigo-600 bg-indigo-50 px-1 py-0.2 rounded font-mono hidden md:inline">
                {effectiveUser.id}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {isPersonaMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3.5 z-50 animate-in fade-in slide-in-from-top-1 text-left">
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">
                      Identity & Multi-User Testing
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Switch ID in this tab or launch parallel windows
                    </p>
                  </div>
                  <button
                    onClick={handleLaunchAllFour}
                    className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded transition-colors"
                    title="Launch all 4 users in separate windows"
                  >
                    ⚡ Open All 4
                  </button>
                </div>

                <div className="space-y-1.5">
                  {COLLABORATION_PERSONAS.map((persona) => {
                    const isCurrent = persona.id === effectiveUser.id;
                    return (
                      <div
                        key={persona.id}
                        className={`p-2 rounded-xl border transition-all ${
                          isCurrent
                            ? 'bg-indigo-50/60 border-indigo-200 shadow-2xs'
                            : 'bg-white border-slate-100 hover:border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className="w-7 h-7 rounded-full text-white flex items-center justify-center text-xs font-bold shadow-xs flex-shrink-0"
                              style={{ backgroundColor: persona.color }}
                            >
                              {persona.initials}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-900 truncate flex items-center gap-1.5">
                                {persona.name}
                                {isCurrent && (
                                  <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-600 text-white font-mono">
                                    Active
                                  </span>
                                )}
                              </p>
                              <p className="text-[10px] text-slate-500 truncate">
                                {persona.role} • <span className="font-mono">{persona.id}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 flex-shrink-0">
                            {!isCurrent ? (
                              <>
                                <button
                                  onClick={() => handleSwitchTabPersona(persona)}
                                  className="px-2 py-1 text-[11px] font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"
                                  title="Switch to this persona in current tab"
                                >
                                  Switch
                                </button>
                                <button
                                  onClick={() => handleLaunchWindow(persona)}
                                  className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[11px] font-medium flex items-center gap-1 transition-colors shadow-2xs"
                                  title="Open in new browser window"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  Launch
                                </button>
                              </>
                            ) : (
                              <span className="text-emerald-600 text-xs font-medium flex items-center gap-1 pr-1">
                                <Check className="w-3.5 h-3.5" />
                                Current
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Editor Toolbar with presence subtitle */}
      <div className="flex items-center justify-between bg-white border-b border-slate-200 px-3 sm:px-6">
        <EditorToolbar onFormat={handleFormat} />
        <div className="hidden sm:block py-1 pr-2">
          <PresenceIndicator
            collaborators={collaborators}
            currentUserId={effectiveUser.id}
          />
        </div>
      </div>

      {/* 11. Collaboration Notifications Toasts */}
      <CollaborationNotification
        notifications={notifications}
        onDismiss={dismissNotification}
      />

      {/* Notice Toast */}
      {exportNotice && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Main Workspace Body */}
      <div className="flex-1 flex relative">
        {/* Desktop Left Sidebar: Document Outline */}
        <div className="hidden md:block">
          <DocumentOutline
            activeId={activeSectionId}
            onSelectSection={handleScrollToSection}
            isCollapsed={isOutlineCollapsed}
            onToggleCollapse={() => setIsOutlineCollapsed(!isOutlineCollapsed)}
          />
        </div>

        {/* Mobile Slide-Over Outline Drawer */}
        {mobileOutlineOpen && (
          <div
            className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs md:hidden"
            onClick={() => setMobileOutlineOpen(false)}
          >
            <div
              className="w-72 max-w-[80vw] h-full bg-white shadow-2xl p-4 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Document Outline
                </span>
                <button
                  onClick={() => setMobileOutlineOpen(false)}
                  className="text-slate-400 hover:text-slate-700 text-sm"
                >
                  ✕
                </button>
              </div>
              <DocumentOutline
                activeId={activeSectionId}
                onSelectSection={handleScrollToSection}
                isCollapsed={false}
                onToggleCollapse={() => setMobileOutlineOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Center Canvas / Document Editor Area */}
        <main className="flex-1 overflow-y-auto bg-slate-100/60 min-h-[calc(100vh-8rem)]">
          <EditorArea
            initialContent={content}
            remoteContent={documentContent}
            onChange={handleContentChange}
            editorRef={editorRef}
          />
        </main>
      </div>
    </div>
  );
};
