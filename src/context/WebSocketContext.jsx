import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const WebSocketContext = createContext(null);

export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket debe usarse dentro de WebSocketProvider');
    }
    return context;
};

export const WebSocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [dashboardStats, setDashboardStats] = useState(null);
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        // Conectar al servidor WebSocket
        const newSocket = io('http://localhost:3000', {
            withCredentials: true,
            transports: ['websocket', 'polling']
        });

        newSocket.on('connect', () => {
            console.log('✅ WebSocket conectado');
            setIsConnected(true);
            toast.success('Conexión en tiempo real establecida');
        });

        newSocket.on('disconnect', () => {
            console.log('❌ WebSocket desconectado');
            setIsConnected(false);
            toast.error('Conexión en tiempo real perdida');
        });

        // Escuchar eventos
        newSocket.on('new_alert', (alert) => {
            console.log('📢 Nueva alerta recibida:', alert);
            setAlerts((prev) => [alert, ...prev]);

            // Mostrar notificación toast
            if (alert.ALE_TIPO === 'CRITICO') {
                toast.error(`¡Alerta Crítica! ${alert.ALE_MENSAJE}`, { duration: 5000 });
            } else {
                toast.warning(`Nueva alerta: ${alert.ALE_MENSAJE}`, { duration: 4000 });
            }
        });

        newSocket.on('alert_updated', (alert) => {
            console.log('📢 Alerta actualizada:', alert);
            setAlerts((prev) =>
                prev.map((a) => (a.ALE_ID === alert.ALE_ID ? alert : a))
            );
        });

        newSocket.on('tank_level_updated', (tankLevel) => {
            console.log('📢 Nivel de tanque actualizado:', tankLevel);
            toast.success(`Tanque ${tankLevel.TAN_ID} actualizado: ${tankLevel.percentage}%`);
        });

        newSocket.on('new_maintenance', (maintenance) => {
            console.log('📢 Nuevo mantenimiento:', maintenance);
            toast.info(`Nuevo mantenimiento programado: ${maintenance.MAN_DESCRIPCION}`);
        });

        newSocket.on('maintenance_updated', (maintenance) => {
            console.log('📢 Mantenimiento actualizado:', maintenance);
            toast.info(`Mantenimiento actualizado: ${maintenance.MAN_DESCRIPCION}`);
        });

        newSocket.on('new_supply', (supply) => {
            console.log('📢 Nuevo suministro:', supply);
            toast.success(`Nuevo suministro registrado: ${supply.SUM_CANTIDAD} unidades`);
        });

        newSocket.on('dashboard_stats', (stats) => {
            console.log('📊 Estadísticas del dashboard actualizadas:', stats);
            setDashboardStats(stats);
        });

        setSocket(newSocket);

        // Limpiar conexión al desmontar
        return () => {
            newSocket.close();
        };
    }, []);

    const value = {
        socket,
        isConnected,
        dashboardStats,
        alerts,
        setAlerts
    };

    return (
        <WebSocketContext.Provider value={value}>
            {children}
        </WebSocketContext.Provider>
    );
};
