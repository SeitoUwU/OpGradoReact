import React, { useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext/AuthContext';
import { motion } from 'framer-motion';
import { Droplet, Lock, User, ArrowRight } from 'lucide-react';

function LogIn() {
    const [user, setUser] = useState({
        nameUser: '',
        userPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await login({
                nameUser: user.nameUser,
                userPassword: user.userPassword
            });

            if (result.success) {
                toast.success('Inicio de sesión exitoso', {
                    duration: 2000,
                });
                setTimeout(() => navigate('/sensor'), 500);
            } else {
                toast.error(result.error || 'Error al intentar iniciar sesión');
            }
        } catch (error) {
            toast.error('Error al intentar iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    return (
        <>
            <Toaster position="top-right" />
            <div className="min-h-screen bg-gradient-to-br from-gc-blue via-gc-blue-600 to-gc-blue-600 flex items-center justify-center p-4">
                {/* Background Decorations */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-gc-green rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gc-orange rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gc-lime rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
                </div>

                {/* Login Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative w-full max-w-md"
                >
                    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                        {/* Header with gradient */}
                        <div className="bg-gradient-to-r from-gc-blue to-gc-blue-600 px-8 py-10 text-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                                className="inline-block bg-white/20 backdrop-blur-sm p-4 rounded-2xl mb-4"
                            >
                                <img
                                    src="/img/gasCaqueta.png"
                                    alt="GasCaquetá Logo"
                                    className="w-16 h-16 object-contain"
                                />
                            </motion.div>
                            <h1 className="text-3xl font-bold text-white mb-2">
                                GasCaquetá
                            </h1>
                            <p className="text-gc-lime-100 text-sm">
                                Sistema de Monitoreo de Gas
                            </p>
                        </div>

                        {/* Form */}
                        <div className="px-8 py-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                                Bienvenido
                            </h2>
                            <p className="text-gray-600 text-center mb-8">
                                Ingresa tus credenciales para continuar
                            </p>

                            <form onSubmit={handleLogin} className="space-y-6">
                                {/* Usuario Input */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Usuario
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <User className="text-gray-400" size={20} />
                                        </div>
                                        <input
                                            name="nameUser"
                                            value={user.nameUser}
                                            onChange={handleChange}
                                            placeholder="Ingrese su usuario"
                                            type="text"
                                            required
                                            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl
                                                     focus:outline-none focus:ring-2 focus:ring-gc-blue focus:border-transparent
                                                     transition-all duration-200 bg-gray-50 hover:bg-white"
                                        />
                                    </div>
                                </div>

                                {/* Password Input */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Contraseña
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock className="text-gray-400" size={20} />
                                        </div>
                                        <input
                                            name="userPassword"
                                            value={user.userPassword}
                                            onChange={handleChange}
                                            placeholder="Ingrese su contraseña"
                                            type="password"
                                            required
                                            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl
                                                     focus:outline-none focus:ring-2 focus:ring-gc-blue focus:border-transparent
                                                     transition-all duration-200 bg-gray-50 hover:bg-white"
                                        />
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <motion.button
                                    whileHover={{ scale: loading ? 1 : 1.02 }}
                                    whileTap={{ scale: loading ? 1 : 0.98 }}
                                    type="submit"
                                    disabled={loading}
                                    className={`
                                        w-full py-3.5 px-6 rounded-xl font-semibold text-white
                                        bg-gradient-to-r from-gc-blue to-gc-blue-600
                                        hover:from-gc-blue-600 hover:to-gc-blue-600
                                        shadow-lg shadow-gc-blue/30
                                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gc-blue
                                        transition-all duration-200
                                        flex items-center justify-center gap-2
                                        ${loading ? 'opacity-70 cursor-not-allowed' : ''}
                                    `}
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Ingresando...
                                        </>
                                    ) : (
                                        <>
                                            Iniciar Sesión
                                            <ArrowRight size={20} />
                                        </>
                                    )}
                                </motion.button>
                            </form>

                            {/* Footer */}
                            <div className="mt-8 text-center">
                                <p className="text-sm text-gray-500">
                                    Sistema de gestión y monitoreo
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    v1.0.0 - 2025
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Bottom decoration */}
                    <div className="text-center mt-6">
                        <p className="text-white/80 text-sm">
                            Desarrollado para GasCaquetá
                        </p>
                    </div>
                </motion.div>
            </div>

            <style>{`
                @keyframes blob {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    25% { transform: translate(20px, -50px) scale(1.1); }
                    50% { transform: translate(-20px, 20px) scale(0.9); }
                    75% { transform: translate(50px, 50px) scale(1.05); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </>
    );
}

export default LogIn;
