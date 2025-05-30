import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import Swal from 'sweetalert2';

export default function CategoriaForm({ categoria, onClose, onSave }) {
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (categoria) {
      setNome(categoria.nome);
    }
  }, [categoria]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nome.trim()) {
      Swal.fire('Atenção', 'O nome da categoria é obrigatório.', 'warning');
      return;
    }

    setLoading(true);
    const payload = {
      nome: nome.trim(),
    };

    try {
      if (categoria?.id) {
        const { error } = await supabase
          .from('categorias')
          .update(payload)
          .eq('id', categoria.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('categorias').insert([payload]);
        if (error) throw error;
      }

      Swal.fire('Sucesso!', 'Categoria salva com sucesso!', 'success');
      onSave();
      onClose();
    } catch (error) {
      Swal.fire('Erro', error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{categoria ? 'Editar' : 'Nova'} Categoria</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome *</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
