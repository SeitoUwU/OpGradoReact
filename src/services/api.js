// Base API URL
const API_URL = 'http://localhost:3000/api';

// Helper function to make API calls
const fetchAPI = async (endpoint, options = {}) => {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            credentials: 'include', // Importante para enviar cookies
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error en la petición');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

// ========== ALERTS API ==========
export const alertsAPI = {
    // Obtener alertas activas
    getActive: () => fetchAPI('/alerts/active'),

    // Marcar alerta como leída
    markAsRead: (id) => fetchAPI(`/alerts/mark-read/${id}`, { method: 'PUT' }),

    // Resolver alerta
    resolve: (id) => fetchAPI(`/alerts/resolve/${id}`, { method: 'PUT' }),

    // Enviar notificación por email
    sendNotification: (alertId) => fetchAPI('/alerts/send-notification', {
        method: 'POST',
        body: JSON.stringify({ alertId }),
    }),

    // Obtener historial de alertas
    getHistory: (params) => {
        const query = new URLSearchParams(params).toString();
        return fetchAPI(`/alerts/history?${query}`);
    },
};

// ========== SUPPLIES API ==========
export const suppliesAPI = {
    // Registrar suministro
    register: (data) => fetchAPI('/supplies/register', {
        method: 'POST',
        body: JSON.stringify(data),
    }),

    // Obtener historial de suministros
    getHistory: (params) => {
        const query = new URLSearchParams(params).toString();
        return fetchAPI(`/supplies/history?${query}`);
    },
};

// ========== TANK LEVEL API ==========
export const tankLevelAPI = {
    // Obtener nivel actual de un tanque
    getCurrentLevel: (id) => fetchAPI(`/tank-level/${id}/level`),

    // Obtener historial de niveles
    getHistory: (id, params) => {
        const query = new URLSearchParams(params).toString();
        return fetchAPI(`/tank-level/${id}/history?${query}`);
    },
};

// ========== MAINTENANCE API ==========
export const maintenanceAPI = {
    // Programar mantenimiento
    schedule: (data) => fetchAPI('/maintenance/schedule', {
        method: 'POST',
        body: JSON.stringify(data),
    }),

    // Obtener mantenimientos pendientes
    getPending: () => fetchAPI('/maintenance/pending'),

    // Completar mantenimiento
    complete: (id, data) => fetchAPI(`/maintenance/complete/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),

    // Obtener historial de mantenimientos
    getHistory: (params) => {
        const query = new URLSearchParams(params).toString();
        return fetchAPI(`/maintenance/history?${query}`);
    },
};

// ========== REPORTS API ==========
export const reportsAPI = {
    // Generar informe
    generate: (data) => fetchAPI('/reports/generate', {
        method: 'POST',
        body: JSON.stringify(data),
    }),

    // Descargar informe
    download: async (fileName) => {
        const response = await fetch(`${API_URL}/reports/download/${fileName}`, {
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Error al descargar el informe');
        }

        // Crear un blob y descargarlo
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    },

    // Listar informes generados
    list: () => fetchAPI('/reports/list'),
};

export default {
    alerts: alertsAPI,
    supplies: suppliesAPI,
    tankLevel: tankLevelAPI,
    maintenance: maintenanceAPI,
    reports: reportsAPI,
};
