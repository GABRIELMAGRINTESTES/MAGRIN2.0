import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { FaTimes, FaBars, FaHome, FaBox, FaTags, FaStore, FaUsers, FaTicketAlt } from 'react-icons/fa';

export default function Sidebar() {
  const [perfilAtual, setPerfilAtual] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const carregarPerfilAtual = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (user) {
        const { data: perfil, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (!error) {
          setPerfilAtual(perfil);
        }
      }
    };

    carregarPerfilAtual();
  }, []);

  // Fecha o menu ao mudar de rota em dispositivos móveis
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const NavLink = ({ to, icon: Icon, children }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        className={`flex items-center p-3 rounded-lg transition-colors ${
          isActive
            ? 'bg-primary text-white'
            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
        }`}
      >
        <Icon className="w-5 h-5 mr-3" />
        <span>{children}</span>
      </Link>
    );
  };

  // Toggle button for mobile
  const ToggleButton = () => (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className="lg:hidden fixed top-4 right-4 z-50 p-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors"
    >
      {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
    </button>
  );

  return (
    <>
      <ToggleButton />
      
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`
          fixed lg:static
          inset-y-0 left-0
          w-64 bg-gray-900
          transform transition-transform duration-300 ease-in-out z-40
          lg:transform-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-800">
            <h2 className="text-xl font-bold text-white mb-4">Painel Admin</h2>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            <NavLink to="/dashboard" icon={FaHome}>
              Dashboard
            </NavLink>
            <NavLink to="/produtos" icon={FaBox}>
              Produtos
            </NavLink>
            <NavLink to="/categorias" icon={FaTags}>
              Categorias
            </NavLink>
            <NavLink to="/home" icon={FaStore}>
              Loja
            </NavLink>

            {perfilAtual?.role === 'admin' && (
              <>
                <NavLink to="/usuarios" icon={FaUsers}>
                  Usuários
                </NavLink>
                <NavLink to="/cupons" icon={FaTicketAlt}>
                  Cupons
                </NavLink>
              </>
            )}
          </nav>

          <div className="p-4 border-t border-gray-800">
            <p className="text-sm text-gray-400">
              {perfilAtual?.role === 'admin' ? 'Administrador' : 'Moderador'}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
