import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import {
  TrendingDown,
  TrendingUp,
  Activity,
  Droplet,
  AlertCircle,
  Zap,
  Clock
} from 'lucide-react';
import Card, { CardBody } from '../../../components/Card';

const TankHistoryChart = ({ history, tankCapacity }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [chartType, setChartType] = useState('area');

  // Procesar y filtrar datos
  const processedData = useMemo(() => {
    if (!history || history.length === 0) return [];

    const now = new Date();
    let filtered = [...history];

    // Filtrar por período
    switch (selectedPeriod) {
      case '24h':
        filtered = history.filter(
          (record) => new Date(record.recordedAt) >= new Date(now - 24 * 60 * 60 * 1000)
        );
        break;
      case '7d':
        filtered = history.filter(
          (record) => new Date(record.recordedAt) >= new Date(now - 7 * 24 * 60 * 60 * 1000)
        );
        break;
      case '30d':
        filtered = history.filter(
          (record) => new Date(record.recordedAt) >= new Date(now - 30 * 24 * 60 * 60 * 1000)
        );
        break;
    }

    // Ordenar por fecha
    const sorted = filtered.sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt));

    // Agrupar datos inteligentemente
    let grouped;
    if (selectedPeriod === '24h') {
      // Para 24h: agrupar por hora
      grouped = groupByHour(sorted);
    } else if (selectedPeriod === '7d') {
      // Para 7 días: agrupar cada 6 horas
      grouped = groupBySixHours(sorted);
    } else if (selectedPeriod === '30d') {
      // Para 30 días: agrupar por día
      grouped = groupByDay(sorted);
    } else {
      // Para todo: agrupar por día si hay más de 60 registros
      grouped = sorted.length > 60 ? groupByDay(sorted) : sorted;
    }

    // Formatear para el gráfico
    return grouped.map((record) => {
      const date = new Date(record.recordedAt);
      let label;

      if (selectedPeriod === '24h') {
        label = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      } else if (selectedPeriod === '7d') {
        label = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit' }) + 'h';
      } else {
        label = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
      }

      return {
        ...record,
        label,
        fullDate: date.toLocaleString('es-ES'),
        percentage: Number(record.gasLevelPercentage?.toFixed(1) || 0),
        liters: Number(record.gasLevelLiters?.toFixed(1) || 0),
        count: record.count || 1
      };
    });
  }, [history, selectedPeriod]);

  // Función para agrupar por hora
  const groupByHour = (data) => {
    const map = new Map();
    data.forEach(record => {
      const date = new Date(record.recordedAt);
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key).push(record);
    });

    return Array.from(map.values()).map(group => ({
      recordedAt: group[group.length - 1].recordedAt,
      gasLevelPercentage: group.reduce((sum, r) => sum + r.gasLevelPercentage, 0) / group.length,
      gasLevelLiters: group.reduce((sum, r) => sum + r.gasLevelLiters, 0) / group.length,
      count: group.length
    }));
  };

  // Función para agrupar cada 6 horas
  const groupBySixHours = (data) => {
    const map = new Map();
    data.forEach(record => {
      const date = new Date(record.recordedAt);
      const hourBlock = Math.floor(date.getHours() / 6);
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${hourBlock}`;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key).push(record);
    });

    return Array.from(map.values()).map(group => ({
      recordedAt: group[Math.floor(group.length / 2)].recordedAt,
      gasLevelPercentage: group.reduce((sum, r) => sum + r.gasLevelPercentage, 0) / group.length,
      gasLevelLiters: group.reduce((sum, r) => sum + r.gasLevelLiters, 0) / group.length,
      count: group.length
    }));
  };

  // Función para agrupar por día
  const groupByDay = (data) => {
    const map = new Map();
    data.forEach(record => {
      const date = new Date(record.recordedAt);
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key).push(record);
    });

    return Array.from(map.values()).map(group => {
      // Tomar el registro del mediodía o el del medio
      const middleIndex = Math.floor(group.length / 2);
      return {
        recordedAt: group[middleIndex].recordedAt,
        gasLevelPercentage: group.reduce((sum, r) => sum + r.gasLevelPercentage, 0) / group.length,
        gasLevelLiters: group.reduce((sum, r) => sum + r.gasLevelLiters, 0) / group.length,
        count: group.length
      };
    });
  };

  // Calcular estadísticas
  const statistics = useMemo(() => {
    if (processedData.length === 0) {
      return { avgLevel: 0, minLevel: 0, maxLevel: 0, trend: 'stable', consumption: 0 };
    }

    const levels = processedData.map((d) => d.percentage);
    const avgLevel = levels.reduce((a, b) => a + b, 0) / levels.length;
    const minLevel = Math.min(...levels);
    const maxLevel = Math.max(...levels);

    const first = processedData[0].liters;
    const last = processedData[processedData.length - 1].liters;
    const consumption = first - last;

    const recentData = processedData.slice(-5);
    let trend = 'stable';
    if (recentData.length >= 2) {
      const change = recentData[recentData.length - 1].percentage - recentData[0].percentage;
      if (change < -5) trend = 'decreasing';
      else if (change > 5) trend = 'increasing';
    }

    return { avgLevel, minLevel, maxLevel, trend, consumption };
  }, [processedData]);

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-semibold mb-2">{data.fullDate}</p>
          <div className="space-y-1">
            <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold">
              Nivel: {payload[0].value}%
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {data.liters.toFixed(1)} Litros
            </p>
            {data.count > 1 && (
              <p className="text-xs text-gray-500 border-t border-gray-200 dark:border-gray-600 pt-1 mt-1">
                Promedio de {data.count} lecturas
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Calcular intervalo de etiquetas
  const tickInterval = useMemo(() => {
    const total = processedData.length;
    if (total <= 8) return 0;
    if (total <= 15) return 1;
    if (total <= 30) return Math.floor(total / 10);
    return Math.floor(total / 12);
  }, [processedData]);

  const getTrendIcon = () => {
    switch (statistics.trend) {
      case 'decreasing': return <TrendingDown className="text-red-500" size={20} />;
      case 'increasing': return <TrendingUp className="text-green-500" size={20} />;
      default: return <Activity className="text-blue-500" size={20} />;
    }
  };

  const getTrendText = () => {
    switch (statistics.trend) {
      case 'decreasing': return 'Consumo Alto';
      case 'increasing': return 'Recarga Detectada';
      default: return 'Consumo Estable';
    }
  };

  const periodOptions = [
    { value: '24h', label: 'Últimas 24h' },
    { value: '7d', label: 'Última semana' },
    { value: '30d', label: 'Último mes' },
    { value: 'all', label: 'Todo' }
  ];

  if (!history || history.length === 0) {
    return (
      <Card>
        <CardBody>
          <div className="text-center py-8 text-gray-500">
            <Activity size={48} className="mx-auto mb-3 opacity-50" />
            <p className="font-semibold">Sin datos históricos</p>
            <p className="text-sm">No hay información suficiente para mostrar gráficos</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controles */}
      <Card>
        <CardBody>
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              {periodOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedPeriod(option.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedPeriod === option.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setChartType('area')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  chartType === 'area'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Área
              </button>
              <button
                onClick={() => setChartType('line')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  chartType === 'line'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Línea
              </button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card gradient>
          <CardBody>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Promedio</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {statistics.avgLevel.toFixed(1)}%
                </p>
              </div>
              <Droplet className="text-blue-500 opacity-50" size={32} />
            </div>
          </CardBody>
        </Card>

        <Card gradient>
          <CardBody>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Rango</p>
                <p className="text-lg font-bold text-gray-800 dark:text-gray-200">
                  {statistics.minLevel.toFixed(1)}% - {statistics.maxLevel.toFixed(1)}%
                </p>
              </div>
              <Activity className="text-purple-500 opacity-50" size={32} />
            </div>
          </CardBody>
        </Card>

        <Card gradient>
          <CardBody>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Tendencia</p>
                <p className="text-lg font-bold flex items-center gap-2">
                  {getTrendIcon()}
                  {getTrendText()}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card gradient>
          <CardBody>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Consumo</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {statistics.consumption >= 0 ? statistics.consumption.toFixed(0) : 0}L
                </p>
              </div>
              <Zap className="text-orange-500 opacity-50" size={32} />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Gráfico */}
      <Card>
        <CardBody>
          <div className="flex items-start justify-between mb-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <TrendingDown size={20} className="text-blue-600" />
              Historial de Nivel de Gas
            </h3>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                {processedData.length} puntos
              </p>
              <p className="text-xs text-gray-400">
                {selectedPeriod === '24h' ? 'Agrupado por hora' :
                 selectedPeriod === '7d' ? 'Agrupado cada 6h' :
                 'Agrupado por día'}
              </p>
            </div>
          </div>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'area' ? (
                <AreaChart
                  data={processedData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 60 }}
                  syncId="tankHistory"
                >
                  <defs>
                    <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-700" />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: 'currentColor', fontSize: 11 }}
                    interval={tickInterval}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    tick={{ fill: 'currentColor' }}
                    domain={[0, 100]}
                    label={{ value: '% Nivel', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '5 5' }}
                    allowEscapeViewBox={{ x: false, y: true }}
                    isAnimationActive={false}
                  />
                  <ReferenceLine y={20} stroke="#ef4444" strokeDasharray="3 3" label="Crítico" />
                  <ReferenceLine y={50} stroke="#f59e0b" strokeDasharray="3 3" label="Medio" />
                  <Area
                    type="monotone"
                    dataKey="percentage"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#colorLevel)"
                    dot={{ fill: '#3b82f6', r: 3 }}
                    activeDot={{ r: 7, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                    isAnimationActive={false}
                  />
                </AreaChart>
              ) : (
                <LineChart
                  data={processedData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 60 }}
                  syncId="tankHistory"
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-700" />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: 'currentColor', fontSize: 11 }}
                    interval={tickInterval}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    tick={{ fill: 'currentColor' }}
                    domain={[0, 100]}
                    label={{ value: '% Nivel', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '5 5' }}
                    allowEscapeViewBox={{ x: false, y: true }}
                    isAnimationActive={false}
                  />
                  <ReferenceLine y={20} stroke="#ef4444" strokeDasharray="3 3" label="Crítico" />
                  <ReferenceLine y={50} stroke="#f59e0b" strokeDasharray="3 3" label="Medio" />
                  <Line
                    type="monotone"
                    dataKey="percentage"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', r: 4 }}
                    activeDot={{ r: 8, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                    isAnimationActive={false}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default TankHistoryChart;
