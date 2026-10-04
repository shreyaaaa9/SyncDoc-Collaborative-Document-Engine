import React from 'react';

const Layout = ({ children }) => {
  return (
    <div>
      <header className="app-header">
        <h1 className="app-title">SyncDoc</h1>
      </header>
      <main className="container">{children}</main>
    </div>
  );
};

export default Layout;