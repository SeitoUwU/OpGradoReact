import { API_URL } from '../config/config.js';

const fetchAPI = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
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

export const authAPI = {
  login: async (credentials) => {
    const response = await fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (response.accessToken) {
      localStorage.setItem('token', response.accessToken);
    }
    return response;
  },

  register: async (userData) => {
    const response = await fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (response.accessToken) {
      localStorage.setItem('token', response.accessToken);
    }
    return response;
  },

  logout: () => {
    localStorage.removeItem('token');
    return fetchAPI('/auth/logout', { method: 'POST' });
  },

  getProfile: () => fetchAPI('/auth/profile'),

  changePassword: (passwords) => fetchAPI('/auth/change-password', {
    method: 'PATCH',
    body: JSON.stringify(passwords),
  }),

  adminCreateUser: async (userData) => {
    return await fetchAPI('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
};

export const usersAPI = {
  getAll: async () => {
    const response = await fetchAPI('/users?limit=1000');
    return response;
  },

  getById: async (id) => fetchAPI(`/users/${id}`),

  update: async (id, data) => fetchAPI(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  }),

  delete: async (id) => fetchAPI(`/users/${id}`, { method: 'DELETE' }),

  getClients: async () => fetchAPI('/users/clients'),
};

export const tanksAPI = {
  getTanks: async () => {
    const tanks = await fetchAPI('/tanks');
    return { data: tanks, success: true };
  },

  getTankById: async (id) => fetchAPI(`/tanks/${id}`),

  getTankHistory: async (id) => fetchAPI(`/tanks/${id}/history`),

  getCompanyTanks: async () => fetchAPI('/tanks/company/all'),

  getMainTank: async () => fetchAPI('/tanks/company/main'),

  getClientTanks: async (clientId) => fetchAPI(`/tanks/client/${clientId}`),

  createTank: async (tankData) => fetchAPI('/tanks', {
    method: 'POST',
    body: JSON.stringify(tankData),
  }),

  updateTank: async (id, tankData) => fetchAPI(`/tanks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(tankData),
  }),

  updateTankSensor: async (id, sensorData) => fetchAPI(`/tanks/${id}/sensor`, {
    method: 'PATCH',
    body: JSON.stringify(sensorData),
  }),

  deleteTank: async (id) => fetchAPI(`/tanks/${id}`, { method: 'DELETE' }),
};

// Los sensores están integrados en los tanques, pero aquí hay métodos de simulación
export const sensorsAPI = {
  // Para simulación y control de sensores
  startSimulation: async (tankId) => fetchAPI(`/sensors/simulate/${tankId}/start`, {
    method: 'POST'
  }),

  stopSimulation: async (tankId) => fetchAPI(`/sensors/simulate/${tankId}/stop`, {
    method: 'POST'
  }),

  getSimulationStatus: async (tankId) => fetchAPI(`/sensors/simulate/${tankId}/status`),

  simulateConsume: async (tankId, amount) => fetchAPI(`/sensors/simulate/${tankId}/consume`, {
    method: 'POST',
    body: JSON.stringify({ amount })
  }),

  simulateRefill: async (tankId, amount) => fetchAPI(`/sensors/simulate/${tankId}/refill`, {
    method: 'POST',
    body: JSON.stringify({ amount })
  }),

  updateConsumptionRate: async (tankId, rate) => fetchAPI(`/sensors/simulate/${tankId}/consumption-rate`, {
    method: 'PATCH',
    body: JSON.stringify({ consumptionRate: rate })
  }),

  startAllSimulations: async () => fetchAPI('/sensors/simulate/start-all', {
    method: 'POST'
  }),

  stopAllSimulations: async () => fetchAPI('/sensors/simulate/stop-all', {
    method: 'POST'
  }),
};

export const alertsAPI = {
  getAlerts: async () => {
    const alerts = await fetchAPI('/alerts');
    return { data: alerts, success: true };
  },

  getActiveAlerts: async (tankId) => {
    const endpoint = tankId ? `/alerts/active?tankId=${tankId}` : '/alerts/active';
    const alerts = await fetchAPI(endpoint);
    return { data: alerts, success: true };
  },

  acknowledgeAlert: async (id) => fetchAPI(`/alerts/${id}/acknowledge`, {
    method: 'PATCH'
  }),

  resolveAlert: async (id, notes) => fetchAPI(`/alerts/${id}/resolve`, {
    method: 'PATCH',
    body: JSON.stringify({ notes })
  }),
};

export const rechargesAPI = {
  getRecharges: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const endpoint = params.toString() ? `/recharges?${params}` : '/recharges';
    const recharges = await fetchAPI(endpoint);
    return { data: recharges, success: true };
  },

  getUpcoming: async (days = 7) => {
    const recharges = await fetchAPI(`/recharges/upcoming?days=${days}`);
    return { data: recharges, success: true };
  },

  getByTank: async (tankId) => {
    const recharges = await fetchAPI(`/recharges/tank/${tankId}`);
    return { data: recharges, success: true };
  },

  getById: async (id) => fetchAPI(`/recharges/${id}`),

  createRecharge: async (rechargeData) => fetchAPI('/recharges', {
    method: 'POST',
    body: JSON.stringify(rechargeData)
  }),

  rescheduleRecharge: async (id, rescheduleData) => fetchAPI(`/recharges/${id}/reschedule`, {
    method: 'PATCH',
    body: JSON.stringify(rescheduleData)
  }),

  startRecharge: async (id) => fetchAPI(`/recharges/${id}/start`, {
    method: 'PATCH'
  }),

  completeRecharge: async (id, completeData) => fetchAPI(`/recharges/${id}/complete`, {
    method: 'PATCH',
    body: JSON.stringify(completeData)
  }),

  cancelRecharge: async (id, reason) => fetchAPI(`/recharges/${id}`, {
    method: 'DELETE',
    body: JSON.stringify({ reason })
  }),
};

export const dashboardAPI = {
  getDashboard: async () => fetchAPI('/dashboard'),

  getAdminDashboard: async () => fetchAPI('/dashboard/admin'),

  getClientDashboard: async () => fetchAPI('/dashboard/client'),

  getClientDashboardById: async (clientId) => fetchAPI(`/dashboard/client/${clientId}`),

  getAdminStats: async () => fetchAPI('/dashboard/admin/stats'),

  getAdminSummary: async () => fetchAPI('/dashboard/admin/summary'),

  getClientSummary: async () => fetchAPI('/dashboard/client/summary'),

  getWidgetTankLevels: async () => fetchAPI('/dashboard/widget/tank-levels'),

  getWidgetConsumptionTrend: async () => fetchAPI('/dashboard/widget/consumption-trend'),

  getWidgetAlerts: async () => fetchAPI('/dashboard/widget/alerts'),

  getWidgetRecharges: async () => fetchAPI('/dashboard/widget/recharges'),

  getNotifications: async () => fetchAPI('/dashboard/notifications'),
};

export const reportsAPI = {
  // Obtener datos de reportes
  getGeneralReport: async (params) => fetchAPI('/reports/general?' + new URLSearchParams(params)),

  getTankReport: async (tankId, params) => fetchAPI(`/reports/tank/${tankId}?` + new URLSearchParams(params)),

  getClientReport: async (clientId, params) => fetchAPI(`/reports/client/${clientId}?` + new URLSearchParams(params)),

  // Exportar reportes en diferentes formatos
  exportReport: async (type, format, params) => {
    const token = localStorage.getItem('token');
    const queryParams = new URLSearchParams({ ...params, type, format });

    try {
      const response = await fetch(`${API_URL}/reports/export?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // Intentar leer el error del backend
        let errorMessage = 'Error al exportar el reporte';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          // Si no se puede parsear como JSON, usar el mensaje por defecto
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const blob = await response.blob();

      // Verificar que el blob no esté vacío
      if (blob.size === 0) {
        throw new Error('El archivo generado está vacío');
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      // Obtener el nombre del archivo desde el header Content-Disposition o generar uno
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `reporte-${type}-${new Date().toISOString().split('T')[0]}.${format}`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      return { success: true, message: 'Reporte exportado exitosamente', filename };
    } catch (error) {
      console.error('Error exportando reporte:', error);
      throw error;
    }
  },

  // Descargar PDF de reporte específico
  downloadPDF: async (reportType, params) => {
    const token = localStorage.getItem('token');
    const queryParams = new URLSearchParams(params);

    try {
      const response = await fetch(`${API_URL}/reports/download/${reportType}?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al descargar el PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      console.error('Error descargando PDF:', error);
      throw error;
    }
  },

  // Vista previa de PDF
  previewPDF: async (reportType, params) => {
    const token = localStorage.getItem('token');
    const queryParams = new URLSearchParams(params);

    try {
      const response = await fetch(`${API_URL}/reports/preview/${reportType}?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener vista previa');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');

      return { success: true };
    } catch (error) {
      console.error('Error mostrando vista previa:', error);
      throw error;
    }
  },

  // Enviar reporte por email
  sendReportByEmail: async (reportType, params, emailTo) => fetchAPI('/reports/send-email', {
    method: 'POST',
    body: JSON.stringify({
      reportType,
      params,
      emailTo,
    }),
  }),
};

export default {
  auth: authAPI,
  users: usersAPI,
  tanks: tanksAPI,
  sensors: sensorsAPI,
  alerts: alertsAPI,
  recharges: rechargesAPI,
  dashboard: dashboardAPI,
  reports: reportsAPI,
};
