import React from 'react';

const EmptyState = ({ title, description, action, icon, className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-16 px-4 ${className}`}>
      {icon && <div className="text-text-light mb-6 w-16 h-16 flex items-center justify-center">{icon}</div>}
      {title && <h3 className="font-heading text-3xl text-primary mb-3">{title}</h3>}
      {description && <p className="font-body text-text-muted max-w-md mb-8 leading-relaxed">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
