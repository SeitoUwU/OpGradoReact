import { AlertCircle, Search, Users, FileText, Package } from 'lucide-react';
import PropTypes from 'prop-types';

const EmptyState = ({
  preset,
  title,
  description,
  icon: CustomIcon,
  action,
  className = ''
}) => {
  const presets = {
    error: {
      icon: AlertCircle,
      title: 'Error',
      description: 'Ocurrió un error inesperado',
      iconColor: 'text-red-500',
      bgColor: 'bg-red-50'
    },
    search: {
      icon: Search,
      title: 'Sin resultados',
      description: 'No se encontraron resultados para tu búsqueda',
      iconColor: 'text-gray-400',
      bgColor: 'bg-gray-50'
    },
    users: {
      icon: Users,
      title: 'Sin usuarios',
      description: 'No hay usuarios registrados',
      iconColor: 'text-blue-400',
      bgColor: 'bg-blue-50'
    },
    data: {
      icon: FileText,
      title: 'Sin datos',
      description: 'No hay datos disponibles',
      iconColor: 'text-gray-400',
      bgColor: 'bg-gray-50'
    },
    empty: {
      icon: Package,
      title: 'Sin elementos',
      description: 'No hay elementos para mostrar',
      iconColor: 'text-gray-400',
      bgColor: 'bg-gray-50'
    }
  };

  const config = preset ? presets[preset] : {};
  const Icon = CustomIcon || config.icon || FileText;
  const finalTitle = title || config.title;
  const finalDescription = description || config.description;
  const iconColor = config.iconColor || 'text-gray-400';
  const bgColor = config.bgColor || 'bg-gray-50';

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
      <div className={`${bgColor} rounded-full p-6 mb-4`}>
        <Icon className={iconColor} size={48} />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{finalTitle}</h3>
      <p className="text-gray-600 text-center max-w-md mb-6">{finalDescription}</p>
      {action && (
        <div>{action}</div>
      )}
    </div>
  );
};

EmptyState.propTypes = {
  preset: PropTypes.oneOf(['error', 'search', 'users', 'data', 'empty']),
  title: PropTypes.string,
  description: PropTypes.string,
  icon: PropTypes.elementType,
  action: PropTypes.node,
  className: PropTypes.string
};

export default EmptyState;
