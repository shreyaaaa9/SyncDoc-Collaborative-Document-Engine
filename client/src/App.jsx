import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import BlockEditor from './components/blocks/BlockEditor';
import ErrorBoundary from './components/common/ErrorBoundary';

const App = () => {
  const [activeDocId, setActiveDocId] = useState(null);

  return (
    <Layout>
      <ErrorBoundary key={activeDocId || 'dashboard'}>
        {activeDocId ? (
          <BlockEditor documentId={activeDocId} onBack={() => setActiveDocId(null)} />
        ) : (
          <Dashboard onOpenDocument={(id) => setActiveDocId(id)} />
        )}
      </ErrorBoundary>
    </Layout>
  );
};

export default App;