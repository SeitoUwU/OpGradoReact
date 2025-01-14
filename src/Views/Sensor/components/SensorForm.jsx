import axios from 'axios';
import React, { useState } from "react";
import { toast, Toaster } from 'react-hot-toast'


const SensorForm = ({ type, onClose, refreshSensors }) => {
    const [sensorId, setSensorId] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (type === 'add') {
            createSensor(sensorId);
            onClose();
        } else {
            deleteSensor(sensorId);
            onClose();
        }
    };

    const createSensor = async () => {
        try {
            const response = await axios.post('http://localhost:3000/api/sensor/createSensor', {
                sensorId
            }, {
                withCredentials: true
            });
            toast.success('Sensor insertado correctamente', {
                duration: 1500,
                position: 'top-right',
            });
            await refreshSensors();
        } catch (error) {
            console.log(error);
            toast.error('Error al insertar sensor', {
                duration: 2000,
                position: 'top-right',
            });
        }
    }

    const deleteSensor = async (sensorId) => {
        try {
            const response = await axios.delete('http://localhost:3000/api/sensor/deleteSensor', {
                data: { sensorId },
                withCredentials: true
            });
            toast.success('Sensor eliminado correctamente', {
                duration: 1500,
                position: 'top-right',
            });
            await refreshSensors();
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <>
            <Toaster />
            <div className="mt-4 p-4 bg-white rounded-lg shadow-md max-w-md mx-auto">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-800">
                        {type === 'add' ? 'Agregar Nuevo Sensor' : 'Eliminar Sensor'}
                    </h2>

                    <div className="space-y-2">
                        <input
                            type="text"
                            value={sensorId}
                            onChange={(e) => setSensorId(e.target.value)}
                            placeholder={type === 'add' ? "Nombre del sensor" : "ID del sensor a eliminar"}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="submit"
                            className={`px-4 py-2 text-white rounded-lg transition-colors duration-200 flex-1
                            ${type === 'add'
                                    ? 'bg-blue-500 hover:bg-blue-600'
                                    : 'bg-red-500 hover:bg-red-600'}`}
                        >
                            {type === 'add' ? 'Agregar' : 'Eliminar'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors duration-200"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default SensorForm;