import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaUser } from 'react-icons/fa';
import { useState, useEffect } from 'react';

export default function Header() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', user.id)
          .single();
        
        if (data?.name) {
          setUserName(data.name);
        } else {
          setUserName(user.email);
        }
      }
    };

    getUser();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm px-4 py-3 lg:py-4">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        {/* Título responsivo */}
        <h1 className="text-lg lg:text-xl font-semibold text-gray-800 hidden lg:block">
          Painel Administrativo
        </h1>
        <h1 className="text-lg font-semibold text-gray-800 lg:hidden">
          Painel Admin
        </h1>

        {/* Perfil e Botão de Logout */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-primary-light/20 flex items-center justify-center">
              <FaUser className="text-primary" />
            </div>
            <span className="hidden lg:block text-sm font-medium">{userName}</span>
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowDropdown(false)}
              ></div>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-20">
                <div className="px-4 py-2 text-sm text-gray-500 border-b lg:hidden">
                  {userName}
                </div>
                <button
                  onClick={logout}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <FaSignOutAlt className="mr-2" />
                  Sair
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
