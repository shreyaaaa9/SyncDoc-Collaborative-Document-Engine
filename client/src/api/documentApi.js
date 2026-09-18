import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/documents';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 1500,
});

const STORAGE_KEY = 'syncdoc_technical_spec_v3';

const getDefaultDocs = () => [
  {
    _id: 'doc_tech_spec_01',
    title: 'SyncDoc Technical Specification & Architecture',
    blocks: [
      {
        id: 'blk_head_1',
        type: 'heading',
        level: 1,
        content: 'SyncDoc Technical Specification & Architecture',
        astNodeType: 'HeadingNode',
      },
      {
        id: 'blk_para_1',
        type: 'paragraph',
        content: 'SyncDoc is a collaborative technical document engine designed for multi-user editing with AST-based conflict resolution. Content is organized into structural blocks such as paragraphs, headings, and code blocks.',
        astNodeType: 'ParagraphNode',
      },
      {
        id: 'blk_para_2',
        type: 'paragraph',
        content: 'NodeMCU communicates with the server using Wi-Fi.',
        astNodeType: 'ParagraphNode',
      },
      {
        id: 'blk_code_1',
        type: 'code',
        language: 'javascript',
        content: 'const example = "SyncDoc";\nconsole.log(`Connecting to collaborative document engine: ${example}`);',
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
