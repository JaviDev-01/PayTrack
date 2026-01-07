import React from 'react';

interface NeoCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  color?: string; // Kept for compatibility but ignored or mapped to styles
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const NeoCard: React.FC<NeoCardProps> = ({ 
  children, 
  className = '', 
  title,
  padding = 'md'
}) => {
  
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-6',
  };

  return (
    <div className={`
      bg-pro-surface 
      rounded-2xl 
      shadow-pro-md 
      border border-pro-border
      transition-all duration-300
      hover:shadow-pro-lg
      ${className}
    `}>
      {title && (
        <div className="border-b border-pro-border p-4 bg-gray-50/50 rounded-t-2xl">
          <h3 className="font-semibold text-pro-text text-lg tracking-tight">{title}</h3>
        </div>
      )}
      <div className={paddingClasses[padding]}>
        {children}
      </div>
    </div>
  );
};