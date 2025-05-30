import { FaShoppingCart, FaSearch } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function CartIcon({ itemCount }) {
  return (
    <div className="flex items-center gap-4">
      {/* Ícone de Lupa (já existente) */}
      <button className="text-gray-600 hover:text-gray-800">
        <FaSearch size={18} />
      </button>

      {/* Ícone do Carrinho (novo) */}
      <Link to="/carrinho" className="relative">
        <FaShoppingCart size={20} className="text-gray-600 hover:text-gray-800" />
        
        {/* Bolinha vermelha com o número */}
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </Link>
    </div>
  );
}