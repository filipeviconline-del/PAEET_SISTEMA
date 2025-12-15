import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

interface Workshop {
    id: string;
    title: string;
    description: string;
    date: string;
    collaborators: string;
    enrollment_id?: number; // If enrolled
}

interface StudentDashboardProps {
    studentId: number; // We need the student's DB ID, not just Auth email
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ studentId }) => {
    const [workshops, setWorkshops] = useState<Workshop[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchWorkshops = async () => {
        try {
            setLoading(true);
            // 1. Fetch all workshops
            const { data: allWorkshops, error: workshopsError } = await supabase
                .from('workshops')
                .select('*')
                .order('date', { ascending: true });

            if (workshopsError) throw workshopsError;

            // 2. Fetch my enrollments
            const { data: myEnrollments, error: enrollError } = await supabase
                .from('workshop_enrollments')
                .select('workshop_id')
                .eq('student_id', studentId);

            if (enrollError) throw enrollError;

            const enrolledIds = new Set(myEnrollments?.map(e => e.workshop_id));

            // Merge
            const mapped = (allWorkshops || []).map(w => ({
                ...w,
                isEnrolled: enrolledIds.has(w.id)
            }));

            setWorkshops(mapped);
        } catch (error) {
            console.error("Erro ao buscar oficinas:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async (workshopId: string) => {
        try {
            const { error } = await supabase
                .from('workshop_enrollments')
                .insert([{ student_id: studentId, workshop_id: workshopId }]);

            if (error) throw error;
            fetchWorkshops();
            alert("Inscrição realizada com sucesso!");
        } catch (error: any) {
            alert("Erro ao se inscrever: " + error.message);
        }
    };

    const handleUnenroll = async (workshopId: string) => {
        if (!confirm("Tem certeza que deseja cancelar sua inscrição?")) return;
        try {
            const { error } = await supabase
                .from('workshop_enrollments')
                .delete()
                .eq('student_id', studentId)
                .eq('workshop_id', workshopId);

            if (error) throw error;
            fetchWorkshops();
        } catch (error: any) {
            alert("Erro ao cancelar: " + error.message);
        }
    };

    useEffect(() => {
        if (studentId) fetchWorkshops();
    }, [studentId]);

    if (loading) return <div className="text-center p-10 text-slate-500">Carregando oficinas...</div>;

    const myWorkshops = workshops.filter((w: any) => w.isEnrolled);
    const availableWorkshops = workshops.filter((w: any) => !w.isEnrolled);

    return (
        <div className="flex flex-col gap-8">
            {/* My Workshops */}
            <div className="flex flex-col gap-4">
                <h2 className="text-2xl font-bold text-text-main dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">check_circle</span>
                    Minhas Oficinas
                </h2>
                {myWorkshops.length === 0 ? (
                    <p className="text-slate-500 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
                        Você ainda não está participando de nenhuma oficina.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {myWorkshops.map((w: any) => (
                            <div key={w.id} className="bg-white dark:bg-surface-dark border-l-4 border-l-green-500 p-6 rounded-lg shadow-sm border border-border-light dark:border-border-dark relative group">
                                <span className="absolute top-4 right-4 text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded">INSCRITO</span>
                                <p className="text-sm font-bold text-primary mb-1">{new Date(w.date).toLocaleDateString('pt-BR')}</p>
                                <h3 className="text-lg font-bold text-text-main dark:text-white mb-2">{w.title}</h3>
                                <p className="text-sm text-text-secondary dark:text-slate-400 mb-4 line-clamp-2">{w.description}</p>
                                <button
                                    onClick={() => handleUnenroll(w.id)}
                                    className="text-xs text-red-500 hover:text-red-700 hover:underline"
                                >
                                    Cancelar Inscrição
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Available Workshops */}
            <div className="flex flex-col gap-4">
                <h2 className="text-2xl font-bold text-text-main dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">event_available</span>
                    Oficinas Disponíveis
                </h2>
                {availableWorkshops.length === 0 ? (
                    <p className="text-slate-500">Nenhuma oficina disponível no momento.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {availableWorkshops.map((w: any) => (
                            <div key={w.id} className="bg-white dark:bg-surface-dark p-6 rounded-lg shadow-sm border border-border-light dark:border-border-dark hover:shadow-md transition-shadow">
                                <p className="text-sm font-bold text-primary mb-1">{new Date(w.date).toLocaleDateString('pt-BR')}</p>
                                <h3 className="text-lg font-bold text-text-main dark:text-white mb-2">{w.title}</h3>
                                <p className="text-sm text-text-secondary dark:text-slate-400 mb-4 line-clamp-3">{w.description}</p>
                                <button
                                    onClick={() => handleEnroll(w.id)}
                                    className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 rounded-lg transition-colors"
                                >
                                    Participar
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;
