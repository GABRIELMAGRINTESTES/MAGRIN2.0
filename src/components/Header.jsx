import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();

  const logout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow p-4 flex justify-between items-center">
      <h1>Painel Administrativo</h1>
      <button onClick={logout} className="text-red-500">Sair</button>
    </header>
  );
}
