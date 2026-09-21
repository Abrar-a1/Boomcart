import React from 'react';

const Badge = ({ children, variant = 'neutral', className = '', ...props }) => {
  const variants = {
    neutral: 'bg-background border border-border text-text-muted',
    discount: 'bg-cta text-white border border-cta',
    status: 'bg-primary text-white border border-primary'
  };

  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-body text-xs uppercase tracking-widest font-bold ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
