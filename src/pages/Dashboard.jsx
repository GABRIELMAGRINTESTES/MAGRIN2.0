import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

export default function Dashboard() {
  const [totais, setTotais] = useState({
    produtos: 0,
    pedidosHoje: 0,
    receita: 0,
    usuarios: 0,
  });
  const [perfilAtual, setPerfilAtual] = useState(null);

  useEffect(() => {
    async function carregarPerfil() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: perfil, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (!error) setPerfilAtual(perfil);
      }
    }

    carregarPerfil();
  }, []);

  useEffect(() => {
    async function carregarDados() {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      const [{ count: produtos }, { count: pedidosHoje }, { data: pedidos }, { count: usuarios }] = await Promise.all([
        supabase.from('produtos').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', hoje.toISOString()),
        supabase.from('orders').select('total_price').neq('status', 'cancelled'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
      ]);

      const receita = pedidos?.reduce((acc, cur) => acc + cur.total_price, 0) || 0;

      setTotais({
        produtos: produtos || 0,
        pedidosHoje: pedidosHoje || 0,
        receita: receita.toFixed(2),
        usuarios: usuarios || 0,
      });
    }

    carregarDados();
  }, []);

  if (!perfilAtual) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 bg-gray-100">
        <Header />
        <main className="p-6">
          <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card titulo="Total de Produtos" valor={totais.produtos} />
            <Card titulo="Pedidos Hoje" valor={totais.pedidosHoje} />

            {/* Se for admin, mostra também receita e usuários */}
            {perfilAtual.role === 'admin' && (
              <>
                <Card titulo="Receita Total" valor={`R$ ${totais.receita}`} />
                <Card titulo="Usuários Registrados" valor={totais.usuarios} />
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function Card({ titulo, valor }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
      <h3 className="text-gray-500 text-sm">{titulo}</h3>
      <p className="text-3xl font-bold">{valor}</p>
    </div>
  );
}
