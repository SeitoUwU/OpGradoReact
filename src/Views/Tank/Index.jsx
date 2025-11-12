import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Container, Plus, Trash2, Edit, RefreshCw, Search, Users } from 'lucide-react';
import Button from '../../components/Button';
import Card, { CardHeader, CardBody } from '../../components/Card';
import Badge from '../../components/Badge';
import Modal, { ModalFooter } from '../../components/Modal';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';

function Index() {
    const [tanks, setTanks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [formData, setFormData] = useState({
        tankId: '',
        tankCapacity: '',
        clientId: '',
        sensorId: '',
        clientNit: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState('id');

    useEffect(() => {
        getTanks();
    }, []);

    const getTanks = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:3000/api/tank/getTanks');
            setTanks(response.data.data);
        } catch (error) {
            toast.error('Error al cargar tanques');
        } finally {
            setLoading(false);
        }
    };

    const filterTanksById = async (value) => {
        try {
            setLoading(true);
            const response = await axios.post('http://localhost:3000/api/tank/filterTankById', {
                tankId: value
            });
            setTanks(response.data.data);
        } catch (error) {
            toast.error('Error al filtrar tanques');
        } finally {
            setLoading(false);
        }
    };

    const filterTankByIdClient = async (value) => {
        try {
            setLoading(true);
            const response = await axios.post('http://localhost:3000/api/tank/filterTankByIdClient', {
                idClient: value
            });
            setTanks(response.data.data);
        } catch (error) {
            toast.error('Error al filtrar tanques');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        if (!searchTerm.trim()) {
            getTanks();
            return;
        }

        if (searchType === 'id') {
            filterTanksById(searchTerm);
        } else {
            filterTankByIdClient(searchTerm);
        }
    };

    const openModal = (type) => {
        setModalType(type);
        setShowModal(true);
        setFormData({ tankId: '', tankCapacity: '', clientId: '', sensorId: '', clientNit: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (modalType === 'add') {
                await axios.post('http://localhost:3000/api/tank/createTank', {
                    tankId: formData.tankId,
                    tankCapacity: formData.tankCapacity,
                    clientId: formData.clientId,
                    sensorId: formData.sensorId
                }, { withCredentials: true });
                toast.success('Tanque creado correctamente');
            } else if (modalType === 'delete') {
                await axios.delete('http://localhost:3000/api/tank/deleteTank', {
                    data: { tankId: formData.tankId },
                    withCredentials: true
                });
                toast.success('Tanque eliminado correctamente');
            } else if (modalType === 'modifyClient') {
                await axios.put('http://localhost:3000/api/tank/modifyTankClient', {
                    tankId: formData.tankId,
                    clientNit: formData.clientNit
                }, { withCredentials: true });
                toast.success('Cliente modificado correctamente');
            } else if (modalType === 'modifySensor') {
                await axios.put('http://localhost:3000/api/tank/modifyTankSensor', {
                    tankId: formData.tankId,
                    sensorId: formData.sensorId
                }, { withCredentials: true });
                toast.success('Sensor modificado correctamente');
            }
            await getTanks();
            setShowModal(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error en la operación');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Estadísticas
    const totalTanks = tanks.length;
    const activeTanks = tanks.filter(t => t.ESTADO === 'ACTIVO').length;
    const averageCapacity = tanks.length > 0
        ? (tanks.reduce((sum, t) => sum + parseFloat(t.CAPACIDAD || 0), 0) / tanks.length).toFixed(2)
        : 0;

    const getCapacityColor = (estado) => {
        return estado === 'ACTIVO' ? 'from-green-500 to-green-600' : 'from-gray-400 to-gray-500';
    };

    return (
        <>
            <Toaster />
            <div className="p-6 md:p-8 lg:p-10 space-y-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-2">
                        <div className="bg-gradient-to-br from-gc-green to-gc-green-600 p-3 rounded-xl shadow-lg">
                            <Container className="text-white" size={32} />
                        </div>
                        Gestión de Tanques
                    </h1>
                    <p className="text-gray-600">Administra y monitorea todos los tanques de gas</p>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                    <StatCard title="Total Tanques" value={totalTanks} icon={Container} color="green" />
                    <StatCard title="Tanques Activos" value={activeTanks} icon={Container} color="blue" />
                    <StatCard title="Capacidad Promedio" value={`${averageCapacity}L`} icon={Container} color="purple" />
                </motion.div>

                {/* Actions & Search */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card>
                        <CardBody>
                            <div className="flex flex-col lg:flex-row gap-4">
                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-3">
                                    <Button variant="primary" icon={<Plus size={20} />} onClick={() => openModal('add')}>
                                        Agregar
                                    </Button>
                                    <Button variant="danger" icon={<Trash2 size={20} />} onClick={() => openModal('delete')}>
                                        Eliminar
                                    </Button>
                                    <Button variant="warning" icon={<Edit size={20} />} onClick={() => openModal('modifyClient')}>
                                        Modificar Cliente
                                    </Button>
                                    <Button variant="warning" icon={<Edit size={20} />} onClick={() => openModal('modifySensor')}>
                                        Modificar Sensor
                                    </Button>
                                    <Button variant="ghost" icon={<RefreshCw size={20} />} onClick={getTanks}>
                                        Actualizar
                                    </Button>
                                </div>

                                {/* Search */}
                                <div className="flex gap-2 lg:ml-auto">
                                    <select
                                        value={searchType}
                                        onChange={(e) => setSearchType(e.target.value)}
                                        className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="id">Por ID</option>
                                        <option value="client">Por Cliente</option>
                                    </select>
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder={searchType === 'id' ? 'ID del tanque' : 'ID del cliente'}
                                        className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                    <Button variant="primary" icon={<Search size={20} />} onClick={handleSearch}>
                                        Buscar
                                    </Button>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </motion.div>

                {/* Tanks Grid */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <LoadingSpinner size="lg" text="Cargando tanques..." />
                    </div>
                ) : tanks.length === 0 ? (
                    <Card>
                        <CardBody className="text-center py-12">
                            <Container className="mx-auto text-gray-400 mb-4" size={64} />
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">No hay tanques disponibles</h3>
                            <p className="text-gray-500">Comienza agregando un nuevo tanque</p>
                        </CardBody>
                    </Card>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {tanks.map((tank, index) => (
                            <motion.div
                                key={tank.ID}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card gradient>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`bg-gradient-to-br ${getCapacityColor(tank.ESTADO)} p-2.5 rounded-lg`}>
                                                    <Container className="text-white" size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg text-gray-900">{tank.ID}</h3>
                                                    <p className="text-xs text-gray-500">Tanque ID</p>
                                                </div>
                                            </div>
                                            <Badge variant={tank.ESTADO === 'ACTIVO' ? 'success' : 'danger'} dot pulse>
                                                {tank.ESTADO}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardBody>
                                        <div className="space-y-4">
                                            {/* Capacity Bar */}
                                            <div>
                                                <div className="flex justify-between mb-2">
                                                    <span className="text-sm font-medium text-gray-700">Capacidad</span>
                                                    <span className="text-sm font-bold text-gray-900">{tank.CAPACIDAD} L</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-3">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${Math.min((tank.CAPACIDAD / 1000) * 100, 100)}%` }}
                                                        transition={{ duration: 1, delay: index * 0.1 }}
                                                        className={`bg-gradient-to-r ${getCapacityColor(tank.ESTADO)} h-3 rounded-full`}
                                                    />
                                                </div>
                                            </div>

                                            {/* Info */}
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between py-2 border-b border-gray-100">
                                                    <span className="text-gray-600">Cliente</span>
                                                    <span className="font-semibold text-gray-900">{tank.CLIENTE}</span>
                                                </div>
                                                <div className="flex justify-between py-2 border-b border-gray-100">
                                                    <span className="text-gray-600">NIT</span>
                                                    <span className="font-medium text-gray-700">{tank.NIT}</span>
                                                </div>
                                                <div className="flex justify-between py-2 border-b border-gray-100">
                                                    <span className="text-gray-600">Sensor</span>
                                                    <Badge variant="info" size="sm">{tank.SENSOR}</Badge>
                                                </div>
                                                <div className="flex justify-between py-2">
                                                    <span className="text-gray-600">Empleado</span>
                                                    <span className="font-medium text-gray-700">{tank.ASIGNACION_EMPL}</span>
                                                </div>
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
                title={
                    modalType === 'add' ? 'Agregar Nuevo Tanque' :
                    modalType === 'delete' ? 'Eliminar Tanque' :
                    modalType === 'modifyClient' ? 'Modificar Cliente' : 'Modificar Sensor'
                }
                size="md"
            >
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">ID del Tanque</label>
                            <input
                                type="text"
                                value={formData.tankId}
                                onChange={(e) => setFormData({ ...formData, tankId: e.target.value })}
                                placeholder="Ej: TANK-001"
                                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        {modalType === 'add' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Capacidad (L)</label>
                                    <input
                                        type="number"
                                        value={formData.tankCapacity}
                                        onChange={(e) => setFormData({ ...formData, tankCapacity: e.target.value })}
                                        placeholder="Ej: 500"
                                        className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">ID del Cliente</label>
                                    <input
                                        type="text"
                                        value={formData.clientId}
                                        onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                                        placeholder="ID del cliente"
                                        className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">ID del Sensor</label>
                                    <input
                                        type="text"
                                        value={formData.sensorId}
                                        onChange={(e) => setFormData({ ...formData, sensorId: e.target.value })}
                                        placeholder="ID del sensor"
                                        className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            </>
                        )}

                        {modalType === 'modifyClient' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">NIT del Cliente</label>
                                <input
                                    type="text"
                                    value={formData.clientNit}
                                    onChange={(e) => setFormData({ ...formData, clientNit: e.target.value })}
                                    placeholder="NIT del nuevo cliente"
                                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                        )}

                        {modalType === 'modifySensor' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">ID del Sensor</label>
                                <input
                                    type="text"
                                    value={formData.sensorId}
                                    onChange={(e) => setFormData({ ...formData, sensorId: e.target.value })}
                                    placeholder="ID del nuevo sensor"
                                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                        )}
                    </div>

                    <ModalFooter>
                        <Button variant="ghost" onClick={() => setShowModal(false)} type="button">
                            Cancelar
                        </Button>
                        <Button
                            variant={modalType === 'delete' ? 'danger' : 'primary'}
                            type="submit"
                            loading={isSubmitting}
                        >
                            {modalType === 'add' ? 'Agregar' : modalType === 'delete' ? 'Eliminar' : 'Modificar'}
                        </Button>
                    </ModalFooter>
                </form>
            </Modal>
        </>
    );
}

export default Index;
