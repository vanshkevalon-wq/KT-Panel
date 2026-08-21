import React from 'react';

const KevalonLogo = ({ className = 'h-10 w-auto', alt = 'Kevalon Technology Logo' }) => {
  return (
    <img
      src="/kevalon-logo.png"
      alt={alt}
      className={`object-contain transition-opacity duration-200 ${className}`}
    />
  );
};

export default KevalonLogo;
