import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Plus, Calendar, File, FileSpreadsheet } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { reportsAPI } from '../../services/api';

const Reports = () => {
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [reports, setReports] = useState([]);

    // Form state
    const [formData, setFormData] = useState({
        type: 'CONSUMO',
        format: 'PDF',
        tankId: '',
        startDate: '',
        endDate: '',
        employeeId: 1,
    });

    useEffect(() => {
        // Set default dates (last 30 days)
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);

        setFormData(prev => ({
            ...prev,
            startDate: thirtyDaysAgo.toISOString().split('T')[0],
            endDate: today.toISOString().split('T')[0],
        }));

        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const response = await reportsAPI.list();
            setReports(response.data || []);
        } catch (error) {
            console.error('Error al cargar informes:', error);
            toast.error('Error al cargar los informes');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async (e) => {
        e.preventDefault();

        if (!formData.type || !formData.format || !formData.startDate || !formData.endDate) {
            toast.error('Todos los campos son obligatorios');
            return;
        }

        try {
            setGenerating(true);

            const payload = {
                ...formData,
                tankId: formData.tankId || null,
            };

            const response = await reportsAPI.generate(payload);
            toast.success('Informe generado exitosamente');

            // Agregar el nuevo informe a la lista
            fetchReports();
        } catch (error) {
            console.error('Error al generar informe:', error);
            toast.error('Error al generar el informe');
        } finally {
            setGenerating(false);
        }
    };

    const handleDownload = async (fileName) => {
        try {
            toast.loading('Descargando informe...', { id: 'download' });
            await reportsAPI.download(fileName);
            toast.success('Informe descargado', { id: 'download' });
        } catch (error) {
            console.error('Error al descargar informe:', error);
            toast.error('Error al descargar el informe', { id: 'download' });
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const getFormatIcon = (format) => {
        return format === 'PDF' ? File : FileSpreadsheet;
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'CONSUMO':
                return 'blue';
            case 'ALERTAS':
                return 'red';
            case 'SUMINISTROS':
                return 'green';
            case 'MANTENIMIENTOS':
                return 'yellow';
            default:
                return 'gray';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <LoadingSpinner size="large" />
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 lg:p-10 space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
            >
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Informes</h1>
                <p className="text-gray-600">Genera y descarga informes del sistema en PDF o Excel</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Formulario de Generación */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-1"
                >
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-purple-600" />
                            Generar Informe
                        </h2>

                        <form onSubmit={handleGenerate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tipo de Informe *
                                </label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value="CONSUMO">Consumo de Gas</option>
                                    <option value="ALERTAS">Alertas</option>
                                    <option value="SUMINISTROS">Suministros</option>
                                    <option value="MANTENIMIENTOS">Mantenimientos</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Formato *
                                </label>
                                <select
                                    name="format"
                                    value={formData.format}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value="PDF">PDF</option>
                                    {formData.type === 'CONSUMO' && <option value="EXCEL">Excel</option>}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tanque (Opcional)
                                </label>
                                <input
                                    type="number"
                                    name="tankId"
                                    placeholder="Dejar vacío para todos"
                                    value={formData.tankId}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fecha Inicio *
                                </label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fecha Fin *
                                </label>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>

                            <Button
                                type="submit"
                                variant="primary"
                                disabled={generating}
                                className="w-full flex items-center justify-center gap-2"
                            >
                                {generating ? (
                                    <>
                                        <LoadingSpinner size="small" />
                                        Generando...
                                    </>
                                ) : (
                                    <>
                                        <FileText className="w-5 h-5" />
                                        Generar Informe
                                    </>
                                )}
                            </Button>
                        </form>
                    </Card>
                </motion.div>

                {/* Lista de Informes Generados */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2"
                >
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-purple-600" />
                            Informes Generados ({reports.length})
                        </h2>

                        <div className="space-y-3 max-h-[600px] overflow-y-auto">
                            {reports.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
                                    <p className="text-lg mb-2">No hay informes generados</p>
                                    <p className="text-sm">Genera tu primer informe usando el formulario</p>
                                </div>
                            ) : (
                                reports.map((report, index) => {
                                    const FormatIcon = getFormatIcon(report.FORMATO);
                                    const fileName = report.RUTA ? report.RUTA.split('/').pop() || report.RUTA.split('\\').pop() : 'archivo';

                                    return (
                                        <motion.div
                                            key={report.ID}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-start gap-3 flex-1">
                                                    <div className="p-2 bg-white rounded-lg">
                                                        <FormatIcon className="w-6 h-6 text-purple-600" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-medium text-gray-900 mb-1 truncate">
                                                            {report.TITULO}
                                                        </h3>
                                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                                            <Badge variant={getTypeColor(report.TIPO)}>
                                                                {report.TIPO}
                                                            </Badge>
                                                            <Badge variant="gray">
                                                                {report.FORMATO}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="w-3 h-3" />
                                                                {new Date(report.FECHA_GENERACION).toLocaleDateString('es-ES')}
                                                            </span>
                                                            <span>
                                                                Período: {new Date(report.FECHA_INICIO).toLocaleDateString('es-ES')} - {new Date(report.FECHA_FIN).toLocaleDateString('es-ES')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDownload(fileName)}
                                                    className="flex items-center gap-2 shrink-0"
                                                >
                                                    <Download className="w-4 h-4" />
                                                    <span className="hidden sm:inline">Descargar</span>
                                                </Button>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                        </div>
                    </Card>
                </motion.div>
            </div>

            {/* Info Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-white rounded-lg">
                            <FileText className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2">Sobre los Informes</h3>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Los informes PDF incluyen gráficos y resúmenes detallados</li>
                                <li>• Los informes Excel permiten análisis personalizado de datos</li>
                                <li>• Puedes filtrar por tanque específico o generar para todos</li>
                                <li>• Los archivos se guardan automáticamente en el servidor</li>
                            </ul>
                        </div>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
};

export default Reports;
