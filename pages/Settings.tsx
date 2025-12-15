import React from 'react';
import { useTheme } from '../context/ThemeContext';

const Settings: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10">
            <div className="max-w-4xl mx-auto flex flex-col gap-8">

                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-black text-text-main dark:text-white">Configurações</h1>
                    <p className="text-text-secondary">Personalize suas preferências no sistema.</p>
                </div>

                <div className="bg-white dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm">
                    <div className="p-6 border-b border-border-light dark:border-border-dark">
                        <h3 className="text-lg font-bold text-text-main dark:text-white">Aparência & Sistema</h3>
                    </div>
                    <div className="p-6 flex flex-col gap-6">

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-text-main dark:text-white">Tema Escuro</p>
                                <p className="text-sm text-text-secondary">Habilitar modo escuro para a interface.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={theme === 'dark'}
                                    onChange={toggleTheme}
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 dark:peer-focus:ring-primary/80 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-text-main dark:text-white">Idioma</p>
                                <p className="text-sm text-text-secondary">Selecione o idioma da interface.</p>
                            </div>
                            <select className="h-10 rounded-lg border px-3 bg-white dark:bg-slate-800 dark:text-white dark:border-slate-700">
                                <option>Português (Brasil)</option>
                                <option>English (US)</option>
                                <option>Español</option>
                            </select>
                        </div>

                    </div>
                </div>

                <div className="bg-white dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm">
                    <div className="p-6 border-b border-border-light dark:border-border-dark">
                        <h3 className="text-lg font-bold text-text-main dark:text-white">Notificações</h3>
                    </div>
                    <div className="p-6 flex flex-col gap-6">

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-text-main dark:text-white">Alertas por Email</p>
                                <p className="text-sm text-text-secondary">Receber atualizações importantes no seu email.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 dark:peer-focus:ring-primary/80 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-text-main dark:text-white">Sons de Sistema</p>
                                <p className="text-sm text-text-secondary">Reproduzir sons para notificações.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 dark:peer-focus:ring-primary/80 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                            </label>
                        </div>

                    </div>
                </div>

                <div className="flex justify-end">
                    <button className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold transition-colors shadow-lg shadow-primary/25">
                        Salvar Alterações
                    </button>
                </div>

            </div>
        </div>
    );
};

export default Settings;
