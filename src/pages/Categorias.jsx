import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import Swal from 'sweetalert2';
import CategoriaForm from '../components/CategoriaForm';

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);

  useEffect(() => {
    buscarCategorias();
  }, []);

  const buscarCategorias = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .order('nome', { ascending: true });

    if (error) {
      Swal.fire('Erro', 'Erro ao buscar categorias', 'error');
    } else {
      setCategorias(data);
    }
    setLoading(false);
  };

  const excluirCategoria = async (id) => {
    const confirm = await Swal.fire({
      title: 'Tem certeza?',
      text: 'Todos os produtos vinculados continuarão existindo.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar',
    });

    if (confirm.isConfirmed) {
      const { error } = await supabase.from('categorias').delete().eq('id', id);
      if (error) {
        Swal.fire('Erro', 'Erro ao excluir categoria', 'error');
      } else {
        Swal.fire('Sucesso', 'Categoria excluída com sucesso!', 'success');
        buscarCategorias();
      }
    }
  };

  const abrirNova = () => {
    setCategoriaSelecionada(null);
    setShowForm(true);
  };

  const editarCategoria = (categoria) => {
    setCategoriaSelecionada(categoria);
    setShowForm(true);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 bg-gray-100">
        <Header />
        <main className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Categorias</h1>
            <button
              onClick={abrirNova}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
            >
              + Nova Categoria
            </button>
          </div>

          {loading ? (
            <p>Carregando categorias...</p>
          ) : (
            <div className="bg-white rounded shadow overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-100 text-sm text-gray-600">
                  <tr>
                    <th className="px-6 py-3 text-left">Nome</th>
                    <th className="px-6 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {categorias.map((cat) => (
                    <tr key={cat.id} className="border-b">
                      <td className="px-6 py-3">{cat.nome}</td>
                      <td className="px-6 py-3 text-right space-x-2">
                        <button
                          onClick={() => editarCategoria(cat)}
                          className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => excluirCategoria(cat.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {categorias.length === 0 && (
                <p className="text-center py-6 text-gray-500">Nenhuma categoria cadastrada.</p>
              )}
            </div>
          )}

          {showForm && (
            <CategoriaForm
              categoria={categoriaSelecionada}
              onClose={() => setShowForm(false)}
              onSave={buscarCategorias}
            />
          )}
        </main>
      </div>
    </div>
  );
}
