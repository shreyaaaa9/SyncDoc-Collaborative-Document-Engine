import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/documents';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

export const fetchDocuments = async () => {
  const res = await api.get('/');
  return res.data;
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