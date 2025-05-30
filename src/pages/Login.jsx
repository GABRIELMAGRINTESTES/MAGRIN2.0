import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();

  const [showRegister, setShowRegister] = useState(false);
  const [formSubtitle, setFormSubtitle] = useState('Faça login para acessar o sistema');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  useEffect(() => {
    setFormSubtitle(showRegister ? 'Crie sua conta para começar' : 'Faça login para acessar o sistema');
  }, [showRegister]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const btn = e.target.querySelector('button');
      btn.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i> Entrando...`;
      btn.disabled = true;

      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) throw error;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profileError || !profile) {
        throw new Error('Erro ao verificar perfil do usuário');
      }

      // Redireciona dependendo da role
      if (profile.role === 'admin' || profile.role === 'moderador') {
        navigate('/dashboard');
      } else {
        navigate('/loja');
      }
    } catch (error) {
      Swal.fire('Erro no login', error.message, 'error');
    } finally {
      const btn = e.target.querySelector('button');
      btn.innerHTML = `<i class="fas fa-sign-in-alt mr-2"></i> Entrar`;
      btn.disabled = false;
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const btn = e.target.querySelector('button');
      btn.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i> Cadastrando...`;
      btn.disabled = true;

      if (regPassword.length < 6) throw new Error('A senha deve ter pelo menos 6 caracteres');

      const { data, error } = await supabase.auth.signUp({
        email: regEmail,
        password: regPassword,
        options: {
          data: {
            name: regName,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert([
          {
            id: data.user.id,
            name: regName,
            role: 'cliente',
          },
        ]);

        if (profileError) throw profileError;
      }

      Swal.fire({
        icon: 'success',
        title: 'Cadastro realizado!',
        html: `
          <p>Uma mensagem foi enviada para <strong>${regEmail}</strong></p>
          <p class="mt-2">Verifique seu email para confirmar sua conta.</p>
        `,
        confirmButtonText: 'Entendido',
      });

      setShowRegister(false);
      setRegName('');
      setRegEmail('');
      setRegPassword('');
    } catch (error) {
      Swal.fire('Erro no cadastro', error.message, 'error');
    } finally {
      const btn = e.target.querySelector('button');
      btn.innerHTML = `<i class="fas fa-user-plus mr-2"></i> Cadastrar`;
      btn.disabled = false;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-500 to-purple-600">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="bg-indigo-600 p-6 text-center">
          <h1 className="text-2xl font-bold text-white">LOGIN</h1>
          <p className="text-indigo-100 mt-1">{formSubtitle}</p>
        </div>

        {!showRegister && (
          <form onSubmit={handleLogin} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md flex justify-center"
            >
              <i className="fas fa-sign-in-alt mr-2"></i> Entrar
            </button>

            <div className="flex justify-between mt-2 text-sm text-indigo-600">
              <button
                type="button"
                onClick={() => navigate('/esqueci-senha')}
                className="hover:underline"
              >
                Esqueci minha senha
              </button>
              <button
                type="button"
                onClick={() => navigate('/home')}
                className="text-gray-500 hover:underline"
              >
                Permanecer desconectado
              </button>
            </div>
          </form>
        )}

        {showRegister && (
          <form onSubmit={handleRegister} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
              <input
                type="text"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <input
                type="password"
                required
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md flex justify-center"
            >
              <i className="fas fa-user-plus mr-2"></i> Cadastrar
            </button>
          </form>
        )}

        <div className="text-center text-sm py-4">
          {!showRegister ? (
            <span
              onClick={() => setShowRegister(true)}
              className="text-indigo-600 cursor-pointer underline"
            >
              Não tem conta? <strong>Crie uma agora</strong>
            </span>
          ) : (
            <span
              onClick={() => setShowRegister(false)}
              className="text-indigo-600 cursor-pointer underline"
            >
              Já tem conta? <strong>Faça login</strong>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
