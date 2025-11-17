import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Gauge, Activity, Zap, AlertTriangle, CheckCircle, XCircle, Filter, X, Container } from 'lucide-react';
import { useAuth } from '../../AuthContext/AuthContextV2';
import { tanksAPI } from '../../services/apiV2.js';
import Button from '../../components/Button';
import Card, { CardHeader, CardBody } from '../../components/Card';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import Select from '../../components/Select';
import EmptyState from '../../components/EmptyState';

const SensorIndex = () => {
  const { user } = useAuth();
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const [filters, setFilters] = useState({
    status: '',
    tankType: ''
  });

  const sensorStatuses = [
    { value: 'active', label: 'Activo' },
    { value: 'inactive', label: 'Inactivo' },
    { value: 'maintenance', label: 'Mantenimiento' },
    { value: 'error', label: 'Error' }
  ];

  const tankTypes = [
    { value: 'client', label: 'Tanque de Cliente' },
    { value: 'company', label: 'Tanque de Empresa' }
  ];

  useEffect(() => {
    fetchSensors();
  }, []);

  const fetchSensors = async () => {
    try {
      setLoading(true);
      const response = await tanksAPI.getTanks();
      const tanks = response.data || [];

      // Extraer sensores de los tanques que los tienen
      const sensorsFromTanks = tanks
        .filter(tank => tank.sensor)
        .map(tank => ({
          ...tank.sensor,
          tankId: tank.id,
          tankCode: tank.code,
          tankType: tank.type,
          tankLocation: tank.location,
          tankCapacity: tank.capacityLiters,
          currentLevel: tank.currentLevelPercentage,
          clientName: tank.client ? `${tank.client.firstName} ${tank.client.lastName}` : null
        }));

      setSensors(sensorsFromTanks);
    } catch (error) {
      toast.error('Error al cargar sensores');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...sensors];

    if (filters.status) {
      filtered = filtered.filter(sensor => sensor.status?.toLowerCase() === filters.status.toLowerCase());
    }

    if (filters.tankType) {
      filtered = filtered.filter(sensor => sensor.tankType?.toLowerCase() === filters.tankType.toLowerCase());
    }

    return filtered;
  };

  const clearFilters = () => {
    setFilters({ status: '', tankType: '' });
    setShowFilterModal(false);
  };

  const getStatusIcon = (status) => {
    const statusMap = {
      active: <CheckCircle className="text-green-500" size={20} />,
      inactive: <XCircle className="text-gray-400" size={20} />,
      maintenance: <AlertTriangle className="text-yellow-500" size={20} />,
      error: <XCircle className="text-red-500" size={20} />
    };
    return statusMap[status?.toLowerCase()] || <Gauge className="text-gray-400" size={20} />;
  };

  const getStatusColor = (status) => {
    const statusMap = {
      active: 'success',
      inactive: 'secondary',
      maintenance: 'warning',
      error: 'danger'
    };
    return statusMap[status?.toLowerCase()] || 'secondary';
  };

  const getLevelColor = (percentage) => {
    if (percentage >= 70) return 'bg-green-500';
    if (percentage >= 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('es-CO', {
      dateStyle: 'short',
      timeStyle: 'short'
    });
  };

  const displayedSensors = Object.values(filters).some(v => v) ? applyFilters() : sensors;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-3 rounded-xl shadow-lg">
              <Gauge className="text-white" size={32} />
            </div>
            Gestión de Sensores
          </h1>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              icon={<Filter size={20} />}
              onClick={() => setShowFilterModal(true)}
            >
              Filtros
              {Object.values(filters).some(v => v) && (
                <Badge variant="primary" size="sm" className="ml-2">
                  {Object.values(filters).filter(v => v).length}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card gradient>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Sensores</p>
                  <p className="text-3xl font-bold">{sensors.length}</p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-xl">
                  <Gauge className="text-blue-600 dark:text-blue-400" size={24} />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card gradient>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Activos</p>
                  <p className="text-3xl font-bold text-green-600">
                    {sensors.filter(s => s.status?.toLowerCase() === 'active').length}
                  </p>
                </div>
                <div className="bg-green-100 dark:bg-green-900 p-3 rounded-xl">
                  <CheckCircle className="text-green-600 dark:text-green-400" size={24} />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card gradient>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Inactivos</p>
                  <p className="text-3xl font-bold text-gray-600">
                    {sensors.filter(s => s.status?.toLowerCase() === 'inactive').length}
                  </p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded-xl">
                  <XCircle className="text-gray-600 dark:text-gray-400" size={24} />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card gradient>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">En Mantenimiento</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {sensors.filter(s => s.status?.toLowerCase() === 'maintenance').length}
                  </p>
                </div>
                <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-xl">
                  <AlertTriangle className="text-yellow-600 dark:text-yellow-400" size={24} />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {displayedSensors.length === 0 ? (
          <EmptyState
            preset="empty"
            title="No hay sensores"
            description="No se encontraron sensores con los filtros aplicados"
            icon={Gauge}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedSensors.map((sensor) => (
              <Card key={sensor.id} gradient hover>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-3 rounded-xl shadow-lg">
                        <Gauge className="text-white" size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{sensor.serialNumber}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusIcon(sensor.status)}
                          <Badge variant={getStatusColor(sensor.status)} size="sm">
                            {sensor.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="space-y-3">
                    {/* Tanque Asociado */}
                    <div className="flex items-center gap-2 text-sm">
                      <Container size={16} className="text-gray-400" />
                      <span className="font-semibold">{sensor.tankCode}</span>
                      <Badge variant={sensor.tankType?.toLowerCase() === 'company' ? 'warning' : 'info'} size="sm">
                        {sensor.tankType?.toLowerCase() === 'company' ? 'Empresa' : 'Cliente'}
                      </Badge>
                    </div>

                    {/* Cliente */}
                    {sensor.clientName && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Cliente: <span className="font-medium">{sensor.clientName}</span>
                      </div>
                    )}

                    {/* Última Lectura */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-500">Última Lectura</span>
                        <span className="text-sm font-bold">
                          {sensor.lastReading?.toFixed(1) || 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${getLevelColor(sensor.lastReading || 0)}`}
                          style={{ width: `${sensor.lastReading || 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Fecha de Última Lectura */}
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Activity size={14} />
                      <span>Última actividad: {formatDate(sensor.lastReadingDate)}</span>
                    </div>

                    {/* Ubicación del Tanque */}
                    {sensor.tankLocation && (
                      <div className="text-xs text-gray-500 truncate" title={sensor.tankLocation}>
                        {sensor.tankLocation}
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal Filtros */}
      <Modal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        title="Filtrar Sensores"
      >
        <div className="space-y-4">
          <Select
            label="Estado"
            value={filters.status}
            onChange={(v) => setFilters({...filters, status: v})}
            options={[
              { value: '', label: 'Todos los estados' },
              ...sensorStatuses
            ]}
          />
          <Select
            label="Tipo de Tanque"
            value={filters.tankType}
            onChange={(v) => setFilters({...filters, tankType: v})}
            options={[
              { value: '', label: 'Todos los tipos' },
              ...tankTypes
            ]}
          />

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="ghost" icon={<X size={20} />} onClick={clearFilters}>
              Limpiar
            </Button>
            <Button variant="primary" icon={<Filter size={20} />} onClick={() => setShowFilterModal(false)}>
              Aplicar
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default SensorIndex;
