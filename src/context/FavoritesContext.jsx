import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import Swal from 'sweetalert2';

// Criar o contexto
const FavoritesContext = createContext({
  favoritesItems: [],
  adicionarAosFavoritos: () => {},
  removerDosFavoritos: () => {},
  verificarSeFavorito: () => false,
  carregarFavoritos: () => {},
  totalFavoritos: 0,
  loading: false
});

// Hook personalizado para usar o contexto
export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites deve ser usado dentro de um FavoritesProvider');
  }
  return context;
};

// Provider Component
export const FavoritesProvider = ({ children }) => {
  const [favoritesItems, setFavoritesItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const carregarFavoritos = async () => {
    try {
      setLoading(true);
      const { data: session } = await supabase.auth.getSession();
      const user = session?.session?.user;
      
      if (!user) {
        setFavoritesItems([]);
        return;
      }

      // Buscar favoritos
      const { data: favorites, error: favoritesError } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id);

      if (favoritesError) {
        console.error('Erro ao buscar favoritos:', favoritesError);
        throw favoritesError;
      }

      if (!favorites || favorites.length === 0) {
        setFavoritesItems([]);
        return;
      }

      // Buscar produtos
      const { data: products, error: productsError } = await supabase
        .from('produtos')
        .select('*')
        .in('id', favorites.map(f => f.id_produto));

      if (productsError) {
        console.error('Erro ao buscar produtos:', productsError);
        throw productsError;
      }

      // Combinar dados
      const items = favorites.map(fav => ({
        id: fav.id,
        product_id: fav.id_produto,
        produto: products.find(p => p.id === fav.id_produto)
      })).filter(item => item.produto);

      setFavoritesItems(items);
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erro ao carregar favoritos',
        text: error.message || 'Não foi possível carregar seus itens favoritos',
        confirmButtonColor: '#4F46E5'
      });
      setFavoritesItems([]);
    } finally {
      setLoading(false);
    }
  };

  const adicionarAosFavoritos = async (productId) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      const user = session?.session?.user;

      if (!user) {
        window.location.href = `/login?redirect=${window.location.pathname}`;
        return;
      }

      if (favoritesItems.some(item => item.product_id === productId)) {
        Swal.fire({
          icon: 'info',
          title: 'Produto já favoritado',
          text: 'Este produto já está na sua lista de favoritos',
          confirmButtonColor: '#4F46E5'
        });
        return;
      }

      const { data: produto, error: produtoError } = await supabase
        .from('produtos')
        .select('*')
        .eq('id', productId)
        .single();

      if (produtoError || !produto) {
        console.error('Erro ao verificar produto:', produtoError);
        throw new Error('Produto não encontrado');
      }

      const { error: insertError } = await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          id_produto: productId
        });

      if (insertError) {
        console.error('Erro ao inserir favorito:', insertError);
        throw insertError;
      }

      await carregarFavoritos();
      
      Swal.fire({
        icon: 'success',
        title: 'Adicionado aos favoritos!',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      console.error('Erro ao adicionar aos favoritos:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erro ao adicionar aos favoritos',
        text: error.message || 'Não foi possível adicionar este item aos favoritos',
        confirmButtonColor: '#4F46E5'
      });
    }
  };

  const removerDosFavoritos = async (id) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao remover favorito:', error);
        throw error;
      }

      await carregarFavoritos();
      
      Swal.fire({
        icon: 'success',
        title: 'Removido dos favoritos!',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      console.error('Erro ao remover dos favoritos:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erro ao remover dos favoritos',
        text: error.message || 'Não foi possível remover este item dos favoritos',
        confirmButtonColor: '#4F46E5'
      });
    }
  };

  const verificarSeFavorito = (productId) => {
    return favoritesItems.some(item => item.product_id === productId);
  };

  useEffect(() => {
    carregarFavoritos();
  }, []);

  const value = {
    favoritesItems,
    adicionarAosFavoritos,
    removerDosFavoritos,
    verificarSeFavorito,
    carregarFavoritos,
    totalFavoritos: favoritesItems.length,
    loading
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};
