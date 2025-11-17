import React, { useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../AuthContext/AuthContextV2';
import { Mail, Lock, Eye, EyeOff, LogIn as LoginIcon } from 'lucide-react';
import Button from '../../components/Button';
import Input from '../../components/Input';

function LogIn() {
    const [credentials, setCredentials] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!credentials.email || !credentials.password) {
            toast.error('Por favor completa todos los campos', {
                duration: 2000,
                position: 'top-right',
            });
            return;
        }

        setLoading(true);

        try {
            const result = await login({
                email: credentials.email,
                password: credentials.password
            });

            if (result.success) {
                toast.success('¡Bienvenido!', {
                    duration: 1500,
                    position: 'top-right',
                });
                navigate('/dashboard');
            } else {
                toast.error(result.error || 'Credenciales incorrectas', {
                    duration: 2000,
                    position: 'top-right',
                });
            }
        } catch (error) {
            toast.error('Error al intentar iniciar sesión', {
                duration: 2000,
                position: 'top-right',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    return (
        <>
            <Toaster />
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    {/* Card principal */}
                    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                        {/* Header con logo */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-center">
                            <div className="flex justify-center mb-4">
                                <img
                                    src="/img/gasCaqueta.png"
                                    alt="Gas Caquetá Logo"
                                    className="h-24 w-auto object-contain"
                                />
                            </div>
                            <h1 className="text-3xl font-bold text-white mb-2">Bienvenido</h1>
                            <p className="text-blue-100">Inicia sesión para continuar</p>
                        </div>

                        {/* Formulario */}
                        <div className="p-8">
                            <form onSubmit={handleLogin} className="space-y-6">
                                {/* Email Input */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Correo Electrónico
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            name="email"
                                            type="email"
                                            value={credentials.email}
                                            onChange={handleChange}
                                            placeholder="correo@ejemplo.com"
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Password Input */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Contraseña
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={credentials.password}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-5 w-5" />
                                            ) : (
                                                <Eye className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Forgot Password Link */}
                                <div className="flex items-center justify-end">
                                    <Link
                                        to="/forgot-password"
                                        className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                                    >
                                        ¿Olvidaste tu contraseña?
                                    </Link>
                                </div>

                                {/* Login Button */}
                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="w-full"
                                    loading={loading}
                                    icon={<LoginIcon size={20} />}
                                >
                                    {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                                </Button>
                            </form>

                            {/* Divider */}
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white text-gray-500">¿No tienes cuenta?</span>
                                </div>
                            </div>

                            {/* Register Link */}
                            <Link to="/register">
                                <button
                                    type="button"
                                    className="w-full px-4 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-all font-medium"
                                >
                                    Crear una cuenta
                                </button>
                            </Link>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center mt-6 text-sm text-gray-600">
                        <p>© 2025 Gas Caquetá. Todos los derechos reservados.</p>
                    </div>
                </div>
            </div>
        </>
    );
}

export default LogIn;
