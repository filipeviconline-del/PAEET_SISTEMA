import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { Student } from '../types';

const Students: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [newStudent, setNewStudent] = useState({ name: '', email: '', registration: '' });

    React.useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase.from('students').select('*').order('name');
            if (error) throw error;
            setStudents(data || []);
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddStudent = async () => {
        if (!newStudent.name || !newStudent.email) {
            alert('Preencha nome e email');
            return;
        }

        try {
            const registration = newStudent.registration || `${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`;
            const firstName = newStudent.name.trim().split(' ')[0];
            const randomCode = Math.floor(1000 + Math.random() * 9000);
            const tempPass = `${firstName}${randomCode}!`;

            const { data, error } = await supabase.from('students').insert([{
                name: newStudent.name,
                email: newStudent.email,
                registration: registration,
                course: 'Desenvolvimento de Sistemas', // Default for now
                class_group: '1º Módulo', // Default
                avatar: `https://ui-avatars.com/api/?name=${newStudent.name}&background=random`,
                temp_password: tempPass
            }]).select();

            if (error) throw error;

            if (data) {
                setStudents([...students, data[0]]);
                setNewStudent({ name: '', email: '', registration: '' });
                alert(`Aluno cadastrado!\nSenha Temporária: ${tempPass}`);
            }
        } catch (error: any) {
            console.error('Error adding student:', error);
            alert('Erro ao cadastrar aluno: ' + error.message);
        }
    };

    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10">
            <div className="max-w-7xl mx-auto flex flex-col gap-8">
                {/* Header */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap gap-2 items-center text-sm text-text-secondary">
                        <span>Home</span> / <span>Gestão de Alunos</span>
                    </div>
                    <div className="flex flex-wrap justify-between gap-4 items-end">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-3xl md:text-4xl font-black text-text-main dark:text-white">Cadastro e Gestão de Discentes</h1>
                            <p className="text-text-secondary text-base max-w-2xl">Gerencie as matrículas e informações dos alunos do curso técnico.</p>
                        </div>
                        <div className="flex gap-2">
                            <button className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark text-text-main dark:text-white px-4 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
                                <span className="material-symbols-outlined text-[20px]">file_upload</span> Importar CSV
                            </button>
                        </div>
                    </div>
                </div>

                {/* Reg Form */}
                <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-border-light dark:border-border-dark bg-slate-50/50 dark:bg-slate-800/20">
                        <h3 className="text-lg font-bold text-text-main dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">person_add</span> Novo Cadastro
                        </h3>
                    </div>
                    <div className="p-6">
                        <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6" onSubmit={(e) => { e.preventDefault(); handleAddStudent(); }}>
                            <label className="col-span-1 md:col-span-2 lg:col-span-6 flex flex-col gap-2">
                                <span className="text-sm font-semibold text-text-main dark:text-white">Nome Completo</span>
                                <input
                                    className="w-full rounded-lg border border-border-light dark:border-slate-700 bg-white dark:bg-slate-900 h-12 px-4 text-text-main dark:text-white"
                                    placeholder="Ex: João da Silva"
                                    type="text"
                                    value={newStudent.name}
                                    onChange={e => setNewStudent({ ...newStudent, name: e.target.value })}
                                />
                            </label>
                            <label className="col-span-1 md:col-span-1 lg:col-span-3 flex flex-col gap-2">
                                <span className="text-sm font-semibold text-text-main dark:text-white">Matrícula (Opcional)</span>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-gray-400">badge</span>
                                    <input
                                        className="w-full rounded-lg border border-border-light dark:border-slate-700 bg-white dark:bg-slate-900 h-12 pl-10 pr-4 text-text-main dark:text-white"
                                        placeholder="Gerado autom."
                                        type="text"
                                        value={newStudent.registration}
                                        onChange={e => setNewStudent({ ...newStudent, registration: e.target.value })}
                                    />
                                </div>
                            </label>
                            <label className="col-span-1 md:col-span-1 lg:col-span-3 flex flex-col gap-2">
                                <span className="text-sm font-semibold text-text-main dark:text-white">Email</span>
                                <input
                                    className="w-full rounded-lg border border-border-light dark:border-slate-700 bg-white dark:bg-slate-900 h-12 px-4 text-text-main dark:text-white"
                                    placeholder="nome@etec.sp.gov.br"
                                    type="email"
                                    value={newStudent.email}
                                    onChange={e => setNewStudent({ ...newStudent, email: e.target.value })}
                                />
                            </label>
                            <div className="col-span-1 md:col-span-2 lg:col-span-12 flex justify-end mt-2">
                                <button className="h-12 px-8 rounded-lg bg-primary text-white font-medium hover:bg-blue-700 transition-colors shadow-md flex items-center gap-2" type="submit">
                                    <span className="material-symbols-outlined text-[20px]">save</span> Cadastrar Aluno
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm flex flex-col min-h-[500px]">
                    <div className="p-4 border-b border-border-light dark:border-border-dark flex flex-col lg:flex-row gap-4 justify-between items-center">
                        <div className="flex items-center gap-2">
                            <span className="bg-primary/10 text-primary p-2 rounded-lg material-symbols-outlined">groups</span>
                            <h3 className="text-lg font-bold text-text-main dark:text-white">Alunos Matriculados</h3>
                            <span className="ml-2 bg-slate-100 dark:bg-slate-800 text-text-secondary text-xs font-bold px-2 py-1 rounded-full">{students.length}</span>
                        </div>
                        <div className="flex gap-3 w-full lg:w-auto">
                            <input className="w-full sm:w-64 rounded-lg border border-border-light dark:border-slate-700 bg-white dark:bg-slate-900 h-10 px-4 text-sm" placeholder="Buscar..." type="text" />
                        </div>
                    </div>
                    <div className="overflow-x-auto flex-1">
                        {loading ? (
                            <div className="p-8 text-center text-text-secondary">Carregando...</div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-border-light dark:border-border-dark bg-white dark:bg-surface-dark text-xs uppercase text-text-secondary font-semibold tracking-wider">
                                        <th className="px-6 py-4">Matrícula</th>
                                        <th className="px-6 py-4">Aluno</th>
                                        <th className="px-6 py-4">Email</th>
                                        <th className="px-6 py-4">Curso</th>
                                        <th className="px-6 py-4">Turma</th>
                                        <th className="px-6 py-4 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-light dark:divide-border-dark bg-white dark:bg-surface-dark text-sm">
                                    {students.map(student => (
                                        <tr key={student.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-text-main dark:text-white">{student.registration}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs overflow-hidden">
                                                        {student.avatar ? <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" /> : student.name.charAt(0)}
                                                    </div>
                                                    <span className="font-medium text-text-main dark:text-white">{student.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-text-secondary">{student.email}</td>
                                            <td className="px-6 py-4"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">{student.course}</span></td>
                                            <td className="px-6 py-4 text-text-main dark:text-slate-300">{student.classGroup}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button className="text-slate-400 hover:text-primary transition-colors p-1"><span className="material-symbols-outlined text-[20px]">edit</span></button>
                                                    <button
                                                        className="text-slate-400 hover:text-red-600 transition-colors p-1"
                                                        onClick={async () => {
                                                            if (confirm('Tem certeza?')) {
                                                                const { error } = await supabase.from('students').delete().eq('id', student.id);
                                                                if (error) {
                                                                    alert('Erro ao excluir: ' + error.message);
                                                                } else {
                                                                    fetchStudents();
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
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Students;
