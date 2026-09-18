import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import BlockEditor from './components/blocks/BlockEditor';

const App = () => {
  const [activeDocId, setActiveDocId] = useState('doc_tech_spec_01');

  return (
    <div className="syncdoc-app">
      {activeDocId ? (
        <BlockEditor
          documentId={activeDocId}
          onBack={() => setActiveDocId(null)}
        />
      ) : (
        <Dashboard onOpenDocument={(id) => setActiveDocId(id)} />
      )}
    </div>
  );
};

export default App;
