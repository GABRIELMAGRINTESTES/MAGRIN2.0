import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import Swal from 'sweetalert2';
import ImageWithFallback from './ImageWithFallback';

export default function ProdutoForm({ onClose, onSave, produto }) {
  const [formData, setFormData] = useState({
    nome: produto?.nome || '',
    preco: produto?.preco || '',
    categoria_id: produto?.categoria_id || '',
    tamanho: produto?.tamanho || '',
    descricao: produto?.descricao || '',
    imagens: produto?.imagens || [],
    imagem_url: produto?.imagem_url || '',
  });

  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [priceError, setPriceError] = useState('');

  useEffect(() => {
    buscarCategorias();
  }, []);

  const buscarCategorias = async () => {
    const { data, error } = await supabase
      .from('categorias')
      .select('id, nome')
      .order('nome', { ascending: true });

    if (!error) setCategorias(data);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePriceChange = (e) => {
    const value = parseFloat(e.target.value);
    if (isNaN(value)) {
      setPriceError('Preço deve ser um número');
      setFormData(prev => ({ ...prev, preco: '' }));
    } else if (value < 0) {
      setPriceError('Preço não pode ser negativo');
      setFormData(prev => ({ ...prev, preco: value }));
    } else {
      setPriceError('');
      setFormData(prev => ({ ...prev, preco: value }));
    }
  };

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!produto?.id) {
      Swal.fire('Ops!', 'Salve o produto antes de enviar imagens.', 'warning');
      return;
    }

    try {
      setUploading(true);

      const uploadedUrls = [];

      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${produto.id}/${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('produtos')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('produtos')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      const imagensAtualizadas = [...formData.imagens, ...uploadedUrls];
      const novaPrincipal = imagensAtualizadas[0];

      const { error: updateError } = await supabase
        .from('produtos')
        .update({ imagens: imagensAtualizadas, imagem_url: novaPrincipal })
        .eq('id', produto.id);

      if (updateError) throw updateError;

      setFormData(prev => ({
        ...prev,
        imagens: imagensAtualizadas,
        imagem_url: novaPrincipal,
      }));

      Swal.fire('Sucesso!', 'Imagens enviadas com sucesso!', 'success');
    } catch (error) {
      console.error('Erro no upload:', error);
      Swal.fire('Erro', error.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (index) => {
    if (!produto?.id) return;

    try {
      setUploading(true);

      const imageUrl = formData.imagens[index];
      const fileName = imageUrl.split('/produtos/')[1];

      const { error: removeError } = await supabase.storage
        .from('produtos')
        .remove([fileName]);

      if (removeError) throw removeError;

      const updatedImages = formData.imagens.filter((_, i) => i !== index);
      const newMainImage = updatedImages[0] || '';

      const { error: updateError } = await supabase
        .from('produtos')
        .update({
          imagens: updatedImages,
          imagem_url: newMainImage
        })
        .eq('id', produto.id);

      if (updateError) throw updateError;

      setFormData(prev => ({
        ...prev,
        imagens: updatedImages,
        imagem_url: newMainImage
      }));

      Swal.fire('Sucesso!', 'Imagem removida com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao remover imagem:', error);
      Swal.fire('Erro', 'Não foi possível remover a imagem', 'error');
    } finally {
      setUploading(false);
    }
  };

  const validateForm = () => {
    if (!formData.nome.trim()) {
      Swal.fire('Atenção', 'O nome do produto é obrigatório', 'warning');
      return false;
    }

    if (!formData.preco || isNaN(formData.preco)) {
      Swal.fire('Atenção', 'O preço deve ser um número válido', 'warning');
      return false;
    }

    if (Number(formData.preco) <= 0) {
      Swal.fire('Atenção', 'O preço deve ser maior que zero', 'warning');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('Usuário não autenticado');

      const produtoData = {
        nome: formData.nome.trim(),
        preco: parseFloat(formData.preco).toFixed(2),
        categoria_id: formData.categoria_id || null,
        tamanho: formData.tamanho || null,
        descricao: formData.descricao || null,
        imagens: formData.imagens.length > 0 ? formData.imagens : null,
        imagem_url: formData.imagem_url || null,
        user_id: user.id,
      };

      if (produto?.id) {
        const { error } = await supabase
          .from('produtos')
          .update(produtoData)
          .eq('id', produto.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('produtos')
          .insert([produtoData]);

        if (error) throw error;
      }

      Swal.fire('Sucesso!', 'Produto salvo com sucesso!', 'success');
      onSave();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      Swal.fire('Erro', error.message || 'Erro ao salvar o produto', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">
            {produto ? 'Editar Produto' : 'Novo Produto'}
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome *</label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              {/* Preço */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Preço *</label>
                <input
                  type="number"
                  name="preco"
                  step="0.01"
                  min="0.01"
                  value={formData.preco}
                  onChange={handlePriceChange}
                  className="w-full p-2 border rounded"
                  required
                />
                {priceError && <p className="text-sm text-red-500">{priceError}</p>}
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Categoria</label>
                <select
                  name="categoria_id"
                  value={formData.categoria_id}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Selecione...</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.nome}</option>
                  ))}
                </select>
              </div>

              {/* Tamanho */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Tamanho</label>
                <input
                  type="text"
                  name="tamanho"
                  value={formData.tamanho}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* Descrição */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Descrição</label>
                <textarea
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  rows="3"
                />
              </div>
            </div>

            {/* Upload de Imagens */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Imagens (máx. 5)</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full p-2 border rounded"
                disabled={!produto?.id || uploading || formData.imagens.length >= 5}
              />

              <div className="flex flex-wrap gap-2 mt-4">
                {formData.imagens.length > 0 ? (
                  formData.imagens.map((img, index) => (
                    <div key={index} className="relative group">
                      <ImageWithFallback
                        src={img}
                        alt={`Imagem ${index + 1}`}
                        className="h-24 w-24 object-cover rounded border"
                      />
                      {img === formData.imagem_url && (
                        <span className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">
                          Principal
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100"
                      >
                        ×
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Nenhuma imagem enviada.</p>
                )}
              </div>
            </div>

            {/* Botões */}
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || uploading}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
