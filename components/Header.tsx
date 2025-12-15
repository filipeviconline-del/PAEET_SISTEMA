import React from 'react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark px-6 py-4 z-10 sticky top-0">
      <div className="flex items-center gap-4 text-text-main dark:text-white">
        <button className="md:hidden text-slate-500 hover:text-primary">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] hidden sm:block">
          {title || "Sistema de Gestão Escolar"}
        </h2>
      </div>
      <div className="flex items-center justify-end gap-4">
        <button
          onClick={() => alert('Notificações: Você não tem novas mensagens.')}
          className="flex items-center justify-center size-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors relative"
        >
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white dark:border-surface-dark"></span>
        </button>
        <button
          onClick={() => navigate('/settings')}
          className="flex items-center justify-center size-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
        >
          <span className="material-symbols-outlined">settings</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
