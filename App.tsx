import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Teachers from './pages/Teachers';
import Students from './pages/Students';
import Disciplines from './pages/Disciplines';
import Allocation from './pages/Allocation';
import Admin from './pages/Admin';
import Workshops from './pages/Workshops';
import Settings from './pages/Settings';
import { supabase } from './services/supabase';
import { User } from './types';
import { ThemeProvider } from './context/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
  isAdmin?: boolean;
  userProfile?: User | null;
}

const Layout: React.FC<LayoutProps> = ({ children, onLogout, isAdmin, userProfile }) => (
  <div className="flex h-screen w-full bg-background-light dark:bg-background-dark overflow-hidden">
    <Sidebar user={userProfile || { name: 'Carregando...', email: '', role: '...', avatar: '' }} onLogout={onLogout} isAdmin={isAdmin} />
    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
      <Header />
      {children}
    </div>
  </div>
);

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // null = loading
  const [isAdmin, setIsAdmin] = useState(false);
  const [userProfile, setUserProfile] = useState<User | null>(null);

  React.useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      if (session?.user?.email) fetchUserProfile(session.user.email.toLowerCase());
    });

    // Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (session?.user?.email) fetchUserProfile(session.user.email.toLowerCase());
      else {
        setIsAdmin(false);
        setUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (email: string) => {
    const emailLower = email.toLowerCase();
    // 1. Check Admin
    const { data: admin } = await supabase.from('admins').select('*').eq('email', emailLower).single();
    if (admin) {
      setIsAdmin(true);
      setUserProfile({
        id: admin.id,
        name: 'Administrador', // Admins might not have names in DB yet, use generic or update schema
        email: admin.email,
        role: 'Administrador',
        avatar: 'https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff'
      });
      return;
    }

    // 2. Check Teacher
    const { data: teacher } = await supabase.from('teachers').select('*').eq('email', emailLower).single();
    if (teacher) {
      setIsAdmin(false);
      setUserProfile({
        ...teacher,
        role: 'Professor'
      });
      return;
    }

    // 3. Check Student
    const { data: student } = await supabase.from('students').select('*').eq('email', emailLower).single();
    if (student) {
      setIsAdmin(false);
      setUserProfile({
        ...student,
        role: 'Aluno'
      });
      return;
    }
  };

  if (isAuthenticated === null) {
    return <div className="flex h-screen items-center justify-center bg-background-light dark:bg-background-dark text-text-main dark:text-white">Carregando...</div>;
  }

  const handleLogin = () => {
    // Auth state handled by subscription
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route
            path="/login"
            element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" replace />}
          />

          <Route
            path="/dashboard"
            element={isAuthenticated ? <Layout onLogout={handleLogout} isAdmin={isAdmin} userProfile={userProfile}><Dashboard userProfile={userProfile} /></Layout> : <Navigate to="/login" replace />}
          />

          <Route
            path="/teachers"
            element={isAuthenticated ? <Layout onLogout={handleLogout} isAdmin={isAdmin} userProfile={userProfile}><Teachers /></Layout> : <Navigate to="/login" replace />}
          />

          <Route
            path="/students"
            element={isAuthenticated ? <Layout onLogout={handleLogout} isAdmin={isAdmin} userProfile={userProfile}><Students /></Layout> : <Navigate to="/login" replace />}
          />

          <Route
            path="/disciplines"
            element={isAuthenticated ? <Layout onLogout={handleLogout} isAdmin={isAdmin} userProfile={userProfile}><Disciplines /></Layout> : <Navigate to="/login" replace />}
          />

          <Route
            path="/allocation"
            element={isAuthenticated ? <Layout onLogout={handleLogout} isAdmin={isAdmin} userProfile={userProfile}><Allocation /></Layout> : <Navigate to="/login" replace />}
          />

          <Route
            path="/workshops"
            element={isAuthenticated ? <Layout onLogout={handleLogout} isAdmin={isAdmin} userProfile={userProfile}><Workshops /></Layout> : <Navigate to="/login" replace />}
          />

          <Route
            path="/admin"
            element={isAuthenticated && isAdmin ? <Layout onLogout={handleLogout} isAdmin={isAdmin} userProfile={userProfile}><Admin /></Layout> : <Navigate to="/dashboard" replace />}
          />

          <Route
            path="/settings"
            element={isAuthenticated ? <Layout onLogout={handleLogout} isAdmin={isAdmin} userProfile={userProfile}><Settings /></Layout> : <Navigate to="/login" replace />}
          />

          {/* Default Redirect */}
          <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;