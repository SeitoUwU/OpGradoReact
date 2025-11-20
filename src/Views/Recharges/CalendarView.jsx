import React, { useState, useMemo } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar.css';
import { Container, Clock, AlertCircle } from 'lucide-react';
import Card, { CardBody } from '../../components/Card';

moment.locale('es');
const localizer = momentLocalizer(moment);

const CalendarView = ({ recharges, tanks, onEventClick }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const getTankName = (recharge) => {
        // Las recargas vienen con el objeto tank incluido desde el backend
        if (recharge.tank) {
            return recharge.tank.code || recharge.tank.name || 'Tanque Desconocido';
        }
        // Fallback: buscar en la lista de tanques si no viene el objeto
        if (recharge.tankId) {
            const tank = tanks.find(t => t.id === recharge.tankId);
            return tank ? (tank.code || tank.name) : 'Tanque Desconocido';
        }
        return 'Tanque Desconocido';
    };

    const getEventStyle = (status) => {
        switch (status) {
            case 'scheduled':
                return {
                    backgroundColor: '#3B82F6',
                    borderColor: '#1E3A8A',
                    color: '#FFFFFF'
                };
            case 'in_progress':
                return {
                    backgroundColor: '#F59E0B',
                    borderColor: '#B45309',
                    color: '#FFFFFF'
                };
            case 'completed':
                return {
                    backgroundColor: '#10B981',
                    borderColor: '#047857',
                    color: '#FFFFFF'
                };
            case 'cancelled':
                return {
                    backgroundColor: '#EF4444',
                    borderColor: '#B91C1C',
                    color: '#FFFFFF'
                };
            case 'rescheduled':
                return {
                    backgroundColor: '#8B5CF6',
                    borderColor: '#6D28D9',
                    color: '#FFFFFF'
                };
            default:
                return {
                    backgroundColor: '#6B7280',
                    borderColor: '#374151',
                    color: '#FFFFFF'
                };
        }
    };

    // Transform recharges to calendar events
    const events = useMemo(() => {
        return recharges.map(recharge => {
            const scheduledDate = new Date(recharge.scheduledDate);
            const tankName = getTankName(recharge);

            return {
                id: recharge.id,
                title: tankName,
                start: scheduledDate,
                end: scheduledDate,
                resource: recharge,
                style: getEventStyle(recharge.status)
            };
        });
    }, [recharges, tanks]);

    const eventStyleGetter = (event) => {
        return {
            style: {
                backgroundColor: event.style.backgroundColor,
                borderColor: event.style.borderColor,
                color: event.style.color,
                borderRadius: '6px',
                border: '2px solid',
                fontWeight: '600',
                fontSize: '13px',
                padding: '2px 6px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
            }
        };
    };

    const CustomEvent = ({ event }) => {
        const recharge = event.resource;
        return (
            <div className="flex items-center gap-1 overflow-hidden">
                <Container size={12} />
                <span className="truncate text-xs">{event.title}</span>
                {recharge.estimatedQuantityLiters && (
                    <span className="text-xs opacity-90">({recharge.estimatedQuantityLiters.toFixed(0)}L)</span>
                )}
            </div>
        );
    };

    const CustomToolbar = (toolbar) => {
        const goToBack = () => {
            toolbar.onNavigate('PREV');
        };

        const goToNext = () => {
            toolbar.onNavigate('NEXT');
        };

        const goToToday = () => {
            toolbar.onNavigate('TODAY');
        };

        const label = () => {
            const date = moment(toolbar.date);
            return (
                <span className="text-lg font-bold text-gray-800">
                    {date.format('MMMM YYYY').toUpperCase()}
                </span>
            );
        };

        return (
            <div className="flex items-center justify-between mb-4 pb-4 border-b">
                <div className="flex gap-2">
                    <button
                        onClick={goToToday}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                    >
                        Hoy
                    </button>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={goToBack}
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        ←
                    </button>
                    {label()}
                    <button
                        onClick={goToNext}
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        →
                    </button>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => toolbar.onView('month')}
                        className={`px-3 py-2 rounded-lg transition-colors ${
                            toolbar.view === 'month'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Mes
                    </button>
                    <button
                        onClick={() => toolbar.onView('week')}
                        className={`px-3 py-2 rounded-lg transition-colors ${
                            toolbar.view === 'week'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Semana
                    </button>
                    <button
                        onClick={() => toolbar.onView('day')}
                        className={`px-3 py-2 rounded-lg transition-colors ${
                            toolbar.view === 'day'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Día
                    </button>
                    <button
                        onClick={() => toolbar.onView('agenda')}
                        className={`px-3 py-2 rounded-lg transition-colors ${
                            toolbar.view === 'agenda'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Agenda
                    </button>
                </div>
            </div>
        );
    };

    const messages = {
        allDay: 'Todo el día',
        previous: 'Anterior',
        next: 'Siguiente',
        today: 'Hoy',
        month: 'Mes',
        week: 'Semana',
        day: 'Día',
        agenda: 'Agenda',
        date: 'Fecha',
        time: 'Hora',
        event: 'Evento',
        noEventsInRange: 'No hay reabastecimientos programados en este período',
        showMore: total => `+ Ver más (${total})`
    };

    return (
        <div className="space-y-4">
            {/* Legend */}
            <Card>
                <CardBody>
                    <div className="flex items-center gap-6 flex-wrap">
                        <span className="font-semibold text-gray-700">Leyenda:</span>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-blue-500"></div>
                            <span className="text-sm text-gray-600">Programado</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-yellow-500"></div>
                            <span className="text-sm text-gray-600">En Progreso</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-green-500"></div>
                            <span className="text-sm text-gray-600">Completado</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-red-500"></div>
                            <span className="text-sm text-gray-600">Cancelado</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-purple-500"></div>
                            <span className="text-sm text-gray-600">Reprogramado</span>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Calendar */}
            <Card>
                <CardBody>
                    <div style={{ height: '700px' }}>
                        <BigCalendar
                            localizer={localizer}
                            events={events}
                            startAccessor="start"
                            endAccessor="end"
                            style={{ height: '100%' }}
                            eventPropGetter={eventStyleGetter}
                            onSelectEvent={(event) => onEventClick(event.resource)}
                            messages={messages}
                            components={{
                                toolbar: CustomToolbar,
                                event: CustomEvent
                            }}
                            views={['month', 'week', 'day', 'agenda']}
                            defaultView='month'
                            popup
                            selectable
                            date={currentDate}
                            onNavigate={setCurrentDate}
                        />
                    </div>
                </CardBody>
            </Card>

            {/* Info Card */}
            <Card className="bg-blue-50 border-blue-200">
                <CardBody>
                    <div className="flex items-start gap-3">
                        <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                        <div className="text-sm text-blue-800">
                            <p className="font-semibold mb-1">Información del Calendario</p>
                            <ul className="space-y-1 text-blue-700">
                                <li>• Haz clic en un evento para ver sus detalles y acciones disponibles</li>
                                <li>• Usa los botones de navegación para cambiar entre vistas (Mes, Semana, Día, Agenda)</li>
                                <li>• La cantidad estimada de litros aparece entre paréntesis en cada evento</li>
                            </ul>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};

export default CalendarView;
