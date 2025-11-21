import React, { useState, useEffect } from 'react';
import { useAuth } from '../../AuthContext/AuthContextV2';
import {
    Calendar,
    Clock,
    Container,
    Plus,
    Edit,
    XCircle,
    CheckCircle,
    AlertCircle,
    Play,
    Filter,
    Truck,
    List,
    CalendarDays,
    Gauge
} from 'lucide-react';
import Card, { CardHeader, CardBody } from '../../components/Card';
import { rechargesAPI, tanksAPI } from '../../services/apiV2.js';
import { toast } from 'react-hot-toast';
import Button from '../../components/Button';
import CalendarView from './CalendarView';

const Recharges = () => {
    const { user } = useAuth();
    const [recharges, setRecharges] = useState([]);
    const [tanks, setTanks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('scheduled');
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedRecharge, setSelectedRecharge] = useState(null);
    const [formData, setFormData] = useState({
        tankId: '',
        scheduledDate: '',
        estimatedAmount: '',
        notes: ''
    });
    const [rescheduleData, setRescheduleData] = useState({
        newDate: '',
        reason: ''
    });
    const [cancelReason, setCancelReason] = useState('');

    const isAdmin = user?.role?.toLowerCase() === 'admin';

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [rechargesRes, tanksRes] = await Promise.all([
                rechargesAPI.getRecharges(),
                tanksAPI.getTanks()
            ]);
            setRecharges(rechargesRes.data || []);
            setTanks(tanksRes.data || []);
        } catch (error) {
            console.error('Error cargando reabastecimientos:', error);
            toast.error('Error al cargar reabastecimientos');
        } finally {
            setLoading(false);
        }
    };

    const getTankName = (recharge) => {
        // Las recargas vienen con el objeto tank incluido desde el backend
        if (recharge.tank) {
            return recharge.tank.code || recharge.tank.name || 'Tanque Desconocido';
        }
        // Fallback: buscar en la lista de tanques si no viene el objeto
        if (recharge.tankId) {
            const tank = tanks.find(t => t.id === recharge.tankId);
            return tank ? (tank.code || tank.name) : 'Tanque Desconocido';
        }
        return 'Tanque Desconocido';
    };

    const getStatusConfig = (status) => {
        switch (status) {
            case 'scheduled':
                return {
                    label: 'Programado',
                    color: 'blue',
                    bgColor: 'bg-blue-100',
                    textColor: 'text-blue-700',
                    badgeBg: 'bg-blue-500'
                };
            case 'in_progress':
                return {
                    label: 'En Progreso',
                    color: 'yellow',
                    bgColor: 'bg-yellow-100',
                    textColor: 'text-yellow-700',
                    badgeBg: 'bg-yellow-500'
                };
            case 'completed':
                return {
                    label: 'Completado',
                    color: 'green',
                    bgColor: 'bg-green-100',
                    textColor: 'text-green-700',
                    badgeBg: 'bg-green-500'
                };
            case 'cancelled':
                return {
                    label: 'Cancelado',
                    color: 'red',
                    bgColor: 'bg-red-100',
                    textColor: 'text-red-700',
                    badgeBg: 'bg-red-500'
                };
            case 'rescheduled':
                return {
                    label: 'Reprogramado',
                    color: 'purple',
                    bgColor: 'bg-purple-100',
                    textColor: 'text-purple-700',
                    badgeBg: 'bg-purple-500'
                };
            default:
                return {
                    label: status,
                    color: 'gray',
                    bgColor: 'bg-gray-100',
                    textColor: 'text-gray-700',
                    badgeBg: 'bg-gray-500'
                };
        }
    };

    const handleCreateRecharge = async (e) => {
        e.preventDefault();

        if (!formData.tankId || !formData.scheduledDate || !formData.estimatedAmount) {
            toast.error('Por favor completa todos los campos requeridos');
            return;
        }

        try {
            await rechargesAPI.createRecharge({
                tankId: formData.tankId,
                scheduledDate: formData.scheduledDate,
                estimatedQuantityLiters: parseFloat(formData.estimatedAmount),
                notes: formData.notes
            });
            toast.success('Reabastecimiento programado exitosamente');
            setShowCreateModal(false);
            resetForm();
            loadData();
        } catch (error) {
            console.error('Error creando reabastecimiento:', error);
            toast.error(error.response?.data?.message || 'Error al programar reabastecimiento');
        }
    };

    const handleReschedule = async (e) => {
        e.preventDefault();

        if (!selectedRecharge || !rescheduleData.newDate || !rescheduleData.reason) {
            toast.error('Por favor completa todos los campos');
            return;
        }

        try {
            await rechargesAPI.rescheduleRecharge(selectedRecharge.id, rescheduleData);
            toast.success('Reabastecimiento reprogramado exitosamente');
            setShowRescheduleModal(false);
            setRescheduleData({ newDate: '', reason: '' });
            setSelectedRecharge(null);
            loadData();
        } catch (error) {
            console.error('Error reprogramando:', error);
            toast.error('Error al reprogramar');
        }
    };

    const handleStart = async (rechargeId) => {
        try {
            await rechargesAPI.startRecharge(rechargeId);
            toast.success('Reabastecimiento iniciado');
            loadData();
        } catch (error) {
            console.error('Error iniciando reabastecimiento:', error);
            toast.error('Error al iniciar reabastecimiento');
        }
    };

    const openCancelModal = (recharge) => {
        setSelectedRecharge(recharge);
        setShowCancelModal(true);
    };

    const handleCancel = async (e) => {
        e.preventDefault();

        if (!cancelReason.trim()) {
            toast.error('Por favor ingresa el motivo de cancelación');
            return;
        }

        try {
            await rechargesAPI.cancelRecharge(selectedRecharge.id, cancelReason);
            toast.success('Reabastecimiento cancelado');
            setShowCancelModal(false);
            setCancelReason('');
            setSelectedRecharge(null);
            loadData();
        } catch (error) {
            console.error('Error cancelando reabastecimiento:', error);
            toast.error('Error al cancelar');
        }
    };

    const resetForm = () => {
        setFormData({
            tankId: '',
            scheduledDate: '',
            estimatedAmount: '',
            notes: ''
        });
    };

    const openRescheduleModal = (recharge) => {
        setSelectedRecharge(recharge);
        setShowRescheduleModal(true);
    };

    const openDetailModal = (recharge) => {
        setSelectedRecharge(recharge);
        setShowDetailModal(true);
    };

    const filteredRecharges = recharges.filter(recharge => {
        if (filter === 'all') return true;
        return recharge.status === filter;
    });

    const userTanks = isAdmin ? tanks : tanks.filter(t => t.clientId === user?.id);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-8 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
                            <Calendar size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Reabastecimientos</h1>
                            <p className="text-blue-100">
                                Programa y gestiona los reabastecimientos de tus tanques
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="flex gap-1 bg-white/20 rounded-lg p-1 backdrop-blur-sm">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                                    viewMode === 'list'
                                        ? 'bg-white text-blue-600 shadow-md'
                                        : 'text-white hover:bg-white/10'
                                }`}
                            >
                                <List size={18} />
                                Lista
                            </button>
                            <button
                                onClick={() => setViewMode('calendar')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                                    viewMode === 'calendar'
                                        ? 'bg-white text-blue-600 shadow-md'
                                        : 'text-white hover:bg-white/10'
                                }`}
                            >
                                <CalendarDays size={18} />
                                Calendario
                            </button>
                        </div>
                        <Button
                            variant="primary"
                            className="bg-white text-blue-600 hover:bg-blue-50"
                            onClick={() => setShowCreateModal(true)}
                            icon={<Plus size={20} />}
                        >
                            Programar Reabastecimiento
                        </Button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardBody>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-600 text-sm font-medium mb-1">Programados</p>
                                <p className="text-3xl font-bold text-blue-700">
                                    {recharges.filter(r => r.status === 'scheduled').length}
                                </p>
                            </div>
                            <Calendar className="text-blue-500" size={40} />
                        </div>
                    </CardBody>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                    <CardBody>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-yellow-600 text-sm font-medium mb-1">En Progreso</p>
                                <p className="text-3xl font-bold text-yellow-700">
                                    {recharges.filter(r => r.status === 'in_progress').length}
                                </p>
                            </div>
                            <Truck className="text-yellow-500" size={40} />
                        </div>
                    </CardBody>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardBody>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-600 text-sm font-medium mb-1">Completados</p>
                                <p className="text-3xl font-bold text-green-700">
                                    {recharges.filter(r => r.status === 'completed').length}
                                </p>
                            </div>
                            <CheckCircle className="text-green-500" size={40} />
                        </div>
                    </CardBody>
                </Card>

                <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                    <CardBody>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-red-600 text-sm font-medium mb-1">Cancelados</p>
                                <p className="text-3xl font-bold text-red-700">
                                    {recharges.filter(r => r.status === 'cancelled').length}
                                </p>
                            </div>
                            <XCircle className="text-red-500" size={40} />
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Filters - Only show in list view */}
            {viewMode === 'list' && (
                <Card>
                    <CardBody>
                        <div className="flex items-center gap-2 flex-wrap">
                            <Filter className="text-gray-500" size={20} />
                            <span className="text-gray-700 font-medium mr-2">Filtrar:</span>
                            <button
                                onClick={() => setFilter('scheduled')}
                                className={`px-4 py-2 rounded-lg transition-all ${
                                    filter === 'scheduled'
                                        ? 'bg-blue-500 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Programados
                            </button>
                            <button
                                onClick={() => setFilter('in_progress')}
                                className={`px-4 py-2 rounded-lg transition-all ${
                                    filter === 'in_progress'
                                        ? 'bg-yellow-500 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                En Progreso
                            </button>
                            <button
                                onClick={() => setFilter('completed')}
                                className={`px-4 py-2 rounded-lg transition-all ${
                                    filter === 'completed'
                                        ? 'bg-green-500 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Completados
                            </button>
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-4 py-2 rounded-lg transition-all ${
                                    filter === 'all'
                                        ? 'bg-purple-500 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Todos
                            </button>
                        </div>
                    </CardBody>
                </Card>
            )}

            {/* Calendar View */}
            {viewMode === 'calendar' ? (
                <CalendarView
                    recharges={recharges}
                    tanks={tanks}
                    onEventClick={openDetailModal}
                />
            ) : (
                <>
                    {/* Recharges List */}
            <div className="grid grid-cols-1 gap-4">
                {filteredRecharges.length === 0 ? (
                    <Card>
                        <CardBody>
                            <div className="text-center py-12">
                                <Calendar className="mx-auto mb-4 text-gray-400" size={64} />
                                <p className="text-xl font-medium text-gray-700">No hay reabastecimientos</p>
                                <p className="text-gray-500 mt-2">
                                    Programa un nuevo reabastecimiento para tus tanques
                                </p>
                            </div>
                        </CardBody>
                    </Card>
                ) : (
                    filteredRecharges.map((recharge) => {
                        const statusConfig = getStatusConfig(recharge.status);
                        const scheduledDate = new Date(recharge.scheduledDate);
                        const isUpcoming = scheduledDate > new Date();

                        return (
                            <Card
                                key={recharge.id}
                                className={`border-l-4 border-${statusConfig.color}-500 hover:shadow-xl transition-all`}
                            >
                                <CardBody>
                                    <div className="flex items-start gap-4">
                                        <div className={`${statusConfig.bgColor} p-3 rounded-xl`}>
                                            <Container className={statusConfig.textColor} size={24} />
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="text-lg font-bold text-gray-900">
                                                            {getTankName(recharge)}
                                                        </h3>
                                                        <span className={`${statusConfig.badgeBg} text-white text-xs px-3 py-1 rounded-full font-medium`}>
                                                            {statusConfig.label}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                                        <span className="flex items-center gap-1">
                                                            <Clock size={14} />
                                                            Programado: {scheduledDate.toLocaleString('es-CO')}
                                                        </span>
                                                        {recharge.estimatedAmount && (
                                                            <span className="font-medium">
                                                                Cantidad: {recharge.estimatedAmount} L
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {recharge.notes && (
                                                <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
                                                    <strong>Notas:</strong> {recharge.notes}
                                                </div>
                                            )}

                                            {recharge.completedAt && (
                                                <div className="mt-2 text-sm text-green-600">
                                                    <strong>Completado:</strong> {new Date(recharge.completedAt).toLocaleString('es-CO')}
                                                </div>
                                            )}

                                            {/* Actions */}
                                            {recharge.status === 'scheduled' && (
                                                <div className="flex gap-2 mt-4">
                                                    {isAdmin && (
                                                        <Button
                                                            variant="primary"
                                                            size="sm"
                                                            onClick={() => handleStart(recharge.id)}
                                                            icon={<Play size={16} />}
                                                        >
                                                            Iniciar
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="warning"
                                                        size="sm"
                                                        onClick={() => openRescheduleModal(recharge)}
                                                        icon={<Edit size={16} />}
                                                    >
                                                        Reprogramar
                                                    </Button>
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => openCancelModal(recharge)}
                                                        icon={<XCircle size={16} />}
                                                    >
                                                        Cancelar
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        );
                    })
                )}
            </div>
                </>
            )}

            {/* Detail Modal - for calendar events */}
            {showDetailModal && selectedRecharge && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <Card className="max-w-2xl w-full">
                        <CardHeader>
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Container className="text-blue-600" size={24} />
                                Detalles del Reabastecimiento
                            </h3>
                        </CardHeader>
                        <CardBody>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Tanque</p>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {getTankName(selectedRecharge)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Estado</p>
                                        <div className="mt-1">
                                            {(() => {
                                                const statusConfig = getStatusConfig(selectedRecharge.status);
                                                return (
                                                    <span className={`${statusConfig.badgeBg} text-white text-sm px-3 py-1 rounded-full font-medium`}>
                                                        {statusConfig.label}
                                                    </span>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Fecha Programada</p>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {new Date(selectedRecharge.scheduledDate).toLocaleString('es-CO')}
                                        </p>
                                    </div>
                                    {selectedRecharge.estimatedQuantityLiters && (
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Cantidad Estimada</p>
                                            <p className="text-lg font-semibold text-gray-900">
                                                {selectedRecharge.estimatedQuantityLiters} Litros
                                            </p>
                                        </div>
                                    )}
                                    {selectedRecharge.completedAt && (
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Completado</p>
                                            <p className="text-lg font-semibold text-green-600">
                                                {new Date(selectedRecharge.completedAt).toLocaleString('es-CO')}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {selectedRecharge.notes && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 mb-2">Notas</p>
                                        <p className="p-3 bg-gray-50 rounded-lg text-gray-700">
                                            {selectedRecharge.notes}
                                        </p>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="pt-4 border-t">
                                    {selectedRecharge.status === 'scheduled' ? (
                                        <div className="flex gap-2 justify-end">
                                            {isAdmin && (
                                                <Button
                                                    variant="primary"
                                                    onClick={() => {
                                                        setShowDetailModal(false);
                                                        handleStart(selectedRecharge.id);
                                                    }}
                                                    icon={<Play size={16} />}
                                                >
                                                    Iniciar
                                                </Button>
                                            )}
                                            <Button
                                                variant="warning"
                                                onClick={() => {
                                                    setShowDetailModal(false);
                                                    openRescheduleModal(selectedRecharge);
                                                }}
                                                icon={<Edit size={16} />}
                                            >
                                                Reprogramar
                                            </Button>
                                            <Button
                                                variant="danger"
                                                onClick={() => {
                                                    setShowDetailModal(false);
                                                    openCancelModal(selectedRecharge);
                                                }}
                                                icon={<XCircle size={16} />}
                                            >
                                                Cancelar
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex justify-end">
                                            <Button
                                                variant="secondary"
                                                onClick={() => setShowDetailModal(false)}
                                            >
                                                Cerrar
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            )}

            {/* Create Modal - Mejorado */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                                        <Truck size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">Programar Reabastecimiento</h3>
                                        <p className="text-blue-100 text-sm mt-1">Complete los datos para programar el servicio</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        resetForm();
                                    }}
                                    className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                                >
                                    <XCircle size={24} />
                                </button>
                            </div>
                        </CardHeader>
                        <CardBody>
                            <form onSubmit={handleCreateRecharge} className="space-y-6">
                                {/* Información del tanque seleccionado */}
                                {formData.tankId && tanks.find(t => t.id === formData.tankId) && (() => {
                                    const selectedTank = tanks.find(t => t.id === formData.tankId);
                                    const nivelActual = selectedTank.currentLevelPercentage || 0;
                                    const capacidadRestante = selectedTank.capacityLiters - selectedTank.currentLevelLiters;

                                    return (
                                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                            <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                                <Container size={18} />
                                                Información del Tanque
                                            </h4>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                <div>
                                                    <p className="text-blue-600 font-medium">Código</p>
                                                    <p className="text-blue-900 font-bold">{selectedTank.code}</p>
                                                </div>
                                                <div>
                                                    <p className="text-blue-600 font-medium">Nivel Actual</p>
                                                    <p className="text-blue-900 font-bold">{nivelActual.toFixed(1)}%</p>
                                                </div>
                                                <div>
                                                    <p className="text-blue-600 font-medium">Capacidad Total</p>
                                                    <p className="text-blue-900 font-bold">{selectedTank.capacityLiters} L</p>
                                                </div>
                                                <div>
                                                    <p className="text-blue-600 font-medium">Espacio Disponible</p>
                                                    <p className="text-blue-900 font-bold">{capacidadRestante.toFixed(0)} L</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Seleccionar Tanque *
                                        </label>
                                        <div className="relative">
                                            <Container className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                            <select
                                                value={formData.tankId}
                                                onChange={(e) => setFormData({ ...formData, tankId: e.target.value })}
                                                className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                required
                                            >
                                                <option value="">Seleccione un tanque</option>
                                                {userTanks.map(tank => (
                                                    <option key={tank.id} value={tank.id}>
                                                        {tank.code} - {tank.location} ({tank.currentLevelPercentage?.toFixed(1)}% - {tank.capacityLiters}L)
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Fecha y Hora *
                                        </label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                            <input
                                                type="datetime-local"
                                                value={formData.scheduledDate}
                                                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                                                min={new Date().toISOString().slice(0, 16)}
                                                className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                required
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Seleccione la fecha y hora del servicio</p>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Cantidad a Reabastecer *
                                        </label>

                                        {/* Botones de opciones rápidas */}
                                        {formData.tankId && tanks.find(t => t.id === formData.tankId) && (() => {
                                            const selectedTank = tanks.find(t => t.id === formData.tankId);
                                            const capacidadRestante = selectedTank.capacityLiters - selectedTank.currentLevelLiters;
                                            const mediaCarga = capacidadRestante / 2;
                                            const tresCuartos = (capacidadRestante * 0.75);

                                            return (
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, estimatedAmount: capacidadRestante.toFixed(2) })}
                                                        className="p-3 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-lg hover:shadow-md transition-all text-left"
                                                    >
                                                        <div className="text-xs text-green-600 font-medium mb-1">Llenar Tanque</div>
                                                        <div className="text-lg font-bold text-green-700">{capacidadRestante.toFixed(0)} L</div>
                                                        <div className="text-xs text-green-600">100% capacidad</div>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, estimatedAmount: tresCuartos.toFixed(2) })}
                                                        className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg hover:shadow-md transition-all text-left"
                                                    >
                                                        <div className="text-xs text-blue-600 font-medium mb-1">3/4 de Tanque</div>
                                                        <div className="text-lg font-bold text-blue-700">{tresCuartos.toFixed(0)} L</div>
                                                        <div className="text-xs text-blue-600">75% capacidad</div>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, estimatedAmount: mediaCarga.toFixed(2) })}
                                                        className="p-3 bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-lg hover:shadow-md transition-all text-left"
                                                    >
                                                        <div className="text-xs text-yellow-600 font-medium mb-1">Media Carga</div>
                                                        <div className="text-lg font-bold text-yellow-700">{mediaCarga.toFixed(0)} L</div>
                                                        <div className="text-xs text-yellow-600">50% capacidad</div>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, estimatedAmount: '' })}
                                                        className="p-3 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-lg hover:shadow-md transition-all text-left"
                                                    >
                                                        <div className="text-xs text-gray-600 font-medium mb-1">Personalizar</div>
                                                        <div className="text-lg font-bold text-gray-700">✏️</div>
                                                        <div className="text-xs text-gray-600">Cantidad manual</div>
                                                    </button>
                                                </div>
                                            );
                                        })()}

                                        {/* Input manual */}
                                        <div className="relative">
                                            <Gauge className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                            <input
                                                type="number"
                                                value={formData.estimatedAmount}
                                                onChange={(e) => setFormData({ ...formData, estimatedAmount: e.target.value })}
                                                className="w-full pl-11 pr-20 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                placeholder="Ingrese la cantidad en litros"
                                                min="1"
                                                step="0.01"
                                                required
                                            />
                                            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                                                Litros
                                            </span>
                                        </div>
                                        {formData.estimatedAmount && formData.tankId && tanks.find(t => t.id === formData.tankId) && (() => {
                                            const selectedTank = tanks.find(t => t.id === formData.tankId);
                                            const capacidadRestante = selectedTank.capacityLiters - selectedTank.currentLevelLiters;
                                            const cantidad = parseFloat(formData.estimatedAmount);
                                            const porcentaje = ((cantidad / capacidadRestante) * 100).toFixed(1);

                                            return (
                                                <p className="text-xs text-gray-600 mt-2 flex items-center gap-2">
                                                    <span className={`px-2 py-1 rounded ${
                                                        cantidad > capacidadRestante
                                                            ? 'bg-red-100 text-red-700'
                                                            : 'bg-green-100 text-green-700'
                                                    }`}>
                                                        {cantidad > capacidadRestante
                                                            ? '⚠️ Excede la capacidad disponible'
                                                            : `✓ ${porcentaje}% del espacio disponible`
                                                        }
                                                    </span>
                                                </p>
                                            );
                                        })()}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Notas o Instrucciones Especiales
                                        </label>
                                        <textarea
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                                            rows="4"
                                            placeholder="Agregue cualquier información adicional, instrucciones especiales o comentarios..."
                                        />
                                    </div>
                                </div>

                                {/* Botones de acción */}
                                <div className="flex gap-3 justify-end pt-4 border-t">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => {
                                            setShowCreateModal(false);
                                            resetForm();
                                        }}
                                        icon={<XCircle size={18} />}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        icon={<CheckCircle size={18} />}
                                        className="px-6"
                                    >
                                        Confirmar Programación
                                    </Button>
                                </div>
                            </form>
                        </CardBody>
                    </Card>
                </div>
            )}

            {/* Cancel Modal */}
            {showCancelModal && selectedRecharge && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <Card className="max-w-lg w-full shadow-2xl">
                        <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                                    <AlertCircle size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">Cancelar Reabastecimiento</h3>
                                    <p className="text-red-100 text-sm mt-1">Esta acción no se puede deshacer</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardBody>
                            <form onSubmit={handleCancel} className="space-y-4">
                                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm text-red-800 mb-2">
                                        <strong>Tanque:</strong> {getTankName(selectedRecharge)}
                                    </p>
                                    <p className="text-sm text-red-800">
                                        <strong>Fecha Programada:</strong> {new Date(selectedRecharge.scheduledDate).toLocaleString('es-CO')}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Motivo de Cancelación *
                                    </label>
                                    <textarea
                                        value={cancelReason}
                                        onChange={(e) => setCancelReason(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all resize-none"
                                        rows="4"
                                        placeholder="Explica por qué se cancela este reabastecimiento..."
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        El motivo será registrado en el historial del reabastecimiento
                                    </p>
                                </div>

                                <div className="flex gap-3 justify-end pt-4 border-t">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => {
                                            setShowCancelModal(false);
                                            setCancelReason('');
                                            setSelectedRecharge(null);
                                        }}
                                    >
                                        Volver
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="danger"
                                        icon={<XCircle size={18} />}
                                    >
                                        Confirmar Cancelación
                                    </Button>
                                </div>
                            </form>
                        </CardBody>
                    </Card>
                </div>
            )}

            {/* Reschedule Modal */}
            {showRescheduleModal && selectedRecharge && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <Card className="max-w-lg w-full">
                        <CardHeader>
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Edit className="text-orange-600" size={24} />
                                Reprogramar Reabastecimiento
                            </h3>
                        </CardHeader>
                        <CardBody>
                            <form onSubmit={handleReschedule} className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-600 mb-2">
                                        <strong>Tanque:</strong> {getTankName(selectedRecharge)}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        <strong>Fecha Actual:</strong> {new Date(selectedRecharge.scheduledDate).toLocaleString('es-CO')}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nueva Fecha y Hora *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={rescheduleData.newDate}
                                        onChange={(e) => setRescheduleData({ ...rescheduleData, newDate: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Motivo de Reprogramación *
                                    </label>
                                    <textarea
                                        value={rescheduleData.reason}
                                        onChange={(e) => setRescheduleData({ ...rescheduleData, reason: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        rows="3"
                                        placeholder="Explica por qué se reprograma..."
                                        required
                                    />
                                </div>

                                <div className="flex gap-2 justify-end">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => {
                                            setShowRescheduleModal(false);
                                            setRescheduleData({ newDate: '', reason: '' });
                                            setSelectedRecharge(null);
                                        }}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button type="submit" variant="warning" icon={<CheckCircle size={16} />}>
                                        Reprogramar
                                    </Button>
                                </div>
                            </form>
                        </CardBody>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default Recharges;
