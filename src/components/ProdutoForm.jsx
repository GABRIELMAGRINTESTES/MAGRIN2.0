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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [priceError, setPriceError] = useState('');

  // Removido limite de tamanho máximo
  const ALLOWED_TYPES = ['image/jpeg', 'image/png','image/jpg', 'image/webp'];

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

  const validateFile = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error(`Tipo de arquivo não permitido: ${file.type}. Use apenas JPEG, PNG ou WEBP.`);
    }
    return true;
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (!produto?.id) {
      Swal.fire({
        title: 'Ops!',
        text: 'Salve o produto antes de enviar imagens.',
        icon: 'warning',
        customClass: {
          confirmButton: 'bg-black text-white px-4 py-2 rounded hover:bg-gray-800'
        },
        buttonsStyling: false
      });
      return;
    }

    // Validar número máximo de imagens
    if (formData.imagens.length + files.length > 5) {
      Swal.fire({
        title: 'Limite Excedido',
        text: 'Você pode enviar no máximo 5 imagens por produto.',
        icon: 'warning',
        customClass: {
          confirmButton: 'bg-black text-white px-4 py-2 rounded hover:bg-gray-800'
        },
        buttonsStyling: false
      });
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      // Validar todos os arquivos primeiro
      for (const file of files) {
        validateFile(file);
      }

      const uploadedUrls = [];
      let progress = 0;

      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${produto.id}/${crypto.randomUUID()}.${fileExt}`;

        // Comprimir imagem antes do upload se necessário
        let fileToUpload = file;

        const { error: uploadError } = await supabase.storage
          .from('produtos')
          .upload(fileName, fileToUpload, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('produtos')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
        
        progress += (1 / files.length) * 100;
        setUploadProgress(Math.round(progress));
      }

      const imagensAtualizadas = [...formData.imagens, ...uploadedUrls];
      const novaPrincipal = formData.imagem_url || imagensAtualizadas[0];

      const { error: updateError } = await supabase
        .from('produtos')
        .update({ 
          imagens: imagensAtualizadas,
          imagem_url: novaPrincipal 
        })
        .eq('id', produto.id);

      if (updateError) throw updateError;

      setFormData(prev => ({
        ...prev,
        imagens: imagensAtualizadas,
        imagem_url: novaPrincipal,
      }));

      Swal.fire({
        title: 'Sucesso!',
        text: 'Imagens enviadas com sucesso!',
        icon: 'success',
        customClass: {
          confirmButton: 'bg-black text-white px-4 py-2 rounded hover:bg-gray-800'
        },
        buttonsStyling: false
      });
    } catch (error) {
      console.error('Erro no upload:', error);
      Swal.fire({
        title: 'Erro',
        text: error.message,
        icon: 'error',
        customClass: {
          confirmButton: 'bg-black text-white px-4 py-2 rounded hover:bg-gray-800'
        },
        buttonsStyling: false
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const removeImage = async (index) => {
    if (!produto?.id) return;

    try {
      setUploading(true);

      const imageUrl = formData.imagens[index];
      const fileName = imageUrl.split('/produtos/')[1];

      if (!fileName) {
        throw new Error('URL da imagem inválida');
      }

      const { error: removeError } = await supabase.storage
        .from('produtos')
        .remove([fileName]);

      if (removeError) throw removeError;

      const updatedImages = formData.imagens.filter((_, i) => i !== index);
      const newMainImage = formData.imagem_url === imageUrl 
        ? (updatedImages[0] || '') 
        : formData.imagem_url;

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

      Swal.fire({
        title: 'Sucesso!',
        text: 'Imagem removida com sucesso!',
        icon: 'success',
        customClass: {
          confirmButton: 'bg-black text-white px-4 py-2 rounded hover:bg-gray-800'
        },
        buttonsStyling: false
      });
    } catch (error) {
      console.error('Erro ao remover imagem:', error);
      Swal.fire({
        title: 'Erro',
        text: error.message || 'Não foi possível remover a imagem',
        icon: 'error',
        customClass: {
          confirmButton: 'bg-black text-white px-4 py-2 rounded hover:bg-gray-800'
        },
        buttonsStyling: false
      });
    } finally {
      setUploading(false);
    }
  };

  const setMainImage = async (imageUrl) => {
    if (!produto?.id) return;

    try {
      setLoading(true);

      const { error: updateError } = await supabase
        .from('produtos')
        .update({ imagem_url: imageUrl })
        .eq('id', produto.id);

      if (updateError) throw updateError;

      setFormData(prev => ({
        ...prev,
        imagem_url: imageUrl
      }));

      Swal.fire({
        title: 'Sucesso!',
        text: 'Imagem principal atualizada!',
        icon: 'success',
        customClass: {
          confirmButton: 'bg-black text-white px-4 py-2 rounded hover:bg-gray-800'
        },
        buttonsStyling: false
      });
    } catch (error) {
      console.error('Erro ao definir imagem principal:', error);
      Swal.fire({
        title: 'Erro',
        text: 'Não foi possível definir a imagem principal',
        icon: 'error',
        customClass: {
          confirmButton: 'bg-black text-white px-4 py-2 rounded hover:bg-gray-800'
        },
        buttonsStyling: false
      });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.nome.trim()) {
      Swal.fire({
        title: 'Atenção',
        text: 'O nome do produto é obrigatório',
        icon: 'warning',
        customClass: {
          confirmButton: 'bg-black text-white px-4 py-2 rounded hover:bg-gray-800'
        },
        buttonsStyling: false
      });
      return false;
    }

    if (!formData.preco || isNaN(formData.preco)) {
      Swal.fire({
        title: 'Atenção',
        text: 'O preço deve ser um número válido',
        icon: 'warning',
        customClass: {
          confirmButton: 'bg-black text-white px-4 py-2 rounded hover:bg-gray-800'
        },
        buttonsStyling: false
      });
      return false;
    }

    if (Number(formData.preco) <= 0) {
      Swal.fire({
        title: 'Atenção',
        text: 'O preço deve ser maior que zero',
        icon: 'warning',
        customClass: {
          confirmButton: 'bg-black text-white px-4 py-2 rounded hover:bg-gray-800'
        },
        buttonsStyling: false
      });
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
        imagens: formData.imagens,
        imagem_url: formData.imagem_url,
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

      Swal.fire({
        title: 'Sucesso!',
        text: 'Produto salvo com sucesso!',
        icon: 'success',
        customClass: {
          confirmButton: 'bg-black text-white px-4 py-2 rounded hover:bg-gray-800'
        },
        buttonsStyling: false
      });
      onSave();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      Swal.fire({
        title: 'Erro',
        text: error.message || 'Erro ao salvar o produto',
        icon: 'error',
        customClass: {
          confirmButton: 'bg-black text-white px-4 py-2 rounded hover:bg-gray-800'
        },
        buttonsStyling: false
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl my-8">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">
            {produto ? 'Editar Produto' : 'Novo Produto'}
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 max-w-full">
              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome *</label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-black focus:border-black"
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
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-black focus:border-black"
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
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-black focus:border-black"
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
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-black focus:border-black"
                />
              </div>

              {/* Descrição */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Descrição</label>
                <textarea
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-black focus:border-black"
                  rows="3"
                />
              </div>
            </div>

            {/* Upload de Imagens */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imagens (máx. 5) - Formatos: JPEG, PNG, WEBP
              </label>
              
              {uploading && (
                <div className="mb-4">
                  <div className="h-2 bg-gray-200 rounded">
                    <div 
                      className="h-2 bg-black rounded transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Enviando... {uploadProgress}%</p>
                </div>
              )}

              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/jpg"
                onChange={handleImageUpload}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-black focus:border-black"
                disabled={!produto?.id || uploading || formData.imagens.length >= 5}
              />

              <div className="flex flex-wrap gap-2 mt-4 justify-center sm:justify-start">
                {formData.imagens.length > 0 ? (
                  formData.imagens.map((img, index) => (
                    <div key={index} className="relative group">
                      <ImageWithFallback
                        src={img}
                        alt={`Imagem ${index + 1}`}
                        className="h-24 w-24 object-cover rounded border cursor-pointer"
                        onClick={() => setMainImage(img)}
                      />
                      {img === formData.imagem_url && (
                        <span className="absolute top-1 left-1 bg-black text-white text-xs px-1 rounded">
                          Principal
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
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
                className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:bg-gray-400"
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
