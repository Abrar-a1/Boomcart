import React, { forwardRef, useId } from 'react';

const Select = forwardRef(({ 
  label, 
  error, 
  helperText, 
  className = '', 
  id,
  children,
  ...props 
}, ref) => {
  const generatedId = useId();
  const selectId = id || generatedId;
  const errorId = `${selectId}-error`;
  const helperId = `${selectId}-helper`;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={selectId} className="font-body text-xs font-bold uppercase tracking-widest text-[var(--color-text)]">
          {label} {props.required && <span className="text-[var(--color-error)]">*</span>}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        aria-invalid={!!error}
        aria-describedby={`${error ? errorId : ''} ${helperText && !error ? helperId : ''}`.trim() || undefined}
        className={`
          w-full px-4 py-3 bg-white border border-[var(--color-border)] rounded-sm font-body text-sm text-[var(--color-text)] 
          transition-colors focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] 
          disabled:bg-[var(--color-background)] disabled:text-[var(--color-text-muted)] disabled:cursor-not-allowed
          appearance-none
          ${error ? 'border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]' : ''}
          ${className}
        `}
        style={{
          backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%232C3E2F%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 12px center',
          backgroundSize: '16px'
        }}
        {...props}
      >
        {children}
      </select>
      {error && <span id={errorId} className="text-xs text-[var(--color-error)] font-body">{error}</span>}
      {helperText && !error && <span id={helperId} className="text-xs text-[var(--color-text-muted)] font-body">{helperText}</span>}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
