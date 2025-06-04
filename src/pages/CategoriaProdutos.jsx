import { useParams } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../services/supabase';
import PublicHeader from '../components/PublicHeader';
import { Link } from 'react-router-dom';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

export default function CategoriaProdutos() {
  const { id } = useParams();
  const [categoria, setCategoria] = useState(null);
  const [grupos, setGrupos] = useState({});
  const [gruposExpandido, setGruposExpandido] = useState({});
  const [loading, setLoading] = useState(true);

  const buscarProdutosDaCategoria = useCallback(async () => {
    setLoading(true);

    const { data: catData, error: catError } = await supabase
      .from('categorias')
      .select('id, nome')
      .eq('id', id)
      .single();

    if (catError || !catData) {
      console.error('Categoria não encontrada.');
      setCategoria(null);
      setGrupos({});
      setLoading(false);
      return;
    }

    setCategoria(catData);

    const { data: produtos, error } = await supabase
      .from('produtos')
      .select('id, nome, preco, imagem_url')
      .eq('categoria_id', id)
      .order('created_at', { ascending: false });

    if (error || !produtos) {
      console.error('Erro ao buscar produtos:', error?.message);
      setGrupos({});
    } else {
      const agrupados = {};

      produtos.forEach((produto) => {
        const grupo = produto.nome.split(' - ')[0].trim();
        if (!agrupados[grupo]) agrupados[grupo] = [];
        agrupados[grupo].push(produto);
      });

      setGrupos(agrupados);
    }

    setLoading(false);
  }, [id]); // Adiciona id como dependência do useCallback

  useEffect(() => {
    buscarProdutosDaCategoria();
  }, [buscarProdutosDaCategoria]); // Agora useEffect depende apenas da função memoizada

  const toggleExpandirGrupo = (grupo) => {
    setGruposExpandido((prev) => ({
      ...prev,
      [grupo]: !prev[grupo],
    }));
  };

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <PublicHeader />

      <div className="px-4 py-6 max-w-6xl mx-auto">
        {loading ? (
          <p className="text-center">Carregando produtos...</p>
        ) : !categoria ? (
          <p className="text-center text-red-500">Categoria não encontrada.</p>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-6 text-center">
              {categoria.nome}
            </h1>

            {Object.keys(grupos).length === 0 ? (
              <p className="text-center text-gray-500">Nenhum produto nesta categoria.</p>
            ) : (
              Object.entries(grupos).map(([grupo, produtos]) => (
                <div key={grupo} className="mb-10">
                  <h2 className="text-xl font-semibold mb-2">{grupo}</h2>

                  {gruposExpandido[grupo] ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {produtos.map((produto) => (
                        <Link
                          key={produto.id}
                          to={`/loja/produto/${produto.id}`}
                          className="block bg-white border rounded hover:shadow transition"
                        >
                          <img
                            src={produto.imagem_url || 'https://via.placeholder.com/300'}
                            alt={produto.nome}
                            className="w-full h-40 object-cover rounded-t"
                          />
                          <div className="p-2">
                            <h3 className="text-sm font-semibold truncate">{produto.nome}</h3>
                            <p className="text-primary font-bold text-sm">
                              R$ {parseFloat(produto.preco).toFixed(2)}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <>
                      <Swiper
                        spaceBetween={16}
                        slidesPerView={2}
                        breakpoints={{
                          640: { slidesPerView: 3 },
                          768: { slidesPerView: 4 },
                          1024: { slidesPerView: 5 },
                        }}
                        autoplay={{
                          delay: 3000,
                          disableOnInteraction: false,
                        }}
                        navigation
                        modules={[Autoplay, Navigation]}
                      >
                        {produtos.map((produto) => (
                          <SwiperSlide key={produto.id}>
                            <Link
                              to={`/loja/produto/${produto.id}`}
                              className="block bg-white border rounded hover:shadow transition"
                            >
                              <img
                                src={produto.imagem_url || 'https://via.placeholder.com/300'}
                                alt={produto.nome}
                                className="w-full h-40 object-cover rounded-t"
                              />
                              <div className="p-2">
                                <h3 className="text-sm font-semibold truncate">{produto.nome}</h3>
                                <p className="text-primary font-bold text-sm">
                                  R$ {parseFloat(produto.preco).toFixed(2)}
                                </p>
                              </div>
                            </Link>
                          </SwiperSlide>
                        ))}
                      </Swiper>

                      <div className="mt-2 text-right">
                        <button
                          onClick={() => toggleExpandirGrupo(grupo)}
                          className="text-sm text-primary hover:underline"
                        >
                          Ver mais &darr;
                        </button>
                      </div>
                    </>
                  )}

                  {gruposExpandido[grupo] && (
                    <div className="mt-2 text-right">
                      <button
                        onClick={() => toggleExpandirGrupo(grupo)}
                        className="text-sm text-primary hover:underline"
                      >
                        Ver menos &uarr;
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}
