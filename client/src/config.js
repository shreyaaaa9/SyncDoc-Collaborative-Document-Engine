// Only VITE_ prefixed variables are exposed to the browser.
// Never put secrets (passwords, private keys) in client .env files.
const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const API_URL = rawUrl.replace(/\/+$/, '');
export const API_BASE = `${API_URL}/api/documents`;