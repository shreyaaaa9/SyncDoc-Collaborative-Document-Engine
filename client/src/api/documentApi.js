import axios from 'axios';

const API_BASE = `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/documents`;

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

export const fetchDocuments = async () => {
  const res = await api.get('/');
  return res.data.data || res.data;
};

export const fetchDocumentById = async (id) => {
  const res = await api.get(`/${id}`);
  return res.data;
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

// Stub for compatibility with BlockEditor — returns empty doc shell
export const getInitialDocument = (id) => ({
  _id: id,
  title: 'Loading...',
  blocks: [],
});
