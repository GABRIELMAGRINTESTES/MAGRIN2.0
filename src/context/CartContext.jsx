// src/context/CartContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarCarrinho();
  }, []);

  const carregarCarrinho = async () => {
    setLoading(true);
    const { data: session } = await supabase.auth.getSession();
    const user = session?.session?.user;
    if (user) {
      setUserId(user.id);
      const { data, error } = await supabase
        .from('cart_items')
        .select('id, product_id, quantity, produtos (id, nome, preco, imagem_url)')
        .eq('user_id', user.id);

      if (!error) {
        const carrinho = data.map((item) => ({
          id: item.id,
          product_id: item.product_id,
          quantity: item.quantity,
          produto: item.produtos,
        }));
        setCartItems(carrinho);
      }
    }
    setLoading(false);
  };

  const adicionarAoCarrinho = async (productId) => {
    const { data: session } = await supabase.auth.getSession();
    const user = session?.session?.user;
    if (!user) {
      window.location.href = `/login?redirect=${window.location.pathname}`;
      return;
    }

    const existente = cartItems.find((item) => item.product_id === productId);
    if (existente) {
      await supabase
        .from('cart_items')
        .update({ quantity: existente.quantity + 1 })
        .eq('id', existente.id);
    } else {
      await supabase.from('cart_items').insert({
        user_id: user.id,
        product_id: productId,
        quantity: 1,
      });
    }
    carregarCarrinho();
  };

  const alterarQuantidade = async (id, novaQuantidade) => {
    if (novaQuantidade <= 0) {
      await supabase.from('cart_items').delete().eq('id', id);
    } else {
      await supabase.from('cart_items').update({ quantity: novaQuantidade }).eq('id', id);
    }
    carregarCarrinho();
  };

  const limparCarrinho = async () => {
    const { data: session } = await supabase.auth.getSession();
    const user = session?.session?.user;
    if (user) {
      await supabase.from('cart_items').delete().eq('user_id', user.id);
      setCartItems([]);
    }
  };

  const totalItens = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        adicionarAoCarrinho,
        alterarQuantidade,
        limparCarrinho,
        totalItens,
        carregarCarrinho,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
