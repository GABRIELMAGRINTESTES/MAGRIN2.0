import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import Swal from 'sweetalert2';

export default function CupomForm({ cupom, onClose, onSave }) {
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percent',
    discount_value: '',
    usage_limit: '',
    expiration_date: '',
    min_order_value: '',
    is_active: true
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (cupom) {
      setFormData({
        code: cupom.code || '',
        discount_type: cupom.discount_type || 'percent',
        discount_value: cupom.discount_value || '',
        usage_limit: cupom.usage_limit || '',
        expiration_date: cupom.expiration_date 
          ? new Date(cupom.expiration_date).toISOString().slice(0, 16) 
          : '',
        min_order_value: cupom.min_order_value || '',
        is_active: cupom.is_active !== undefined ? cupom.is_active : true
      });
    }
  }, [cupom]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.code.trim()) {
      newErrors.code = 'Código é obrigatório';
    } else if (!/^[A-Z0-9]+$/.test(formData.code.trim())) {
      newErrors.code = 'Apenas letras maiúsculas e números são permitidos';
    }
    
    if (!formData.discount_value || isNaN(formData.discount_value)) {
      newErrors.discount_value = 'Valor inválido';
    } else if (formData.discount_type === 'percent' && (formData.discount_value < 0 || formData.discount_value > 100)) {
      newErrors.discount_value = 'Percentual deve ser entre 0 e 100';
    } else if (formData.discount_type === 'fixed' && formData.discount_value < 0) {
      newErrors.discount_value = 'Valor não pode ser negativo';
    }
    
    if (formData.usage_limit && isNaN(formData.usage_limit)) {
      newErrors.usage_limit = 'Limite inválido';
    }
    
    if (formData.min_order_value && isNaN(formData.min_order_value)) {
      newErrors.min_order_value = 'Valor mínimo inválido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    const cupomData = {
      code: formData.code.trim().toUpperCase(),
      discount_type: formData.discount_type,
      discount_value: parseFloat(formData.discount_value),
      usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
      expiration_date: formData.expiration_date || null,
      min_order_value: formData.min_order_value ? parseFloat(formData.min_order_value) : null,
      is_active: formData.is_active
    };

    try {
      let result;
      if (cupom?.id) {
        result = await supabase
          .from('coupons')
          .update(cupomData)
          .eq('id', cupom.id);
      } else {
        // Verificar se o código já existe
        const { data: existing } = await supabase
          .from('coupons')
          .select('code')
          .ilike('code', formData.code.trim())
          .single();

        if (existing) {
          throw new Error('Já existe um cupom com este código');
        }

        result = await supabase
          .from('coupons')
          .insert([cupomData]);
      }

      if (result.error) throw result.error;

      Swal.fire({
        title: 'Sucesso!',
        text: `Cupom ${cupom ? 'atualizado' : 'criado'} com sucesso`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
      
      onSave();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar cupom:', error);
      Swal.fire({
        title: 'Erro',
        text: error.message || 'Falha ao salvar o cupom',
        icon: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              {cupom ? 'Editar Cupom' : 'Criar Novo Cupom'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                Código do Cupom *
              </label>
              <input
                type="text"
                id="code"
                name="code"
                value={formData.code}
                onChange={handleChange}
                className={`block w-full px-3 py-2 border ${errors.code ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary`}
                placeholder="EXEMPLO20"
                required
              />
              {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code}</p>}
            </div>

            <div>
              <label htmlFor="discount_type" className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Desconto
              </label>
              <select
                id="discount_type"
                name="discount_type"
                value={formData.discount_type}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              >
                <option value="percent">Percentual (%)</option>
                <option value="fixed">Valor Fixo (R$)</option>
              </select>
            </div>

            <div>
              <label htmlFor="discount_value" className="block text-sm font-medium text-gray-700 mb-1">
                Valor do Desconto *
              </label>
              <div className="relative rounded-md shadow-sm">
                {formData.discount_type === 'fixed' && (
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">R$</span>
                  </div>
                )}
                <input
                  type="number"
                  id="discount_value"
                  name="discount_value"
                  value={formData.discount_value}
                  onChange={handleChange}
                  step={formData.discount_type === 'percent' ? '1' : '0.01'}
                  min="0"
                  max={formData.discount_type === 'percent' ? '100' : undefined}
                  className={`block w-full ${formData.discount_type === 'fixed' ? 'pl-10' : ''} px-3 py-2 border ${errors.discount_value ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary`}
                  required
                />
                {formData.discount_type === 'percent' && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">%</span>
                  </div>
                )}
              </div>
              {errors.discount_value && <p className="mt-1 text-sm text-red-600">{errors.discount_value}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="usage_limit" className="block text-sm font-medium text-gray-700 mb-1">
                  Limite de Usos
                </label>
                <input
                  type="number"
                  id="usage_limit"
                  name="usage_limit"
                  value={formData.usage_limit}
                  onChange={handleChange}
                  min="1"
                  className={`block w-full px-3 py-2 border ${errors.usage_limit ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary`}
                  placeholder="Ilimitado se vazio"
                />
                {errors.usage_limit && <p className="mt-1 text-sm text-red-600">{errors.usage_limit}</p>}
              </div>

              <div>
                <label htmlFor="min_order_value" className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Mínimo (R$)
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">R$</span>
                  </div>
                  <input
                    type="number"
                    id="min_order_value"
                    name="min_order_value"
                    value={formData.min_order_value}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className="block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    placeholder="Sem mínimo se vazio"
                  />
                </div>
                {errors.min_order_value && <p className="mt-1 text-sm text-red-600">{errors.min_order_value}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="expiration_date" className="block text-sm font-medium text-gray-700 mb-1">
                Data de Validade
              </label>
              <input
                type="datetime-local"
                id="expiration_date"
                name="expiration_date"
                value={formData.expiration_date}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>

            {cupom && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                  Cupom ativo
                </label>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Salvando...
                  </>
                ) : (
                  cupom ? 'Atualizar Cupom' : 'Criar Cupom'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}