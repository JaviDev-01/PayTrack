import React from 'react';

interface NeoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'neutral' | 'ghost';
  fullWidth?: boolean;
}

export const NeoButton: React.FC<NeoButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '',
  ...props 
}) => {
  const baseStyles = "relative font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-pro-primary text-white shadow-pro-md hover:bg-pro-primary-dark hover:shadow-pro-lg focus:ring-pro-primary",
    secondary: "bg-pro-secondary text-white shadow-pro-md hover:bg-emerald-600 hover:shadow-pro-lg focus:ring-pro-secondary",
    accent: "bg-amber-500 text-white shadow-pro-md hover:bg-amber-600 focus:ring-amber-500",
    danger: "bg-red-500 text-white shadow-pro-md hover:bg-red-600 focus:ring-red-500",
    neutral: "bg-white text-pro-text border border-pro-border shadow-pro-sm hover:bg-gray-50 focus:ring-gray-200",
    ghost: "bg-transparent text-pro-text-light hover:bg-gray-100 shadow-none",
  };

  return (
    <button 
      className={`
        ${baseStyles} 
        ${variants[variant]} 
        ${fullWidth ? 'w-full' : ''} 
        px-6 py-3.5 text-base
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};