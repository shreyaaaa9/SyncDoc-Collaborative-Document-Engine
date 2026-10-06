import React from 'react';

const Loader = ({ text = 'Loading...' }) => (
  <div className="state-box" role="status" aria-live="polite">
    <div className="spinner" />
    <p>{text}</p>
  </div>
);

export default Loader;