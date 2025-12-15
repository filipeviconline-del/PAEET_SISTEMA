import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { Discipline } from '../types';

const Disciplines: React.FC = () => {
    const [disciplines, setDisciplines] = useState<Discipline[]>([]);
    const [loading, setLoading] = useState(true);
    const [newDiscipline, setNewDiscipline] = useState({ name: '', hours: '', code: '' });

    React.useEffect(() => {
        fetchDisciplines();
    }, []);

    const fetchDisciplines = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase.from('disciplines').select('*').order('name');
            if (error) throw error;
            setDisciplines(data || []);
        } catch (error) {
            console.error('Error fetching disciplines:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddDiscipline = async () => {
        if (!newDiscipline.name || !newDiscipline.hours) {
            alert('Preencha nome e carga horária');
            return;
        }

        try {
            const { data, error } = await supabase.from('disciplines').insert([{
                name: newDiscipline.name,
                code: newDiscipline.code || newDiscipline.name.substring(0, 3).toUpperCase(),
                hours: parseInt(newDiscipline.hours),
                course: 'DS', // Default
                module: 'Módulo 1 - Fundamentos', // Default for demo
                description: 'Disciplina do currículo técnico',
                period: 'Noturno'
            }]).select();

            if (error) throw error;

            if (data) {
                setDisciplines([...disciplines, data[0]]);
                setNewDiscipline({ name: '', hours: '', code: '' });
                alert('Disciplina cadastrada!');
            }
        } catch (error: any) {
            console.log(error);
            alert('Erro ao salvar: ' + error.message);
        }
    };

    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10">
            <div className="max-w-7xl mx-auto flex flex-col gap-8">
                {/* Heading */}
                <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap gap-2 items-center text-sm text-text-secondary">
                        <span>Home</span> / <span>Disciplinas</span>
                    </div>
                    <div className="flex flex-wrap justify-between items-end gap-4">
                        <div className="flex flex-col gap-1">
                            <h1 className="text-3xl md:text-4xl font-black text-text-main dark:text-white">Cadastro de Disciplinas</h1>
                            <p className="text-text-secondary text-base max-w-2xl">Adicione e gerencie os módulos curriculares dos cursos técnicos.</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Form */}
                    <div className="xl:col-span-1 flex flex-col gap-6">
                        <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark overflow-hidden">
                            <div className="px-6 py-4 border-b border-border-light dark:border-border-dark bg-slate-50/50 dark:bg-slate-800/50">
                                <h3 className="text-text-main dark:text-white text-lg font-bold">Nova Disciplina</h3>
                            </div>
                            <form className="p-6 flex flex-col gap-5" onSubmit={(e) => { e.preventDefault(); handleAddDiscipline(); }}>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-medium text-text-main dark:text-white">Nome do Módulo</label>
                                    <input
                                        className="w-full rounded-lg border border-border-light dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-text-main dark:text-white"
                                        placeholder="Ex: Desenvolvimento Web I"
                                        type="text"
                                        value={newDiscipline.name}
                                        onChange={e => setNewDiscipline({ ...newDiscipline, name: e.target.value })}
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-medium text-text-main dark:text-white">Sigla (Código)</label>
                                    <input
                                        className="w-full rounded-lg border border-border-light dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-text-main dark:text-white"
                                        placeholder="Ex: PW1"
                                        type="text"
                                        value={newDiscipline.code}
                                        onChange={e => setNewDiscipline({ ...newDiscipline, code: e.target.value })}
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-medium text-text-main dark:text-white">Carga Horária (h)</label>
                                    <input
                                        className="w-full rounded-lg border border-border-light dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-text-main dark:text-white"
                                        placeholder="Ex: 80"
                                        type="number"
                                        value={newDiscipline.hours}
                                        onChange={e => setNewDiscipline({ ...newDiscipline, hours: e.target.value })}
                                    />
                                </div>
                                <button className="bg-primary hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2" type="submit">
                                    <span className="material-symbols-outlined text-[20px]">check</span> Salvar
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="xl:col-span-2 flex flex-col gap-6">
                        <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark flex flex-col h-full">
                            <div className="px-6 py-5 border-b border-border-light dark:border-border-dark flex flex-col sm:flex-row justify-between items-center gap-4">
                                <h3 className="text-text-main dark:text-white text-lg font-bold">Disciplinas Cadastradas</h3>
                            </div>
                            <div className="overflow-x-auto flex-1 h-[400px]">
                                {loading ? (
                                    <div className="p-8 text-center text-text-secondary">Carregando...</div>
                                ) : (
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-slate-50 dark:bg-slate-800/50 sticky top-0">
                                            <tr>
                                                <th className="px-6 py-3 text-xs font-semibold text-text-secondary uppercase">ID</th>
                                                <th className="px-6 py-3 text-xs font-semibold text-text-secondary uppercase">Módulo</th>
                                                <th className="px-6 py-3 text-xs font-semibold text-text-secondary uppercase">Curso</th>
                                                <th className="px-6 py-3 text-xs font-semibold text-text-secondary uppercase text-center">C.H.</th>
                                                <th className="px-6 py-3 text-xs font-semibold text-text-secondary uppercase text-right">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border-light dark:divide-border-dark">
                                            {disciplines.map(disc => (
                                                <tr key={disc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                    <td className="px-6 py-4 text-sm text-slate-500">#{disc.id}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-semibold text-text-main dark:text-white">{disc.name}</span>
                                                            <span className="text-xs text-text-secondary">{disc.description}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                                            {disc.course.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-center text-text-main dark:text-white">{disc.hours}h</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                className="size-8 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 transition-colors"
                                                                onClick={async () => {
                                                                    if (confirm('Tem certeza?')) {
                                                                        const { error } = await supabase.from('disciplines').delete().eq('id', disc.id);
                                                                        if (error) {
                                                                            alert('Erro ao excluir: ' + error.message);
                                                                        } else {
                                                                            fetchDisciplines();
                                                                        }
                                                                    }
                                                                }}
                                                            >
                                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Disciplines;
