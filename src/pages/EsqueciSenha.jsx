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

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/resetar-senha`, // ✅ Rota de redefinição
    });

    if (error) {
      Swal.fire('Erro', error.message, 'error');
    } else {
      Swal.fire('Sucesso!', 'Enviamos um email com instruções para redefinir sua senha.', 'success');
    }

    setEnviando(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-500 to-purple-600">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="bg-indigo-600 p-6 text-center">
          <h1 className="text-2xl font-bold text-white">Recuperar Senha</h1>
          <p className="text-indigo-100 mt-1 text-sm">
            Insira seu email para receber instruções
          </p>
        </div>

        <form onSubmit={handleReset} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              placeholder="seu@email.com"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md flex justify-center"
            disabled={enviando}
          >
            {enviando ? 'Enviando...' : 'Enviar Instruções'}
          </button>
        </form>

        <div className="text-center text-sm py-4">
          <Link to="/login" className="text-indigo-600 underline">
            ← Voltar ao login
          </Link>
        </div>
      </div>
    </div>
  );
}
