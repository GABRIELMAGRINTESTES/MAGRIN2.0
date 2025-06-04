import { useState } from 'react';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function ResetarSenha() {
  const navigate = useNavigate();
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [atualizando, setAtualizando] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    
    if (novaSenha !== confirmarSenha) {
      Swal.fire({
        icon: 'error',
        title: 'Senhas diferentes',
        text: 'A nova senha e a confirmação precisam ser iguais',
        confirmButtonColor: '#4F46E5'
      });
      return;
    }

    if (novaSenha.length < 6) {
      Swal.fire({
        icon: 'error',
        title: 'Senha muito curta',
        text: 'A senha deve ter pelo menos 6 caracteres',
        confirmButtonColor: '#4F46E5'
      });
      return;
    }

    setAtualizando(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: novaSenha
      });

      if (error) throw error;

      await Swal.fire({
        icon: 'success',
        title: 'Senha Atualizada!',
        text: 'Sua nova senha foi definida com sucesso.',
        confirmButtonText: 'Fazer Login',
        confirmButtonColor: '#4F46E5',
        allowOutsideClick: false
      });

      navigate('/login');
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Erro ao atualizar senha',
        text: error.message || 'Ocorreu um erro inesperado. Tente novamente.',
        confirmButtonColor: '#4F46E5'
      });
    } finally {
      setAtualizando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary to-primary-dark">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="bg-primary p-8 text-center relative">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <i className="fas fa-lock text-9xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></i>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Nova Senha</h1>
          <p className="text-primary-light text-sm">
            Digite e confirme sua nova senha
          </p>
        </div>

        <form onSubmit={handleReset} className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nova Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-lock text-gray-400"></i>
                </div>
                <input
                  type="password"
                  required
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Digite sua nova senha"
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Nova Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-lock text-gray-400"></i>
                </div>
                <input
                  type="password"
                  required
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Confirme sua nova senha"
                  minLength={6}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-md flex items-center justify-center transition-colors duration-200"
            disabled={atualizando}
          >
            {atualizando ? (
              <>
                <i className="fas fa-circle-notch fa-spin mr-2"></i>
                Atualizando...
              </>
            ) : (
              <>
                <i className="fas fa-check mr-2"></i>
                Confirmar Nova Senha
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            Certifique-se de que sua nova senha seja segura e diferente da anterior
          </p>
        </form>
      </div>
    </div>
  );
}
