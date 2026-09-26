import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  PanelLeft,
  Download,
  Check,
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

export const Editor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { documents, getDocument, saveDocument, user } = useDocuments();

  // Find document or fallback to first available
  const activeDocument = id ? getDocument(id) : documents[0];

  // Resolve user identity (supports ?user=Name for instant multi-window testing)
  const queryUser = searchParams.get('user') || searchParams.get('name');
  const effectiveUser = useMemo(() => {
    if (queryUser) {
      return {
        ...user,
        id: `user_${queryUser.toLowerCase().replace(/\s+/g, '_')}`,
        name: queryUser,
        email: `${queryUser.toLowerCase().replace(/\s+/g, '.')}@engineering.org`,
      };
    }
    return user;
  }, [queryUser, user]);

  const [title, setTitle] = useState(activeDocument?.title || 'Untitled Specification');
  const [content, setContent] = useState(activeDocument?.content || '');
  const [isOutlineCollapsed, setIsOutlineCollapsed] = useState(false);
  const [mobileOutlineOpen, setMobileOutlineOpen] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState('system-overview');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const editorRef = useRef<HTMLDivElement | null>(null);

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

          {/* User Avatar with Profile badge */}
          <div
            className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold ring-2 ring-slate-200 cursor-pointer"
            title={`Logged in as ${effectiveUser.name}`}
          >
            {effectiveUser.name.charAt(0)}
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
