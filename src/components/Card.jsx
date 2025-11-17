import React from 'react';

const Card = ({
  children,
  className = '',
  gradient = false,
  hover = false,
  ...props
}) => {
  const baseStyles = 'bg-white rounded-xl shadow-md overflow-hidden';
  const gradientStyles = gradient ? 'bg-gradient-to-br from-white to-gray-50' : '';
  const hoverStyles = hover ? 'hover:shadow-lg transition-shadow duration-300' : '';

  return (
    <div
      className={`${baseStyles} ${gradientStyles} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`px-6 py-4 border-b border-gray-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardBody = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`px-6 py-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardFooter = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`px-6 py-4 border-t border-gray-200 bg-gray-50 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
