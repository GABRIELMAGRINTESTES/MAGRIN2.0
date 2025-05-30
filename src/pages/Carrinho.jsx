// src/pages/Carrinho.jsx
import { useCart } from '../context/CartContext';
import PublicHeader from '../components/PublicHeader';

export default function Carrinho() {
  const { cartItems, alterarQuantidade } = useCart();

  const total = cartItems.reduce((acc, item) => {
    return acc + (item.produto?.preco || 0) * item.quantity;
  }, 0);

  return (
    <div className="min-h-screen bg-gray-100">
      <PublicHeader />
      <div className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">Seu Carrinho</h1>

        {cartItems.length === 0 ? (
          <p>Seu carrinho está vazio.</p>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center bg-white p-4 rounded shadow justify-between"
              >
                <div className="flex gap-4 items-center">
                  <img
                    src={item.produto?.imagem_url || 'https://via.placeholder.com/80'}
                    alt={item.produto?.nome}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <h2 className="font-semibold">{item.produto?.nome}</h2>
                    <p className="text-indigo-600 font-bold">
                      R$ {parseFloat(item.produto?.preco).toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => alterarQuantidade(item.id, item.quantity - 1)}
                    className="px-2 py-1 bg-gray-300 rounded"
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => alterarQuantidade(item.id, item.quantity + 1)}
                    className="px-2 py-1 bg-gray-300 rounded"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}

            <div className="text-right mt-4 font-bold text-xl">
              Total: R$ {total.toFixed(2)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
