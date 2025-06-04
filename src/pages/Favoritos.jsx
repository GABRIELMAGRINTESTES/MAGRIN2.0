import { useFavorites } from '../context/FavoritesContext';
import PublicHeader from '../components/PublicHeader';
import { Link } from 'react-router-dom';
import { FaStar, FaRegStar, FaTrash } from 'react-icons/fa';

export default function Favoritos() {
  const { favoritesItems, loading, removerDosFavoritos } = useFavorites();

  const handleRemoverFavorito = (id) => {
    removerDosFavoritos(id);
  };

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <PublicHeader />
      
      <div className="px-4 py-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center mb-6">
          <FaStar className="text-yellow-500 mr-2" size={24} />
          <h1 className="text-2xl font-bold">Seus Favoritos</h1>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-gray-600">Carregando favoritos...</p>
          </div>
        ) : favoritesItems.length === 0 ? (
          <div className="text-center py-12">
            <FaRegStar className="mx-auto text-yellow-300 mb-4" size={64} />
            <p className="text-gray-500 text-lg mb-4">
              Você ainda não adicionou nenhum produto aos favoritos.
            </p>
            <Link 
              to="/loja" 
              className="inline-block px-6 py-3 bg-primary text-white rounded hover:bg-primary-dark transition"
            >
              Explorar Produtos
            </Link>
          </div>
        ) : (
          <>
            <p className="text-center text-gray-600 mb-6">
              {favoritesItems.length} {favoritesItems.length === 1 ? 'produto favorito' : 'produtos favoritos'}
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {favoritesItems.map((item) => (
                <div key={item.id} className="relative group">
                  <Link
                    to={`/loja/produto/${item.product_id}`}
                    className="block bg-white border rounded hover:shadow-lg transition-shadow"
                  >
                    <img
                      src={item.produto.imagem_url || 'https://via.placeholder.com/300'}
                      alt={item.produto.nome}
                      className="w-full h-40 object-cover rounded-t"
                    />
                    <div className="p-3">
                      <h3 className="text-sm font-semibold truncate mb-1">
                        {item.produto.nome}
                      </h3>
                      <p className="text-primary font-bold text-sm">
                        R$ {parseFloat(item.produto.preco).toFixed(2)}
                      </p>
                    </div>
                  </Link>
                  
                  {/* Botão de remover */}
                  <button
                    onClick={() => handleRemoverFavorito(item.id)}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                    title="Remover dos favoritos"
                  >
                    <FaTrash className="text-red-500" size={12} />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
