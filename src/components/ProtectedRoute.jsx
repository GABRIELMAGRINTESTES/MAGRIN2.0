import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import supabase from '../services/supabase';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({ children, requiredRoles = ['admin', 'moderador'] }) {
  const location = useLocation();
  const [authStatus, setAuthStatus] = useState('checking'); // 'checking' | 'authorized' | 'unauthorized'

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 1. Verificar sessão
/*************  ✨ Windsurf Command ⭐  *************/
    /**
     * Verifica se o usuário está autenticado e tem a permissão necessária
     * para acessar a rota.
     *
     * 1. Verifica se a sessão existe e está válida.
     * 2. Verifica se o usuário tem o role correto.
     * 3. Define o estado de autenticação como 'authorized' ou 'unauthorized'.
     */
/*******  a54555fb-5275-4507-a40c-efd6cd177ff1  *******/        const { data: { session }, error } = await supabase.auth.getSession();

        if (error || !session) {
          throw new Error('Not authenticated');
        }

        // 2. Verificar role do usuário
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profileError || !requiredRoles.includes(profile?.role)) {
          throw new Error('Not authorized');
        }

        // 3. Acesso permitido
        setAuthStatus('authorized');
      } catch (error) {
        setAuthStatus('unauthorized');
      }
    };

    checkAuth();
  }, [requiredRoles, location]);

  if (authStatus === 'checking') {
    return <LoadingSpinner fullscreen />;
  }

  if (authStatus === 'unauthorized') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
