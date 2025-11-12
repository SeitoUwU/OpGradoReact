import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Mail, Check, X, AlertTriangle, Calendar, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { alertsAPI } from '../../services/api';
import { useWebSocket } from '../../context/WebSocketContext';

const Alerts = () => {
    const [loading, setLoading] = useState(true);
    const { alerts: wsAlerts, setAlerts: setWsAlerts } = useWebSocket();
    const [alerts, setAlerts] = useState([]);
    const [filter, setFilter] = useState('all'); // all, NIVEL_BAJO, CRITICO, MANTENIMIENTO
    const [sendingEmail, setSendingEmail] = useState(null);

    // Cargar datos iniciales
    useEffect(() => {
        fetchAlerts();
    }, []);

    // Actualizar alertas desde WebSocket
    useEffect(() => {
        if (wsAlerts && wsAlerts.length > 0) {
            setAlerts(wsAlerts);
        }
    }, [wsAlerts]);

    const fetchAlerts = async () => {
        try {
            setLoading(true);
            const response = await alertsAPI.getActive();
            setAlerts(response.data || []);
        } catch (error) {
            console.error('Error al cargar alertas:', error);
            toast.error('Error al cargar las alertas');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await alertsAPI.markAsRead(id);
            toast.success('Alerta marcada como leída');
            fetchAlerts();
        } catch (error) {
            console.error('Error al marcar alerta:', error);
            toast.error('Error al marcar la alerta');
        }
    };

    const handleResolve = async (id) => {
        try {
            await alertsAPI.resolve(id);
            toast.success('Alerta resuelta exitosamente');
            fetchAlerts();
        } catch (error) {
            console.error('Error al resolver alerta:', error);
            toast.error('Error al resolver la alerta');
        }
    };

    const handleSendNotification = async (alertId) => {
        try {
            setSendingEmail(alertId);
            await alertsAPI.sendNotification(alertId);
            toast.success('Notificación enviada por email');
            fetchAlerts();
        } catch (error) {
            console.error('Error al enviar notificación:', error);
            toast.error('Error al enviar la notificación');
        } finally {
            setSendingEmail(null);
        }
    };

    const getAlertColor = (tipo) => {
        switch (tipo) {
            case 'CRITICO':
                return 'red';
            case 'NIVEL_BAJO':
                return 'yellow';
            case 'MANTENIMIENTO':
                return 'blue';
            default:
                return 'gray';
        }
    };

    const filteredAlerts = filter === 'all'
        ? alerts
        : alerts.filter(a => a.TIPO === filter);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <LoadingSpinner size="large" />
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 lg:p-10 space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6"
            >
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Alertas Activas</h1>
                    <p className="text-gray-600">Gestiona y responde a las alertas del sistema</p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="purple">{filteredAlerts.length} alertas</Badge>
                </div>
            </motion.div>

            {/* Filtros */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
            >
                <Card className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter className="w-5 h-5 text-gray-600" />
                        <span className="font-medium text-gray-700">Filtrar por tipo:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant={filter === 'all' ? 'primary' : 'outline'}
                            onClick={() => setFilter('all')}
                        >
                            Todas
                        </Button>
                        <Button
                            variant={filter === 'NIVEL_BAJO' ? 'primary' : 'outline'}
                            onClick={() => setFilter('NIVEL_BAJO')}
                        >
                            Nivel Bajo
                        </Button>
                        <Button
                            variant={filter === 'CRITICO' ? 'primary' : 'outline'}
                            onClick={() => setFilter('CRITICO')}
                        >
                            Críticas
                        </Button>
                        <Button
                            variant={filter === 'MANTENIMIENTO' ? 'primary' : 'outline'}
                            onClick={() => setFilter('MANTENIMIENTO')}
                        >
                            Mantenimiento
                        </Button>
                    </div>
                </Card>
            </motion.div>

            {/* Lista de Alertas */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="space-y-6"
            >
                {filteredAlerts.length === 0 ? (
                    <Card>
                        <div className="text-center py-12 text-gray-500">
                            <Bell className="w-16 h-16 mx-auto mb-4 opacity-30" />
                            <p className="text-lg mb-2">No hay alertas {filter !== 'all' && `de tipo "${filter}"`}</p>
                            <p className="text-sm">Todas las alertas están bajo control</p>
                        </div>
                    </Card>
                ) : (
                    filteredAlerts.map((alert, index) => (
                        <motion.div
                            key={alert.ID}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className={`hover:shadow-lg transition-shadow ${alert.LEIDA === 0 ? 'border-l-4 border-purple-500' : ''}`}>
                                <div className="flex flex-col lg:flex-row gap-4">
                                    {/* Contenido Principal */}
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <Badge variant={getAlertColor(alert.TIPO)}>
                                                    {alert.TIPO}
                                                </Badge>
                                                {alert.LEIDA === 0 && (
                                                    <span className="flex items-center gap-1 text-sm text-blue-600">
                                                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                                                        Nueva
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-sm text-gray-500">
                                                Alerta #{alert.ID}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                            {alert.MENSAJE}
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <AlertTriangle className="w-4 h-4" />
                                                <span>Tanque #{alert.TANQUE_ID}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Bell className="w-4 h-4" />
                                                <span>{alert.CLIENTE_NOMBRE}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Calendar className="w-4 h-4" />
                                                <span>{new Date(alert.FECHA).toLocaleString('es-ES')}</span>
                                            </div>
                                        </div>

                                        {alert.NIVEL && (
                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-medium">Nivel actual:</span> {alert.NIVEL} litros
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Acciones */}
                                    <div className="flex lg:flex-col gap-2 justify-end">
                                        {alert.LEIDA === 0 && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleMarkAsRead(alert.ID)}
                                                className="flex items-center gap-2"
                                            >
                                                <Check className="w-4 h-4" />
                                                <span className="hidden md:inline">Marcar Leída</span>
                                            </Button>
                                        )}

                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={() => handleSendNotification(alert.ID)}
                                            disabled={sendingEmail === alert.ID}
                                            className="flex items-center gap-2"
                                        >
                                            <Mail className="w-4 h-4" />
                                            <span className="hidden md:inline">
                                                {sendingEmail === alert.ID ? 'Enviando...' : 'Enviar Email'}
                                            </span>
                                        </Button>

                                        <Button
                                            variant="success"
                                            size="sm"
                                            onClick={() => handleResolve(alert.ID)}
                                            className="flex items-center gap-2"
                                        >
                                            <X className="w-4 h-4" />
                                            <span className="hidden md:inline">Resolver</span>
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))
                )}
            </motion.div>
        </div>
    );
};

export default Alerts;
