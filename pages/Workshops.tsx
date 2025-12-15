import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { generateWorkshopIdeas } from '../services/ai';

interface Workshop {
    id: string;
    title: string;
    description: string;
    date: string;
    collaborators: string;
}

const Workshops: React.FC = () => {
    const [workshops, setWorkshops] = useState<Workshop[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAIOpen, setIsAIOpen] = useState(false);

    // Form State
    const [form, setForm] = useState({ title: '', description: '', date: '', collaborators: '' });
    const [aiTheme, setAiTheme] = useState('');
    const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
    const [generating, setGenerating] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        fetchWorkshops();
    }, []);
    // ...


    const fetchWorkshops = async () => {
        setLoading(true);
        const { data } = await supabase.from('workshops').select('*').order('date', { ascending: true });
        if (data) setWorkshops(data);
        setLoading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const { error } = await supabase.from('workshops').insert([form]);
        if (error) alert('Erro ao salvar: ' + error.message);
        else {
            setIsModalOpen(false);
            setForm({ title: '', description: '', date: '', collaborators: '' });
            fetchWorkshops();
        }
    };

    const handleDelete = async (id: string) => {
        const { error } = await supabase.from('workshops').delete().eq('id', id);

        if (error) {
            console.error("Erro Supabase:", error);
            alert('Erro ao excluir: ' + error.message);
        } else {
            setDeletingId(null);
            fetchWorkshops();
        }
    };

    const handleGenerateIdeas = async () => {
        if (!aiTheme) return;
        setGenerating(true);
        try {
            const ideas = await generateWorkshopIdeas(aiTheme);
            setAiSuggestions(ideas);
        } catch (error: any) {
            console.error('Full AI Error:', error);
            if (error.message.includes('API Key')) {
                alert('⚠️ Tente reiniciar o servidor!\n\nSe você acabou de colocar a chave no .env.local, o sistema precisa reiniciar para reconhecê-la.\n\nSe ainda não colocou, configure VITE_GEMINI_API_KEY.');
            } else {
                alert('Erro na IA: ' + error.message);
            }
        } finally {
            setGenerating(false);
        }
    };

    const applyIdea = (idea: any) => {
        setForm({ ...form, title: idea.title, description: idea.description });
        setIsAIOpen(false);
        setIsModalOpen(true);
    };

    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10">
            <div className="max-w-7xl mx-auto flex flex-col gap-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black text-text-main dark:text-white">Gestão de Oficinas</h1>
                        <p className="text-text-secondary">Planeje e organize atividades práticas.</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setIsAIOpen(true)} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-lg shadow-purple-500/30">
                            <span className="material-symbols-outlined">auto_awesome</span>
                            IA: Sugerir Ideias
                        </button>
                        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-lg shadow-blue-500/30">
                            <span className="material-symbols-outlined">add</span>
                            Nova Oficina
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {workshops.map(w => (
                        <div key={w.id} className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-border-light dark:border-border-dark shadow-sm hover:shadow-md transition-shadow relative group">
                            {deletingId === w.id ? (
                                <div className="absolute top-4 right-4 z-10 flex gap-2 animate-fadeIn bg-white dark:bg-surface-dark p-1 rounded-lg border border-red-200 shadow-sm">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(w.id);
                                        }}
                                        className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded font-bold"
                                    >
                                        Confirmar
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setDeletingId(null);
                                        }}
                                        className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1.5 rounded font-bold"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setDeletingId(w.id);
                                    }}
                                    className="absolute top-4 right-4 z-10 text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                                    title="Excluir"
                                >
                                    <span className="material-symbols-outlined">delete</span>
                                </button>
                            )}
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined text-primary">event</span>
                                <span className="text-sm font-bold text-primary">{new Date(w.date).toLocaleDateString('pt-BR')}</span>
                            </div>
                            <h3 className="text-xl font-bold text-text-main dark:text-white mb-2">{w.title}</h3>
                            <p className="text-text-secondary dark:text-slate-400 text-sm mb-4 line-clamp-3">{w.description}</p>
                            <div className="flex items-center gap-2 text-xs text-text-secondary mt-auto pt-4 border-t border-border-light dark:border-border-dark">
                                <span className="material-symbols-outlined text-[16px]">group</span>
                                {w.collaborators || 'Sem colaboradores'}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-surface-dark p-6 rounded-xl w-full max-w-md shadow-2xl">
                            <h2 className="text-xl font-bold mb-4 text-text-main dark:text-white">Nova Oficina</h2>
                            <form onSubmit={handleSave} className="flex flex-col gap-4">
                                <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Título da Oficina" className="p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                                <div className="grid grid-cols-2 gap-4">
                                    <input required type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                                    <input value={form.collaborators} onChange={e => setForm({ ...form, collaborators: e.target.value })} placeholder="Colaboradores (ex: Prof. João)" className="p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                                </div>
                                <textarea required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Descrição das atividades..." className="p-2 border rounded-lg h-32 resize-none dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                                <div className="flex gap-2 justify-end mt-2">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-500 hover:text-slate-700">Cancelar</button>
                                    <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg font-bold">Salvar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* AI Modal */}
                {isAIOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-surface-dark p-6 rounded-xl w-full max-w-lg shadow-2xl">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold flex items-center gap-2 text-purple-600">
                                    <span className="material-symbols-outlined">auto_awesome</span>
                                    Assistente de Ideias
                                </h2>
                                <button onClick={() => setIsAIOpen(false)} className="text-slate-400 hover:text-slate-600"><span className="material-symbols-outlined">close</span></button>
                            </div>

                            <div className="flex gap-2 mb-6">
                                <input
                                    value={aiTheme}
                                    onChange={e => setAiTheme(e.target.value)}
                                    placeholder="Sobre o que será a oficina? (ex: Robótica, Artes...)"
                                    className="flex-1 p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                    onKeyDown={e => e.key === 'Enter' && handleGenerateIdeas()}
                                />
                                <button onClick={handleGenerateIdeas} disabled={generating || !aiTheme} className="px-4 py-2 bg-purple-600 disabled:opacity-50 text-white rounded-lg font-bold">
                                    {generating ? '...' : 'Gerar'}
                                </button>
                            </div>

                            <div className="flex flex-col gap-3 max-h-96 overflow-y-auto">
                                {aiSuggestions.map((idea, i) => (
                                    <div key={i} className="p-4 border border-purple-100 dark:border-purple-900/30 bg-purple-50 dark:bg-purple-900/10 rounded-lg hover:border-purple-300 transition-colors cursor-pointer group" onClick={() => applyIdea(idea)}>
                                        <h4 className="font-bold text-purple-900 dark:text-purple-300 mb-1 flex justify-between">
                                            {idea.title}
                                            <span className="opacity-0 group-hover:opacity-100 text-xs bg-purple-200 text-purple-800 px-2 py-0.5 rounded">Usar</span>
                                        </h4>
                                        <p className="text-sm text-purple-700 dark:text-purple-400">{idea.description}</p>
                                    </div>
                                ))}
                                {aiSuggestions.length === 0 && !generating && (
                                    <div className="text-center text-slate-400 py-8">
                                        Digite um tema e peça para a IA sugerir ideias!
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Workshops;
