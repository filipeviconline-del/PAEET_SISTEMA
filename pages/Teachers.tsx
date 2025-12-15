import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { Teacher } from '../types';

const Teachers: React.FC = () => {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [newTeacher, setNewTeacher] = useState<Partial<Teacher>>({ name: '', email: '', specializations: [] });

    React.useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase.from('teachers').select('*').order('name');
            if (error) throw error;
            setTeachers(data || []);
        } catch (error) {
            console.error('Error fetching teachers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTeacher = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newTeacher.name && newTeacher.email) {
            try {
                const firstName = newTeacher.name.trim().split(' ')[0];
                const randomCode = Math.floor(1000 + Math.random() * 9000);
                const tempPass = `${firstName}${randomCode}!`;

                const { data, error } = await supabase.from('teachers').insert([{
                    name: newTeacher.name,
                    email: newTeacher.email,
                    phone: '(00) 0000-0000',
                    avatar: `https://ui-avatars.com/api/?name=${newTeacher.name}&background=random`,
                    specializations: newTeacher.specializations || [],
                    max_hours: 20,
                    current_hours: 0,
                    temp_password: tempPass
                }]).select();

                if (error) throw error;

                if (data) {
                    setTeachers([...teachers, data[0]]);
                    setNewTeacher({ name: '', email: '', specializations: [] });
                    setShowForm(false);
                    alert(`Professor cadastrado!\nSenha Temporária: ${tempPass}`);
                }
            } catch (error: any) {
                console.error('Error adding teacher:', error);
                alert('Erro ao adicionar professor: ' + error.message);
            }
        }
    };

    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10">
            <div className="max-w-7xl mx-auto flex flex-col gap-6">

                {/* Breadcrumbs & Title */}
                <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap gap-2 text-sm text-text-secondary">
                        <span>Home</span> / <span>Professores</span>
                    </div>
                    <div className="flex justify-between items-end">
                        <h1 className="text-3xl font-black text-text-main dark:text-white">Gerenciamento de Professores</h1>
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors"
                        >
                            {showForm ? 'Cancelar' : 'Novo Professor'}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Form */}
                    {showForm && (
                        <div className="lg:col-span-4 flex flex-col gap-6 animate-fade-in">
                            <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm">
                                <div className="p-6 border-b border-border-light dark:border-border-dark">
                                    <h3 className="text-lg font-bold text-text-main dark:text-white">Novo Cadastro</h3>
                                </div>
                                <form onSubmit={handleAddTeacher} className="p-6 flex flex-col gap-5">
                                    <label className="flex flex-col gap-2">
                                        <span className="text-sm font-medium text-text-main dark:text-white">Nome Completo</span>
                                        <input
                                            className="w-full h-11 rounded-lg border border-border-light dark:border-slate-700 px-4 bg-white dark:bg-slate-900 text-text-main dark:text-white"
                                            type="text"
                                            value={newTeacher.name}
                                            onChange={e => setNewTeacher({ ...newTeacher, name: e.target.value })}
                                            placeholder="Ex: Ana Silva"
                                        />
                                    </label>
                                    <label className="flex flex-col gap-2">
                                        <span className="text-sm font-medium text-text-main dark:text-white">Email Institucional</span>
                                        <input
                                            className="w-full h-11 rounded-lg border border-border-light dark:border-slate-700 px-4 bg-white dark:bg-slate-900 text-text-main dark:text-white"
                                            type="email"
                                            value={newTeacher.email}
                                            onChange={e => setNewTeacher({ ...newTeacher, email: e.target.value })}
                                            placeholder="email@etec.sp.gov.br"
                                        />
                                    </label>
                                    <label className="flex flex-col gap-2">
                                        <span className="text-sm font-medium text-text-main dark:text-white">Especializações (Separe por vírgula)</span>
                                        <textarea
                                            className="w-full rounded-lg border border-border-light dark:border-slate-700 p-4 bg-white dark:bg-slate-900 text-text-main dark:text-white resize-none"
                                            rows={3}
                                            value={newTeacher.specializations?.join(', ')}
                                            onChange={e => setNewTeacher({ ...newTeacher, specializations: e.target.value.split(',').map(s => s.trim()) })}
                                            placeholder="Java, Banco de Dados..."
                                        />
                                    </label>
                                    <button type="submit" className="h-11 rounded-lg bg-primary text-white font-bold hover:bg-blue-700 transition-colors">
                                        Salvar
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* List */}
                    <div className={`${showForm ? 'lg:col-span-8' : 'lg:col-span-12'} flex flex-col gap-6`}>
                        <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm">
                            <div className="p-5 border-b border-border-light dark:border-border-dark flex justify-between items-center">
                                <h3 className="text-lg font-bold text-text-main dark:text-white">Professores Cadastrados</h3>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-gray-400">search</span>
                                    <input type="text" placeholder="Buscar..." className="pl-10 h-10 rounded-lg border border-border-light dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-slate-800/50">
                                            <th className="py-4 px-6 text-xs font-semibold uppercase text-text-secondary">Docente</th>
                                            <th className="py-4 px-6 text-xs font-semibold uppercase text-text-secondary hidden md:table-cell">Contato</th>
                                            <th className="py-4 px-6 text-xs font-semibold uppercase text-text-secondary">Especializações</th>
                                            <th className="py-4 px-6 text-xs font-semibold uppercase text-text-secondary text-right">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border-light dark:divide-border-dark">
                                        {teachers.map((t) => (
                                            <tr key={t.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-10 rounded-full bg-cover bg-center" style={{ backgroundImage: `url('${t.avatar}')` }}></div>
                                                        <div>
                                                            <p className="text-sm font-bold text-text-main dark:text-white">{t.name}</p>
                                                            <p className="text-xs text-text-secondary md:hidden">{t.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 hidden md:table-cell">
                                                    <p className="text-sm text-text-main dark:text-slate-300">{t.email}</p>
                                                    <p className="text-xs text-text-secondary">{t.phone}</p>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {t.specializations.map((spec, i) => (
                                                            <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                                {spec}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button className="p-1.5 rounded-md text-text-secondary hover:text-primary hover:bg-blue-50 dark:hover:bg-blue-900/30">
                                                            <span className="material-symbols-outlined text-[20px]">edit</span>
                                                        </button>
                                                        <button
                                                            className="p-1.5 rounded-md text-text-secondary hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                                                            onClick={async () => {
                                                                if (confirm('Tem certeza?')) {
                                                                    const { error } = await supabase.from('teachers').delete().eq('id', t.id);
                                                                    if (error) {
                                                                        alert('Erro ao excluir: ' + error.message);
                                                                    } else {
                                                                        fetchTeachers();
                                                                    }
                                                                }
                                                            }}
                                                        >
                                                            <span className="material-symbols-outlined text-[20px]">delete</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Teachers;
