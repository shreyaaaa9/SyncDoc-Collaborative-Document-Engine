import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import BlockEditor from './components/blocks/BlockEditor';

const App = () => {
  const [activeDocId, setActiveDocId] = useState(null);

  return (
    <Layout>
      {activeDocId ? (
        <BlockEditor documentId={activeDocId} onBack={() => setActiveDocId(null)} />
      ) : (
        <Dashboard onOpenDocument={(id) => setActiveDocId(id)} />
      )}
    </Layout>
  );
};

export default App;