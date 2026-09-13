import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import BlockEditor from './components/BlockEditor';

const App = () => {
  const [activeDocId, setActiveDocId] = useState(null);

  return (
    <div>
      {activeDocId ? (
        <BlockEditor documentId={activeDocId} onBack={() => setActiveDocId(null)} />
      ) : (
        <Dashboard onOpenDocument={(id) => setActiveDocId(id)} />
      )}
    </div>
  );
};

export default App;