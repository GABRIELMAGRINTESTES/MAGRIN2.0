import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import PublicHeader from '../components/PublicHeader';
import { useFavorites } from '../context/FavoritesContext';
import { FaStar, FaRegStar } from 'react-icons/fa';

export default function ProdutoDetalhes() {
  const { id } = useParams();
  const [produto, setProduto] = useState(null);
  const [categoria, setCategoria] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);
  const { adicionarAosFavoritos, removerDosFavoritos, verificarSeFavorito, favoritesItems } = useFavorites();

  useEffect(() => {
    const buscarProduto = async () => {
      setLoading(true);
      setErro(false);

      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        console.error('Erro ao buscar produto:', error?.message);
        setErro(true);
        setLoading(false);
        return;
      }

      setProduto(data);

      if (data.categoria_id) {
        const { data: cat } = await supabase
          .from('categorias')
          .select('nome')
          .eq('id', data.categoria_id)
          .single();

        setCategoria(cat?.nome);
      }

      setLoading(false);
    };

    buscarProduto();
  }, [id]);

  const isFavorito = produto ? verificarSeFavorito(produto.id) : false;

  const handleToggleFavorito = () => {
    if (!produto) return;
    
    if (isFavorito) {
      // Encontrar o item nos favoritos e remover
      const favoritoItem = favoritesItems.find(item => item.product_id === produto.id);
      if (favoritoItem) {
        removerDosFavoritos(favoritoItem.id);
      }
    } else {
      adicionarAosFavoritos(produto.id);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <PublicHeader />

      {loading ? (
        <p className="text-center p-6">Carregando produto...</p>
      ) : erro ? (
        <p className="text-center p-6 text-red-600 font-semibold">
          Produto não encontrado.
        </p>
      ) : (
        <div className="p-4 max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
          {/* Imagem principal */}
          <div>
            <img
              src={produto.imagem_url || 'https://via.placeholder.com/600'}
              alt={produto.nome}
              className="w-full h-80 object-cover rounded mb-4"
            />
            {produto.imagens?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {produto.imagens.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`img-${i}`}
                    className="h-20 w-20 object-cover rounded border"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Detalhes */}
          <div className="space-y-4">
            <h1 className="text-2xl font-bold">{produto.nome}</h1>
            <p className="text-xl text-primary font-semibold">
              R$ {parseFloat(produto.preco).toFixed(2)}
            </p>

            {categoria && (
              <p className="text-sm text-gray-500">Categoria: {categoria}</p>
            )}

            {produto.tamanho && (
              <p className="text-sm text-gray-500">Tamanho: {produto.tamanho}</p>
            )}

            {produto.descricao && (
              <div>
                <h2 className="text-lg font-semibold mt-4 mb-1">Descrição</h2>
                <p className="text-gray-700 whitespace-pre-line">
                  {produto.descricao}
                </p>
              </div>
            )}

            <button
              onClick={handleToggleFavorito}
              className={`mt-4 px-6 py-3 rounded transition flex items-center justify-center space-x-2 ${
                isFavorito 
                  ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
                  : 'bg-primary text-white hover:bg-primary-dark'
              }`}
            >
              {isFavorito ? (
                <>
                  <FaStar size={16} className="text-white" />
                  <span>Remover dos Favoritos</span>
                </>
              ) : (
                <>
                  <FaRegStar size={16} />
                  <span>Adicionar aos Favoritos</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
