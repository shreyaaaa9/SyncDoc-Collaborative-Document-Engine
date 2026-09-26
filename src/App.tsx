import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DocumentProvider } from './context/DocumentContext';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { CreateDocument } from './pages/CreateDocument';
import { Editor } from './pages/Editor';

export const App: React.FC = () => {
  return (
    <DocumentProvider>
      <BrowserRouter>
        <Routes>
          {/* Default entrypoint navigates to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create" element={<CreateDocument />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="/editor/:id" element={<Editor />} />
          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </DocumentProvider>
  );
};

export default App;
