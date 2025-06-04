import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { FaBox, FaShoppingBag, FaDollarSign, FaUsers, FaTag } from 'react-icons/fa';

function Card({ titulo, valor, icon }) {
  return (
    <div className="bg-white p-4 lg:p-6 rounded-lg shadow hover:shadow-lg transition">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-500 text-sm font-medium">{titulo}</h3>
        {icon}
      </div>
      <div className="text-xl lg:text-3xl font-bold text-gray-800">{valor}</div>
    </div>
  );
}

export default function Dashboard() {
  const [totais, setTotais] = useState({
    produtos: 0,
    estoque: 0,
    pedidosHoje: 0,
    receita: 0,
    usuarios: 0
  });
  const [categorias, setCategorias] = useState([]);
  const [perfilAtual, setPerfilAtual] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarPerfil() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: perfil } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        if (perfil) setPerfilAtual(perfil);
      }
    }
    carregarPerfil();
  }, []);

  useEffect(() => {
    async function carregarDados() {
      setLoading(true);
      try {
        const [
          { count: produtos }, 
          { count: estoque },
          { count: usuarios }
        ] = await Promise.all([
          supabase.from('produtos').select('*', { count: 'exact', head: true }),
          supabase.from('produtos').select('*', { count: 'exact', head: true }).eq('pronta_entrega', true),
          supabase.from('profiles').select('*', { count: 'exact', head: true })
        ]);

        const { data: categoriasData } = await supabase
          .from('categorias')
          .select('*, produtos(count)');

        const categoriasProcessadas = categoriasData?.map(cat => ({
          ...cat,
          total_produtos: cat.produtos?.[0]?.count || 0
        })) || [];

        setCategorias(categoriasProcessadas);
        setTotais({
          produtos: produtos || 0,
          estoque: estoque || 0,
          pedidosHoje: 'Em desenvolvimento',
          receita: 'Em desenvolvimento',
          usuarios: usuarios || 0
        });
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    }
    carregarDados();
  }, []);

  if (!perfilAtual || loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-4 lg:p-6 max-w-7xl mx-auto">
          <h1 className="text-xl lg:text-2xl font-bold mb-6 text-gray-800">Dashboard</h1>

          {/* Cards Grid - Responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
            <div className="space-y-4 sm:col-span-2 lg:col-span-1">
              <Card 
                titulo="Total de Produtos" 
                valor={totais.produtos} 
                icon={<FaBox className="text-primary" size={24} />}
              />
              <Card 
                titulo="Pronta Entrega" 
                valor={totais.estoque} 
                icon={<FaBox className="text-green-500" size={24} />}
              />
            </div>
            <Card 
                titulo="Pedidos Hoje" 
                valor={<span className="text-yellow-500 text-base lg:text-xl">Em desenvolvimento</span>}
                icon={<FaShoppingBag className="text-yellow-500" size={24} />}
              />
            {perfilAtual.role === 'admin' && (
              <>
                <Card 
                  titulo="Receita Total" 
                  valor={<span className="text-yellow-500 text-base lg:text-xl">Em desenvolvimento</span>}
                  icon={<FaDollarSign className="text-yellow-500" size={24} />}
                />
                <Card 
                  titulo="Usuários Registrados" 
                  valor={totais.usuarios}
                  icon={<FaUsers className="text-primary" size={24} />}
                />
              </>
            )}
          </div>

          {/* Seção de Categorias - Responsive */}
          <div className="bg-white rounded-lg shadow p-4 lg:p-6">
            <div className="flex items-center mb-4">
              <FaTag className="text-primary mr-2" size={20} />
              <h2 className="text-lg lg:text-xl font-semibold text-gray-800">Detalhes das Categorias</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categorias.map((categoria) => (
                <div 
                  key={categoria.id}
                  className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold text-gray-700 mb-2">{categoria.nome}</h3>
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>Total de Produtos:</span>
                    <span className="font-medium text-primary">{categoria.total_produtos}</span>
                  </div>
                  {categoria.descricao && (
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">{categoria.descricao}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
