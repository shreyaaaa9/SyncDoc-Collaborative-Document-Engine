import axios from 'axios';
import { API_BASE } from '../config';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Converts any API error into a clear message for the UI.
export const getErrorMessage = (err, fallback = 'Something went wrong. Please try again.') => {
  if (err?.code === 'ECONNABORTED') return 'The server took too long to respond.';
  if (!err?.response) return 'Cannot reach the server. Check that the backend is running.';

  const status = err.response.status;
  if (status === 404) return 'Document not found.';
  if (status >= 500) return 'Server error. Please try again later.';

  const serverMessage = err.response.data?.message;
  return typeof serverMessage === 'string' && serverMessage ? serverMessage : fallback;
};

export const fetchDocuments = async () => {
  const res = await api.get('/');
  const data = res.data;
  if (Array.isArray(data)) return data;
  return Array.isArray(data?.documents) ? data.documents : [];
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