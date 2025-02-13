import React, { useState } from "react";
import { AddIcon, DeleteIcon, EditIcon, SensorIcon } from "../../../assets/icons/Icons";
import TankForm from "./TankForm";
import SearchTank from "./SearchTankBy";

const TankOptions = ({ getTanks, filterTanksById, filterTankByIdClient }) => {
    const [showForm, setShowForm] = useState(false);
    const [formType, setFormType] = useState('');

    const handleOptionClick = (type) => {
        setFormType(type);
        setShowForm(true);
    }

    return (
        <div>
            <div className="w-full p-4 bg-white shadow-sm flex justify-center">
                <div className="flex flex-wrap gap-4 items-center">
                    <button
                        onClick={() => handleOptionClick('add')}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2"
                    >
                        <AddIcon />
                        Agregar Tanque
                    </button>

                    <button
                        onClick={() => handleOptionClick('delete')}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center gap-2"
                    >
                        <DeleteIcon />
                        Eliminar Tanque
                    </button>

                    <button
                        onClick={() => handleOptionClick('updateClient')}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 flex items-center gap-2"
                    >
                        <EditIcon />
                        Modificar Cliente
                    </button>

                    <button
                        onClick={() => handleOptionClick('updateSensor')}
                        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors duration-200 flex items-center gap-2"
                    >
                        <SensorIcon />
                        Modificar Sensor
                    </button>
                </div>
            </div>
            {showForm && (
                <TankForm
                    type={formType}
                    onClose={() => setShowForm(false)}
                    getTanks={getTanks}
                />
            )}
            <SearchTank
                getTanks={getTanks}
                filterTanksById={filterTanksById}
                filterTankByIdClient={filterTankByIdClient}
            />
        </div>
    )
}

export default TankOptions;