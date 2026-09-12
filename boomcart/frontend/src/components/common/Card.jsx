import React from 'react';

const Card = ({ children, className = '', noPadding = false, ...props }) => {
  return (
    <div 
      className={`bg-white border border-[var(--color-border)] rounded-sm ${noPadding ? '' : 'p-6 lg:p-8'} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
