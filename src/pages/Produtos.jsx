import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import ProdutoForm from '../components/ProdutoForm';
import ImageWithFallback from '../components/ImageWithFallback';
import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import Swal from 'sweetalert2';

// ... (importações continuam iguais)

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);

  useEffect(() => {
    buscarProdutos();
  }, []);

  async function buscarProdutos() {
    setLoading(true);
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      Swal.fire('Erro', 'Erro ao buscar produtos', 'error');
    } else {
      setProdutos(data);
    }
    setLoading(false);
  }

  async function deletarProduto(id) {
    const confirm = await Swal.fire({
      title: 'Tem certeza?',
      text: 'Este produto será removido de todos os carrinhos de compra!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, deletar',
      cancelButtonText: 'Cancelar',
    });

    if (confirm.isConfirmed) {
      try {
        const { error: cartError } = await supabase
          .from('cart_items')
          .delete()
          .eq('product_id', id);

        if (cartError) throw new Error('Erro ao remover do carrinho');

        const { error } = await supabase
          .from('produtos')
          .delete()
          .eq('id', id);

        if (error) throw error;

        Swal.fire('Sucesso!', 'Produto excluído com sucesso.', 'success');
        buscarProdutos();
      } catch (error) {
        Swal.fire('Erro', error.message, 'error');
      }
    }
  }

  // ✅ NOVO: alternar destaque
  async function alternarDestaque(produto) {
    const { error } = await supabase
      .from('produtos')
      .update({ destaque: !produto.destaque })
      .eq('id', produto.id);

    if (error) {
      Swal.fire('Erro', 'Erro ao atualizar destaque', 'error');
    } else {
      buscarProdutos();
    }
  }

  const abrirNovoProduto = () => {
    setProdutoSelecionado(null);
    setShowForm(true);
  };

  const editarProduto = (produto) => {
    setProdutoSelecionado(produto);
    setShowForm(true);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 bg-gray-100">
        <Header />
        <main className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Produtos</h1>
            <button
              onClick={abrirNovoProduto}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
            >
              + Novo Produto
            </button>
          </div>

          {loading ? (
            <p>Carregando produtos...</p>
          ) : (
            <div className="overflow-x-auto bg-white rounded shadow">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-600">
                    <th className="px-6 py-3">Imagem</th>
                    <th className="px-6 py-3">Nome</th>
                    <th className="px-6 py-3">Preço</th>
                    <th className="px-6 py-3">Categoria</th>
                    <th className="px-6 py-3">Destaque</th>
                    <th className="px-6 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {produtos.map((produto) => (
                    <tr key={produto.id} className="border-b">
                      <td className="px-6 py-3">
                        <ImageWithFallback
                          src={produto.imagem_url}
                          alt={produto.nome}
                          className="h-16 w-16 object-cover rounded border"
                        />
                      </td>
                      <td className="px-6 py-3">{produto.nome}</td>
                      <td className="px-6 py-3">
                        R$ {parseFloat(produto.preco).toFixed(2)}
                      </td>
                      <td className="px-6 py-3">{produto.categoria || '-'}</td>

                      {/* ✅ Coluna destaque */}
                      <td className="px-6 py-3">
                        {produto.destaque ? (
                          <span className="text-green-600 font-semibold">Sim</span>
                        ) : (
                          <span className="text-gray-500">Não</span>
                        )}
                      </td>

                      <td className="px-6 py-3 text-right space-x-2">
                        <button
                          onClick={() => editarProduto(produto)}
                          className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500 transition"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => deletarProduto(produto.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                        >
                          Excluir
                        </button>
                        <button
                          onClick={() => alternarDestaque(produto)}
                          className={`px-3 py-1 rounded transition ${
                            produto.destaque
                              ? 'bg-gray-300 text-gray-800 hover:bg-gray-400'
                              : 'bg-indigo-600 text-white hover:bg-indigo-700'
                          }`}
                        >
                          {produto.destaque ? 'Remover Destaque' : 'Destacar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {produtos.length === 0 && (
                <p className="text-center py-6 text-gray-500">
                  Nenhum produto encontrado.
                </p>
              )}
            </div>
          )}

          {showForm && (
            <ProdutoForm
              onClose={() => setShowForm(false)}
              onSave={buscarProdutos}
              produto={produtoSelecionado}
            />
          )}
        </main>
      </div>
    </div>
  );
}
