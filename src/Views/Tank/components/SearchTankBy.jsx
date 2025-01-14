import React from "react";
import axios from 'axios';
import { useState } from "react";
import { useEfect } from "react";

const SearchTankBy = ({getTanks, filterTanksById, filterTankByNitClient}) => {

    const [searchType, setSearchType] = useState('tank'); // 'tank' o 'client'
    const [searchValue, setSearchValue] = useState('');
    const [tanks, setTanks] = useState([]);

    const onSearch = (value) => {
        if (value === '') {
            getTanks();
        } else {
            getTanksFiltered(value);
        }
    }
    const getTanksFiltered = async (value) => {
        if (searchType === 'tank') {
            filterTanksById(value);
        }else {
            filterTankByNitClient(value);
        }
    }

    return (
        <div className="w-full max-w-2xl mx-auto p-4">
            <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                    <span className={`text-sm ${searchType === 'tank' ? 'text-blue-600' : 'text-gray-500'}`}>
                        ID Tanque
                    </span>
                    <button
                        onClick={() => setSearchType(searchType === 'tank' ? 'client' : 'tank')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${searchType === 'client' ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-300 ${searchType === 'client' ? 'translate-x-6' : 'translate-x-1'
                                }`}
                        />
                    </button>
                    <span className={`text-sm ${searchType === 'client' ? 'text-blue-600' : 'text-gray-500'}`}>
                        NIT Cliente
                    </span>
                </div>
            </div>
            <div className="relative">
                <input
                    type="text"
                    placeholder={searchType === 'tank' ? "Buscar por ID de tanque..." : "Buscar por NIT de cliente..."}
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
    )
}

export default SearchTankBy;