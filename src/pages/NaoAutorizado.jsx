import { Link } from 'react-router-dom';

export default function NaoAutorizado() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Acesso Negado</h1>
        <p className="mb-6">Você não tem permissão para acessar esta página.</p>
        <Link 
          to="/login" 
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 inline-block"
        >
          Voltar para o login
        </Link>
      </div>
    </div>
  );
}