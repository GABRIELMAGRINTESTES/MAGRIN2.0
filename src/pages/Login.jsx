import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import Swal from 'sweetalert2';
import logoLoja from '../assets/logo-loja.png';

export default function Login() {
  const navigate = useNavigate();
  const [showRegister, setShowRegister] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const formSubtitle = showRegister
    ? 'Crie sua conta para começar'
    : 'Entre com suas credenciais';

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) throw error;

      navigate('/dashboard');
    } catch (error) {
      Swal.fire({
        title: 'Erro',
        text: error.message,
        icon: 'error',
        customClass: {
          confirmButton: 'bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900'
        },
        buttonsStyling: false
      });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const { error: signUpError, data: { user } } = await supabase.auth.signUp({
        email: regEmail,
        password: regPassword,
      });

      if (signUpError) throw signUpError;

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: regName })
        .eq('id', user.id);

      if (profileError) throw profileError;

      Swal.fire({
        title: 'Sucesso!',
        text: 'Verifique seu email para confirmar o cadastro.',
        icon: 'success',
        customClass: {
          confirmButton: 'bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900'
        },
        buttonsStyling: false
      });
      setShowRegister(false);
    } catch (error) {
      Swal.fire({
        title: 'Erro',
        text: error.message,
        icon: 'error',
        customClass: {
          confirmButton: 'bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900'
        },
        buttonsStyling: false
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-gray-900 to-black relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full translate-x-1/2 translate-y-1/2"></div>
      
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:scale-[1.02] my-4">
        <div className="bg-white p-6 text-center relative overflow-hidden">
          {/* Logo da Loja */}
          <div className="relative mb-4">
            <img src={logoLoja} alt="Logo da Loja" className="mx-auto h-16 object-contain" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-2 tracking-wider">{showRegister ? 'CRIAR CONTA' : 'LOGIN'}</h1>
          <p className="text-gray-600 text-sm">{formSubtitle}</p>
        </div>

        {!showRegister && (
          <form onSubmit={handleLogin} className="p-6 space-y-4">
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 transform transition-all duration-200 group-focus-within:text-gray-900">
                Email
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-envelope text-gray-400 group-focus-within:text-gray-900 transition-colors duration-200"></i>
                </div>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-all duration-300"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-medium text-gray-700 transform transition-all duration-200 group-focus-within:text-gray-900">
                Senha
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-lock text-gray-400 group-focus-within:text-gray-900 transition-colors duration-200"></i>
                </div>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-all duration-300"
                  placeholder="Digite sua senha"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-black hover:bg-gray-800 text-white py-3 rounded-lg flex justify-center items-center transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
            >
              <i className="fas fa-sign-in-alt mr-2"></i> Entrar
            </button>

            <div className="mt-4 space-y-3">
              <button
                type="button"
                onClick={() => navigate('/home')}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-lg flex justify-center items-center transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
              >
                <i className="fas fa-door-open mr-2"></i> Permanecer deslogado
              </button>

              <button
                type="button"
                onClick={() => navigate('/esqueci-senha')}
                className="w-full text-center py-3 px-4 border-2 border-gray-800 text-gray-800 rounded-lg hover:bg-gray-50 transition-all duration-300 flex items-center justify-center hover:shadow-md"
              >
                <i className="fas fa-key mr-2"></i>
                Esqueci minha senha
              </button>

              <div className="text-center">
                <span className="text-sm text-gray-600">
                  Não tem uma conta?{' '}
                  <button
                    type="button"
                    onClick={() => setShowRegister(true)}
                    className="text-gray-800 cursor-pointer hover:underline transition-all duration-200"
                  >
                    Criar conta
                  </button>
                </span>
              </div>
            </div>
          </form>
        )}

        {showRegister && (
          <form onSubmit={handleRegister} className="p-6 space-y-4">
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 transform transition-all duration-200 group-focus-within:text-gray-900">
                Nome Completo
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-user text-gray-400 group-focus-within:text-gray-900 transition-colors duration-200"></i>
                </div>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-all duration-300"
                  placeholder="Digite seu nome completo"
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-medium text-gray-700 transform transition-all duration-200 group-focus-within:text-gray-900">
                Email
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-envelope text-gray-400 group-focus-within:text-gray-900 transition-colors duration-200"></i>
                </div>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-all duration-300"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-medium text-gray-700 transform transition-all duration-200 group-focus-within:text-gray-900">
                Senha
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-lock text-gray-400 group-focus-within:text-gray-900 transition-colors duration-200"></i>
                </div>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-all duration-300"
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-black hover:bg-gray-800 text-white py-3 rounded-lg flex justify-center items-center transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
            >
              <i className="fas fa-user-plus mr-2"></i> Criar Conta
            </button>

            <div className="text-center">
              <span className="text-sm text-gray-600">
                Já tem uma conta?{' '}
                <button
                  type="button"
                  onClick={() => setShowRegister(false)}
                  className="text-gray-800 cursor-pointer hover:underline transition-all duration-200"
                >
                  Fazer login
                </button>
              </span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
