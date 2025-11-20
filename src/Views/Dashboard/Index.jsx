import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../AuthContext/AuthContextV2';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Gauge,
    Users,
    TrendingUp,
    Activity,
    AlertCircle,
    CheckCircle
} from 'lucide-react';
import Card, { CardHeader, CardBody } from '../../components/Card';
import { tanksAPI, usersAPI } from '../../services/apiV2.js';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        tanks: 0,
        sensors: 0,
        users: 0,
        activeSensors: 0,
        inactiveSensors: 0
    });
    const [loading, setLoading] = useState(true);

    const isAdmin = user?.role?.toLowerCase() === 'admin';

    const loadDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            const tanksRes = await tanksAPI.getTanks();

            // Los sensores están dentro de los tanques
            const tanks = tanksRes.data || [];
            const sensorsCount = tanks.filter(t => t.sensor).length;
            const activeSensors = tanks.filter(t => t.sensor && t.sensor.status === 'active').length;
            const inactiveSensors = sensorsCount - activeSensors;

            const newStats = {
                tanks: tanks.length,
                sensors: sensorsCount,
                activeSensors: activeSensors,
                inactiveSensors: inactiveSensors
            };

            if (isAdmin) {
                const usersRes = await usersAPI.getAll();
                newStats.users = usersRes.data?.length || 0;
            }

            setStats(newStats);
        } catch (error) {
            console.error('Error cargando datos del dashboard:', error);
            toast.error('Error al cargar estadísticas');
        } finally {
            setLoading(false);
        }
    }, [isAdmin]);

    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]);

    const adminCards = [
        {
            title: 'Tanques',
            value: stats.tanks,
            icon: Container,
            color: 'blue',
            bgColor: 'bg-blue-500',
            path: '/tank'
        },
        {
            title: 'Sensores',
            value: stats.sensors,
            icon: Gauge,
            color: 'green',
            bgColor: 'bg-green-500',
            path: '/tank'
        },
        {
            title: 'Usuarios',
            value: stats.users,
            icon: Users,
            color: 'orange',
            bgColor: 'bg-orange-500',
            path: '/users'
        }
    ];

    const clientCards = [
        {
            title: 'Mis Tanques',
            value: stats.tanks,
            icon: Container,
            color: 'blue',
            bgColor: 'bg-blue-500',
            path: '/tank'
        },
        {
            title: 'Sensores',
            value: stats.sensors,
            icon: Gauge,
            color: 'green',
            bgColor: 'bg-green-500',
            path: '/sensor'
        }
    ];

    const cards = isAdmin ? adminCards : clientCards;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-8 text-white">
                <h1 className="text-3xl font-bold mb-2">
                    ¡Bienvenido, {user?.name}!
                </h1>
                <p className="text-blue-100">
                    {isAdmin
                        ? 'Panel de administración del sistema de gestión de Gas Caquetá'
                        : 'Monitorea tus tanques y sensores en tiempo real'}
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, index) => {
                    const Icon = card.icon;
                    return (
                        <Card
                            key={index}
                            className="cursor-pointer hover:shadow-xl transition-all transform hover:-translate-y-1"
                            onClick={() => navigate(card.path)}
                        >
                            <CardBody>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-500 text-sm font-medium mb-1">{card.title}</p>
                                        <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                                    </div>
                                    <div className={`${card.bgColor} p-4 rounded-xl`}>
                                        <Icon className="text-white" size={32} />
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    );
                })}
            </div>

            {/* Sensor Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card gradient>
                    <CardHeader>
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <Activity className="text-blue-600" size={24} />
                            Estado de Sensores
                        </h3>
                    </CardHeader>
                    <CardBody>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="text-green-600" size={24} />
                                    <div>
                                        <p className="font-medium text-gray-900">Sensores Activos</p>
                                        <p className="text-sm text-gray-500">En funcionamiento</p>
                                    </div>
                                </div>
                                <p className="text-2xl font-bold text-green-600">{stats.activeSensors}</p>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="text-red-600" size={24} />
                                    <div>
                                        <p className="font-medium text-gray-900">Sensores Inactivos</p>
                                        <p className="text-sm text-gray-500">Requieren atención</p>
                                    </div>
                                </div>
                                <p className="text-2xl font-bold text-red-600">{stats.inactiveSensors}</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card gradient>
                    <CardHeader>
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <TrendingUp className="text-green-600" size={24} />
                            Resumen Rápido
                        </h3>
                    </CardHeader>
                    <CardBody>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 border-b border-gray-200">
                                <p className="text-gray-600">Total de Tanques</p>
                                <p className="font-bold text-lg text-gray-900">{stats.tanks}</p>
                            </div>
                            <div className="flex items-center justify-between p-3 border-b border-gray-200">
                                <p className="text-gray-600">Total de Sensores</p>
                                <p className="font-bold text-lg text-gray-900">{stats.sensors}</p>
                            </div>
                            {isAdmin && (
                                <div className="flex items-center justify-between p-3">
                                    <p className="text-gray-600">Total de Usuarios</p>
                                    <p className="font-bold text-lg text-gray-900">{stats.users}</p>
                                </div>
                            )}
                            {!isAdmin && (
                                <div className="flex items-center justify-between p-3">
                                    <p className="text-gray-600">Sensores Activos</p>
                                    <p className="font-bold text-lg text-green-600">{stats.activeSensors}</p>
                                </div>
                            )}
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-bold">Accesos Rápidos</h3>
                </CardHeader>
                <CardBody>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <button
                            onClick={() => navigate('/sensor')}
                            className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-center"
                        >
                            <Gauge className="mx-auto mb-2 text-blue-600" size={32} />
                            <p className="font-medium text-gray-900">Ver Sensores</p>
                        </button>
                        <button
                            onClick={() => navigate('/tank')}
                            className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-center"
                        >
                            <Container className="mx-auto mb-2 text-green-600" size={32} />
                            <p className="font-medium text-gray-900">Ver Tanques</p>
                        </button>
                        {isAdmin && (
                            <button
                                onClick={() => navigate('/users')}
                                className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-center"
                            >
                                <Users className="mx-auto mb-2 text-orange-600" size={32} />
                                <p className="font-medium text-gray-900">Usuarios</p>
                            </button>
                        )}
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};

export default Dashboard;
