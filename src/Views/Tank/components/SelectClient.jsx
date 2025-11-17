import React, { useState } from "react";
import { toast } from 'react-hot-toast';
import { usersAPI } from '../../../services/apiV2.js';

const SelectClient = ({ isOpen, onClose, onSelectClient, clients, setClients, getClients, }) => {
    const [searchType, setSearchType] = useState('empresa');
    const [searchValue, setSearchValue] = useState('');

    const filterClientsByCompany = async (company) => {
        try {
            const response = await usersAPI.getClients();
            const filtered = response.filter(client =>
                client.company?.toLowerCase().includes(company.toLowerCase())
            );
            setClients(filtered);
        } catch (error) {
            toast.error('Error al filtrar clientes');
            console.error(error);
        }
    }

    const onSearch = (value) => {
        if (value === '') {
            getClients();
        } else if (searchType === 'client') {
            filterClientsByCedula(value);
        } else if (searchType === 'empresa') {
            filterClientsByCompany(value);
        }
    }

    const filterClientsByCedula = async (cedula) => {
        try {
            const response = await usersAPI.getClients();
            const filtered = response.filter(client =>
                client.identificationNumber?.toLowerCase().includes(cedula.toLowerCase())
            );
            setClients(filtered);
        } catch (error) {
            toast.error('Error al filtrar clientes');
            console.error(error);
        }
    }

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full m-4">
                <div className="p-6">
                    <h3 className="text-lg font-medium mb-4">Seleccionar Cliente</h3>
                    <div className="overflow-x-auto">
                        <div className="w-full max-w-2xl mx-auto p-4">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex items-center gap-2">
                                    <span className={`text-sm ${searchType === 'empresa' ? 'text-blue-600' : 'text-gray-500'}`}>
                                        Empresa
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setSearchType(searchType === 'empresa' ? 'client' : 'empresa')}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${searchType === 'client' ? 'bg-blue-600' : 'bg-gray-200'
                                            }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-300 ${searchType === 'client' ? 'translate-x-6' : 'translate-x-1'
                                                }`}
                                        />
                                    </button>
                                    <span className={`text-sm ${searchType === 'client' ? 'text-blue-600' : 'text-gray-500'}`}>
                                        Cedula
                                    </span>
                                </div>
                            </div>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder={searchType === 'empresa' ? "Buscar por empresa..." : "Buscar por cedula de cliente..."}
                                    value={searchValue}
                                    onChange={(e) => {
                                        setSearchValue(e.target.value); 
                                        onSearch(e.target.value);
                                    }}
                                    className="w-full px-4 py-2 pl-10 pr-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <svg
                                    className="absolute left-3 top-3 h-4 w-4 text-gray-400"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                        </div>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Identificación</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Empresa</th>
                                    <th className="px-6 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {clients.map(client => (
                                    <tr key={client.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">{client.identificationNumber}</td>
                                        <td className="px-6 py-4">{client.name}</td>
                                        <td className="px-6 py-4">{client.email}</td>
                                        <td className="px-6 py-4">{client.company || 'N/A'}</td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => onSelectClient(client)}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                Seleccionar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}


export default SelectClient;