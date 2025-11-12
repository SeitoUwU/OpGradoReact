import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Plus, Calendar, DollarSign, TrendingUp, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { suppliesAPI } from '../../services/api';

const Supplies = () => {
    const [loading, setLoading] = useState(true);
    const [supplies, setSupplies] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [tankId, setTankId] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        tankId: '',
        quantity: '',
        cost: '',
        employeeId: 1, // Default employee
        observations: '',
    });

    useEffect(() => {
        // Set default dates (last 30 days)
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);

        setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
        setEndDate(today.toISOString().split('T')[0]);
    }, []);

    useEffect(() => {
        if (startDate && endDate) {
            fetchSupplies();
        }
    }, [startDate, endDate, tankId]);

    const fetchSupplies = async () => {
        try {
            setLoading(true);
            const params = {
                startDate,
                endDate,
            };
            if (tankId) params.tankId = tankId;

            const response = await suppliesAPI.getHistory(params);
            setSupplies(response.data || []);
        } catch (error) {
            console.error('Error al cargar suministros:', error);
            toast.error('Error al cargar el historial de suministros');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.tankId || !formData.quantity) {
            toast.error('Tanque y cantidad son requeridos');
            return;
        }

        try {
            await suppliesAPI.register(formData);
            toast.success('Suministro registrado exitosamente');
            setShowModal(false);
            setFormData({
                tankId: '',
                quantity: '',
                cost: '',
                employeeId: 1,
                observations: '',
            });
            fetchSupplies();
        } catch (error) {
            console.error('Error al registrar suministro:', error);
            toast.error('Error al registrar el suministro');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    // Calculate total cost
    const totalCost = supplies.reduce((sum, s) => sum + (parseFloat(s.COSTO) || 0), 0);
    const totalQuantity = supplies.reduce((sum, s) => sum + (parseFloat(s.CANTIDAD) || 0), 0);

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
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Historial de Suministros</h1>
                    <p className="text-gray-600">Registro completo de recargas de gas</p>
                </div>
                <Button
                    variant="primary"
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Registrar Suministro
                </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Total Suministros</p>
                            <p className="text-2xl font-bold text-gray-900">{supplies.length}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-xl">
                            <Package className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Cantidad Total (L)</p>
                            <p className="text-2xl font-bold text-gray-900">{totalQuantity.toFixed(2)}</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-xl">
                            <TrendingUp className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Costo Total</p>
                            <p className="text-2xl font-bold text-gray-900">
                                ${totalCost.toLocaleString('es-CO')}
                            </p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-xl">
                            <DollarSign className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <Card className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter className="w-5 h-5 text-gray-600" />
                        <span className="font-medium text-gray-700">Filtros:</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Fecha Inicio
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Fecha Fin
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tanque (Opcional)
                            </label>
                            <input
                                type="number"
                                placeholder="ID del tanque"
                                value={tankId}
                                onChange={(e) => setTankId(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Table */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                <Card className="p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">ID</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Fecha</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tanque</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Cantidad (L)</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Costo</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Nivel Anterior</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Nivel Nuevo</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Empleado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {supplies.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="text-center py-8 text-gray-500">
                                            No hay suministros registrados en este período
                                        </td>
                                    </tr>
                                ) : (
                                    supplies.map((supply) => (
                                        <tr key={supply.ID} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4 text-sm text-gray-900">#{supply.ID}</td>
                                            <td className="py-3 px-4 text-sm text-gray-600">
                                                {new Date(supply.FECHA).toLocaleDateString('es-ES')}
                                            </td>
                                            <td className="py-3 px-4 text-sm">
                                                <Badge variant="blue">Tanque #{supply.TANQUE}</Badge>
                                            </td>
                                            <td className="py-3 px-4 text-sm font-medium text-gray-900">
                                                {parseFloat(supply.CANTIDAD).toFixed(2)} L
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-900">
                                                ${parseFloat(supply.COSTO || 0).toLocaleString('es-CO')}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-600">
                                                {parseFloat(supply.NIVEL_ANTERIOR).toFixed(2)} L
                                            </td>
                                            <td className="py-3 px-4 text-sm font-medium text-green-600">
                                                {parseFloat(supply.NIVEL_NUEVO).toFixed(2)} L
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-600">
                                                {supply.EMPLEADO}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </motion.div>

            {/* Modal Registrar Suministro */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Registrar Suministro">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            ID del Tanque *
                        </label>
                        <input
                            type="number"
                            name="tankId"
                            value={formData.tankId}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cantidad (Litros) *
                        </label>
                        <input
                            type="number"
                            step="0.001"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Costo (Opcional)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            name="cost"
                            value={formData.cost}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Observaciones
                        </label>
                        <textarea
                            name="observations"
                            value={formData.observations}
                            onChange={handleInputChange}
                            rows="3"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowModal(false)}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" variant="primary">
                            Registrar Suministro
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Supplies;
