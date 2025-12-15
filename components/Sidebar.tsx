import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { User } from '../types';

interface SidebarProps {
  user: User;
  onLogout: () => void;
  isAdmin?: boolean;
}


const Sidebar: React.FC<SidebarProps> = ({ user, onLogout, isAdmin }) => {
  const location = useLocation();

  const getLinkClass = (path: string) => {
    const isActive = location.pathname === path;
    const baseClass = "flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group";
    const activeClass = "bg-primary/10 dark:bg-primary/20 text-primary";
    const inactiveClass = "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300";

    return `${baseClass} ${isActive ? activeClass : inactiveClass}`;
  };

  const getIconClass = (path: string) => {
    const isActive = location.pathname === path;
    return `material-symbols-outlined ${isActive ? "text-primary fill" : "text-slate-500 dark:text-slate-400 group-hover:text-primary"}`;
  };

  return (
    <aside className="hidden md:flex w-72 flex-col justify-between border-r border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-6 h-screen sticky top-0">
      <div className="flex flex-col gap-8">
        {/* Logo Area */}
        <div className="flex gap-3 items-center">
          <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-12 shadow-sm"
            style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAp0nij9B3NzBh5y--Cpi78XuGzH0s0mdQ0trKVSEuHG828MMD3Zuf-Zdcrr2iIR98PR1VOioAKTU1Ldl-pHLA2XgTB5GaPGPmh2Ow-5r5WQVKoskXz5t1N5dRxZz-y48U26dKgRJxwdDhkZEE3OqzFVNwpIbLY4KEc6c9NMT1HZucjAsqs5yN9Iu3XeZV46lqFHyiRBQoMVjpZKtCaBE4ICNdFPzOHUHk4L8FkpLVVURpOJKdwSTmcskGDO8duXPbHZRO4WmG3i2M")' }}></div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold leading-tight tracking-tight text-text-main dark:text-white">Gestão Acadêmica</h1>
            <p className="text-text-secondary text-xs font-normal">Painel do Paeet</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-2">
          <NavLink to="/dashboard" className={getLinkClass('/dashboard')}>
            <span className={getIconClass('/dashboard')}>dashboard</span>
            <p className="text-sm font-medium">Dashboard</p>
          </NavLink>

          {user.role !== 'Aluno' && (
            <>
              <NavLink to="/teachers" className={getLinkClass('/teachers')}>
                <span className={getIconClass('/teachers')}>groups</span>
                <p className="text-sm font-medium">Professores</p>
              </NavLink>

              <NavLink to="/students" className={getLinkClass('/students')}>
                <span className={getIconClass('/students')}>person_add</span>
                <p className="text-sm font-medium">Alunos</p>
              </NavLink>

              <NavLink to="/disciplines" className={getLinkClass('/disciplines')}>
                <span className={getIconClass('/disciplines')}>book</span>
                <p className="text-sm font-medium">Disciplinas</p>
              </NavLink>

              <NavLink to="/allocation" className={getLinkClass('/allocation')}>
                <span className={getIconClass('/allocation')}>school</span>
                <p className="text-sm font-medium">Alocação</p>
              </NavLink>

              <NavLink to="/workshops" className={getLinkClass('/workshops')}>
                <span className={getIconClass('/workshops')}>lightbulb</span>
                <p className="text-sm font-medium">Oficinas</p>
              </NavLink>
            </>
          )}

          {isAdmin && (
            <NavLink to="/admin" className={getLinkClass('/admin')}>
              <span className={getIconClass('/admin')}>admin_panel_settings</span>
              <p className="text-sm font-medium text-amber-600 dark:text-amber-500">Administração</p>
            </NavLink>
          )}
        </nav>
      </div>

      <div className="border-t border-border-light dark:border-border-dark pt-4 mt-auto">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="bg-center bg-no-repeat bg-cover rounded-full size-10"
            style={{ backgroundImage: `url("${user.avatar}")` }}></div>
          <div className="flex flex-col overflow-hidden">
            <p className="text-sm font-bold text-text-main dark:text-white truncate">{user.name}</p>
            <p className="text-xs text-text-secondary truncate">{user.role}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full mt-4 flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          Sair do Sistema
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
