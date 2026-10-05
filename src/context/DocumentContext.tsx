import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Document, User } from '../types/document';
import { INITIAL_DOCUMENTS } from '../data/mockDocuments';

interface DocumentContextType {
  documents: Document[];
  user: User;
  setUser: (user: User) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  // Document actions (Mock frontend methods with backend placeholders)
  createDocument: (title: string, description: string) => string;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  deleteDocument: (id: string) => void;
  getDocument: (id: string) => Document | undefined;
  saveDocument: (id: string, content: string, title?: string) => Promise<boolean>;
  resetToDefault: () => void;
}

const STORAGE_KEY = 'syncdoc_documents_v1';
const USER_STORAGE_KEY = 'syncdoc_user_v1';

const DEFAULT_USER: User = {
  id: 'user_1',
  name: 'Kirubakar',
  email: 'kirubakar@engineering.org',
  role: 'Staff Systems Engineer',
};

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [documents, setDocuments] = useState<Document[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      console.warn('Failed to parse cached documents from localStorage');
    }
    return INITIAL_DOCUMENTS;
  });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [user, setUserState] = useState<User>(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return DEFAULT_USER;
  });

  const setUser = (newUser: User) => {
    setUserState(newUser);
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
    } catch {
      // ignore
    }
  };

  // Sync to local storage whenever documents change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
    } catch (err) {
      console.error('Failed to sync documents to localStorage', err);
    }
  }, [documents]);

  /**
   * Create a new document
   * TODO: Connect to backend API (POST /api/documents)
   */
  const createDocument = (title: string, description: string): string => {
    const trimmedTitle = title.trim();
    const newId = `doc_${Date.now()}`;
    
    const newDoc: Document = {
      id: newId,
      title: trimmedTitle,
      description: description.trim() || 'Engineering document specification',
      owner: user.name,
      lastEdited: 'Just now',
      status: 'Draft',
      tags: ['Engineering', 'Technical Spec'],
      wordCount: 150,
      content: `
        <h2 id="system-overview">System Overview</h2>
        <p>SyncDoc document: <strong>${trimmedTitle}</strong>.</p>
        <p>This technical document provides detailed architecture, specification requirements, and implementation verification guides for the engineering team.</p>
        
        <h2 id="architecture">Architecture</h2>
        <p>The system contains multiple components that communicate through clearly defined interfaces. Define data flows, component relationships, and boundary contracts here.</p>

        <h2 id="requirements">Requirements</h2>
        <ul>
          <li>Reliable document editing</li>
          <li>Clear document structure</li>
          <li>Responsive interface</li>
          <li>Easy document management</li>
        </ul>

        <h2 id="implementation">Implementation</h2>
        <p>Technical implementation details and modular service designs for this engineering module.</p>

        <h2 id="testing">Testing</h2>
        <p>Verification criteria, test coverage guidelines, and integration sign-off procedures.</p>
      `.trim()
    };

    setDocuments(prev => [newDoc, ...prev]);
    // TODO: Connect to backend API - trigger websocket sync or document creation event
    return newId;
  };

  /**
   * Update existing document
   * TODO: Connect to backend API (PATCH /api/documents/:id)
   */
  const updateDocument = (id: string, updates: Partial<Document>) => {
    setDocuments(prev =>
      prev.map(doc => {
        if (doc.id === id) {
          return {
            ...doc,
            ...updates,
            lastEdited: 'Just now',
          };
        }
        return doc;
      })
    );
  };

  /**
   * Delete document
   * TODO: Connect to backend API (DELETE /api/documents/:id)
   */
  const deleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  /**
   * Retrieve document by ID
   * TODO: Connect to backend API (GET /api/documents/:id)
   */
  const getDocument = (id: string): Document | undefined => {
    return documents.find(doc => doc.id === id);
  };

  /**
   * Save document content and optional title
   * Returns a promise simulating a network delay then updates local state
   * TODO: Connect to backend API (PUT /api/documents/:id/save)
   */
  const saveDocument = async (id: string, content: string, title?: string): Promise<boolean> => {
    // Brief simulated network debounce (250ms)
    await new Promise(resolve => setTimeout(resolve, 250));
    
    // Estimate word count
    const cleanText = content.replace(/<[^>]*>/g, ' ');
    const words = cleanText.trim().split(/\s+/).filter(Boolean).length;

    setDocuments(prev =>
      prev.map(doc => {
        if (doc.id === id) {
          return {
            ...doc,
            ...(title ? { title: title.trim() } : {}),
            content,
            wordCount: words,
            lastEdited: 'Just now',
          };
        }
        return doc;
      })
    );

    // TODO: Connect to backend API - persist document revision to database
    return true;
  };

  const resetToDefault = () => {
    setDocuments(INITIAL_DOCUMENTS);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DOCUMENTS));
    } catch {
      // ignore
    }
  };

  return (
    <DocumentContext.Provider
      value={{
        documents,
        user,
        setUser,
        searchQuery,
        setSearchQuery,
        createDocument,
        updateDocument,
        deleteDocument,
        getDocument,
        saveDocument,
        resetToDefault,
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocuments = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
};
