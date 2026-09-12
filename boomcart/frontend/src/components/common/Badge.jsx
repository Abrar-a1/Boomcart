import React from 'react';

const Badge = ({ children, variant = 'neutral', className = '', ...props }) => {
  const variants = {
    neutral: 'bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-text-muted)]',
    discount: 'bg-[var(--color-cta)] text-white border border-[var(--color-cta)]',
    status: 'bg-[var(--color-primary)] text-white border border-[var(--color-primary)]'
  };

  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-body text-[10px] uppercase tracking-widest font-bold ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
