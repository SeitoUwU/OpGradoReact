import axios from 'axios';
import React, { useState } from 'react';
import SensorForm from './sensorForm';
import { AddIcon, DeleteIcon, FilterIcon } from '../../../assets/icons/Icons';

const SensorOptions = ({ sensorStates, setSensors, refreshSensors }) => {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('');
    const [formType, setFormType] = useState("");
    const [showForm, setShowForm] = useState(false);

    const handleFilterChange = (value) => {
        setSelectedFilter(value);
        setIsFilterOpen(false);
        getSensorsFiltered(value);
    };

    const handleOptionClick = (type) => {
        setFormType(type);
        setShowForm(true);
    }

    const getSensorsFiltered = async (value) => {
        try {
            if (value) {
                const response = await axios.post('http://localhost:3000/api/sensor/filterSensorAs', {
                    sensorState: value
                })
                setSensors(response.data.data);
            } else {
                const response = await axios.get('http://localhost:3000/api/sensor/getSensor');
                setSensors(response.data.data);
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div>
            <div className="w-full p-4 bg-white shadow-sm flex justify-center">
                <div className="flex flex-wrap gap-4 items-center">
                    {/* Botón Agregar */}
                    <button
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2"
                        onClick={() => handleOptionClick('add')}
                    >
                        <AddIcon />
                        Agregar Sensor
                    </button>

                    {/* Botón Eliminar */}
                    <button
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center gap-2"
                        onClick={() => handleOptionClick('delete')}
                    >
                        <DeleteIcon />
                        Eliminar Sensor
                    </button>
                    {/* Menú desplegable de Filtros */}
                    <div className="relative">
                        <button
                            className={`px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors duration-200 flex items-center gap-2 ${isFilterOpen ? 'bg-yellow-600' : ''}`}
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                        >
                            <FilterIcon />
                            Filtrar {selectedFilter && `(${selectedFilter})`}
                        </button>

                        {isFilterOpen && (
                            <div className="absolute mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-10 border border-gray-200">
                                <div className="space-y-2 p-3">
                                    {sensorStates.map((state) => (
                                        <label
                                            key={state}
                                            className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                                        >
                                            <input
                                                type='radio'
                                                name='filter'
                                                value={state}
                                                checked={selectedFilter === state}
                                                onChange={() => handleFilterChange(state)}
                                                className="form-radio h-4 w-4 text-yellow-500 focus:ring-yellow-500"
                                            />
                                            <span className="text-gray-700">{state}</span>
                                        </label>
                                    ))}

                                    {selectedFilter && (
                                        <button
                                            onClick={() => handleFilterChange('')}
                                            className="w-full mt-2 text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                            Limpiar filtro
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {showForm && (
                <SensorForm
                    type={formType}
                    onClose={() => setShowForm(false)}
                    refreshSensors={refreshSensors}
                />
            )}
        </div>
    );
};

export default SensorOptions;