import { useState } from 'react';
import { supabase } from '../services/supabase';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function EsqueciSenha() {
  const [email, setEmail] = useState('');
  const [enviando, setEnviando] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setEnviando(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/resetar-senha`,
      });

      if (error) {
        throw error;
      }

      await Swal.fire({
        icon: 'success',
        title: 'Email Enviado!',
        html: `
          <p>Enviamos as instruções para:</p>
          <p class="mt-2"><strong>${email}</strong></p>
          <p class="mt-4 text-sm">Verifique também sua caixa de spam.</p>
        `,
        confirmButtonText: 'Entendi',
        confirmButtonColor: '#4F46E5',
      });

      setEmail(''); // Limpa o campo após sucesso
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Erro ao enviar email',
        text: error.message || 'Ocorreu um erro inesperado. Tente novamente.',
        confirmButtonColor: '#4F46E5',
      });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-gray-900 to-black relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full translate-x-1/2 translate-y-1/2"></div>
      
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:scale-[1.02] my-4">
        <div className="bg-white p-6 text-center relative overflow-hidden">
          <div className="relative mb-4">
            <i className="fas fa-key text-6xl text-gray-800"></i>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2 tracking-wider">Recuperar Senha</h1>
          <p className="text-gray-600 text-sm">
            Não se preocupe! Acontece com todo mundo.
          </p>
        </div>

        <form onSubmit={handleReset} className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Digite seu email cadastrado
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="fas fa-envelope text-gray-400"></i>
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-black focus:border-black transition-all duration-300"
                placeholder="seu@email.com"
              />
            </div>
            <p className="text-xs text-gray-500">
              Enviaremos um link para você redefinir sua senha
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-black hover:bg-gray-800 text-white py-3 rounded-lg flex justify-center items-center transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
            disabled={enviando}
          >
            {enviando ? (
              <>
                <i className="fas fa-circle-notch fa-spin mr-2"></i>
                Enviando...
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane mr-2"></i>
                Enviar Instruções
              </>
            )}
          </button>
        </form>

        <div className="p-6 border-t border-gray-200">
          <Link 
            to="/login"
            className="w-full text-center py-3 px-4 border-2 border-gray-800 text-gray-800 rounded-lg hover:bg-gray-50 transition-all duration-300 flex items-center justify-center hover:shadow-md"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Voltar ao login
          </Link>
        </div>
      </div>
    </div>
  );
}
