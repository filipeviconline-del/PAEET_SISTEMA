import React, { useState, useEffect } from 'react';
import { getHolidays } from '../utils/holidays';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    addDays,
    parseISO,
    isValid
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '../services/supabase';

interface Holiday {
    date: string;
    name: string;
    type?: string;
}

interface Workshop {
    id: string;
    title: string;
    date: string;
}

const Calendar: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [workshops, setWorkshops] = useState<Workshop[]>([]);
    const [academicStart, setAcademicStart] = useState<Date | null>(null);

    const fetchData = async () => {
        try {
            // 1. Fetch academic start date
            const { data } = await supabase.from('system_settings').select('value').eq('key', 'academic_start_date').single();
            if (data && data.value) {
                const parsedDate = parseISO(data.value);
                if (isValid(parsedDate)) {
                    setAcademicStart(parsedDate);
                } else {
                    console.warn('Invalid academic_start_date format:', data.value);
                    setAcademicStart(null);
                }
            } else {
                setAcademicStart(null);
            }

            // 2. Fetch Workshops
            const { data: wsData } = await supabase.from('workshops').select('id, title, date');
            if (wsData) {
                setWorkshops(wsData);
            }

            // 3. Calculate holidays for current year
            // Assuming getHolidays is safe, but wrapping in try-catch just in case
            const year = currentDate.getFullYear();
            const yearHolidays = getHolidays(year);
            setHolidays(yearHolidays);

        } catch (error) {
            console.error('Error in Calendar fetchData:', error);
            // Fallback safe state
            setAcademicStart(null);
            setHolidays([]);
            setWorkshops([]);
        }
    };

    useEffect(() => {
        fetchData();

        // Subscribe to changes for immediate updates
        const subscription = supabase
            .channel('calendar_settings')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'system_settings'
                },
                () => {
                    fetchData();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    // Re-calculate holidays if year changes (e.g. user navigation)
    useEffect(() => {
        try {
            setHolidays(getHolidays(currentDate.getFullYear()));
        } catch (e) {
            console.error(e);
        }
    }, [currentDate]);

    const header = () => {
        return (
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                    <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <div className="flex flex-col items-center">
                    <span className="text-lg font-bold text-text-main dark:text-white capitalize">
                        {isValid(currentDate) ? format(currentDate, 'MMMM yyyy', { locale: ptBR }) : ''}
                    </span>
                </div>
                <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                    <span className="material-symbols-outlined">chevron_right</span>
                </button>
            </div>
        );
    };

    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const daysHeader = () => (
        <div className="grid grid-cols-7 mb-2">
            {weekDays.map((val, i) => (
                <div className="text-center text-xs font-bold text-text-secondary uppercase" key={i}>
                    {val}
                </div>
            ))}
        </div>
    );

    const renderCells = () => {
        try {
            const monthStart = startOfMonth(currentDate);
            const monthEnd = endOfMonth(monthStart);
            const startDate = startOfWeek(monthStart);
            const endDate = endOfWeek(monthEnd);

            const dateFormat = "d";
            const rows = [];
            let days = [];
            let day = startDate;
            let formattedDate = "";

            while (day <= endDate) {
                for (let i = 0; i < 7; i++) {
                    formattedDate = format(day, dateFormat);
                    const dayStr = format(day, 'yyyy-MM-dd');
                    const isHoliday = holidays.find(h => h.date === dayStr);
                    const dayWorkshop = workshops.filter(w => w.date === dayStr);
                    const isStart = academicStart && isSameDay(day, academicStart);
                    const isToday = isSameDay(day, new Date());

                    let bgClass = "";
                    let textClass = "";

                    if (!isSameMonth(day, monthStart)) {
                        textClass = "text-slate-300 dark:text-slate-600";
                    } else if (isStart) {
                        bgClass = "bg-primary text-white";
                    } else if (isHoliday) {
                        bgClass = "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300";
                    } else if (dayWorkshop.length > 0) {
                        bgClass = "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-bold";
                    } else if (isToday) {
                        bgClass = "bg-blue-100 dark:bg-blue-900/30 text-primary dark:text-blue-300 font-bold border border-primary";
                    } else {
                        bgClass = "hover:bg-slate-50 dark:hover:bg-slate-800/50";
                        textClass = "text-text-main dark:text-white";
                    }

                    days.push(
                        <div
                            className={`p-2 h-10 md:h-12 flex flex-col items-center justify-center cursor-pointer rounded-lg relative group transition-colors ${bgClass} ${textClass}`}
                            key={day.toString()}
                            title={isHoliday ? isHoliday.name : (dayWorkshop.length > 0 ? dayWorkshop[0].title : '')}
                        >
                            <span className="text-sm">{formattedDate}</span>
                            {isHoliday && (
                                <div className="absolute -bottom-8 bg-black text-white text-xs p-1 rounded z-50 opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
                                    {isHoliday.name}
                                </div>
                            )}
                            {dayWorkshop.length > 0 && (
                                <div className="absolute -bottom-8 bg-purple-700 text-white text-xs p-1 rounded z-50 opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity z-50">
                                    Oficina: {dayWorkshop[0].title}
                                    {dayWorkshop.length > 1 && ` (+${dayWorkshop.length - 1})`}
                                </div>
                            )}
                            {isStart && (
                                <div className="absolute -bottom-8 bg-primary text-white text-xs p-1 rounded z-50 opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
                                    Início das Aulas
                                </div>
                            )}
                        </div>
                    );
                    day = addDays(day, 1);
                }
                rows.push(
                    <div className="grid grid-cols-7 gap-1" key={day.toString()}>
                        {days}
                    </div>
                );
                days = [];
            }
            return <div className="flex flex-col gap-1">{rows}</div>;
        } catch (e) {
            console.error('Error rendering calendar cells:', e);
            return <div className="p-4 text-center text-red-500">Erro ao renderizar dados.</div>;
        }
    };

    return (
        <div className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl shadow-sm p-6 h-full flex flex-col">
            {header()}
            {daysHeader()}
            {renderCells()}

            <div className="mt-4 flex gap-4 text-xs justify-center border-t border-border-light dark:border-border-dark pt-4">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-900"></div>
                    <span className="text-text-secondary">Feriado</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-900"></div>
                    <span className="text-text-secondary">Oficina</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                    <span className="text-text-secondary">Início Aulas</span>
                </div>
            </div>
        </div>
    );
};

export default Calendar;
