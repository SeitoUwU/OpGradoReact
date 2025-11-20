import { Check } from 'lucide-react';
import PropTypes from 'prop-types';

const Checkbox = ({
  label,
  checked = false,
  onChange,
  disabled = false,
  error,
  helperText,
  className = ''
}) => {
  return (
    <div className={`flex flex-col ${className}`}>
      <label className={`flex items-start cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
        <div className="relative flex-shrink-0 mt-0.5">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
            className="sr-only"
          />
          <div
            className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${
              checked
                ? 'bg-blue-600 border-blue-600'
                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
            } ${disabled ? '' : 'hover:border-blue-500'} ${
              error ? 'border-red-500' : ''
            }`}
          >
            {checked && (
              <Check size={16} className="text-white" strokeWidth={3} />
            )}
          </div>
        </div>
        {label && (
          <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-100">
            {label}
          </span>
        )}
      </label>
      {helperText && !error && (
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 ml-8">
          {helperText}
        </p>
      )}
      {error && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400 ml-8">
          {error}
        </p>
      )}
    </div>
  );
};

Checkbox.propTypes = {
  label: PropTypes.string,
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  helperText: PropTypes.string,
  className: PropTypes.string
};

export default Checkbox;
