import React, { forwardRef, useId } from 'react';

const Input = forwardRef(({ 
  label, 
  error, 
  helperText, 
  className = '', 
  id, 
  leftElement,
  rightElement,
  variant = 'default',
  ...props 
}, ref) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  const variantStyles = {
    default: "bg-white border border-border rounded-sm text-text focus:border-primary focus:ring-1 focus:ring-primary disabled:bg-background placeholder:text-text-light",
    glass: "bg-transparent border-0 border-b border-white/40 rounded-none text-white focus:border-white focus:ring-0 placeholder:text-white/60 focus:bg-white/5 disabled:bg-transparent px-0",
    slider: "bg-transparent border-0 border-b border-white/60 rounded-none text-white focus:border-white focus:ring-0 placeholder:text-white/40 disabled:bg-transparent px-0 py-2 min-h-[40px] text-sm"
  };

  const labelStyles = {
    default: "text-xs font-bold uppercase tracking-widest text-text",
    glass: "text-xs font-bold uppercase tracking-widest text-white/90",
    slider: "text-sm font-medium text-white/90"
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label htmlFor={inputId} className={`font-body ${labelStyles[variant]}`}>
          {label} {props.required && <span className={variant === 'default' ? "text-error" : "text-red-400"}>*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {leftElement && <div className={`absolute left-0 z-10 ${variant === 'default' ? 'text-text-light' : 'text-white/70'}`}>{leftElement}</div>}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={`${error ? errorId : ''} ${helperText && !error ? helperId : ''}`.trim() || undefined}
          className={`
            w-full font-body transition-all focus:outline-none disabled:text-text-muted disabled:cursor-not-allowed
            ${variantStyles[variant]}
            ${variant === 'default' ? 'px-4 py-3 min-h-[48px] text-sm' : ''}
            ${leftElement ? (variant === 'default' ? 'pl-10' : 'pl-8') : ''}
            ${rightElement ? 'pr-10' : ''}
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            ${className}
          `}
          {...props}
        />
        {rightElement && <div className={`absolute right-0 z-10 ${variant === 'default' ? 'text-text-light' : 'text-white/70'}`}>{rightElement}</div>}
      </div>
      {error && <span id={errorId} className="text-xs text-error font-body">{error}</span>}
      {helperText && !error && <span id={helperId} className="text-xs text-text-muted font-body">{helperText}</span>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
