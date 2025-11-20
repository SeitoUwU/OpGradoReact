import PropTypes from 'prop-types';

export const SkeletonLine = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
);

export const SkeletonCard = () => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
    <div className="animate-pulse space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
      </div>
    </div>
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="animate-pulse space-y-2">
    <div className="h-10 bg-gray-200 rounded"></div>
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="h-16 bg-gray-100 rounded"></div>
    ))}
  </div>
);

SkeletonLine.propTypes = {
  className: PropTypes.string
};

SkeletonTable.propTypes = {
  rows: PropTypes.number
};

export default SkeletonCard;
