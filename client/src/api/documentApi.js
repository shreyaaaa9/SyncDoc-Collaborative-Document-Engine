import axios from 'axios';

const API_BASE = `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/documents`;

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

export const fetchDocuments = async () => {
  const res = await api.get('/');
  if (!res.data) return [];
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.data.documents)) return res.data.documents;
  if (Array.isArray(res.data.data)) return res.data.data;
  return res.data.data || res.data || [];
};

export const fetchDocumentById = async (id) => {
  const res = await api.get(`/${id}`);
  return res.data?.data || res.data;
};

export const createDocument = async (title) => {
  const res = await api.post('/', { title, blocks: [] });
  return res.data;
};

export const updateDocument = async (id, data) => {
  const res = await api.put(`/${id}`, data);
  return res.data;
};

export const deleteDocument = async (id) => {
  await api.delete(`/${id}`);
};

export const getErrorMessage = (err, fallback = 'An error occurred.') => {
  if (err?.code === 'ECONNABORTED') {
    return 'Request took too long to complete.';
  }
  if (!err?.response && (!err || Object.keys(err).length === 0 || !err.status)) {
    return 'Cannot reach the server. Please check your connection.';
  }
  if (err?.response?.status === 404) {
    return 'Document not found.';
  }
  if (err?.response?.status === 500) {
    return 'Internal server error. Please try again later.';
  }
  if (err?.response?.data?.message) {
    return err.response.data.message;
  }
  return fallback;
};

// Stub for compatibility with BlockEditor — returns empty doc shell
export const getInitialDocument = (id) => ({
  _id: id,
  title: 'Loading...',
  content: [],
  blocks: [],
});
