import React from 'react'
import { useState } from 'react'
import { toast, Toaster } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../AuthContext/AuthContext'

function LogIn() {
    const [user, setUser] = useState({
        nameUser: '',
        userPassword: ''
    })
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate();
    const { login } = useAuth(); 

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true)
        
        try {
            const result = await login({
                nameUser: user.nameUser,
                userPassword: user.userPassword
            });

            if (result.success) {
                navigate('/sensor')
            } else {
                toast.error(result.error || 'Error al intentar iniciar sesión', {
                    duration: 1500,
                    position: 'top-right',
                });
            }
        } catch (error) {
            toast.error('Error al intentar iniciar sesión', {
                duration: 1500,
                position: 'top-right',
            });
        } finally {
            setLoading(false)
        }
    };

    const handleChange = (e) => {
        setUser({
            ...user,
            [e.target.name]: e.target.value
        })
    }

    return (
        <>
            <Toaster />
            <div className="flex items-center justify-center min-h-screen">
                <div className="max-w-sm mx-auto bg-white rounded-lg shadow-md overflow-hidden p-6">
                    <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Welcome To GasCaqueta</h1>
                    <form onSubmit={handleLogin}>
                        <div className="space-y-4">
                            <input name='nameUser'
                                value={user.nameUser}
                                onChange={handleChange}
                                placeholder="Ingrese su usuario"
                                type="text"
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input name='userPassword'
                                value={user.userPassword}
                                onChange={handleChange}
                                placeholder="Ingrese su contraseña"
                                type="password"
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-300 focus:outline-none ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Ingresando...' : 'Ingresar'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}

export default LogIn