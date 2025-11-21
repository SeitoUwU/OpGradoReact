import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Container, Plus, Filter, X, Gauge, Users, Building2, MapPin, Droplets, Calendar, Activity, TrendingDown, Edit2, Save, UserPlus } from 'lucide-react';
import { useAuth } from '../../AuthContext/AuthContextV2';
import { tanksAPI, usersAPI } from '../../services/apiV2.js';
import Button from '../../components/Button';
import Card, { CardHeader, CardBody } from '../../components/Card';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Checkbox from '../../components/Checkbox';
import EmptyState from '../../components/EmptyState';
import TankHistoryChart from './components/TankHistoryChart';

const TankIndex = () => {
  const { user } = useAuth();
  const [tanks, setTanks] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTank, setSelectedTank] = useState(null);
  const [tankHistory, setTankHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showEditCapacityModal, setShowEditCapacityModal] = useState(false);
  const [newCapacity, setNewCapacity] = useState('');
  const [capacityMode, setCapacityMode] = useState('set'); // 'set' o 'add'
  const [capacityToAdd, setCapacityToAdd] = useState('');
  const [assigningClient, setAssigningClient] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');

  const [filters, setFilters] = useState({
    clientId: '',
    type: '',
    status: ''
  });

  const [newTank, setNewTank] = useState({
    code: '',
    type: 'client',
    capacityLiters: '',
    location: '',
    clientId: '',
    useClientLocation: false
  });

  const [formErrors, setFormErrors] = useState({});

  const tankTypes = [
    { value: 'client', label: 'Tanque de Cliente' },
    { value: 'company', label: 'Tanque de Empresa' }
  ];

  const tankStatuses = [
    { value: 'active', label: 'Activo' },
    { value: 'inactive', label: 'Inactivo' },
    { value: 'maintenance', label: 'En Mantenimiento' }
  ];

  useEffect(() => {
    fetchTanks();
    if (user?.role?.toLowerCase() === 'admin') {
      fetchClients();
    }
  }, [user]);

  const fetchTanks = async () => {
    try {
      setLoading(true);
      const response = await tanksAPI.getTanks();
      setTanks(response.data || []);
    } catch (error) {
      toast.error('Error al cargar tanques');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await usersAPI.getClients();
      setClients(response || []);
    } catch (error) {
      toast.error('Error al cargar clientes');
      console.error(error);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!newTank.code.trim()) errors.code = 'El código es requerido';
    if (!newTank.capacityLiters || newTank.capacityLiters <= 0) errors.capacityLiters = 'La capacidad debe ser mayor a 0';
    if (newTank.type === 'client' && !newTank.clientId) errors.clientId = 'El cliente es requerido';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateTank = async () => {
    if (!validateForm()) return;
    try {
      setSaving(true);
      const tankData = {
        code: newTank.code,
        type: newTank.type, // Enviar en minúsculas como espera el backend
        capacityLiters: parseFloat(newTank.capacityLiters),
        location: newTank.location || undefined,
        clientId: newTank.type === 'client' ? newTank.clientId : undefined
      };

      await tanksAPI.createTank(tankData);
      toast.success('Tanque creado exitosamente');
      setShowCreateModal(false);
      resetForm();
      fetchTanks();
    } catch (error) {
      toast.error(error.message || 'Error al crear tanque');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setNewTank({
      code: '',
      type: 'client',
      capacityLiters: '',
      location: '',
      clientId: '',
      useClientLocation: false
    });
    setFormErrors({});
  };

  const handleClientChange = (clientId) => {
    const selectedClient = clients.find(c => c.id === clientId);
    setNewTank({
      ...newTank,
      clientId,
      location: newTank.useClientLocation && selectedClient?.address ? selectedClient.address : newTank.location
    });
  };

  const handleUseClientLocationChange = (checked) => {
    const selectedClient = clients.find(c => c.id === newTank.clientId);
    setNewTank({
      ...newTank,
      useClientLocation: checked,
      location: checked && selectedClient?.address ? selectedClient.address : ''
    });
  };

  const applyFilters = () => {
    let filtered = [...tanks];

    if (filters.clientId) {
      filtered = filtered.filter(tank => tank.client?.id === filters.clientId);
    }

    if (filters.type) {
      filtered = filtered.filter(tank => tank.type?.toLowerCase() === filters.type.toLowerCase());
    }

    if (filters.status) {
      filtered = filtered.filter(tank => tank.status?.toLowerCase() === filters.status.toLowerCase());
    }

    return filtered;
  };

  const clearFilters = () => {
    setFilters({ clientId: '', type: '', status: '' });
    setShowFilterModal(false);
  };

  const handleTankClick = async (tank) => {
    setSelectedTank(tank);
    setNewCapacity(tank.capacityLiters);
    setCapacityToAdd('');
    setCapacityMode('set');
    setSelectedClientId(tank.client?.id || '');
    setAssigningClient(false);
    setShowDetailModal(true);
    setLoadingHistory(true);
    try {
      const history = await tanksAPI.getTankHistory(tank.id);
      console.log('Historial recibido:', history);
      // El backend retorna directamente el array, no dentro de .data
      const historyArray = Array.isArray(history) ? history : (history.data || []);
      setTankHistory(historyArray);
    } catch (error) {
      toast.error('Error al cargar historial');
      console.error(error);
      setTankHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleOpenEditCapacity = () => {
    setNewCapacity(selectedTank.capacityLiters);
    setCapacityToAdd('');
    setCapacityMode('set');
    setShowEditCapacityModal(true);
  };

  const handleUpdateCapacity = async () => {
    let finalCapacity;

    if (capacityMode === 'set') {
      if (!newCapacity || newCapacity <= 0) {
        toast.error('La capacidad debe ser mayor a 0');
        return;
      }
      finalCapacity = parseFloat(newCapacity);
    } else {
      // Modo agregar
      if (!capacityToAdd || capacityToAdd <= 0) {
        toast.error('La cantidad a agregar debe ser mayor a 0');
        return;
      }
      finalCapacity = parseFloat(selectedTank.capacityLiters) + parseFloat(capacityToAdd);
    }

    try {
      setSaving(true);
      await tanksAPI.updateTank(selectedTank.id, { capacityLiters: finalCapacity });

      const message = capacityMode === 'set'
        ? 'Capacidad actualizada exitosamente'
        : `Se agregaron ${capacityToAdd}L a la capacidad del tanque`;

      toast.success(message);
      setShowEditCapacityModal(false);

      // Actualizar el tanque en la lista
      const updatedTank = await tanksAPI.getTankById(selectedTank.id);
      setSelectedTank(updatedTank);
      setTanks(tanks.map(t => t.id === selectedTank.id ? updatedTank : t));
    } catch (error) {
      toast.error(error.message || 'Error al actualizar capacidad');
    } finally {
      setSaving(false);
    }
  };

  const handleAssignClient = async () => {
    try {
      setSaving(true);
      await tanksAPI.assignClient(selectedTank.id, selectedClientId || null);
      toast.success(selectedClientId ? 'Cliente asignado exitosamente' : 'Cliente desasignado exitosamente');
      setAssigningClient(false);

      // Actualizar el tanque en la lista
      const updatedTank = await tanksAPI.getTankById(selectedTank.id);
      setSelectedTank(updatedTank);
      setTanks(tanks.map(t => t.id === selectedTank.id ? updatedTank : t));
    } catch (error) {
      toast.error(error.message || 'Error al asignar cliente');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status) => {
    const statusMap = {
      active: 'success',
      inactive: 'secondary',
      maintenance: 'warning',
      critical: 'danger'
    };
    return statusMap[status?.toLowerCase()] || 'secondary';
  };

  const getLevelColor = (percentage) => {
    if (percentage >= 70) return 'text-green-600';
    if (percentage >= 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const displayedTanks = Object.values(filters).some(v => v) ? applyFilters() : tanks;

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
            <div className="bg-blue-600 p-3 rounded-xl">
              <Container className="text-white" size={32} />
            </div>
            Gestión de Tanques
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
            {user?.role?.toLowerCase() === 'admin' && (
              <Button
                variant="primary"
                icon={<Plus size={20} />}
                onClick={() => setShowCreateModal(true)}
              >
                Crear Tanque
              </Button>
            )}
          </div>
        </div>

        {displayedTanks.length === 0 ? (
          <EmptyState
            preset="empty"
            title="No hay tanques"
            description="No se encontraron tanques con los filtros aplicados"
            icon={Container}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedTanks.map((tank) => (
              <Card key={tank.id} gradient hover onClick={() => handleTankClick(tank)} className="cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl ${tank.type?.toLowerCase() === 'company' ? 'bg-purple-500' : 'bg-blue-500'}`}>
                        <Container className="text-white" size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{tank.code}</h3>
                        <Badge variant={tank.type?.toLowerCase() === 'company' ? 'warning' : 'info'} size="sm">
                          {tank.type?.toLowerCase() === 'company' ? 'Empresa' : 'Cliente'}
                        </Badge>
                      </div>
                    </div>
                    <Badge variant={getStatusColor(tank.status)} size="sm">
                      {tank.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="space-y-3">
                    {/* Nivel de Gas */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Nivel de Gas</span>
                        <span className={`text-sm font-bold ${getLevelColor(tank.currentLevelPercentage || 0)}`}>
                          {tank.currentLevelPercentage?.toFixed(1) || 0}%
                        </span>
                      </div>
                      <div
                        className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 relative group cursor-pointer"
                        title={`${tank.currentLevelLiters?.toFixed(1) || 0}L de ${tank.capacityLiters || 0}L`}
                      >
                        <div
                          className={`h-2 rounded-full transition-all ${
                            (tank.currentLevelPercentage || 0) >= 70 ? 'bg-green-500' :
                            (tank.currentLevelPercentage || 0) >= 30 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${tank.currentLevelPercentage || 0}%` }}
                        />
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                          {tank.currentLevelLiters?.toFixed(1) || 0}L
                          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0L</span>
                        <span>{tank.capacityLiters?.toFixed(0) || 0}L</span>
                      </div>
                    </div>

                    {/* Cliente */}
                    {tank.client && (
                      <div className="flex items-center gap-2 text-sm">
                        <Users size={16} className="text-gray-400" />
                        <span>{tank.client.firstName} {tank.client.lastName}</span>
                      </div>
                    )}

                    {/* Ubicación */}
                    {tank.location && (
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin size={16} className="text-gray-400 mt-0.5" />
                        <span className="flex-1">{tank.location}</span>
                      </div>
                    )}

                    {/* Sensor */}
                    {tank.sensor && (
                      <div className="flex items-center gap-2 text-sm">
                        <Gauge size={16} className="text-gray-400" />
                        <span className="text-xs text-gray-500">{tank.sensor.serialNumber}</span>
                      </div>
                    )}

                    {/* Capacidad */}
                    <div className="flex items-center gap-2 text-sm">
                      <Droplets size={16} className="text-gray-400" />
                      <span>Capacidad: {tank.capacityLiters}L</span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal Crear Tanque */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => { setShowCreateModal(false); resetForm(); }}
        title="Crear Nuevo Tanque"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Código del Tanque"
              value={newTank.code}
              onChange={(e) => setNewTank({...newTank, code: e.target.value.toUpperCase()})}
              error={formErrors.code}
              placeholder="TK-001"
              required
            />
            <Select
              label="Tipo de Tanque"
              value={newTank.type}
              onChange={(v) => setNewTank({...newTank, type: v, clientId: v === 'company' ? '' : newTank.clientId})}
              options={tankTypes}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Capacidad (Litros)"
              type="number"
              value={newTank.capacityLiters}
              onChange={(e) => setNewTank({...newTank, capacityLiters: e.target.value})}
              error={formErrors.capacityLiters}
              placeholder="300"
              required
            />
            {newTank.type === 'client' && (
              <Select
                label="Cliente"
                value={newTank.clientId}
                onChange={handleClientChange}
                options={clients.map(c => ({
                  value: c.id,
                  label: `${c.firstName} ${c.lastName} - ${c.identificationNumber || c.email}`
                }))}
                error={formErrors.clientId}
                required
              />
            )}
          </div>

          {newTank.type === 'client' && newTank.clientId && newTank.clientId !== '' ? (
            <div className="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 pl-4 py-3 rounded">
              <Checkbox
                label="Usar la misma dirección del cliente"
                checked={newTank.useClientLocation}
                onChange={handleUseClientLocationChange}
                disabled={!newTank.clientId || !clients.find(c => c.id === newTank.clientId)?.address}
                helperText={
                  !newTank.clientId
                    ? 'Primero seleccione un cliente'
                    : !clients.find(c => c.id === newTank.clientId)?.address
                    ? 'El cliente no tiene una dirección registrada'
                    : newTank.useClientLocation
                    ? `Dirección: ${clients.find(c => c.id === newTank.clientId)?.address}`
                    : 'Marque esta opción para usar automáticamente la dirección registrada del cliente'
                }
              />
            </div>
          ) : null}

          <Input
            label="Ubicación del Tanque"
            value={newTank.location}
            onChange={(e) => setNewTank({...newTank, location: e.target.value, useClientLocation: false})}
            placeholder="Calle Principal 123, Col. Centro"
            disabled={newTank.useClientLocation}
          />

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Nota:</strong> El sensor se creará automáticamente al crear el tanque. El tanque iniciará con un nivel del 100%.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="ghost" onClick={() => { setShowCreateModal(false); resetForm(); }} disabled={saving}>
              Cancelar
            </Button>
            <Button variant="primary" icon={<Plus size={20} />} onClick={handleCreateTank} loading={saving}>
              Crear Tanque
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Filtros */}
      <Modal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        title="Filtrar Tanques"
      >
        <div className="space-y-4">
          {user?.role?.toLowerCase() === 'admin' && (
            <Select
              label="Cliente"
              value={filters.clientId}
              onChange={(v) => setFilters({...filters, clientId: v})}
              options={[
                { value: '', label: 'Todos los clientes' },
                ...clients.map(c => ({
                  value: c.id,
                  label: `${c.firstName} ${c.lastName}`
                }))
              ]}
            />
          )}
          <Select
            label="Tipo"
            value={filters.type}
            onChange={(v) => setFilters({...filters, type: v})}
            options={[
              { value: '', label: 'Todos los tipos' },
              ...tankTypes
            ]}
          />
          <Select
            label="Estado"
            value={filters.status}
            onChange={(v) => setFilters({...filters, status: v})}
            options={[
              { value: '', label: 'Todos los estados' },
              ...tankStatuses
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

      {/* Modal de Detalle del Tanque */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={`Detalle del Tanque ${selectedTank?.code || ''}`}
        size="xl"
      >
        {selectedTank && (
          <div className="space-y-6">
            {/* Información General */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardBody>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Container size={20} className="text-blue-600" />
                    Información General
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Código:</span>
                      <span className="font-semibold">{selectedTank.code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Tipo:</span>
                      <Badge variant={selectedTank.type?.toLowerCase() === 'company' ? 'warning' : 'info'} size="sm">
                        {selectedTank.type?.toLowerCase() === 'company' ? 'Empresa' : 'Cliente'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Estado:</span>
                      <Badge variant={getStatusColor(selectedTank.status)} size="sm">
                        {selectedTank.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Capacidad:</span>
                      <span className="font-semibold">{selectedTank.capacityLiters}L</span>
                    </div>
                    {selectedTank.location && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Ubicación:</span>
                        <span className="font-semibold text-right max-w-[200px] truncate" title={selectedTank.location}>
                          {selectedTank.location}
                        </span>
                      </div>
                    )}
                  </div>
                  {user?.role?.toLowerCase() === 'admin' && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<Edit2 size={16} />}
                        onClick={handleOpenEditCapacity}
                        className="w-full"
                      >
                        Modificar Capacidad
                      </Button>
                    </div>
                  )}
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Activity size={20} className="text-green-600" />
                    Nivel Actual
                  </h3>
                  <div className="space-y-3">
                    <div className="text-center">
                      <div className={`text-4xl font-bold ${getLevelColor(selectedTank.currentLevelPercentage || 0)}`}>
                        {selectedTank.currentLevelPercentage?.toFixed(1) || 0}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {selectedTank.currentLevelLiters?.toFixed(1) || 0}L de {selectedTank.capacityLiters || 0}L
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                      <div
                        className={`h-4 rounded-full transition-all ${
                          (selectedTank.currentLevelPercentage || 0) >= 70 ? 'bg-green-500' :
                          (selectedTank.currentLevelPercentage || 0) >= 30 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${selectedTank.currentLevelPercentage || 0}%` }}
                      />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Cliente y Sensor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cliente */}
              <Card>
                <CardBody>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Users size={20} className="text-purple-600" />
                      Cliente
                    </h3>
                    {user?.role?.toLowerCase() === 'admin' && !assigningClient && (
                      <button
                        onClick={() => setAssigningClient(true)}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        title={selectedTank.client ? "Reasignar cliente" : "Asignar cliente"}
                      >
                        <UserPlus size={16} />
                      </button>
                    )}
                  </div>

                  {!assigningClient ? (
                    selectedTank.client ? (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Nombre:</span>
                          <span className="font-semibold">{selectedTank.client.firstName} {selectedTank.client.lastName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Email:</span>
                          <span className="font-semibold">{selectedTank.client.email}</span>
                        </div>
                        {selectedTank.client.phone && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Teléfono:</span>
                            <span className="font-semibold">{selectedTank.client.phone}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-500">Sin cliente asignado</p>
                      </div>
                    )
                  ) : (
                    <div className="space-y-3">
                      <Select
                        label="Seleccionar Cliente"
                        value={selectedClientId}
                        onChange={setSelectedClientId}
                        options={[
                          { value: '', label: 'Sin cliente (desasignar)' },
                          ...clients.filter(c => c.isActive !== false).map(c => ({
                            value: c.id,
                            label: `${c.firstName} ${c.lastName} - ${c.identificationNumber || c.email}`
                          }))
                        ]}
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={handleAssignClient}
                          loading={saving}
                          icon={<Save size={14} />}
                        >
                          Guardar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setAssigningClient(false);
                            setSelectedClientId(selectedTank.client?.id || '');
                          }}
                          disabled={saving}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  )}
                </CardBody>
              </Card>

              {/* Sensor */}
              {selectedTank.sensor && (
                <Card>
                  <CardBody>
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <Gauge size={20} className="text-orange-600" />
                      Sensor
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Serial:</span>
                        <span className="font-semibold text-xs">{selectedTank.sensor.serialNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Estado:</span>
                        <Badge variant={selectedTank.sensor.status === 'active' ? 'success' : 'secondary'} size="sm">
                          {selectedTank.sensor.status}
                        </Badge>
                      </div>
                      {selectedTank.sensor.lastReadingDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Última lectura:</span>
                          <span className="font-semibold text-xs">
                            {new Date(selectedTank.sensor.lastReadingDate).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardBody>
                </Card>
              )}
            </div>

            {/* Historial de Monitoreo - Visualización Gráfica */}
            {loadingHistory ? (
              <Card>
                <CardBody>
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                </CardBody>
              </Card>
            ) : (
              <TankHistoryChart
                history={tankHistory}
                tankCapacity={selectedTank?.capacityLiters || 0}
              />
            )}

            <div className="flex justify-end">
              <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Modificar Capacidad */}
      <Modal
        isOpen={showEditCapacityModal}
        onClose={() => setShowEditCapacityModal(false)}
        title="Modificar Capacidad del Tanque"
        size="md"
      >
        {selectedTank && (
          <div className="space-y-6">
            {/* Info del tanque */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Container size={24} className="text-blue-600" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedTank.code}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Capacidad actual: <span className="font-bold">{selectedTank.capacityLiters}L</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Selector de modo */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                ¿Qué deseas hacer?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setCapacityMode('set')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    capacityMode === 'set'
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Edit2 size={20} className={`mx-auto mb-2 ${capacityMode === 'set' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <p className={`text-sm font-medium ${capacityMode === 'set' ? 'text-blue-600' : 'text-gray-600 dark:text-gray-400'}`}>
                    Establecer nueva capacidad
                  </p>
                </button>
                <button
                  onClick={() => setCapacityMode('add')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    capacityMode === 'add'
                      ? 'border-green-600 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Plus size={20} className={`mx-auto mb-2 ${capacityMode === 'add' ? 'text-green-600' : 'text-gray-400'}`} />
                  <p className={`text-sm font-medium ${capacityMode === 'add' ? 'text-green-600' : 'text-gray-600 dark:text-gray-400'}`}>
                    Ampliar capacidad
                  </p>
                </button>
              </div>
            </div>

            {/* Inputs según modo */}
            {capacityMode === 'set' ? (
              <div className="space-y-2">
                <Input
                  label="Nueva capacidad (Litros)"
                  type="number"
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(e.target.value)}
                  placeholder="Ej: 500"
                  min="1"
                  required
                />
                <p className="text-xs text-gray-500">
                  Establece una nueva capacidad total para el tanque
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <Input
                  label="Capacidad a agregar (Litros)"
                  type="number"
                  value={capacityToAdd}
                  onChange={(e) => setCapacityToAdd(e.target.value)}
                  placeholder="Ej: 100"
                  min="1"
                  required
                />
                {capacityToAdd && parseFloat(capacityToAdd) > 0 && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-semibold text-green-600 dark:text-green-400">Nueva capacidad:</span>{' '}
                      {selectedTank.capacityLiters}L + {capacityToAdd}L = {' '}
                      <span className="font-bold text-green-700 dark:text-green-300">
                        {(parseFloat(selectedTank.capacityLiters) + parseFloat(capacityToAdd)).toFixed(0)}L
                      </span>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="ghost"
                onClick={() => setShowEditCapacityModal(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                icon={<Save size={20} />}
                onClick={handleUpdateCapacity}
                loading={saving}
              >
                Guardar Cambios
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default TankIndex;
