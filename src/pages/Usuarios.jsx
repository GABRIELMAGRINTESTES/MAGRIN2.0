import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import Swal from 'sweetalert2';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [perfilAtual, setPerfilAtual] = useState(null);

  // Agora inclui 'moderador'
  const rolesDisponiveis = ['cliente', 'moderador', 'admin'];

  useEffect(() => {
    carregarPerfilAtual();
    carregarUsuarios();
  }, []);

  const carregarPerfilAtual = async () => {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (user) {
      const { data: perfil, error } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Erro ao carregar perfil:', error);
        Swal.fire('Erro', 'Não foi possível carregar o perfil atual.', 'error');
      } else {
        setPerfilAtual(perfil);
      }
    }
  };

  const carregarUsuarios = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, role, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar usuários:', error);
      Swal.fire('Erro', 'Erro ao buscar usuários', 'error');
    } else {
      setUsuarios(data);
    }

    setLoading(false);
  };

  const atualizarRole = async (userId, novaRole) => {
    if (perfilAtual?.role === 'moderador') {
      Swal.fire('Acesso negado', 'Moderadores não podem alterar cargos.', 'warning');
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ role: novaRole })
      .eq('id', userId);

    if (error) {
      console.error('Erro ao atualizar role:', error);
      Swal.fire('Erro', 'Erro ao atualizar cargo', 'error');
    } else {
      Swal.fire({
        title: 'Sucesso!',
        text: 'Cargo atualizado com sucesso',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      }).then(() => {
        window.location.reload();
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Gerenciamento de Usuários</h1>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {usuarios.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cargo</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cadastrado em</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {usuarios.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{user.name || 'Sem nome'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={user.role || ''}
                              onChange={(e) => atualizarRole(user.id, e.target.value)}
                              className={`block w-full pl-3 pr-10 py-2 text-base border ${
                                user.role ? 'border-gray-300' : 'border-red-300'
                              } focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md`}
                              disabled={perfilAtual?.role === 'moderador'}
                            >
                              <option value="">Selecione um cargo</option>
                              {rolesDisponiveis.map((role) => (
                                <option key={role} value={role}>
                                  {role === 'admin'
                                    ? 'Administrador'
                                    : role === 'moderador'
                                    ? 'Moderador'
                                    : 'Cliente'}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.created_at).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum usuário encontrado</h3>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
