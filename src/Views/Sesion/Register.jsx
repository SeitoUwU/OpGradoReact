import React, { useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Building2, Hash, Phone, MapPin, Eye, EyeOff, UserPlus } from 'lucide-react';
import { authAPI } from '../../services/apiV2.js';
import Button from '../../components/Button';
import Select from '../../components/Select';

function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        companyName: '',
        identificationType: 'cedula',
        identificationNumber: '',
        address: '',
        phone: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const identificationTypes = [
        { value: 'cedula', label: 'Cédula de Ciudadanía' },
        { value: 'nit', label: 'NIT' },
        { value: 'pasaporte', label: 'Pasaporte' },
        { value: 'extranjeria', label: 'Cédula de Extranjería' }
    ];

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'El nombre es requerido';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'El correo es requerido';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Correo electrónico inválido';
        }

        if (!formData.password) {
            newErrors.password = 'La contraseña es requerida';
        } else if (formData.password.length < 6) {
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden';
        }

        if (!formData.identificationNumber.trim()) {
            newErrors.identificationNumber = 'El número de identificación es requerido';
        }

        if (!formData.address.trim()) {
            newErrors.address = 'La dirección es requerida';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'El teléfono es requerido';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Por favor corrige los errores en el formulario', {
                duration: 2000,
                position: 'top-right',
            });
            return;
        }

        setLoading(true);

        try {
            await authAPI.register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: 'CLIENT',
                companyName: formData.companyName || null,
                identificationType: formData.identificationType,
                identificationNumber: formData.identificationNumber,
                address: formData.address,
                phone: formData.phone
            });

            toast.success('Cuenta creada exitosamente. Iniciando sesión...', {
                duration: 2000,
                position: 'top-right',
            });

            setTimeout(() => {
                navigate('/dashboard');
            }, 1500);
        } catch (error) {
            toast.error(error.message || 'Error al crear la cuenta', {
                duration: 2000,
                position: 'top-right',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    return (
        <>
            <Toaster />
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
                <div className="w-full max-w-2xl">
                    {/* Card principal */}
                    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                        {/* Header con logo */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-center">
                            <div className="flex justify-center mb-3">
                                <img
                                    src="/img/gasCaqueta.png"
                                    alt="Gas Caquetá Logo"
                                    className="h-20 w-auto object-contain"
                                />
                            </div>
                            <h1 className="text-2xl font-bold text-white mb-1">Crear Cuenta</h1>
                            <p className="text-blue-100">Regístrate para comenzar</p>
                        </div>

                        {/* Formulario */}
                        <div className="p-8">
                            <form onSubmit={handleRegister} className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* Nombre */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nombre Completo <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <User className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                name="name"
                                                type="text"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="Juan Pérez"
                                                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                                    errors.name ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            />
                                        </div>
                                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Correo Electrónico <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Mail className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="correo@ejemplo.com"
                                                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                                    errors.email ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            />
                                        </div>
                                        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                                    </div>

                                    {/* Contraseña */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Contraseña <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Lock className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                name="password"
                                                type={showPassword ? 'text' : 'password'}
                                                value={formData.password}
                                                onChange={handleChange}
                                                placeholder="••••••••"
                                                className={`w-full pl-10 pr-12 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                                    errors.password ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                            >
                                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                                    </div>

                                    {/* Confirmar Contraseña */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Confirmar Contraseña <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Lock className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                name="confirmPassword"
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                placeholder="••••••••"
                                                className={`w-full pl-10 pr-12 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                            >
                                                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                        {errors.confirmPassword && (
                                            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                                        )}
                                    </div>

                                    {/* Tipo de Identificación */}
                                    <div>
                                        <Select
                                            label="Tipo de Identificación"
                                            value={formData.identificationType}
                                            onChange={(value) => setFormData({ ...formData, identificationType: value })}
                                            options={identificationTypes}
                                            required
                                        />
                                    </div>

                                    {/* Número de Identificación */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Número de Identificación <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Hash className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                name="identificationNumber"
                                                type="text"
                                                value={formData.identificationNumber}
                                                onChange={handleChange}
                                                placeholder="123456789"
                                                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                                    errors.identificationNumber ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            />
                                        </div>
                                        {errors.identificationNumber && (
                                            <p className="mt-1 text-sm text-red-600">{errors.identificationNumber}</p>
                                        )}
                                    </div>

                                    {/* Empresa (opcional) */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Empresa (Opcional)
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Building2 className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                name="companyName"
                                                type="text"
                                                value={formData.companyName}
                                                onChange={handleChange}
                                                placeholder="Mi Empresa S.A.S"
                                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Teléfono */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Teléfono <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Phone className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                name="phone"
                                                type="tel"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder="3001234567"
                                                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                                    errors.phone ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            />
                                        </div>
                                        {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                                    </div>
                                </div>

                                {/* Dirección (campo completo) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Dirección <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute top-3 left-3 pointer-events-none">
                                            <MapPin className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            name="address"
                                            type="text"
                                            value={formData.address}
                                            onChange={handleChange}
                                            placeholder="Calle 123 #45-67"
                                            className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                                errors.address ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        />
                                    </div>
                                    {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
                                </div>

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="w-full"
                                    loading={loading}
                                    icon={<UserPlus size={20} />}
                                >
                                    {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                                </Button>
                            </form>

                            {/* Divider */}
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white text-gray-500">¿Ya tienes cuenta?</span>
                                </div>
                            </div>

                            {/* Login Link */}
                            <Link to="/login">
                                <button
                                    type="button"
                                    className="w-full px-4 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-all font-medium"
                                >
                                    Iniciar Sesión
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

export default Register;
