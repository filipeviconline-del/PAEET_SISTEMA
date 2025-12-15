import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, CartesianGrid } from 'recharts';
import { supabase } from '../services/supabase';
import Calendar from '../components/Calendar';
import StudentDashboard from '../components/StudentDashboard';
import { User } from '../types';

interface DashboardProps {
  userProfile?: User | null;
}

const Dashboard: React.FC<DashboardProps> = ({ userProfile }) => {
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    disciplines: 0
  });
  const [title, setTitle] = useState('Painel Administrativo');
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear().toString());
  const [loading, setLoading] = useState(true);

  // If student, render student dashboard
  if (userProfile?.role === 'Aluno') {
    return (
      <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-main dark:text-white">Olá, {userProfile.name}!</h1>
            <p className="text-text-secondary dark:text-slate-400">Bem-vindo ao seu painel do aluno.</p>
          </div>
          <StudentDashboard studentId={Number(userProfile.id)} />
        </div>
      </div>
    );
  }

  // Mock chart data for now as we don't have enough real data for a good chart
  const data = [
    { name: 'Lógica', hours: 120 },
    { name: 'Banco', hours: 60 },
    { name: 'Web', hours: 130 },
    { name: 'Mobile', hours: 100 },
    { name: 'Algo', hours: 90 },
    { name: 'Redes', hours: 75 },
    { name: 'Hard', hours: 120 },
  ];

  const fetchDashboardData = async () => {
    try {
      const [
        { count: studentCount },
        { count: teacherCount },
        { count: disciplineCount },
        { data: titleSettings },
        { data: dateSettings }
      ] = await Promise.all([
        supabase.from('students').select('*', { count: 'exact', head: true }),
        supabase.from('teachers').select('*', { count: 'exact', head: true }),
        supabase.from('disciplines').select('*', { count: 'exact', head: true }),
        supabase.from('system_settings').select('value').eq('key', 'dashboard_title').single(),
        supabase.from('system_settings').select('value').eq('key', 'academic_start_date').single()
      ]);

      setStats({
        students: studentCount || 0,
        teachers: teacherCount || 0,
        disciplines: disciplineCount || 0
      });

      if (titleSettings) {
        setTitle(titleSettings.value);
      }

      if (dateSettings && dateSettings.value) {
        const date = new Date(dateSettings.value);
        if (!isNaN(date.getTime())) {
          // Logic: if month < 6, set as .1, else .2
          const semester = date.getMonth() < 6 ? '1' : '2';
          setAcademicYear(`${date.getFullYear()}.${semester}`);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Subscribe to changes in system_settings
    const settingsSubscription = supabase
      .channel('system_settings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'system_settings'
        },
        () => {
          fetchDashboardData();
        }
      )
      .subscribe();

    // Polling as fallback (every 30s)
    const interval = setInterval(fetchDashboardData, 30000);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(settingsSubscription);
    };
  }, []);

  const handleExport = () => {
    // Generate CSV content
    const headers = ['Métrica', 'Valor'];
    const csvContent = [
      headers.join(','),
      `Alunos,${stats.students}`,
      `Professores,${stats.teachers}`,
      `Disciplinas,${stats.disciplines}`
    ].join('\n');

    // Create blobs and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_dashboard_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">

        {/* Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-text-main dark:text-white text-2xl md:text-3xl font-black tracking-tight">{loading ? 'Carregando...' : title}</h2>
            <p className="text-text-secondary dark:text-slate-400 text-sm md:text-base">Acompanhamento administrativo do semestre letivo {academicYear}</p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-2 bg-primary hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 px-5 py-2.5 rounded-xl font-medium transition-all active:scale-95">
            <span className="material-symbols-outlined text-[20px]">download</span>
            <span>Exportar Relatório</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Stat 1 */}
          <div className="bg-white dark:bg-surface-dark rounded-xl p-6 border border-border-light dark:border-border-dark shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="material-symbols-outlined text-6xl">school</span>
            </div>
            <div>
              <p className="text-text-secondary dark:text-slate-400 text-sm font-medium">Alunos Matriculados</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-3xl font-bold text-text-main dark:text-white">{stats.students}</h3>
                <span className="inline-flex items-center text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded text-xs font-semibold">
                  <span className="material-symbols-outlined text-[14px] mr-0.5">trending_up</span>+5%
                </span>
              </div>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-auto">
              <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>

          {/* Stat 2 */}
          <div className="bg-white dark:bg-surface-dark rounded-xl p-6 border border-border-light dark:border-border-dark shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="material-symbols-outlined text-6xl">person_apron</span>
            </div>
            <div>
              <p className="text-text-secondary dark:text-slate-400 text-sm font-medium">Professores Ativos</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-3xl font-bold text-text-main dark:text-white">{stats.teachers}</h3>
                <span className="inline-flex items-center text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400 px-2 py-0.5 rounded text-xs font-semibold">0%</span>
              </div>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-auto">
              <div className="bg-primary h-1.5 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>

          {/* Stat 3 */}
          <div className="bg-white dark:bg-surface-dark rounded-xl p-6 border border-border-light dark:border-border-dark shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="material-symbols-outlined text-6xl">book_2</span>
            </div>
            <div>
              <p className="text-text-secondary dark:text-slate-400 text-sm font-medium">Disciplinas Cadastradas</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-3xl font-bold text-text-main dark:text-white">{stats.disciplines}</h3>
                <span className="inline-flex items-center text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded text-xs font-semibold">
                  <span className="material-symbols-outlined text-[14px] mr-0.5">trending_up</span>+12%
                </span>
              </div>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-auto">
              <div className="bg-blue-400 h-1.5 rounded-full" style={{ width: '65%' }}></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <div>
                <h3 className="text-lg font-bold text-text-main dark:text-white">Carga Horária por Módulo Técnico</h3>
                <p className="text-text-secondary dark:text-slate-400 text-sm">Distribuição de horas por disciplina no semestre atual</p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="hours" fill="#135bec" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Calendar */}
          <div className="lg:col-span-1">
            <Calendar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
