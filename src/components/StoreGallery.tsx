import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs } from 'firebase/firestore';

interface Jewel {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  instagramUrl: string;
  price?: number;
  available?: boolean;
  materials?: string;
  tags?: string;
}

interface Category {
  id: string;
  name: string;
}

const StoreGallery: React.FC = () => {
  const [products, setProducts] = useState<Jewel[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar Categorías
        const catSnapshot = await getDocs(collection(db, 'categories'));
        const catList: Category[] = [];
        catSnapshot.forEach((doc) => {
          catList.push({ id: doc.id, ...(doc.data() as { name: string }) });
        });
        setCategories(catList);

        // Cargar Productos
        const prodSnapshot = await getDocs(collection(db, 'jewels'));
        const prodList: Jewel[] = [];
        prodSnapshot.forEach((doc) => {
          prodList.push({ id: doc.id, ...(doc.data() as any) });
        });
        setProducts(prodList);
      } catch (err) {
        console.error('Error fetching catalog data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredProducts = products.filter((prod) => {
    const matchesCategory = selectedCategory === 'all' || prod.category === selectedCategory;
    const matchesSearch =
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prod.materials && prod.materials.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-10">
      {/* Filtros y Búsqueda */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 bg-white/85 backdrop-blur-md p-5 rounded-3xl border border-[#E8DFC8] shadow-sm">
        {/* Categorías */}
        <div className="flex flex-wrap gap-2.5 items-center">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 ${
              selectedCategory === 'all'
                ? 'bg-gradient-to-r from-emerald to-emerald-dark text-white shadow-md'
                : 'bg-white/80 text-ink-medium hover:text-emerald hover:bg-emerald-light/60 border border-[#EBDDCB]'
            }`}
          >
            Todos los Diseños
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-emerald to-emerald-dark text-white shadow-md'
                  : 'bg-white/80 text-ink-medium hover:text-emerald hover:bg-emerald-light/60 border border-[#EBDDCB]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Barra de Búsqueda */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Buscar por joya, mineral o metal..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-[#E0CCB4] bg-[#FAF6F0]/90 px-5 py-2.5 pr-10 text-xs sm:text-sm text-ink-deep placeholder:text-ink-muted/50 focus:outline-none focus:ring-2 focus:ring-emerald focus:bg-white transition shadow-inner"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none">
            🔍
          </span>
        </div>
      </div>

      {/* Grid de Productos */}
      {loading ? (
        <div className="py-24 text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald mx-auto"></div>
          <p className="text-ink-muted font-serif text-lg italic">Descubriendo la colección artesanal...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-20 text-center card p-10 space-y-4 bg-white/85 border-[#E8DFC8]">
          <span className="text-4xl block">✨</span>
          <h3 className="text-2xl font-serif font-semibold text-ink-deep">
            No encontramos piezas con este criterio
          </h3>
          <p className="text-ink-medium max-w-md mx-auto text-sm">
            Prueba buscando con otros términos como cuarzo, plata, bronce o restableciendo los filtros de categoría.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="button-ghost !py-2 !px-5 text-xs mt-2"
          >
            Ver todas las joyas
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((prod) => (
            <article
              key={prod.id}
              className="card p-6 flex flex-col gap-4 group hover:shadow-watercolor transition-all duration-500 bg-white/85 border-[#E8DFC8]"
            >
              <div className="aspect-square rounded-2xl overflow-hidden border border-[#E8DFC8] relative bg-[#FAF6F0]">
                <img
                  src={prod.image}
                  alt={prod.name}
                  className="w-full h-full object-cover transition duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                {!prod.available && (
                  <div className="absolute inset-0 bg-ink-deep/60 backdrop-blur-[2px] flex items-center justify-center">
                    <span className="bg-white/95 text-ink-deep px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase shadow-md">
                      Bajo Encargo
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="badge !text-[11px]">
                  {categories.find((c) => c.id === prod.category)?.name || prod.category}
                </span>
                {prod.price && (
                  <span className="font-bold text-ink-deep text-lg font-sans">
                    ${prod.price.toLocaleString('es-CL')}
                  </span>
                )}
              </div>

              <div className="space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-serif font-semibold text-ink-deep leading-snug group-hover:text-emerald transition-colors">
                    {prod.name}
                  </h3>
                  <p className="text-ink-medium text-sm line-clamp-2 mt-1 leading-relaxed">
                    {prod.description}
                  </p>
                </div>

                {prod.materials && (
                  <p className="text-xs text-ink-muted italic pt-2 border-t border-[#EBDDCB]/60">
                    Materiales: {prod.materials}
                  </p>
                )}
              </div>

              <a
                href={`/tienda/producto?id=${prod.id}`}
                className="button-ghost text-xs text-center py-2.5 w-full mt-2 font-semibold"
              >
                Ver Detalle & Consultar ✦
              </a>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default StoreGallery;
