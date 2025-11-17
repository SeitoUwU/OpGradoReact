import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext/AuthContextV2';
import {
    LayoutDashboard,
    Container,
    Gauge,
    Users,
    Bell,
    Calendar,
    FileText,
    Menu,
    X,
    LogOut,
    User,
    ChevronDown
} from 'lucide-react';

const MainLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const isAdmin = user?.role?.toLowerCase() === 'admin';

    const menuItems = [
        {
            path: '/dashboard',
            icon: LayoutDashboard,
            label: 'Dashboard',
            roles: ['admin', 'client']
        },
        {
            path: '/tank',
            icon: Container,
            label: 'Tanques',
            roles: ['admin', 'client']
        },
        {
            path: '/sensor',
            icon: Gauge,
            label: 'Sensores',
            roles: ['admin', 'client']
        },
        {
            path: '/alerts',
            icon: Bell,
            label: 'Alertas',
            roles: ['admin', 'client']
        },
        {
            path: '/recharges',
            icon: Calendar,
            label: 'Reabastecimientos',
            roles: ['admin', 'client']
        },
        {
            path: '/reports',
            icon: FileText,
            label: 'Informes',
            roles: ['admin', 'client']
        },
        {
            path: '/users',
            icon: Users,
            label: 'Usuarios',
            roles: ['admin']
        }
    ];

    const filteredMenuItems = menuItems.filter(item =>
        item.roles.includes(user?.role?.toLowerCase())
    );

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } bg-white w-64 shadow-2xl border-r border-gray-100`}
            >
                {/* Logo Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center gap-3">
                        <img
                            src="/img/gasCaqueta.png"
                            alt="Gas Caquetá"
                            className="h-10 w-auto object-contain"
                        />
                        <div>
                            <h2 className="text-gray-800 font-bold text-lg">Gas Caquetá</h2>
                            <p className="text-gray-500 text-xs">Sistema de Gestión</p>
                        </div>
                    </div>
                </div>

                {/* Navigation Menu */}
                <nav className="p-4 space-y-1">
                    {filteredMenuItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                                    active
                                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-200'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                            >
                                <Icon size={20} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User Info at Bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-2 rounded-xl shadow-md">
                            <User className="text-white" size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-gray-800 font-medium text-sm truncate">{user?.name}</p>
                            <p className="text-gray-500 text-xs truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white rounded-xl transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                    >
                        <LogOut size={18} />
                        <span className="font-medium">Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
                {/* Top Bar */}
                <header className="bg-white border-b border-gray-100 sticky top-0 z-30 backdrop-blur-sm bg-white/90">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="p-2 hover:bg-gray-100 rounded-xl transition-all"
                            >
                                {sidebarOpen ? <X size={24} className="text-gray-600" /> : <Menu size={24} className="text-gray-600" />}
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-gray-800">
                                    {filteredMenuItems.find(item => isActive(item.path))?.label || 'Dashboard'}
                                </h1>
                                <p className="text-sm text-gray-500">
                                    {isAdmin ? 'Panel de Administración' : 'Panel de Cliente'}
                                </p>
                            </div>
                        </div>

                        {/* User Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded-xl transition-all"
                            >
                                <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-2 rounded-xl shadow-sm">
                                    <User className="text-white" size={16} />
                                </div>
                                <span className="font-medium text-gray-700">{user?.name}</span>
                                <ChevronDown size={16} className="text-gray-400" />
                            </button>

                            {userMenuOpen && (
                                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                                    <div className="px-4 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                                        <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                                        <p className="text-xs text-gray-600 mt-0.5">{user?.email}</p>
                                        <span className="inline-block mt-2 px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs rounded-full font-medium shadow-sm">
                                            {user?.role}
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-all flex items-center gap-2 font-medium"
                                    >
                                        <LogOut size={16} />
                                        Cerrar Sesión
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6">
                    {children}
                </main>
            </div>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}
        </div>
    );
};

export default MainLayout;
