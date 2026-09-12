import React, { forwardRef } from 'react';

const Button = forwardRef(({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  disabled, 
  isLoading, 
  ...props 
}, ref) => {
  const baseClasses = 'inline-flex items-center justify-center font-body rounded-sm transition-colors focus:outline-none focus-visible:outline disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-[var(--color-cta)] text-white hover:bg-[var(--color-cta-dark)]',
    secondary: 'bg-transparent border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white',
    ghost: 'bg-transparent text-[var(--color-primary)] hover:bg-[var(--color-background)]',
    danger: 'bg-[var(--color-error)] text-white hover:opacity-90'
  };

  const sizes = {
    sm: 'text-xs px-4 py-2 min-h-[32px]',
    md: 'text-sm px-6 py-3 min-h-[44px]',
    lg: 'text-base px-8 py-4 min-h-[52px]'
  };

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <svg className="motion-safe:animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
      ) : null}
      {children}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
