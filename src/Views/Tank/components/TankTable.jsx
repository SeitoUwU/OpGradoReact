import React from "react";

const TankTable = ({tanks, loading }) => {
    const headers = tanks.length > 0 ? Object.keys(tanks[0]) : [];
    return (
        <div className="w-full px-4 py-8">
            <div className="overflow-x-auto rounded-lg shadow">
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-50">
                        <tr>
                            {headers.map((header) => (
                                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {!loading ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                    Cargando tanques...
                                </td>
                            </tr>
                        ) : tanks.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                    No hay tanques disponibles
                                </td>
                            </tr>
                        ) : (
                            
                            tanks.map((tank) => (
                                <tr key={tank.ID} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tank.ID}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tank.CAPACIDAD}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                           ${tank.ESTADO === 'ACTIVO'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'}`}>
                                            {tank.ESTADO}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tank.ASIGNACION_EMPL}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tank.CLIENTE}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tank.NIT_CLIENTE}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tank.SENSOR}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default TankTable;