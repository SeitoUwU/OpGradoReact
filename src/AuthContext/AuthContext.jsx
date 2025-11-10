import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/auth/verifyToken', {
                withCredentials: true
            });
            
            if (response.data.success) {
                setIsAuthenticated(true);
                setUser(response.data.user || null);
            } else {
                setIsAuthenticated(false);
                setUser(null);
            }
        } catch (error) {
            setIsAuthenticated(false);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        try {
            const response = await axios.post('http://localhost:3000/api/auth/login', credentials, {
                withCredentials: true
            });
            
            if (response.data.success) {
                setIsAuthenticated(true);
                setUser(response.data.user || null);
                return { success: true };
            }
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Error en login' };
        }
    };

    const logout = async () => {
        try {
            await axios.post('http://localhost:3000/api/auth/logout', {}, {
                withCredentials: true
            });
        } catch (error) {
            console.error('Error en logout:', error);
        } finally {
            setIsAuthenticated(false);
            setUser(null);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const value = {
        isAuthenticated,
        user,
        loading,
        login,
        logout,
        checkAuth
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};