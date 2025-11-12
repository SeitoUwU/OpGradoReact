import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Users, Search, RefreshCw, Building2, MapPin, Mail, Hash } from 'lucide-react';
import Button from '../../components/Button';
import Card, { CardHeader, CardBody } from '../../components/Card';
import Badge from '../../components/Badge';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';

const Index = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState('nit');

    useEffect(() => {
        getClients();
    }, []);

    const getClients = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:3000/api/client/getClients');
            setClients(response.data.data);
        } catch (error) {
            toast.error('Error al cargar clientes');
        } finally {
            setLoading(false);
        }
    };

    const filterClientByNit = async (nit) => {
        try {
            setLoading(true);
            const response = await axios.post('http://localhost:3000/api/client/filterClientByNit', { nit });
            setClients(response.data.data);
        } catch (error) {
            toast.error('Error al filtrar por NIT');
        } finally {
            setLoading(false);
        }
    };

    const filterClientByCompany = async (company) => {
        try {
            setLoading(true);
            const response = await axios.post('http://localhost:3000/api/client/filterClientByCompany', { company });
            setClients(response.data.data);
        } catch (error) {
            toast.error('Error al filtrar por empresa');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        if (!searchTerm.trim()) {
            getClients();
            return;
        }

        if (searchType === 'nit') {
            filterClientByNit(searchTerm);
        } else {
            filterClientByCompany(searchTerm);
        }
    };

    // Estadísticas
    const totalClients = clients.length;
    const uniqueNeighborhoods = [...new Set(clients.map(c => c.BARRIO))].length;

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
                        <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-3 rounded-xl shadow-lg">
                            <Users className="text-white" size={32} />
                        </div>
                        Gestión de Clientes
                    </h1>
                    <p className="text-gray-600">Administra y visualiza la información de tus clientes</p>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                    <StatCard
                        title="Total Clientes"
                        value={totalClients}
                        icon={Users}
                        color="purple"
                    />
                    <StatCard
                        title="Barrios"
                        value={uniqueNeighborhoods}
                        icon={MapPin}
                        color="indigo"
                    />
                </motion.div>

                {/* Search Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card>
                        <CardBody>
                            <div className="flex flex-col lg:flex-row gap-4">
                                <Button
                                    variant="ghost"
                                    icon={<RefreshCw size={20} />}
                                    onClick={getClients}
                                >
                                    Actualizar
                                </Button>

                                <div className="flex gap-2 lg:ml-auto flex-1 lg:flex-initial">
                                    <select
                                        value={searchType}
                                        onChange={(e) => setSearchType(e.target.value)}
                                        className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="nit">Por NIT</option>
                                        <option value="company">Por Empresa</option>
                                    </select>
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder={searchType === 'nit' ? 'Ingrese el NIT' : 'Nombre de la empresa'}
                                        className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
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

                {/* Clients Grid */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <LoadingSpinner size="lg" text="Cargando clientes..." />
                    </div>
                ) : clients.length === 0 ? (
                    <Card>
                        <CardBody className="text-center py-12">
                            <Users className="mx-auto text-gray-400 mb-4" size={64} />
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">No hay clientes disponibles</h3>
                            <p className="text-gray-500">No se encontraron resultados</p>
                        </CardBody>
                    </Card>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {clients.map((client, index) => (
                            <motion.div
                                key={client.CEDULA}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card gradient>
                                    <CardHeader>
                                        <div className="flex items-center gap-3">
                                            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl">
                                                <Building2 className="text-white" size={24} />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-lg text-gray-900 truncate">
                                                    {client.EMPRESA}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge variant="info" size="sm">
                                                        NIT: {client.NIT}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardBody>
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3 py-2 border-b border-gray-100">
                                                <Hash className="text-gray-400 flex-shrink-0 mt-1" size={18} />
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Cédula</p>
                                                    <p className="text-sm font-semibold text-gray-900">{client.CEDULA}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3 py-2 border-b border-gray-100">
                                                <MapPin className="text-gray-400 flex-shrink-0 mt-1" size={18} />
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Dirección</p>
                                                    <p className="text-sm font-medium text-gray-700">{client.DIRECCION}</p>
                                                    <p className="text-xs text-gray-500 mt-1">Barrio: {client.BARRIO}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3 py-2">
                                                <Mail className="text-gray-400 flex-shrink-0 mt-1" size={18} />
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Correo Electrónico</p>
                                                    <p className="text-sm font-medium text-gray-700 break-all">
                                                        {client.CORREO}
                                                    </p>
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
        </>
    );
};

export default Index;
