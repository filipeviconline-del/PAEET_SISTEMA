import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Teacher, Discipline } from '../types';

const Allocation: React.FC = () => {
    const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);
    const [disciplines, setDisciplines] = useState<Discipline[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [teachersRes, disciplinesRes] = await Promise.all([
                supabase.from('teachers').select('*').order('name'),
                supabase.from('disciplines').select('*').order('name')
            ]);

            if (teachersRes.error) throw teachersRes.error;
            if (disciplinesRes.error) throw disciplinesRes.error;

            const formattedTeachers = (teachersRes.data || []).map((t: any) => ({
                ...t,
                maxHours: t.max_hours,
                currentHours: t.current_hours
            }));

            const formattedDisciplines = (disciplinesRes.data || []).map((d: any) => ({
                ...d,
                assignedTeacherId: d.assigned_teacher_id
            }));

            setTeachers(formattedTeachers);
            setDisciplines(formattedDisciplines);
        } catch (error) {
            console.error('Error fetching allocation data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTeacherClick = (id: number) => {
        setSelectedTeacherId(id === selectedTeacherId ? null : id);
    };

    const handleAssign = async (disciplineId: number) => {
        if (selectedTeacherId === null) return;

        try {
            const { error } = await supabase
                .from('disciplines')
                .update({ assigned_teacher_id: selectedTeacherId })
                .eq('id', disciplineId);

            if (error) throw error;

            // Optimistic update
            setDisciplines(disciplines.map(d =>
                d.id === disciplineId ? { ...d, assignedTeacherId: selectedTeacherId } : d
            ));

            setSelectedTeacherId(null);
        } catch (error) {
            console.error('Error assigning teacher:', error);
            alert('Erro ao realizar alocação');
        }
    };

    const handleRemoveAssign = async (disciplineId: number) => {
        try {
            const { error } = await supabase
                .from('disciplines')
                .update({ assigned_teacher_id: null })
                .eq('id', disciplineId);

            if (error) throw error;

            // Optimistic update
            setDisciplines(disciplines.map(d =>
                d.id === disciplineId ? { ...d, assignedTeacherId: null } : d
            ));
        } catch (error) {
            console.error('Error removing assignment:', error);
            alert('Erro ao remover alocação');
        }
    };

    // Helper to calculate hours
    const getTeacherHours = (teacherId: number) => {
        return disciplines
            .filter(d => d.assignedTeacherId === teacherId)
            .reduce((acc, curr) => acc + curr.hours, 0);
    };

    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10">
            <div className="max-w-[1920px] mx-auto flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between gap-6 pb-8 border-b border-border-light dark:border-border-dark mb-4">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-text-main dark:text-white text-3xl md:text-4xl font-black">Alocação Professor-Disciplina</h1>
                        <p className="text-text-secondary text-base max-w-2xl">Gerencie a atribuição de aulas e carga horária docente.</p>
                    </div>
                    <div className="flex items-end gap-3">
                        <button
                            onClick={fetchData}
                            className="flex items-center justify-center gap-2 rounded-lg h-10 px-6 bg-primary hover:bg-blue-700 text-white text-sm font-bold shadow-md transition-all">
                            <span className="material-symbols-outlined text-[20px]">refresh</span> Atualizar
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="p-10 text-center text-text-secondary">Carregando dados...</div>
                ) : (
                    <div className="flex flex-col xl:flex-row gap-8 min-h-[600px]">
                        {/* Left Panel: Teachers */}
                        <div className="flex-1 flex flex-col bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden h-[800px]">
                            <div className="p-4 border-b border-border-light dark:border-border-dark bg-slate-50 dark:bg-slate-900/50 sticky top-0 z-10">
                                <h3 className="font-bold text-lg text-text-main dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">person</span> Professores Disponíveis
                                </h3>
                                <p className="text-xs text-text-secondary mt-1">Clique para selecionar</p>
                            </div>
                            <div className="overflow-y-auto p-4 space-y-3 flex-1 bg-background-light dark:bg-background-dark/50">
                                {teachers.map(teacher => {
                                    const isSelected = selectedTeacherId === teacher.id;
                                    const currentHours = getTeacherHours(teacher.id);
                                    const isOverloaded = currentHours > teacher.maxHours;
                                    const progress = Math.min((currentHours / teacher.maxHours) * 100, 100);

                                    return (
                                        <div
                                            key={teacher.id}
                                            onClick={() => handleTeacherClick(teacher.id)}
                                            className={`cursor-pointer group p-4 rounded-lg border shadow-sm transition-all relative ${isSelected ? 'ring-2 ring-primary border-primary bg-primary/5 dark:bg-primary/10' : 'bg-surface-light dark:bg-surface-dark border-border-light dark:border-border-dark hover:border-primary/50'}`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex gap-3">
                                                    <div className="size-10 rounded-full bg-cover bg-center overflow-hidden flex items-center justify-center bg-slate-200">
                                                        {teacher.avatar ? <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url('${teacher.avatar}')` }}></div> : <span className="text-xs font-bold">{teacher.name.charAt(0)}</span>}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-text-main dark:text-white text-sm">{teacher.name}</p>
                                                        <div className="flex gap-1 mt-1 flex-wrap">
                                                            {teacher.specializations && teacher.specializations.map((s, i) => (
                                                                <span key={i} className="text-[10px] uppercase font-bold text-blue-600 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/40 px-1.5 py-0.5 rounded">{s}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                {isOverloaded && <span className="material-symbols-outlined text-red-500">warning</span>}
                                            </div>
                                            <div className="mt-3">
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-text-secondary font-medium">Carga Horária</span>
                                                    <span className={`${isOverloaded ? 'text-red-500' : 'text-text-main dark:text-white'} font-bold`}>{currentHours} / {teacher.maxHours}h</span>
                                                </div>
                                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                                                    <div className={`${isOverloaded ? 'bg-red-500' : 'bg-primary'} h-1.5 rounded-full`} style={{ width: `${progress}%` }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Right Panel: Subjects */}
                        <div className="flex-1 flex flex-col bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden h-[800px]">
                            <div className="p-4 border-b border-border-light dark:border-border-dark bg-slate-50 dark:bg-slate-900/50 sticky top-0 z-10">
                                <h3 className="font-bold text-lg text-text-main dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">book_2</span> Disciplinas / Módulos
                                </h3>
                                <p className="text-xs text-text-secondary mt-1">{selectedTeacherId ? 'Clique em uma disciplina pendente para atribuir' : 'Selecione um professor primeiro'}</p>
                            </div>
                            <div className="overflow-y-auto p-4 space-y-6 flex-1 bg-background-light dark:bg-background-dark/50">
                                {['Módulo 1 - Fundamentos', 'Módulo 2 - Desenvolvimento Web', 'Módulo 3 - Mobile e IoT'].map((mod) => {
                                    const modDisciplines = disciplines.filter(d => (d.module === mod) || (!d.module && mod === 'Outros'));
                                    if (modDisciplines.length === 0) return null;

                                    return (
                                        <div key={mod}>
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">{mod}</span>
                                                <div className="h-px bg-border-light dark:border-border-dark flex-1"></div>
                                            </div>
                                            <div className="grid grid-cols-1 gap-3">
                                                {modDisciplines.map(disc => {
                                                    const isAssigned = !!disc.assignedTeacherId;
                                                    const assignedTeacher = teachers.find(t => t.id === disc.assignedTeacherId);

                                                    return (
                                                        <div key={disc.id} className={`p-4 rounded-lg border-l-4 border-y border-r border-border-light dark:border-border-dark shadow-sm transition-all ${isAssigned ? 'bg-surface-light dark:bg-surface-dark border-l-green-500' : 'bg-surface-light dark:bg-surface-dark border-l-primary/30 border-dashed hover:border-solid hover:border-primary cursor-pointer'}`}
                                                            onClick={() => !isAssigned && handleAssign(disc.id)}
                                                        >
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <span className="text-xs font-bold text-text-secondary bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{disc.code}</span>
                                                                        <span className={`text-xs font-bold flex items-center gap-1 ${isAssigned ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                                                                            <span className="material-symbols-outlined text-[14px]">{isAssigned ? 'check_circle' : 'error'}</span> {isAssigned ? 'Alocado' : 'Pendente'}
                                                                        </span>
                                                                    </div>
                                                                    <h4 className="font-bold text-text-main dark:text-white">{disc.name}</h4>
                                                                    <p className="text-xs text-text-secondary mt-1">{disc.hours} Horas • {disc.period}</p>
                                                                </div>
                                                                {isAssigned && (
                                                                    <button onClick={(e) => { e.stopPropagation(); handleRemoveAssign(disc.id); }} className="text-text-secondary hover:text-red-500 transition-colors p-1" title="Remover alocação">
                                                                        <span className="material-symbols-outlined text-[20px]">link_off</span>
                                                                    </button>
                                                                )}
                                                                {!isAssigned && (
                                                                    <button className="bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-lg p-2 transition-colors">
                                                                        <span className="material-symbols-outlined text-[20px]">add_link</span>
                                                                    </button>
                                                                )}
                                                            </div>
                                                            {isAssigned && assignedTeacher && (
                                                                <div className="mt-3 flex items-center gap-2 bg-green-50 dark:bg-green-900/10 p-2 rounded border border-green-100 dark:border-green-900/30">
                                                                    <div className="size-6 rounded-full bg-cover bg-center" style={{ backgroundImage: `url('${assignedTeacher.avatar}')` }}></div>
                                                                    <span className="text-sm font-medium text-text-main dark:text-white">{assignedTeacher.name}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Allocation;
