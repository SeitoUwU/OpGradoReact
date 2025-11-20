import PropTypes from 'prop-types';

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

Card.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  gradient: PropTypes.bool,
  hover: PropTypes.bool
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

CardHeader.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string
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

CardBody.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string
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

CardFooter.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string
};

export default Card;
