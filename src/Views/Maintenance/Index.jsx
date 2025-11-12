import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wrench, Plus, Calendar, Check, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { maintenanceAPI } from '../../services/api';

const Maintenance = () => {
    const [loading, setLoading] = useState(true);
    const [maintenances, setMaintenances] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('create'); // create | complete
    const [selectedMaintenance, setSelectedMaintenance] = useState(null);

    // Form state para crear
    const [formData, setFormData] = useState({
        type: 'PREVENTIVO',
        description: '',
        scheduledDate: '',
        tankId: '',
        employeeId: 1,
        observations: '',
        cost: '',
    });

    // Form state para completar
    const [completeData, setCompleteData] = useState({
        observations: '',
        cost: '',
    });

    useEffect(() => {
        fetchMaintenances();
    }, []);

    const fetchMaintenances = async () => {
        try {
            setLoading(true);
            const response = await maintenanceAPI.getPending();
            setMaintenances(response.data || []);
        } catch (error) {
            console.error('Error al cargar mantenimientos:', error);
            toast.error('Error al cargar los mantenimientos');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.type || !formData.description || !formData.scheduledDate || !formData.tankId) {
            toast.error('Todos los campos obligatorios deben completarse');
            return;
        }

        try {
            await maintenanceAPI.schedule(formData);
            toast.success('Mantenimiento programado exitosamente');
            setShowModal(false);
            setFormData({
                type: 'PREVENTIVO',
                description: '',
                scheduledDate: '',
                tankId: '',
                employeeId: 1,
                observations: '',
                cost: '',
            });
            fetchMaintenances();
        } catch (error) {
            console.error('Error al programar mantenimiento:', error);
            toast.error('Error al programar el mantenimiento');
        }
    };

    const handleComplete = async (e) => {
        e.preventDefault();

        try {
            await maintenanceAPI.complete(selectedMaintenance.ID, completeData);
            toast.success('Mantenimiento completado exitosamente');
            setShowModal(false);
            setCompleteData({ observations: '', cost: '' });
            setSelectedMaintenance(null);
            fetchMaintenances();
        } catch (error) {
            console.error('Error al completar mantenimiento:', error);
            toast.error('Error al completar el mantenimiento');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleCompleteInputChange = (e) => {
        const { name, value } = e.target;
        setCompleteData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const openCompleteModal = (maintenance) => {
        setSelectedMaintenance(maintenance);
        setModalType('complete');
        setShowModal(true);
    };

    const openCreateModal = () => {
        setModalType('create');
        setShowModal(true);
    };

    const getStatusColor = (estado) => {
        switch (estado) {
            case 'PROGRAMADO':
                return 'blue';
            case 'EN_PROCESO':
                return 'yellow';
            case 'COMPLETADO':
                return 'green';
            default:
                return 'gray';
        }
    };

    const getTypeColor = (tipo) => {
        switch (tipo) {
            case 'PREVENTIVO':
                return 'green';
            case 'CORRECTIVO':
                return 'red';
            case 'INSPECCION':
                return 'blue';
            default:
                return 'gray';
        }
    };

    // Stats
    const programados = maintenances.filter(m => m.ESTADO === 'PROGRAMADO').length;
    const enProceso = maintenances.filter(m => m.ESTADO === 'EN_PROCESO').length;

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
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Mantenimientos</h1>
                    <p className="text-gray-600">Gestión de mantenimientos preventivos y correctivos</p>
                </div>
                <Button
                    variant="primary"
                    onClick={openCreateModal}
                    className="flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Programar Mantenimiento
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
                            <p className="text-sm text-gray-600 mb-1">Total Pendientes</p>
                            <p className="text-2xl font-bold text-gray-900">{maintenances.length}</p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-xl">
                            <Wrench className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Programados</p>
                            <p className="text-2xl font-bold text-gray-900">{programados}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-xl">
                            <Calendar className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">En Proceso</p>
                            <p className="text-2xl font-bold text-gray-900">{enProceso}</p>
                        </div>
                        <div className="p-3 bg-yellow-100 rounded-xl">
                            <Clock className="w-6 h-6 text-yellow-600" />
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Lista de Mantenimientos */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="space-y-6"
            >
                {maintenances.length === 0 ? (
                    <Card className="p-6">
                        <div className="text-center py-12 text-gray-500">
                            <Wrench className="w-16 h-16 mx-auto mb-4 opacity-30" />
                            <p className="text-lg mb-2">No hay mantenimientos pendientes</p>
                            <p className="text-sm">Programa un nuevo mantenimiento para comenzar</p>
                        </div>
                    </Card>
                ) : (
                    maintenances.map((maintenance, index) => (
                        <motion.div
                            key={maintenance.ID}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className="hover:shadow-lg transition-shadow p-6">
                                <div className="flex flex-col lg:flex-row gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <Badge variant={getTypeColor(maintenance.TIPO)}>
                                                    {maintenance.TIPO}
                                                </Badge>
                                                <Badge variant={getStatusColor(maintenance.ESTADO)}>
                                                    {maintenance.ESTADO}
                                                </Badge>
                                            </div>
                                            <span className="text-sm text-gray-500">
                                                #{maintenance.ID}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                            {maintenance.DESCRIPCION}
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Calendar className="w-4 h-4" />
                                                <span>Programado: {new Date(maintenance.FECHA_PROGRAMADA).toLocaleDateString('es-ES')}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Wrench className="w-4 h-4" />
                                                <span>Tanque #{maintenance.TANQUE_ID}</span>
                                            </div>
                                            {maintenance.RESPONSABLE && (
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <AlertCircle className="w-4 h-4" />
                                                    <span>{maintenance.RESPONSABLE}</span>
                                                </div>
                                            )}
                                        </div>

                                        {maintenance.OBSERVACIONES && (
                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-medium">Observaciones:</span> {maintenance.OBSERVACIONES}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex lg:flex-col gap-2 justify-end">
                                        {maintenance.ESTADO === 'PROGRAMADO' && (
                                            <Button
                                                variant="success"
                                                size="sm"
                                                onClick={() => openCompleteModal(maintenance)}
                                                className="flex items-center gap-2"
                                            >
                                                <Check className="w-4 h-4" />
                                                <span className="hidden md:inline">Completar</span>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))
                )}
            </motion.div>

            {/* Modal Programar/Completar */}
            <Modal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    setSelectedMaintenance(null);
                }}
                title={modalType === 'create' ? 'Programar Mantenimiento' : 'Completar Mantenimiento'}
            >
                {modalType === 'create' ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tipo *
                            </label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                                <option value="PREVENTIVO">Preventivo</option>
                                <option value="CORRECTIVO">Correctivo</option>
                                <option value="INSPECCION">Inspección</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Descripción *
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                required
                                rows="3"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Fecha Programada *
                            </label>
                            <input
                                type="date"
                                name="scheduledDate"
                                value={formData.scheduledDate}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>

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

                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowModal(false)}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" variant="primary">
                                Programar
                            </Button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleComplete} className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-lg mb-4">
                            <p className="text-sm text-blue-800">
                                <span className="font-medium">Mantenimiento:</span> {selectedMaintenance?.DESCRIPCION}
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Observaciones del Trabajo Realizado
                            </label>
                            <textarea
                                name="observations"
                                value={completeData.observations}
                                onChange={handleCompleteInputChange}
                                rows="4"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Costo del Mantenimiento
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                name="cost"
                                value={completeData.cost}
                                onChange={handleCompleteInputChange}
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
                            <Button type="submit" variant="success">
                                Completar Mantenimiento
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
};

export default Maintenance;
