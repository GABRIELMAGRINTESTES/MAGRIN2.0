import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import ProdutoForm from '../components/ProdutoForm';
import ImageWithFallback from '../components/ImageWithFallback';
import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import Swal from 'sweetalert2';
import { FaEdit, FaTrash, FaStar, FaRegStar, FaPlus, FaFilter } from 'react-icons/fa';

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [categoriaFiltrada, setCategoriaFiltrada] = useState('todas');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    buscarDados();
  }, []);

  async function buscarDados() {
    setLoading(true);
    try {
      // Buscar produtos com informações da categoria
      const { data: produtos, error: produtosError } = await supabase
        .from('produtos')
        .select(`
          *,
          categoria:categoria_id (
            id,
            nome
          )
        `)
        .order('created_at', { ascending: false });

      if (produtosError) throw produtosError;

      // Buscar categorias
      const { data: categorias, error: categoriasError } = await supabase
        .from('categorias')
        .select('*')
        .order('nome');

      if (categoriasError) throw categoriasError;

      setProdutos(produtos);
      setCategorias(categorias);
    } catch (error) {
      Swal.fire({
        title: 'Erro',
        text: 'Erro ao buscar dados',
        icon: 'error',
        customClass: {
          confirmButton: 'bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark'
        },
        buttonsStyling: false
      });
    } finally {
      setLoading(false);
    }
  }

  async function deletarProduto(id) {
    const confirm = await Swal.fire({
      title: 'Tem certeza?',
      text: 'Este produto será removido permanentemente!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, deletar',
      cancelButtonText: 'Cancelar',
      customClass: {
        confirmButton: 'bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark',
        cancelButton: 'bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400'
      },
      buttonsStyling: false
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

        Swal.fire({
          title: 'Sucesso!',
          text: 'Produto excluído com sucesso.',
          icon: 'success',
          customClass: {
            confirmButton: 'bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark'
          },
          buttonsStyling: false
        });
        buscarDados();
      } catch (error) {
        Swal.fire({
          title: 'Erro',
          text: error.message,
          icon: 'error',
          customClass: {
            confirmButton: 'bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark'
          },
          buttonsStyling: false
        });
      }
    }
  }

  async function alternarDestaque(produto) {
    const { error } = await supabase
      .from('produtos')
      .update({ destaque: !produto.destaque })
      .eq('id', produto.id);

    if (error) {
      Swal.fire({
        title: 'Erro',
        text: 'Erro ao atualizar destaque',
        icon: 'error',
        customClass: {
          confirmButton: 'bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark'
        },
        buttonsStyling: false
      });
    } else {
      buscarDados();
    }
  }

  const produtosFiltrados = produtos.filter(produto => 
    categoriaFiltrada === 'todas' || produto.categoria_id === categoriaFiltrada
  );

  const produtosPorCategoria = categoriaFiltrada === 'todas'
    ? categorias.map(cat => ({
        categoria: cat,
        produtos: produtos.filter(p => p.categoria_id === cat.id.toString())
      }))
    : [{
        categoria: categorias.find(c => c.id === categoriaFiltrada),
        produtos: produtosFiltrados
      }];

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 bg-gray-100">
        <Header />
        <main className="p-4 lg:p-6">
          {/* Header com Filtros */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
              <h1 className="text-2xl font-bold text-gray-800">Produtos</h1>
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors lg:hidden"
                >
                  <FaFilter />
                  Filtros
                </button>
                <button
                  onClick={() => {
                    setProdutoSelecionado(null);
                    setShowForm(true);
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  <FaPlus />
                  Novo Produto
                </button>
              </div>
            </div>

            {/* Filtros - Responsivo */}
            <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
              <select
                value={categoriaFiltrada}
                onChange={(e) => setCategoriaFiltrada(e.target.value)}
                className="w-full lg:w-auto px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="todas">Todas as Categorias</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-8">
              {produtosPorCategoria.map(({ categoria, produtos }) => (
                produtos.length > 0 && (
                  <div key={categoria.id} className="bg-white rounded-lg shadow p-4">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                      {categoria?.nome || 'Sem categoria'}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {produtos.map((produto) => (
                        <div key={produto.id} className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                          <div className="relative">
                            <ImageWithFallback
                              src={produto.imagem_url}
                              alt={produto.nome}
                              className="w-full h-48 object-cover rounded-t-lg"
                            />
                            <button
                              onClick={() => alternarDestaque(produto)}
                              className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                              title={produto.destaque ? "Remover destaque" : "Destacar produto"}
                            >
                              {produto.destaque ? (
                                <FaStar className="text-yellow-500" size={16} />
                              ) : (
                                <FaRegStar className="text-gray-400" size={16} />
                              )}
                            </button>
                          </div>
                          
                          <div className="p-4">
                            <h3 className="font-semibold text-gray-800 mb-2">{produto.nome}</h3>
                            <p className="text-primary font-bold mb-4">
                              R$ {parseFloat(produto.preco).toFixed(2)}
                            </p>
                            
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => {
                                  setProdutoSelecionado(produto);
                                  setShowForm(true);
                                }}
                                className="p-2 text-yellow-500 hover:text-yellow-600 transition-colors"
                                title="Editar"
                              >
                                <FaEdit size={18} />
                              </button>
                              <button
                                onClick={() => deletarProduto(produto.id)}
                                className="p-2 text-red-500 hover:text-red-600 transition-colors"
                                title="Excluir"
                              >
                                <FaTrash size={18} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              ))}

              {produtosFiltrados.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                  <p className="text-gray-500 text-lg">Nenhum produto encontrado.</p>
                </div>
              )}
            </div>
          )}

          {showForm && (
            <ProdutoForm
              onClose={() => setShowForm(false)}
              onSave={buscarDados}
              produto={produtoSelecionado}
            />
          )}
        </main>
      </div>
    </div>
  );
}
