import React, { useState } from 'react';
import { supabase } from '../services/supabase';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // New state for name
  const [newPassword, setNewPassword] = useState(''); // State for new password setting
  const [isSignUp, setIsSignUp] = useState(false); // Toggle state
  const [isTempPassword, setIsTempPassword] = useState(false); // Toggle for Temp Password Flow
  const [isAdminLogin, setIsAdminLogin] = useState(false); // Toggle for Admin Auth
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    const emailLower = email.toLowerCase().trim();

    try {
      setLoading(true);
      setError('');

      console.log('Tentando login com:', emailLower);

      console.log('Tentando login com:', emailLower);

      if (isTempPassword) {
        // --- SET NEW PASSWORD LOGIC ---
        if (!newPassword) throw new Error('Defina sua nova senha permanentemente.');

        // 1. SignUp/Update Auth User
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: emailLower,
          password: newPassword,
        });

        if (authError) {
          // If user already exists but somehow we are here (maybe auth link issue), try updating? 
          // Actually supabase sign up handles "already registered" by returning user (if email confirm off) or error.
          if (authError.message.includes('already registered')) {
            // Try signIn then update - but we don't know old password...
            // Wait, if they are here it means they COULD NOT sign in with 'password' (the temp one).
            throw new Error('Usuário já existe no sistema de autenticação. Tente recuperar a senha.');
          }
          throw authError;
        }

        // 2. Clear temp_password in DB
        // We need to know which table... checking all or we could save 'table' in state. 
        // For simplicity, try updating all tables where email matches.
        await supabase.from('teachers').update({ temp_password: null }).eq('email', emailLower);
        await supabase.from('students').update({ temp_password: null }).eq('email', emailLower);
        await supabase.from('admins').update({ temp_password: null }).eq('email', emailLower);

        alert('Senha definida com sucesso!');
        // Auto login should happen via session listener or we can just reload/reset
        setIsTempPassword(false);
        setLoading(false);
        return;
      }

      if (isSignUp) {
        // --- SIGN UP LOGIC ---
        if (!name) throw new Error('Nome é obrigatório para cadastro.');

        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: emailLower,
          password,
        });

        if (authError) throw authError;

        if (authData.user) {
          // Create student record
          const { error: dbError } = await supabase.from('students').insert([{
            name: name,
            email: emailLower,
            registration: `${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`, // Auto-generate registration
            course: 'Novo Aluno', // Default
            class_group: '1º Módulo', // Default
            avatar: `https://ui-avatars.com/api/?name=${name}&background=random`
          }]);

          if (dbError) {
            console.error('Erro ao criar aluno:', dbError);
            // Optional: delete auth user if db fails, but for now just warn
            throw new Error('Erro ao salvar dados do aluno: ' + dbError.message);
          }

          alert('Cadastro realizado com sucesso! Você já pode entrar.');
          setIsSignUp(false); // Switch back to login
          setLoading(false);
          return;
        }
      }

      // --- LOGIN LOGIC ---
      // 1. Authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: emailLower,
        password,
      });

      if (authError) {
        // --- TEMP PASSWORD FLOW ---
        // If auth fails, check if text matches a temp_password in DB
        console.log('Verificando senha temporária...');
        let tempUser = null;
        let table = '';

        // Check Admins
        const { data: admin } = await supabase.from('admins').select('*').eq('email', emailLower).eq('temp_password', password).single();
        if (admin) { tempUser = admin; table = 'admins'; }

        // Check Teachers
        if (!tempUser) {
          const { data: teacher } = await supabase.from('teachers').select('*').eq('email', emailLower).eq('temp_password', password).single();
          if (teacher) { tempUser = teacher; table = 'teachers'; }
        }

        // Check Students
        if (!tempUser) {
          const { data: student } = await supabase.from('students').select('*').eq('email', emailLower).eq('temp_password', password).single();
          if (student) { tempUser = student; table = 'students'; }
        }

        if (tempUser) {
          // Found matched temp password!
          setIsTempPassword(true);
          setLoading(false);
          return;
        }

        console.error('Erro de Auth:', authError);
        throw new Error('Credenciais inválidas. Verifique seu email e senha ou se possui cadastro.');
      }

      // 2. Validate against database (Teacher, Student, or Admin)
      let validUser = false;
      let userRole = '';

      // Check Admin
      const { data: admin } = await supabase.from('admins').select('*').eq('email', emailLower).single();
      if (admin) {
        validUser = true;
        userRole = 'Admin';
      }

      // Check Teacher (if not Admin or just to check)
      if (!validUser) {
        const { data: teacher } = await supabase.from('teachers').select('*').eq('email', emailLower).single();
        if (teacher) {
          validUser = true;
          userRole = 'Professor';
        }
      }

      // Check Student
      if (!validUser) {
        const { data: student } = await supabase.from('students').select('*').eq('email', emailLower).single();
        if (student) {
          validUser = true;
          userRole = 'Aluno';
        }
      }

      if (!validUser) {
        // Optional: Sign out if not in DB
        await supabase.auth.signOut();
        throw new Error('Usuário não encontrado no cadastro (Admin, Professor ou Aluno).');
      }

      console.log(`Login bem sucedido como ${userRole}`);

      // Success - State update will be handled by App.tsx subscription
    } catch (err: any) {
      let msg = err.message;
      if (msg.includes('security purposes')) {
        msg = 'Muitas tentativas. Por favor, aguarde 60 segundos antes de tentar novamente.';
      } else if (msg.includes('Invalid login') || msg.includes('Invalid credentials')) {
        msg = 'Credenciais inválidas. Verifique seu e-mail e senha.';
      } else if (msg.includes('User already registered')) {
        msg = 'Este e-mail já está cadastrado.';
      }
      setError(msg || 'Ocorreu um erro ao fazer login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-background-light dark:bg-background-dark">
      <header className="flex items-center justify-between px-6 py-4 lg:px-10 lg:py-5 z-20">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white shadow-lg shadow-primary/30">
            <span className="material-symbols-outlined text-2xl">school</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-text-main dark:text-white">Paeet <span className="text-primary font-medium">| Gestão</span></h2>
        </div>
      </header>

      <main className="flex flex-1 flex-col lg:flex-row h-full relative z-10 px-4 pb-4 lg:px-0 lg:pb-0">
        <div className="flex flex-1 flex-col justify-center items-center p-4 lg:p-12 xl:p-24 relative z-10 animate-fade-in">
          <div className="w-full max-w-[440px] flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-text-main dark:text-white">
                {isSignUp ? 'Crie sua conta' : (isAdminLogin ? 'Acesso Administrativo' : 'Bem-vindo de volta!')}
              </h1>
              <p className="text-text-secondary text-base">
                {isSignUp ? 'Preencha seus dados para começar.' : (isAdminLogin ? 'Entre com suas credenciais de administrador.' : 'Acesse o portal de gestão administrativa.')}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-4">
                {isSignUp && (
                  <div className="space-y-2 animate-fade-in">
                    <label className="text-sm font-medium text-text-main dark:text-slate-200" htmlFor="name">Nome Completo</label>
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-[20px]">badge</span>
                      <input
                        className="w-full h-12 rounded-lg border border-border-light dark:border-slate-700 bg-white dark:bg-slate-800 px-10 text-base outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-slate-400 dark:text-white"
                        id="name"
                        type="text"
                        placeholder="Seu nome"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-main dark:text-slate-200" htmlFor="email">E-mail ou Usuário</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-[20px]">person</span>
                    <input
                      className="w-full h-12 rounded-lg border border-border-light dark:border-slate-700 bg-white dark:bg-slate-800 px-10 text-base outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-slate-400 dark:text-white"
                      id="email"
                      type="text"
                      placeholder="coord@paeet.edu.br"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium text-text-main dark:text-slate-200" htmlFor="password">Senha</label>
                    <a className="text-xs font-medium text-primary hover:text-primary/80 hover:underline" href="#">Esqueci minha senha</a>
                  </div>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-[20px]">lock</span>
                    <input
                      className="w-full h-12 rounded-lg border border-border-light dark:border-slate-700 bg-white dark:bg-slate-800 px-10 text-base outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-slate-400 dark:text-white"
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                      <span className="material-symbols-outlined text-[20px]">visibility</span>
                    </button>
                  </div>
                </div>
              </div>

              {isTempPassword && (
                <div className="space-y-2 animate-fade-in">
                  <label className="text-sm font-medium text-text-main dark:text-slate-200" htmlFor="newPassword">Nova Senha Permanente</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-[20px]">lock_reset</span>
                    <input
                      className="w-full h-12 rounded-lg border border-border-light dark:border-slate-700 bg-white dark:bg-slate-800 px-10 text-base outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-slate-400 dark:text-white"
                      id="newPassword"
                      type="password"
                      placeholder="Sua nova senha"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-yellow-600 dark:text-yellow-400">Você está acessando com uma senha temporária. Defina sua senha pessoal.</p>
                </div>
              )}

              <button disabled={loading} type="submit" className="h-12 w-full rounded-lg bg-primary hover:bg-primary/90 text-white font-bold text-base shadow-lg shadow-primary/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                <span>{loading ? 'Processando...' : (isSignUp ? 'Cadastrar' : (isTempPassword ? 'Definir Senha' : 'Acessar Painel'))}</span>
                {!loading && <span className="material-symbols-outlined text-lg">arrow_forward</span>}
              </button>
              {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}

              <button
                type="button"
                onClick={() => { setIsSignUp(!isSignUp); setIsAdminLogin(false); setError(''); }}
                className="text-sm text-center text-text-secondary hover:text-primary transition-colors mt-2"
              >
                {isSignUp ? 'Já tem uma conta? Faça login' : 'Não tem conta? Cadastre-se'}
              </button>

              {!isSignUp && (
                <button
                  type="button"
                  onClick={() => { setIsAdminLogin(!isAdminLogin); setError(''); }}
                  className={`text-xs text-center mt-1 transition-colors ${isAdminLogin ? 'text-primary font-bold' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {isAdminLogin ? 'Voltar para Login de Usuário' : 'Acesso Administrativo'}
                </button>
              )}
            </form>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-border-light dark:border-slate-700"></div>
              <span className="flex-shrink-0 mx-4 text-xs font-medium text-slate-400">INSTITUCIONAL</span>
              <div className="flex-grow border-t border-border-light dark:border-slate-700"></div>
            </div>

            <div className="flex justify-center gap-6 text-xs text-slate-400">
              <a href="#" className="hover:text-primary transition-colors">Termos de Uso</a>
              <a href="#" className="hover:text-primary transition-colors">Política de Privacidade</a>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex lg:flex-1 p-4 xl:p-6 h-[calc(100vh-80px)] sticky top-20">
          <div className="w-full h-full rounded-2xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAywjG4Ui0sKcpHE8Vq7JyLg2AaSsshVLlmVauQlZiBdzkMlW7vtofv-Feb38vtguJlXNwtVuNgPnw5kUMQGZP4PocngGy73zbVR85AdkErDZAZgce2nZdZo3SXpjcduozG1WgL1pcXlrTelDqzswogIJncxAR_dxOf9SUIpy-JYzbIttc3WPDVsTWajhwbh9UEm9zv2IC3FvJb4oga0ln1czePl1T4DaQKrtoaXDQdiRMklqEvQIXtzROdkQME3tNbESZwxGWFgTE')" }}>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent mix-blend-multiply"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-background-dark/30 to-background-dark/80"></div>
            <div className="absolute bottom-0 left-0 right-0 p-12 text-white z-10 flex flex-col gap-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-1 w-12 bg-white/50 rounded-full"></div>
                <span className="text-sm font-medium text-white/80 tracking-wider uppercase">Sistemas de Informação</span>
              </div>
              <h2 className="text-4xl xl:text-5xl font-bold leading-tight tracking-tight">Eficiência administrativa para o futuro.</h2>
              <p className="text-lg text-white/80 max-w-md leading-relaxed">Gerencie projetos, alunos e o corpo docente com a precisão que o desenvolvimento de sistemas exige.</p>
              <div className="grid grid-cols-2 gap-4 mt-4 border-t border-white/20 pt-8">
                <div>
                  <div className="text-3xl font-bold mb-1">100%</div>
                  <div className="text-sm text-white/60">Digitalizado</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-1">24/7</div>
                  <div className="text-sm text-white/60">Disponibilidade</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
