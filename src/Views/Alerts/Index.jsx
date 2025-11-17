import React, { useState, useEffect } from 'react';
import { useAuth } from '../../AuthContext/AuthContextV2';
import {
    Bell,
    AlertTriangle,
    AlertCircle,
    Info,
    CheckCircle2,
    Eye,
    XCircle,
    Filter,
    Clock,
    FileText
} from 'lucide-react';
import Card, { CardHeader, CardBody } from '../../components/Card';
import { alertsAPI, tanksAPI } from '../../services/apiV2.js';
import { toast } from 'react-hot-toast';
import Button from '../../components/Button';

const Alerts = () => {
    const { user } = useAuth();
    const [alerts, setAlerts] = useState([]);
    const [tanks, setTanks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('active');
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [showResolveModal, setShowResolveModal] = useState(false);
    const [resolveNotes, setResolveNotes] = useState('');

    const isAdmin = user?.role?.toLowerCase() === 'admin';

    useEffect(() => {
        loadData();
    }, [filter]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [alertsRes, tanksRes] = await Promise.all([
                filter === 'active' ? alertsAPI.getActiveAlerts() : alertsAPI.getAlerts(),
                tanksAPI.getTanks()
            ]);
            setAlerts(alertsRes.data || []);
            setTanks(tanksRes.data || []);
        } catch (error) {
            console.error('Error cargando alertas:', error);
            toast.error('Error al cargar alertas');
        } finally {
            setLoading(false);
        }
    };

    const getTankName = (tankId) => {
        const tank = tanks.find(t => t.id === tankId);
        return tank ? tank.name : 'Tanque Desconocido';
    };

    const getSeverityConfig = (severity) => {
        switch (severity) {
            case 'critical':
                return {
                    icon: AlertTriangle,
                    color: 'red',
                    bgColor: 'bg-red-100',
                    textColor: 'text-red-700',
                    borderColor: 'border-red-300',
                    badgeBg: 'bg-red-500'
                };
            case 'warning':
                return {
                    icon: AlertCircle,
                    color: 'orange',
                    bgColor: 'bg-orange-100',
                    textColor: 'text-orange-700',
                    borderColor: 'border-orange-300',
                    badgeBg: 'bg-orange-500'
                };
            case 'info':
                return {
                    icon: Info,
                    color: 'blue',
                    bgColor: 'bg-blue-100',
                    textColor: 'text-blue-700',
                    borderColor: 'border-blue-300',
                    badgeBg: 'bg-blue-500'
                };
            default:
                return {
                    icon: Bell,
                    color: 'gray',
                    bgColor: 'bg-gray-100',
                    textColor: 'text-gray-700',
                    borderColor: 'border-gray-300',
                    badgeBg: 'bg-gray-500'
                };
        }
    };

    const getTypeLabel = (type) => {
        const labels = {
            'low_level': 'Nivel Bajo',
            'critical_level': 'Nivel Crítico',
            'sensor_failure': 'Falla de Sensor',
            'consumption_anomaly': 'Anomalía de Consumo',
            'maintenance_required': 'Mantenimiento Requerido'
        };
        return labels[type] || type;
    };

    const getStatusBadge = (status) => {
        const badges = {
            'active': { label: 'Activa', bg: 'bg-red-500' },
            'acknowledged': { label: 'Reconocida', bg: 'bg-yellow-500' },
            'resolved': { label: 'Resuelta', bg: 'bg-green-500' }
        };
        const config = badges[status] || { label: status, bg: 'bg-gray-500' };
        return (
            <span className={`${config.bg} text-white text-xs px-3 py-1 rounded-full font-medium`}>
                {config.label}
            </span>
        );
    };

    const handleAcknowledge = async (alertId) => {
        try {
            await alertsAPI.acknowledgeAlert(alertId);
            toast.success('Alerta reconocida');
            loadData();
        } catch (error) {
            console.error('Error reconociendo alerta:', error);
            toast.error('Error al reconocer la alerta');
        }
    };

    const handleResolve = async () => {
        if (!selectedAlert) return;

        try {
            await alertsAPI.resolveAlert(selectedAlert.id, resolveNotes);
            toast.success('Alerta resuelta');
            setShowResolveModal(false);
            setResolveNotes('');
            setSelectedAlert(null);
            loadData();
        } catch (error) {
            console.error('Error resolviendo alerta:', error);
            toast.error('Error al resolver la alerta');
        }
    };

    const openResolveModal = (alert) => {
        setSelectedAlert(alert);
        setShowResolveModal(true);
    };

    const filteredAlerts = alerts.filter(alert => {
        if (filter === 'active') return alert.status === 'active';
        if (filter === 'acknowledged') return alert.status === 'acknowledged';
        if (filter === 'resolved') return alert.status === 'resolved';
        return true;
    });

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
                <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
                        <Bell size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Alertas del Sistema</h1>
                        <p className="text-blue-100">
                            Gestiona y monitorea las alertas de tus tanques
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                    <CardBody>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-red-600 text-sm font-medium mb-1">Alertas Activas</p>
                                <p className="text-3xl font-bold text-red-700">
                                    {alerts.filter(a => a.status === 'active').length}
                                </p>
                            </div>
                            <AlertTriangle className="text-red-500" size={40} />
                        </div>
                    </CardBody>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                    <CardBody>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-yellow-600 text-sm font-medium mb-1">Reconocidas</p>
                                <p className="text-3xl font-bold text-yellow-700">
                                    {alerts.filter(a => a.status === 'acknowledged').length}
                                </p>
                            </div>
                            <Eye className="text-yellow-500" size={40} />
                        </div>
                    </CardBody>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardBody>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-600 text-sm font-medium mb-1">Resueltas</p>
                                <p className="text-3xl font-bold text-green-700">
                                    {alerts.filter(a => a.status === 'resolved').length}
                                </p>
                            </div>
                            <CheckCircle2 className="text-green-500" size={40} />
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
                            onClick={() => setFilter('active')}
                            className={`px-4 py-2 rounded-lg transition-all ${
                                filter === 'active'
                                    ? 'bg-red-500 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Activas
                        </button>
                        <button
                            onClick={() => setFilter('acknowledged')}
                            className={`px-4 py-2 rounded-lg transition-all ${
                                filter === 'acknowledged'
                                    ? 'bg-yellow-500 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Reconocidas
                        </button>
                        <button
                            onClick={() => setFilter('resolved')}
                            className={`px-4 py-2 rounded-lg transition-all ${
                                filter === 'resolved'
                                    ? 'bg-green-500 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Resueltas
                        </button>
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-lg transition-all ${
                                filter === 'all'
                                    ? 'bg-blue-500 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Todas
                        </button>
                    </div>
                </CardBody>
            </Card>

            {/* Alerts List */}
            <div className="space-y-4">
                {filteredAlerts.length === 0 ? (
                    <Card>
                        <CardBody>
                            <div className="text-center py-12">
                                <CheckCircle2 className="mx-auto mb-4 text-green-500" size={64} />
                                <p className="text-xl font-medium text-gray-700">No hay alertas</p>
                                <p className="text-gray-500 mt-2">
                                    {filter === 'active'
                                        ? '¡Todo está funcionando correctamente!'
                                        : `No se encontraron alertas ${filter === 'all' ? '' : filter}`}
                                </p>
                            </div>
                        </CardBody>
                    </Card>
                ) : (
                    filteredAlerts.map((alert) => {
                        const severityConfig = getSeverityConfig(alert.severity);
                        const Icon = severityConfig.icon;

                        return (
                            <Card
                                key={alert.id}
                                className={`border-l-4 ${severityConfig.borderColor} hover:shadow-xl transition-all`}
                            >
                                <CardBody>
                                    <div className="flex items-start gap-4">
                                        <div className={`${severityConfig.bgColor} p-3 rounded-xl`}>
                                            <Icon className={severityConfig.textColor} size={24} />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4 mb-2">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="text-lg font-bold text-gray-900">
                                                            {getTypeLabel(alert.type)}
                                                        </h3>
                                                        {getStatusBadge(alert.status)}
                                                    </div>
                                                    <p className="text-gray-600 mb-2">{alert.message}</p>
                                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <Clock size={14} />
                                                            {new Date(alert.createdAt).toLocaleString('es-CO')}
                                                        </span>
                                                        <span className="font-medium text-gray-700">
                                                            {getTankName(alert.tankId)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {alert.details && (
                                                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                                    <p className="text-sm text-gray-700">
                                                        <strong>Detalles:</strong> {JSON.stringify(alert.details)}
                                                    </p>
                                                </div>
                                            )}

                                            {alert.acknowledgedAt && (
                                                <div className="mt-2 text-sm text-gray-600">
                                                    <strong>Reconocida:</strong> {new Date(alert.acknowledgedAt).toLocaleString('es-CO')}
                                                </div>
                                            )}

                                            {alert.resolvedAt && alert.resolutionNotes && (
                                                <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                                                    <p className="text-sm text-green-800">
                                                        <strong>Resuelta:</strong> {new Date(alert.resolvedAt).toLocaleString('es-CO')}
                                                    </p>
                                                    <p className="text-sm text-green-700 mt-1">
                                                        <strong>Notas:</strong> {alert.resolutionNotes}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Actions */}
                                            {alert.status !== 'resolved' && (
                                                <div className="flex gap-2 mt-4">
                                                    {alert.status === 'active' && (
                                                        <Button
                                                            variant="warning"
                                                            size="sm"
                                                            onClick={() => handleAcknowledge(alert.id)}
                                                            icon={<Eye size={16} />}
                                                        >
                                                            Reconocer
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="success"
                                                        size="sm"
                                                        onClick={() => openResolveModal(alert)}
                                                        icon={<CheckCircle2 size={16} />}
                                                    >
                                                        Resolver
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

            {/* Resolve Modal */}
            {showResolveModal && selectedAlert && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <Card className="max-w-lg w-full">
                        <CardHeader>
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <FileText className="text-green-600" size={24} />
                                Resolver Alerta
                            </h3>
                        </CardHeader>
                        <CardBody>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-600 mb-2">
                                        <strong>Tipo:</strong> {getTypeLabel(selectedAlert.type)}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        <strong>Mensaje:</strong> {selectedAlert.message}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Notas de Resolución
                                    </label>
                                    <textarea
                                        value={resolveNotes}
                                        onChange={(e) => setResolveNotes(e.target.value)}
                                        placeholder="Describe cómo se resolvió la alerta..."
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        rows="4"
                                    />
                                </div>

                                <div className="flex gap-2 justify-end">
                                    <Button
                                        variant="secondary"
                                        onClick={() => {
                                            setShowResolveModal(false);
                                            setResolveNotes('');
                                            setSelectedAlert(null);
                                        }}
                                        icon={<XCircle size={16} />}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        variant="success"
                                        onClick={handleResolve}
                                        icon={<CheckCircle2 size={16} />}
                                    >
                                        Resolver
                                    </Button>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default Alerts;
