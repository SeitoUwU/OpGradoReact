import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle, Droplet, TrendingUp, Bell, Wifi, WifiOff } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../../components/Card';
import StatCard from '../../components/StatCard';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { alertsAPI, tankLevelAPI } from '../../services/api';
import { useWebSocket } from '../../context/WebSocketContext';

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const { isConnected, dashboardStats, alerts: wsAlerts } = useWebSocket();
    const [alerts, setAlerts] = useState([]);
    const [stats, setStats] = useState({
        totalAlerts: 0,
        criticalAlerts: 0,
        averageLevel: 0,
        lowLevelTanks: 0,
    });

    // Cargar datos iniciales
    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Actualizar stats desde WebSocket
    useEffect(() => {
        if (dashboardStats) {
            setStats(dashboardStats);
        }
    }, [dashboardStats]);

    // Actualizar alertas desde WebSocket
    useEffect(() => {
        if (wsAlerts && wsAlerts.length > 0) {
            setAlerts(wsAlerts.slice(0, 5));
        }
    }, [wsAlerts]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Obtener alertas activas inicialmente
            const alertsResponse = await alertsAPI.getActive();
            const alertsData = alertsResponse.data || [];
            setAlerts(alertsData.slice(0, 5)); // Solo las primeras 5

            // Calcular estadísticas iniciales
            const criticalCount = alertsData.filter(a => a.TIPO === 'CRITICO').length;
            const lowLevelCount = alertsData.filter(a => a.TIPO === 'NIVEL_BAJO').length;

            setStats({
                totalAlerts: alertsData.length,
                criticalAlerts: criticalCount,
                averageLevel: 0,
                lowLevelTanks: lowLevelCount,
            });

        } catch (error) {
            console.error('Error al cargar datos del dashboard:', error);
        } finally {
            setLoading(false);
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
                className="mb-6"
            >
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
                <p className="text-gray-600">Sistema de Monitoreo de Gas en Tiempo Real</p>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
                <StatCard
                    title="Alertas Activas"
                    value={stats.totalAlerts}
                    icon={Bell}
                    color="blue"
                    trend={stats.totalAlerts > 0 ? 'up' : 'down'}
                />
                <StatCard
                    title="Alertas Críticas"
                    value={stats.criticalAlerts}
                    icon={AlertTriangle}
                    color="orange"
                    trend={stats.criticalAlerts > 0 ? 'up' : 'down'}
                />
                <StatCard
                    title="Tanques Nivel Bajo"
                    value={stats.lowLevelTanks}
                    icon={Droplet}
                    color="orange"
                />
                <StatCard
                    title="Nivel Promedio"
                    value={`${stats.averageLevel}%`}
                    icon={TrendingUp}
                    color="green"
                />
            </motion.div>

            {/* Grid de contenido */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Alertas Recientes */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="h-full"
                >
                    <Card className="h-full p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-3">
                                <Activity className="w-6 h-6 text-gc-blue" />
                                Alertas Recientes
                            </h2>
                            <Badge variant="blue">{alerts.length} activas</Badge>
                        </div>

                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                            {alerts.length === 0 ? (
                                <div className="text-center py-16 text-gray-500">
                                    <AlertTriangle className="w-20 h-20 mx-auto mb-6 opacity-50" />
                                    <p className="text-xl">No hay alertas activas</p>
                                </div>
                            ) : (
                                alerts.map((alert) => (
                                    <motion.div
                                        key={alert.ID}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-4 bg-white rounded-xl border-2 border-gray-100 hover:border-gc-blue-100 hover:shadow-md transition-all"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Badge variant={getAlertColor(alert.TIPO)}>
                                                        {alert.TIPO}
                                                    </Badge>
                                                    {alert.LEIDA === 0 && (
                                                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-700 mb-2">
                                                    {alert.MENSAJE}
                                                </p>
                                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                                    <span>Tanque #{alert.TANQUE_ID}</span>
                                                    <span>Cliente: {alert.CLIENTE_NOMBRE}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </Card>
                </motion.div>

                {/* Gráfico de niveles (placeholder) */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="h-full p-6">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
                            <TrendingUp className="w-6 h-6 text-purple-600" />
                            Monitoreo en Tiempo Real
                        </h2>

                        <div className="h-80 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <Activity className="w-16 h-16 mx-auto mb-4 opacity-30" />
                                <p className="text-sm">Los gráficos de monitoreo se actualizarán</p>
                                <p className="text-sm">cuando haya datos disponibles</p>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </div>

            {/* Indicadores de estado */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <Card className="p-6">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Estado del Sistema</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                            <div>
                                <p className="text-sm font-medium text-gray-700">Sistema Operativo</p>
                                <p className="text-xs text-gray-500 mt-1">Todos los servicios activos</p>
                            </div>
                        </div>
                        <div className={`flex items-center gap-3 p-4 rounded-lg ${isConnected ? 'bg-blue-50' : 'bg-red-50'}`}>
                            {isConnected ? (
                                <Wifi className="w-5 h-5 text-blue-500" />
                            ) : (
                                <WifiOff className="w-5 h-5 text-red-500" />
                            )}
                            <div>
                                <p className="text-sm font-medium text-gray-700">
                                    {isConnected ? 'WebSocket Conectado' : 'WebSocket Desconectado'}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {isConnected ? 'Tiempo real activo' : 'Reconectando...'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                            <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse" />
                            <div>
                                <p className="text-sm font-medium text-gray-700">Notificaciones</p>
                                <p className="text-xs text-gray-500 mt-1">Email configurado</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
};

export default Dashboard;
