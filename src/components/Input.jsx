import PropTypes from 'prop-types';

const Input = ({
  label,
  error,
  required = false,
  className = '',
  type = 'text',
  disabled = false,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className={`block text-sm font-medium mb-1 ${disabled ? 'text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        disabled={disabled}
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white text-gray-900 dark:bg-gray-800 dark:text-white ${
          error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'
        } ${disabled ? 'bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-500 cursor-not-allowed' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

Input.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  required: PropTypes.bool,
  className: PropTypes.string,
  type: PropTypes.string,
  disabled: PropTypes.bool
};

export default Input;
