import React, { useEffect } from "react";
import axios from "axios";
import { useState } from "react";
import { UserIcon } from "../../../assets/icons/Icons";
import { toast, Toaster } from "react-hot-toast";
import SelectClient from "./SelectClient";

const TankForm = ({ type, onClose, getTanks }) => {
    const [sensors, setSensors] = useState([]);
    const [clients, setClients] = useState([]);
    const [showClientInfo, setShowClientInfo] = useState(false);
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        tankId: '',
        storage: '',
        clientNit: '',
        sensorId: '',
        clientId: ''
    });
    const [client, setClient] = useState({
        clientNombre: '',
        clientApellido: ''
    });

    useEffect(() => {
        getSensorsWhitoutTank();
    }, []);

    const getOptionSelected = (e) => {
        setFormData({ ...formData, sensorId: e.target.value });
    }

    const handleClientInfo = () => {
        setIsClientModalOpen(true)
        getClients();
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if (type === 'add') {
            addTank();
        } else if (type === 'delete') {
            delteTank(formData.tankId);
        } else if (type === 'updateClient') {
            modifyTankClient(formData.tankId, formData.clientNit);
        } else if (type === 'updateSensor') {
            modifyTankSensor(formData.tankId, formData.sensorId);
        }
    }

    const getClients = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/client/getClients');
            setClients(response.data.data);
        } catch (error) {
            console.log(error);
        }
    }

    const getSensorsWhitoutTank = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/sensor/getSensorWhithoutTank');
            setSensors(response.data.data);
        } catch (error) {
            console.log(error);
        }
    }

    const addTank = async () => {
        console.log(formData);
        try {
            const response = await axios.post('http://localhost:3000/api/tank/createTank', {
                tankId: formData.tankId,
                tankCapacity: formData.storage,
                clientId: formData.clientId,
                sensorId: formData.sensorId
            }, {
                withCredentials: true
            });
            if (response.status === 200) {
                toast.success('Tanque insertado correctamente', {
                    duration: 1500,
                    position: 'top-right'
                });
                getTanks();
                onClose();
            }
        } catch (error) {
            toast.error('Error al insertar tanque', {
                duration: 2000,
                position: 'top-right'
            });
        }
    }

    const delteTank = async (tankId) => {
        try {
            const response = await axios.delete('http://localhost:3000/api/tank/deleteTank', {
                data: { tankId },
                withCredentials: true
            });
            if (response.status === 200) {
                toast.success('Tanque eliminado correctamente', {
                    duration: 1500,
                    position: 'top-right'
                });
                getTanks();
                onClose();
            }
        } catch (error) {
            toast.error('Error al eliminar el tanque', {
                duration: 1500,
                position: 'top-right'
            });
        }
    }

    const modifyTankClient = async (tankId, clientNit) => {
        try {
            const response = await axios.put('http://localhost:3000/api/tank/modifyTankClient', {
                tankId,
                clientNit
            }, {
                withCredentials: true
            });
            if (response.status === 200) {
                toast.success('Cliente modificado correctamente', {
                    duration: 1500,
                    position: 'top-right'
                });
                getTanks();
                onClose();
            }
        } catch (error) {
            toast.error('Error al modificar el cliente', {
                duration: 2000,
                position: 'top-right'
            });
        }
    }

    const modifyTankSensor = async (tankId, sensorId) => {
        try {
            const response = await axios.put('http://localhost:3000/api/tank/modifyTankSensor', {
                tankId: tankId,
                sensorId: sensorId
            }, {
                withCredentials: true
            });
            if (response.status === 200) {
                toast.success('Sensor modificado correctamente', {
                    duration: 1500,
                    position: 'top-right'
                });
                getTanks();
                onClose();
            }
        } catch (error) {
            toast.error('Error al modificar el sensor', {
                duration: 2000,
                position: 'top-right'
            });
        }
    }

    return (
        <>
            <Toaster />
            <div className="mt-4 p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        {type === 'add' && 'Agregar Tanque'}
                        {type === 'delete' && 'Eliminar Tanque'}
                        {type === 'updateClient' && 'Modificar Cliente'}
                        {type === 'updateSensor' && 'Modificar Sensor'}
                    </h2>

                    {/* Campos para Agregar */}
                    {type === 'add' && (
                        <>
                            <input
                                type="text"
                                placeholder="ID del Tanque"
                                value={formData.tankId}
                                onChange={(e) => setFormData({ ...formData, tankId: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg"
                            />
                            <input
                                type="number"
                                placeholder="Almacenamiento"
                                value={formData.storage}
                                onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg"
                            />
                            <select
                                value={formData.sensorId || ''}
                                onChange={(e) => setFormData({ ...formData, sensorId: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg"
                                
                            >
                                <option disabled value=''>Seleccione el sensor</option>
                                {sensors.map((sensor) => (
                                    <option key={sensor.ID} value={sensor.ID}>{sensor.ID}</option>
                                ))}
                            </select>
                            <div className="flex flex-col items-center mt-4">
                                <span className="text-gray-600 mb-2">Seleccionar Cliente</span>
                                <button
                                    type="button"
                                    onClick={() => handleClientInfo()}>
                                    <UserIcon className="h-12 w-12 text-gray-500 cursor-pointer hover:text-blue-500 transition-colors" />
                                </button>
                                <SelectClient
                                    isOpen={isClientModalOpen}
                                    onClose={() => setIsClientModalOpen(false)}
                                    onSelectClient={(client) => {
                                        setFormData({ ...formData, clientId: client.ID });
                                        setClient({...client, clientNombre: client.NOMBRE, clientApellido: client.APELLIDO});
                                        setIsClientModalOpen(false);
                                        setShowClientInfo(true);
                                    }}
                                    clients={clients}
                                    setClients={setClients}
                                    getClients={getClients}
                                />
                                {showClientInfo && (
                                    <div className="flex flex-col items-center mt-4">
                                        <span className="text-gray-600">Cliente Seleccionado</span>
                                        <span className="text-gray-800 font-semibold">{client.clientNombre}</span>
                                        <span className="text-gray-800 font-semibold">{client.clientApellido}</span>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* Campo para Eliminar */}
                    {type === 'delete' && (
                        <input
                            type="text"
                            placeholder="ID del Tanque"
                            value={formData.tankId}
                            onChange={(e) => setFormData({ ...formData, tankId: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg"
                        />
                    )}

                    {/* Campos para Modificar Cliente */}
                    {type === 'updateClient' && (
                        <>
                            <input
                                type="text"
                                placeholder="ID del Tanque"
                                value={formData.tankId}
                                onChange={(e) => setFormData({ ...formData, tankId: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg"
                            />
                            <input
                                type="text"
                                placeholder="NIT del Cliente"
                                value={formData.clientNit}
                                onChange={(e) => setFormData({ ...formData, clientNit: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg"
                            />
                        </>
                    )}

                    {/* Campos para Modificar Sensor */}
                    {type === 'updateSensor' && (
                        <>
                            <input
                                type="text"
                                placeholder="ID del Tanque"
                                value={formData.tankId}
                                onChange={(e) => setFormData({ ...formData, tankId: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg"
                            />
                            <select
                                value={formData.sensorId}
                                onChange={getOptionSelected}
                                className="w-full px-4 py-2 border rounded-lg"
                            >
                                <option value="" disabled>Seleccione el sensor</option>
                                {sensors.map((sensor) => (
                                    <option key={sensor.ID} value={sensor.ID}>{sensor.ID}</option>
                                ))}
                            </select>
                        </>
                    )}

                    <div className="flex gap-2 pt-4">
                        <button
                            type="submit"
                            className={`flex-1 px-4 py-2 text-white rounded-lg ${type === 'delete'
                                ? 'bg-red-500 hover:bg-red-600'
                                : type === 'updateClient' || type === 'updateSensor'
                                    ? 'bg-green-500 hover:bg-green-600'
                                    : 'bg-blue-500 hover:bg-blue-600'
                                }`}
                        >
                            {type === 'add' ? 'Agregar' : type === 'delete' ? 'Eliminar' : 'Actualizar'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </>
    )
}

export default TankForm;