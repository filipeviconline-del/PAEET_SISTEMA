export interface User {
  name: string;
  role: string;
  avatar: string;
  email: string;
}

export interface Teacher {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  specializations: string[];
  maxHours: number;
  currentHours: number;
}

export interface Student {
  id: number;
  registration: string; // Matrícula
  name: string;
  email: string;
  course: string;
  classGroup: string; // Turma
  avatar: string;
}

export interface Discipline {
  id: number;
  code: string;
  name: string;
  course: string;
  module: string; // e.g. "Módulo 1 - Fundamentos"
  hours: number;
  description: string;
  period: 'Matutino' | 'Vespertino' | 'Noturno';
  assignedTeacherId?: number | null;
}

export interface DashboardStat {
  label: string;
  value: string;
  trend: string;
  trendUp: boolean;
  icon: string;
  colorClass: string;
  progress: number;
}
