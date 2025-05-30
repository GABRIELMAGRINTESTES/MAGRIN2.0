import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import PublicHeader from '../components/PublicHeader';
import { Link } from 'react-router-dom';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

import bannerImage from '../assets/banner.jpg'; // Certifique-se que o caminho está correto

export default function Home() {
  const [categoriasComProdutos, setCategoriasComProdutos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    buscarCategoriasComProdutos();
  }, []);

  const buscarCategoriasComProdutos = async () => {
    setLoading(true);

    const { data: categorias, error: catError } = await supabase
      .from('categorias')
      .select('id, nome')
      .order('nome', { ascending: true });

    if (catError) {
      console.error('Erro ao buscar categorias:', catError.message);
      return;
    }

    const lista = [];

    for (const cat of categorias) {
      const { data: produtos } = await supabase
        .from('produtos')
        .select('id, nome, preco, imagem_url')
        .eq('categoria_id', cat.id)
        .eq('destaque', true)
        .order('created_at', { ascending: false })
        .limit(12);

      if (produtos && produtos.length > 0) {
        lista.push({
          categoria: cat,
          produtos,
        });
      }
    }

    setCategoriasComProdutos(lista);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <PublicHeader />

      {/* ✅ Banner com responsividade */}
      <div className="w-full mb-6 overflow-hidden">
        <img
          src={bannerImage}
          alt="Banner"
          className="w-full h-auto max-h-[450px] object-contain md:object-cover"
        />
      </div>

      {/* Produtos por categoria com Swiper */}
      <section className="px-4 pb-10 space-y-10">
        {loading ? (
          <p className="text-center text-gray-600">Carregando produtos...</p>
        ) : categoriasComProdutos.length === 0 ? (
          <p className="text-center text-gray-500">Nenhum produto em destaque.</p>
        ) : (
          categoriasComProdutos.map(({ categoria, produtos }) => (
            <div key={categoria.id}>
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold">{categoria.nome}</h2>
                <Link
                  to={`/loja/categorias/${categoria.id}`}
                  className="text-sm text-indigo-600 hover:underline"
                >
                  Ver todos &rarr;
                </Link>
              </div>

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
                        <p className="text-indigo-600 font-bold text-sm">
                          R$ {parseFloat(produto.preco).toFixed(2)}
                        </p>
                      </div>
                    </Link>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
