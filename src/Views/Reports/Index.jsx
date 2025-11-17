import React, { useState, useEffect } from 'react';
import { useAuth } from '../../AuthContext/AuthContextV2';
import {
    FileText,
    Download,
    Calendar,
    TrendingUp,
    AlertTriangle,
    Container,
    BarChart3,
    PieChart,
    Filter
} from 'lucide-react';
import Card, { CardHeader, CardBody } from '../../components/Card';
import { tanksAPI, alertsAPI, rechargesAPI } from '../../services/apiV2.js';
import { toast } from 'react-hot-toast';
import Button from '../../components/Button';

const Reports = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });
    const [reportData, setReportData] = useState({
        tanks: [],
        alerts: [],
        recharges: [],
        consumption: []
    });
    const [selectedReport, setSelectedReport] = useState('overview');

    const isAdmin = user?.role?.toLowerCase() === 'admin';

    useEffect(() => {
        loadReportData();
    }, [dateRange]);

    const loadReportData = async () => {
        try {
            setLoading(true);
            const [tanksRes, alertsRes, rechargesRes] = await Promise.all([
                tanksAPI.getTanks(),
                alertsAPI.getAlerts(),
                rechargesAPI.getRecharges({
                    startDate: dateRange.startDate,
                    endDate: dateRange.endDate
                })
            ]);

            setReportData({
                tanks: tanksRes.data || [],
                alerts: alertsRes.data || [],
                recharges: rechargesRes.data || [],
            });
        } catch (error) {
            console.error('Error cargando datos de informes:', error);
            toast.error('Error al cargar datos de informes');
        } finally {
            setLoading(false);
        }
    };

    const calculateConsumptionStats = () => {
        const tanks = reportData.tanks;
        const totalCapacity = tanks.reduce((sum, tank) => sum + (tank.capacity || 0), 0);
        const totalCurrent = tanks.reduce((sum, tank) => sum + (tank.currentLevel || 0), 0);
        const averageFillPercentage = tanks.length > 0
            ? (totalCurrent / totalCapacity) * 100
            : 0;

        return {
            totalCapacity,
            totalCurrent,
            averageFillPercentage: averageFillPercentage.toFixed(2),
            tanksCount: tanks.length
        };
    };

    const calculateAlertsStats = () => {
        const alerts = reportData.alerts;
        const activeAlerts = alerts.filter(a => a.status === 'active').length;
        const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;
        const resolvedAlerts = alerts.filter(a => a.status === 'resolved').length;

        return {
            total: alerts.length,
            active: activeAlerts,
            critical: criticalAlerts,
            resolved: resolvedAlerts
        };
    };

    const calculateRechargesStats = () => {
        const recharges = reportData.recharges;
        const completed = recharges.filter(r => r.status === 'completed').length;
        const scheduled = recharges.filter(r => r.status === 'scheduled').length;
        const totalAmount = recharges
            .filter(r => r.status === 'completed')
            .reduce((sum, r) => sum + (r.actualAmount || r.estimatedAmount || 0), 0);

        return {
            total: recharges.length,
            completed,
            scheduled,
            totalAmount: totalAmount.toFixed(2)
        };
    };

    const exportToCSV = (data, filename) => {
        const csvContent = [
            Object.keys(data[0]).join(','),
            ...data.map(row => Object.values(row).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const exportTanksReport = () => {
        const data = reportData.tanks.map(tank => ({
            ID: tank.id,
            Nombre: tank.name,
            Ubicación: tank.location,
            Capacidad: tank.capacity,
            'Nivel Actual': tank.currentLevel,
            'Porcentaje': tank.sensor?.currentPercentage || 0,
            Estado: tank.sensor?.status || 'N/A'
        }));
        exportToCSV(data, 'informe_tanques');
        toast.success('Informe de tanques exportado');
    };

    const exportAlertsReport = () => {
        const data = reportData.alerts.map(alert => ({
            ID: alert.id,
            Tipo: alert.type,
            Severidad: alert.severity,
            Estado: alert.status,
            Mensaje: alert.message,
            'Fecha Creación': new Date(alert.createdAt).toLocaleString('es-CO'),
            'Fecha Resolución': alert.resolvedAt ? new Date(alert.resolvedAt).toLocaleString('es-CO') : 'N/A'
        }));
        exportToCSV(data, 'informe_alertas');
        toast.success('Informe de alertas exportado');
    };

    const exportRechargesReport = () => {
        const data = reportData.recharges.map(recharge => ({
            ID: recharge.id,
            'Tanque ID': recharge.tankId,
            Estado: recharge.status,
            'Fecha Programada': new Date(recharge.scheduledDate).toLocaleString('es-CO'),
            'Cantidad Estimada': recharge.estimatedAmount,
            'Cantidad Real': recharge.actualAmount || 'N/A',
            Prioridad: recharge.priority
        }));
        exportToCSV(data, 'informe_reabastecimientos');
        toast.success('Informe de reabastecimientos exportado');
    };

    const consumptionStats = calculateConsumptionStats();
    const alertsStats = calculateAlertsStats();
    const rechargesStats = calculateRechargesStats();

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
            <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-xl shadow-lg p-8 text-white">
                <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
                        <FileText size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Informes y Reportes</h1>
                        <p className="text-purple-100">
                            Análisis y estadísticas del sistema de gestión
                        </p>
                    </div>
                </div>
            </div>

            {/* Date Range Filter */}
            <Card>
                <CardBody>
                    <div className="flex items-center gap-4 flex-wrap">
                        <Calendar className="text-gray-500" size={20} />
                        <span className="text-gray-700 font-medium">Rango de Fechas:</span>
                        <input
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <span className="text-gray-500">hasta</span>
                        <input
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                </CardBody>
            </Card>

            {/* Report Type Selector */}
            <Card>
                <CardBody>
                    <div className="flex items-center gap-2 flex-wrap">
                        <Filter className="text-gray-500" size={20} />
                        <span className="text-gray-700 font-medium mr-2">Tipo de Informe:</span>
                        <button
                            onClick={() => setSelectedReport('overview')}
                            className={`px-4 py-2 rounded-lg transition-all ${
                                selectedReport === 'overview'
                                    ? 'bg-purple-500 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Resumen General
                        </button>
                        <button
                            onClick={() => setSelectedReport('consumption')}
                            className={`px-4 py-2 rounded-lg transition-all ${
                                selectedReport === 'consumption'
                                    ? 'bg-blue-500 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Consumo
                        </button>
                        <button
                            onClick={() => setSelectedReport('alerts')}
                            className={`px-4 py-2 rounded-lg transition-all ${
                                selectedReport === 'alerts'
                                    ? 'bg-red-500 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Alertas
                        </button>
                        <button
                            onClick={() => setSelectedReport('recharges')}
                            className={`px-4 py-2 rounded-lg transition-all ${
                                selectedReport === 'recharges'
                                    ? 'bg-green-500 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Reabastecimientos
                        </button>
                    </div>
                </CardBody>
            </Card>

            {/* Overview Report */}
            {selectedReport === 'overview' && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                            <CardBody>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-blue-600 text-sm font-medium mb-1">Capacidad Total</p>
                                        <p className="text-3xl font-bold text-blue-700">
                                            {consumptionStats.totalCapacity.toLocaleString()} L
                                        </p>
                                        <p className="text-sm text-blue-600 mt-1">
                                            {consumptionStats.tanksCount} tanques
                                        </p>
                                    </div>
                                    <Container className="text-blue-500" size={40} />
                                </div>
                            </CardBody>
                        </Card>

                        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                            <CardBody>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-red-600 text-sm font-medium mb-1">Alertas Activas</p>
                                        <p className="text-3xl font-bold text-red-700">{alertsStats.active}</p>
                                        <p className="text-sm text-red-600 mt-1">
                                            {alertsStats.critical} críticas
                                        </p>
                                    </div>
                                    <AlertTriangle className="text-red-500" size={40} />
                                </div>
                            </CardBody>
                        </Card>

                        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                            <CardBody>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-green-600 text-sm font-medium mb-1">Reabastecimientos</p>
                                        <p className="text-3xl font-bold text-green-700">{rechargesStats.completed}</p>
                                        <p className="text-sm text-green-600 mt-1">
                                            {rechargesStats.totalAmount} L totales
                                        </p>
                                    </div>
                                    <TrendingUp className="text-green-500" size={40} />
                                </div>
                            </CardBody>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <BarChart3 className="text-purple-600" size={24} />
                                Estadísticas Generales
                            </h3>
                        </CardHeader>
                        <CardBody>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-gray-800">Consumo de Gas</h4>
                                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                        <span className="text-gray-700">Nivel Promedio</span>
                                        <span className="font-bold text-blue-700">{consumptionStats.averageFillPercentage}%</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                        <span className="text-gray-700">Total Actual</span>
                                        <span className="font-bold text-blue-700">{consumptionStats.totalCurrent.toLocaleString()} L</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="font-semibold text-gray-800">Gestión de Alertas</h4>
                                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                        <span className="text-gray-700">Total de Alertas</span>
                                        <span className="font-bold text-red-700">{alertsStats.total}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                        <span className="text-gray-700">Resueltas</span>
                                        <span className="font-bold text-green-700">{alertsStats.resolved}</span>
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </>
            )}

            {/* Consumption Report */}
            {selectedReport === 'consumption' && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <TrendingUp className="text-blue-600" size={24} />
                                Informe de Consumo
                            </h3>
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={exportTanksReport}
                                icon={<Download size={16} />}
                            >
                                Exportar
                            </Button>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanque</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ubicación</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacidad</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nivel Actual</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">%</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {reportData.tanks.map(tank => (
                                        <tr key={tank.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium">{tank.name}</td>
                                            <td className="px-6 py-4">{tank.location}</td>
                                            <td className="px-6 py-4">{tank.capacity} L</td>
                                            <td className="px-6 py-4">{tank.currentLevel || 0} L</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                    (tank.sensor?.currentPercentage || 0) > 50
                                                        ? 'bg-green-100 text-green-700'
                                                        : (tank.sensor?.currentPercentage || 0) > 20
                                                        ? 'bg-yellow-100 text-yellow-700'
                                                        : 'bg-red-100 text-red-700'
                                                }`}>
                                                    {tank.sensor?.currentPercentage || 0}%
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                    tank.sensor?.status === 'active'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                    {tank.sensor?.status || 'N/A'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardBody>
                </Card>
            )}

            {/* Alerts Report */}
            {selectedReport === 'alerts' && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <AlertTriangle className="text-red-600" size={24} />
                                Informe de Alertas
                            </h3>
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={exportAlertsReport}
                                icon={<Download size={16} />}
                            >
                                Exportar
                            </Button>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-blue-600">Total</p>
                                    <p className="text-2xl font-bold text-blue-700">{alertsStats.total}</p>
                                </div>
                                <div className="p-4 bg-red-50 rounded-lg">
                                    <p className="text-sm text-red-600">Activas</p>
                                    <p className="text-2xl font-bold text-red-700">{alertsStats.active}</p>
                                </div>
                                <div className="p-4 bg-orange-50 rounded-lg">
                                    <p className="text-sm text-orange-600">Críticas</p>
                                    <p className="text-2xl font-bold text-orange-700">{alertsStats.critical}</p>
                                </div>
                                <div className="p-4 bg-green-50 rounded-lg">
                                    <p className="text-sm text-green-600">Resueltas</p>
                                    <p className="text-2xl font-bold text-green-700">{alertsStats.resolved}</p>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severidad</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mensaje</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {reportData.alerts.slice(0, 20).map(alert => (
                                            <tr key={alert.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">{alert.type}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                        alert.severity === 'critical'
                                                            ? 'bg-red-100 text-red-700'
                                                            : alert.severity === 'warning'
                                                            ? 'bg-orange-100 text-orange-700'
                                                            : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                        {alert.severity}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                        alert.status === 'resolved'
                                                            ? 'bg-green-100 text-green-700'
                                                            : alert.status === 'acknowledged'
                                                            ? 'bg-yellow-100 text-yellow-700'
                                                            : 'bg-red-100 text-red-700'
                                                    }`}>
                                                        {alert.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    {new Date(alert.createdAt).toLocaleDateString('es-CO')}
                                                </td>
                                                <td className="px-6 py-4 text-sm">{alert.message}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            )}

            {/* Recharges Report */}
            {selectedReport === 'recharges' && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <Calendar className="text-green-600" size={24} />
                                Informe de Reabastecimientos
                            </h3>
                            <Button
                                variant="success"
                                size="sm"
                                onClick={exportRechargesReport}
                                icon={<Download size={16} />}
                            >
                                Exportar
                            </Button>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-blue-600">Total</p>
                                    <p className="text-2xl font-bold text-blue-700">{rechargesStats.total}</p>
                                </div>
                                <div className="p-4 bg-green-50 rounded-lg">
                                    <p className="text-sm text-green-600">Completados</p>
                                    <p className="text-2xl font-bold text-green-700">{rechargesStats.completed}</p>
                                </div>
                                <div className="p-4 bg-purple-50 rounded-lg">
                                    <p className="text-sm text-purple-600">Cantidad Total</p>
                                    <p className="text-2xl font-bold text-purple-700">{rechargesStats.totalAmount} L</p>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cantidad Est.</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cantidad Real</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prioridad</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {reportData.recharges.map(recharge => (
                                            <tr key={recharge.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 text-sm">
                                                    {new Date(recharge.scheduledDate).toLocaleDateString('es-CO')}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                        recharge.status === 'completed'
                                                            ? 'bg-green-100 text-green-700'
                                                            : recharge.status === 'in_progress'
                                                            ? 'bg-yellow-100 text-yellow-700'
                                                            : recharge.status === 'scheduled'
                                                            ? 'bg-blue-100 text-blue-700'
                                                            : 'bg-gray-100 text-gray-700'
                                                    }`}>
                                                        {recharge.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">{recharge.estimatedAmount} L</td>
                                                <td className="px-6 py-4">{recharge.actualAmount || 'N/A'} L</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                        recharge.priority === 'urgent'
                                                            ? 'bg-red-100 text-red-700'
                                                            : recharge.priority === 'high'
                                                            ? 'bg-orange-100 text-orange-700'
                                                            : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                        {recharge.priority}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            )}
        </div>
    );
};

export default Reports;
