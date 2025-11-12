import React from 'react';
import { motion } from 'framer-motion';

const variants = {
  success: 'bg-green-100 text-green-800 border-green-200',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  danger: 'bg-red-100 text-red-800 border-red-200',
  info: 'bg-blue-100 text-blue-800 border-blue-200',
  gray: 'bg-gray-100 text-gray-800 border-gray-200',
  purple: 'bg-purple-100 text-purple-800 border-purple-200',
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

const Badge = ({
  children,
  variant = 'gray',
  size = 'md',
  className = '',
  icon,
  pulse = false,
  dot = false
}) => {
  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
      className={`
        inline-flex items-center gap-1.5
        font-semibold rounded-full border
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {dot && (
        <span className={`
          w-2 h-2 rounded-full
          ${pulse ? 'animate-pulse' : ''}
          ${variant === 'success' ? 'bg-green-500' : ''}
          ${variant === 'warning' ? 'bg-yellow-500' : ''}
          ${variant === 'danger' ? 'bg-red-500' : ''}
          ${variant === 'info' ? 'bg-blue-500' : ''}
          ${variant === 'gray' ? 'bg-gray-500' : ''}
        `}></span>
      )}
      {icon && icon}
      {children}
    </motion.span>
  );
};

export default Badge;
