import React from 'react';

const VersionBadge = ({ version, updatedAt }) => {
  if (version == null && !updatedAt) return null;
  const updated = updatedAt ? new Date(updatedAt).toLocaleString() : null;
  return (
    <span className="version-badge" title={updated ? `Last updated: ${updated}` : undefined}>
      {version != null ? `v${version}` : 'Version'}
    </span>
  );
};

export default VersionBadge;