import React from "react";

const SensorTable = ({ sensors, loading }) => {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-CO'); // Formato: DD/MM/YYYY
    };

    return(
        <div className="w-full px-4 py-8">
            <div className="overflow-x-auto rounded-lg shadow">
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Creación</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empleado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {!loading ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">Cargando sensores...</td>
                            </tr>
                        ) : sensors.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">No hay sensores disponibles</td>
                            </tr>
                        ) : (
                            sensors.map((sensor) => (
                                <tr key={sensor.ID} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sensor.ID}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(sensor.FECHACREACION)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                            ${sensor.ESTADO === 'ASIGNADO'
                                                ? 'bg-green-100 text-green-800'
                                                : sensor.ESTADO === 'SIN ASIGNAR'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-red-100 text-red-800'}`}>
                                            {sensor.ESTADO}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sensor.EMPLEADO}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default SensorTable;