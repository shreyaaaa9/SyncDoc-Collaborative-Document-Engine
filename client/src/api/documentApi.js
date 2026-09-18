import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/documents';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 1500,
});

const STORAGE_KEY = 'syncdoc_technical_spec_v2';

const getDefaultDocs = () => [
  {
    _id: 'doc_tech_spec_01',
    title: 'Technical Spec: Distributed Real-Time AST Synchronization',
    blocks: [
      {
        id: 'blk_head_1',
        type: 'heading',
        level: 1,
        content: 'Technical Spec: AST-Based Collaborative Document Engine',
        astNodeType: 'HeadingNode',
      },
      {
        id: 'blk_para_prob',
        type: 'paragraph',
        content: 'Problem Statement: Multi-user text editors frequently suffer from destructive overwrites and sync conflicts. Plain text line/character merging is insufficient for complex structural documents, leading to corrupted layouts and lost work when multiple users edit simultaneously.',
        astNodeType: 'ParagraphNode',
      },
      {
        id: 'blk_para_spec',
        type: 'paragraph',
        content: 'Use Case in Action: Two engineers open this technical spec. As User A (You) types this new paragraph, User B concurrently adds and edits the code block lower down the page. The system AST conflict resolution ensures neither edit is lost, while live visual block state indicators prevent layout overwrites.',
        astNodeType: 'ParagraphNode',
      },
      {
        id: 'blk_code_spec',
        type: 'code',
        language: 'typescript',
        content: '// AST Conflict Resolution & Node State Serialization\ninterface AstBlockNode {\n  id: string;\n  astNodeType: "ParagraphNode" | "CodeBlockNode" | "HeadingNode";\n  version: number;\n  activeLockAuthor: string | null; // e.g. "User B (Engineer 2)"\n  content: string;\n}',
        astNodeType: 'CodeBlockNode',
      },
    ],
    updatedAt: new Date().toISOString(),
  },
];

const getLocalDocs = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.warn('LocalStorage error:', e);
  }
  const defaultDocs = getDefaultDocs();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultDocs));
  return defaultDocs;
};

const saveLocalDocs = (docs) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
  } catch (e) {
    console.error('Save to localStorage failed:', e);
  }
};

export const fetchDocuments = async () => {
  try {
    const res = await api.get('/');
    return res.data;
  } catch (err) {
    return getLocalDocs();
  }
};

export const fetchDocumentById = async (id) => {
  try {
    const res = await api.get(`/${id}`);
    return res.data;
  } catch (err) {
    const docs = getLocalDocs();
    return docs.find((d) => d._id === id) || docs[0] || null;
  }
};

export const createDocument = async (title) => {
  try {
    const res = await api.post('/', { title, blocks: [] });
    return res.data;
  } catch (err) {
    const docs = getLocalDocs();
    const newDoc = {
      _id: `doc_${Date.now()}`,
      title: title || 'Untitled Technical Spec',
      blocks: [
        {
          id: `blk_${Date.now()}`,
          type: 'heading',
          level: 1,
          content: title || 'Untitled Technical Spec',
          astNodeType: 'HeadingNode',
        },
        {
          id: `blk_${Date.now() + 1}`,
          type: 'paragraph',
          content: 'Add technical documentation, architecture notes, and AST blocks here...',
          astNodeType: 'ParagraphNode',
        },
      ],
      updatedAt: new Date().toISOString(),
    };
    docs.unshift(newDoc);
    saveLocalDocs(docs);
    return newDoc;
  }
};

export const updateDocument = async (id, data) => {
  try {
    const res = await api.put(`/${id}`, data);
    return res.data;
  } catch (err) {
    const docs = getLocalDocs();
    const updated = docs.map((d) => (d._id === id ? { ...d, ...data, updatedAt: new Date().toISOString() } : d));
    saveLocalDocs(updated);
    return data;
  }
};

export const deleteDocument = async (id) => {
  try {
    await api.delete(`/${id}`);
  } catch (err) {
    const docs = getLocalDocs();
    const filtered = docs.filter((d) => d._id !== id);
    saveLocalDocs(filtered);
  }
};
