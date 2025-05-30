import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

export default function Sidebar() {
  const [perfilAtual, setPerfilAtual] = useState(null);

  useEffect(() => {
    const carregarPerfilAtual = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (user) {
        const { data: perfil, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (!error) {
          setPerfilAtual(perfil);
        }
      }
    };

    carregarPerfilAtual();
  }, []);

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen">
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Painel</h2>
        <nav className="space-y-2">
          <Link to="/dashboard" className="block hover:underline">Dashboard</Link>
          <Link to="/produtos" className="block hover:underline">Produtos</Link>
          <Link to="/categorias" className="block hover:underline">Categorias</Link>
          <Link to="/home" className="block hover:underline">Loja</Link>

          {/* Renderiza o link de Usuários apenas se for admin */}
          {perfilAtual?.role === 'admin' && (
            <Link to="/usuarios" className="block hover:underline">
              Usuários
            </Link>
          )}
          {perfilAtual?.role === 'admin' && (
            <Link to="/cupons" className="block hover:underline">
              Cupons
            </Link>
          )}
        </nav>
      </div>
    </aside>
  );
}
