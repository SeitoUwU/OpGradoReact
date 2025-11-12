import React, { useEffect, useState } from "react";
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Gauge, Plus, Trash2, Filter, RefreshCw, Activity } from 'lucide-react';
import Button from '../../components/Button';
import Card, { CardHeader, CardBody } from '../../components/Card';
import Badge from '../../components/Badge';
import Modal, { ModalFooter } from '../../components/Modal';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';

function Index() {
    const [sensors, setSensors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [states, setStates] = useState([]);
    const [selectedFilter, setSelectedFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [sensorId, setSensorId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        getSensors();
        getSensorStates();
    }, []);

    const getSensors = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:3000/api/sensor/getSensor');
            setSensors(response.data.data);
        } catch (error) {
            toast.error('Error al cargar sensores');
        } finally {
            setLoading(false);
        }
    };

    const getSensorStates = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/sensor/getSensorStates');
            setStates(response.data.data.map((state) => state.ESTADO));
        } catch (error) {
            console.log(error);
        }
    };

    const getSensorsFiltered = async (value) => {
        try {
            setLoading(true);
            if (value) {
                const response = await axios.post('http://localhost:3000/api/sensor/filterSensorAs', {
                    sensorState: value
                });
                setSensors(response.data.data);
            } else {
                await getSensors();
            }
        } catch (error) {
            toast.error('Error al filtrar sensores');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (value) => {
        setSelectedFilter(value);
        getSensorsFiltered(value);
    };

    const openModal = (type) => {
        setModalType(type);
        setShowModal(true);
        setSensorId('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (modalType === 'add') {
            await createSensor();
        } else {
            await deleteSensor();
        }

        setIsSubmitting(false);
        setShowModal(false);
    };

    const createSensor = async () => {
        try {
            await axios.post('http://localhost:3000/api/sensor/createSensor', {
                sensorId
            }, {
                withCredentials: true
            });
            toast.success('Sensor creado correctamente');
            await getSensors();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al crear sensor');
        }
    };

    const deleteSensor = async () => {
        try {
            await axios.delete('http://localhost:3000/api/sensor/deleteSensor', {
                data: { sensorId },
                withCredentials: true
            });
            toast.success('Sensor eliminado correctamente');
            await getSensors();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al eliminar sensor');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getStateBadge = (estado) => {
        const variants = {
            'ASIGNADO': 'success',
            'SIN ASIGNAR': 'warning',
            'INACTIVO': 'danger'
        };
        return variants[estado] || 'gray';
    };

    // Calcular estadísticas
    const totalSensors = sensors.length;
    const asignados = sensors.filter(s => s.ESTADO === 'ASIGNADO').length;
    const sinAsignar = sensors.filter(s => s.ESTADO === 'SIN ASIGNAR').length;

    return (
        <>
            <Toaster />
            <div className="space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
                >
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-xl shadow-lg">
                                <Gauge className="text-white" size={32} />
                            </div>
                            Gestión de Sensores
                        </h1>
                        <p className="text-gray-600 mt-2">Administra y monitorea todos los sensores del sistema</p>
                    </div>
                </motion.div>

                {/* Stats Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                    <StatCard
                        title="Total Sensores"
                        value={totalSensors}
                        icon={Gauge}
                        color="blue"
                    />
                    <StatCard
                        title="Asignados"
                        value={asignados}
                        icon={Activity}
                        color="green"
                    />
                    <StatCard
                        title="Sin Asignar"
                        value={sinAsignar}
                        icon={Gauge}
                        color="yellow"
                    />
                </motion.div>

                {/* Actions Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card>
                        <CardBody>
                            <div className="flex flex-wrap gap-3">
                                <Button
                                    variant="primary"
                                    icon={<Plus size={20} />}
                                    onClick={() => openModal('add')}
                                >
                                    Agregar Sensor
                                </Button>
                                <Button
                                    variant="danger"
                                    icon={<Trash2 size={20} />}
                                    onClick={() => openModal('delete')}
                                >
                                    Eliminar Sensor
                                </Button>
                                <Button
                                    variant="ghost"
                                    icon={<RefreshCw size={20} />}
                                    onClick={getSensors}
                                >
                                    Actualizar
                                </Button>

                                {/* Filter Dropdown */}
                                <div className="relative ml-auto">
                                    <select
                                        value={selectedFilter}
                                        onChange={(e) => handleFilterChange(e.target.value)}
                                        className="px-4 py-2 pr-10 border-2 border-gray-300 rounded-lg
                                                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                                 bg-white text-gray-700 font-medium cursor-pointer"
                                    >
                                        <option value="">Todos los estados</option>
                                        {states.map((state) => (
                                            <option key={state} value={state}>{state}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </motion.div>

                {/* Sensors Grid */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <LoadingSpinner size="lg" text="Cargando sensores..." />
                    </div>
                ) : sensors.length === 0 ? (
                    <Card>
                        <CardBody className="text-center py-12">
                            <Gauge className="mx-auto text-gray-400 mb-4" size={64} />
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                No hay sensores disponibles
                            </h3>
                            <p className="text-gray-500">Comienza agregando un nuevo sensor</p>
                        </CardBody>
                    </Card>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {sensors.map((sensor, index) => (
                            <motion.div
                                key={sensor.ID}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card gradient>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-lg">
                                                    <Gauge className="text-white" size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg text-gray-900">
                                                        {sensor.ID}
                                                    </h3>
                                                    <p className="text-xs text-gray-500">Sensor ID</p>
                                                </div>
                                            </div>
                                            <Badge variant={getStateBadge(sensor.ESTADO)} dot pulse>
                                                {sensor.ESTADO}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardBody>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                                <span className="text-sm text-gray-600">Empleado</span>
                                                <span className="text-sm font-semibold text-gray-900">
                                                    {sensor.EMPLEADO}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between py-2">
                                                <span className="text-sm text-gray-600">Fecha Creación</span>
                                                <span className="text-sm font-medium text-gray-700">
                                                    {formatDate(sensor.FECHACREACION)}
                                                </span>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>

            {/* Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={modalType === 'add' ? 'Agregar Nuevo Sensor' : 'Eliminar Sensor'}
                size="sm"
            >
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {modalType === 'add' ? 'ID del Sensor' : 'ID del Sensor a Eliminar'}
                            </label>
                            <input
                                type="text"
                                value={sensorId}
                                onChange={(e) => setSensorId(e.target.value)}
                                placeholder={modalType === 'add' ? 'Ej: SENSOR-001' : 'Ingrese el ID'}
                                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg
                                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>
                    </div>

                    <ModalFooter>
                        <Button
                            variant="ghost"
                            onClick={() => setShowModal(false)}
                            type="button"
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant={modalType === 'add' ? 'primary' : 'danger'}
                            type="submit"
                            loading={isSubmitting}
                        >
                            {modalType === 'add' ? 'Agregar' : 'Eliminar'}
                        </Button>
                    </ModalFooter>
                </form>
            </Modal>
        </>
    );
}

export default Index;
