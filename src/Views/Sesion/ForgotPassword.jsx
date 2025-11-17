import React, { useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import Button from '../../components/Button';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            toast.error('Por favor ingresa tu correo electrónico', {
                duration: 2000,
                position: 'top-right',
            });
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            toast.error('Por favor ingresa un correo electrónico válido', {
                duration: 2000,
                position: 'top-right',
            });
            return;
        }

        setLoading(true);

        try {
            // TODO: Implementar llamada al backend para enviar email de recuperación
            // await authAPI.forgotPassword({ email });

            // Simulación
            await new Promise(resolve => setTimeout(resolve, 1500));

            setEmailSent(true);
            toast.success('Correo de recuperación enviado', {
                duration: 3000,
                position: 'top-right',
            });
        } catch (error) {
            toast.error(error.message || 'Error al enviar el correo de recuperación', {
                duration: 2000,
                position: 'top-right',
            });
        } finally {
            setLoading(false);
        }
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
                            <h1 className="text-3xl font-bold text-white mb-2">Recuperar Contraseña</h1>
                            <p className="text-blue-100">
                                {emailSent
                                    ? 'Revisa tu correo electrónico'
                                    : 'Ingresa tu correo para recuperar tu cuenta'}
                            </p>
                        </div>

                        {/* Formulario */}
                        <div className="p-8">
                            {!emailSent ? (
                                <>
                                    <p className="text-gray-600 text-center mb-6">
                                        Te enviaremos un enlace para restablecer tu contraseña
                                    </p>

                                    <form onSubmit={handleSubmit} className="space-y-6">
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
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    placeholder="correo@ejemplo.com"
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Submit Button */}
                                        <Button
                                            type="submit"
                                            variant="primary"
                                            className="w-full"
                                            loading={loading}
                                            icon={<Send size={20} />}
                                        >
                                            {loading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
                                        </Button>
                                    </form>
                                </>
                            ) : (
                                <div className="text-center space-y-4">
                                    {/* Success Icon */}
                                    <div className="flex justify-center mb-4">
                                        <div className="bg-green-100 rounded-full p-4">
                                            <Send className="h-12 w-12 text-green-600" />
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-semibold text-gray-900">¡Correo Enviado!</h3>
                                    <p className="text-gray-600">
                                        Hemos enviado un enlace de recuperación a <strong>{email}</strong>
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Si no recibes el correo en unos minutos, verifica tu carpeta de spam o correo no
                                        deseado.
                                    </p>

                                    {/* Resend Button */}
                                    <button
                                        onClick={() => {
                                            setEmailSent(false);
                                            setEmail('');
                                        }}
                                        className="text-blue-600 hover:text-blue-700 hover:underline text-sm font-medium"
                                    >
                                        ¿No recibiste el correo? Intentar de nuevo
                                    </button>
                                </div>
                            )}

                            {/* Divider */}
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300"></div>
                                </div>
                            </div>

                            {/* Back to Login Link */}
                            <Link to="/login">
                                <button
                                    type="button"
                                    className="w-full px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium flex items-center justify-center gap-2"
                                >
                                    <ArrowLeft size={20} />
                                    Volver al inicio de sesión
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

export default ForgotPassword;
