import { useState, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { supabase } from '../services/supabase'
import PublicHeader from '../components/PublicHeader'

export default function CategoriasPublicas() {
  const { search } = useLocation()
  const query = new URLSearchParams(search).get('search') || ''
  const [produtos, setProdutos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      setLoading(true)
      const { data, error } = await supabase
        .from('produtos')
        .select('id, nome, preco, imagem_url')
        .ilike('nome', `%${query}%`)
      if (!error) setProdutos(data)
      setLoading(false)
    }
    if (query) {
      fetch()
    } else {
      setProdutos([])
      setLoading(false)
    }
  }, [query])

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <PublicHeader />
      <main className="p-4 max-w-7xl mx-auto">
        {loading ? (
          <p className="text-center">Carregando resultados…</p>
        ) : produtos.length === 0 ? (
          <p className="text-center text-gray-500">
            {query
              ? `Nenhum produto encontrado para “${query}”.`
              : 'Digite algo no campo de busca acima.'}
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {produtos.map((p) => (
              <Link
                to={`/loja/produto/${p.id}`}
                key={p.id}
                className="block border rounded-lg overflow-hidden hover:shadow-md transition"
              >
                <img
                  src={p.imagem_url || 'https://via.placeholder.com/300'}
                  alt={p.nome}
                  className="w-full h-40 object-cover"
                />
                <div className="p-2">
                  <h3 className="text-sm font-semibold truncate">{p.nome}</h3>
                  <p className="text-indigo-600 font-bold">
                    R$ {parseFloat(p.preco).toFixed(2)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
