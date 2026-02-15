import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'default';
  size?: 'sm' | 'md';
}

const variantClasses = {
  success: 'bg-green-100 text-green-700 border-green-200',
  warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  danger: 'bg-red-100 text-red-700 border-red-200',
  info: 'bg-blue-100 text-blue-700 border-blue-200',
  purple: 'bg-purple-100 text-purple-700 border-purple-200',
  default: 'bg-gray-100 text-gray-700 border-gray-200',
};

const sizeClasses = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
};

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'default',
  size = 'sm' 
}) => {
  return (
    <span
      className={`
        inline-flex items-center font-medium rounded border
        ${variantClasses[variant]} 
        ${sizeClasses[size]}
      `}
    >
      {children}
    </span>
  );
};
