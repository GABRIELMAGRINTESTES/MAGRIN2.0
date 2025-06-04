import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../services/supabase';
import Swal from 'sweetalert2';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import CupomForm from '../components/CupomForm';

export default function Cupons() {
  const [cupons, setCupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [cupomSelecionado, setCupomSelecionado] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState(true);

  const buscarCupons = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.ilike('code', `%${searchTerm}%`);
      }

      if (filterActive) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      setCupons(data || []);
    } catch (error) {
      console.error('Erro ao buscar cupons:', error);
      Swal.fire('Erro', 'Não foi possível carregar os cupons', 'error');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterActive]);

  useEffect(() => {
    buscarCupons();
  }, [buscarCupons]);

  const desativarCupom = async (id) => {
    const { isConfirmed } = await Swal.fire({
      title: 'Confirmar desativação',
      text: 'Deseja desativar este cupom? Ele não será mais aplicável.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, desativar',
      cancelButtonText: 'Cancelar'
    });

    if (isConfirmed) {
      try {
        setLoading(true);
        const { error } = await supabase
          .from('coupons')
          .update({ is_active: false })
          .eq('id', id);

        if (error) throw error;

        Swal.fire('Sucesso!', 'Cupom desativado com sucesso', 'success');
        buscarCupons();
      } catch (error) {
        console.error('Erro ao desativar cupom:', error);
        Swal.fire('Erro', 'Falha ao desativar o cupom', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const ativarCupom = async (id) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('coupons')
        .update({ is_active: true })
        .eq('id', id);

      if (error) throw error;

      Swal.fire('Sucesso!', 'Cupom ativado com sucesso', 'success');
      buscarCupons();
    } catch (error) {
      console.error('Erro ao ativar cupom:', error);
      Swal.fire('Erro', 'Falha ao ativar o cupom', 'error');
    } finally {
      setLoading(false);
    }
  };

  const abrirNovo = () => {
    setCupomSelecionado(null);
    setShowForm(true);
  };

  const editarCupom = (cupom) => {
    setCupomSelecionado(cupom);
    setShowForm(true);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h1 className="text-2xl font-bold text-gray-800">Gerenciamento de Cupons</h1>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <input
                type="text"
                placeholder="Buscar cupom..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
              />
              <div className="flex items-center">
                <label className="mr-2 text-sm text-gray-700">Mostrar:</label>
                <select
                  value={filterActive ? 'active' : 'inactive'}
                  onChange={(e) => setFilterActive(e.target.value === 'active')}
                  className="border rounded-md px-3 py-2"
                >
                  <option value="active">Ativos</option>
                  <option value="inactive">Inativos</option>
                </select>
              </div>
              <button
                onClick={abrirNovo}
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Novo Cupom
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {cupons.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uso</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Validade</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {cupons.map((cupom) => (
                        <tr key={cupom.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap font-mono font-medium text-gray-900">
                            {cupom.code}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              cupom.is_active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {cupom.is_active ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              cupom.discount_type === 'percent' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {cupom.discount_type === 'percent' ? 'Percentual' : 'Valor Fixo'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {cupom.discount_type === 'percent'
                              ? `${cupom.discount_value}%`
                              : `R$ ${parseFloat(cupom.discount_value).toFixed(2)}`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {cupom.used_count || 0} / {cupom.usage_limit || '∞'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {cupom.expiration_date
                              ? new Date(cupom.expiration_date).toLocaleDateString('pt-BR')
                              : 'Sem validade'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                            <button
                              onClick={() => editarCupom(cupom)}
                              className="text-primary hover:text-primary-dark"
                            >
                              Editar
                            </button>
                            {cupom.is_active ? (
                              <button
                                onClick={() => desativarCupom(cupom.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Desativar
                              </button>
                            ) : (
                              <button
                                onClick={() => ativarCupom(cupom.id)}
                                className="text-green-600 hover:text-green-900"
                              >
                                Ativar
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum cupom encontrado</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm ? 'Tente ajustar sua busca' : 'Comece criando um novo cupom'}
                  </p>
                  {!searchTerm && (
                    <div className="mt-6">
                      <button
                        onClick={abrirNovo}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Novo Cupom
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {showForm && (
            <CupomForm
              cupom={cupomSelecionado}
              onClose={() => setShowForm(false)}
              onSave={buscarCupons}
            />
          )}
        </main>
      </div>
    </div>
  );
}