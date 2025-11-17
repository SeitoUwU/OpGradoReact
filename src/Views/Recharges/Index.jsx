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
    Truck
} from 'lucide-react';
import Card, { CardHeader, CardBody } from '../../components/Card';
import { rechargesAPI, tanksAPI } from '../../services/apiV2.js';
import { toast } from 'react-hot-toast';
import Button from '../../components/Button';

const Recharges = () => {
    const { user } = useAuth();
    const [recharges, setRecharges] = useState([]);
    const [tanks, setTanks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('scheduled');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [selectedRecharge, setSelectedRecharge] = useState(null);
    const [formData, setFormData] = useState({
        tankId: '',
        scheduledDate: '',
        estimatedAmount: '',
        priority: 'normal',
        notes: ''
    });
    const [rescheduleData, setRescheduleData] = useState({
        newDate: '',
        reason: ''
    });

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

    const getTankName = (tankId) => {
        const tank = tanks.find(t => t.id === tankId);
        return tank ? tank.name : 'Tanque Desconocido';
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

    const getPriorityBadge = (priority) => {
        const priorities = {
            'urgent': { label: 'Urgente', bg: 'bg-red-500' },
            'high': { label: 'Alta', bg: 'bg-orange-500' },
            'normal': { label: 'Normal', bg: 'bg-blue-500' },
            'low': { label: 'Baja', bg: 'bg-gray-500' }
        };
        const config = priorities[priority] || { label: priority, bg: 'bg-gray-500' };
        return (
            <span className={`${config.bg} text-white text-xs px-2 py-1 rounded font-medium`}>
                {config.label}
            </span>
        );
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
                estimatedAmount: parseFloat(formData.estimatedAmount),
                priority: formData.priority,
                notes: formData.notes
            });
            toast.success('Reabastecimiento programado exitosamente');
            setShowCreateModal(false);
            resetForm();
            loadData();
        } catch (error) {
            console.error('Error creando reabastecimiento:', error);
            toast.error('Error al programar reabastecimiento');
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

    const handleCancel = async (rechargeId) => {
        const reason = prompt('Motivo de cancelación:');
        if (!reason) return;

        try {
            await rechargesAPI.cancelRecharge(rechargeId, reason);
            toast.success('Reabastecimiento cancelado');
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
            priority: 'normal',
            notes: ''
        });
    };

    const openRescheduleModal = (recharge) => {
        setSelectedRecharge(recharge);
        setShowRescheduleModal(true);
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

            {/* Filters */}
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
                                                            {getTankName(recharge.tankId)}
                                                        </h3>
                                                        <span className={`${statusConfig.badgeBg} text-white text-xs px-3 py-1 rounded-full font-medium`}>
                                                            {statusConfig.label}
                                                        </span>
                                                        {getPriorityBadge(recharge.priority)}
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
                                                        onClick={() => handleCancel(recharge.id)}
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

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <CardHeader>
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Plus className="text-blue-600" size={24} />
                                Programar Reabastecimiento
                            </h3>
                        </CardHeader>
                        <CardBody>
                            <form onSubmit={handleCreateRecharge} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tanque *
                                    </label>
                                    <select
                                        value={formData.tankId}
                                        onChange={(e) => setFormData({ ...formData, tankId: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Seleccionar tanque</option>
                                        {userTanks.map(tank => (
                                            <option key={tank.id} value={tank.id}>
                                                {tank.name} - {tank.location}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Fecha y Hora Programada *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={formData.scheduledDate}
                                        onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Cantidad Estimada (Litros) *
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.estimatedAmount}
                                        onChange={(e) => setFormData({ ...formData, estimatedAmount: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="1000"
                                        min="1"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Prioridad
                                    </label>
                                    <select
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="low">Baja</option>
                                        <option value="normal">Normal</option>
                                        <option value="high">Alta</option>
                                        <option value="urgent">Urgente</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Notas
                                    </label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows="3"
                                        placeholder="Información adicional..."
                                    />
                                </div>

                                <div className="flex gap-2 justify-end">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => {
                                            setShowCreateModal(false);
                                            resetForm();
                                        }}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button type="submit" variant="primary" icon={<CheckCircle size={16} />}>
                                        Programar
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
                                        <strong>Tanque:</strong> {getTankName(selectedRecharge.tankId)}
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
