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
    <div className="space-y-8">
      {/* Filtros y Búsqueda */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-white/60 shadow-sm">
        {/* Categorías */}
        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition ${
              selectedCategory === 'all'
                ? 'bg-gold text-white shadow-md'
                : 'bg-white/80 text-neutral-600 hover:bg-gold/15 hover:text-gold border border-neutral-100'
            }`}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition ${
                selectedCategory === cat.id
                  ? 'bg-gold text-white shadow-md'
                  : 'bg-white/80 text-neutral-600 hover:bg-gold/15 hover:text-gold border border-neutral-100'
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
            placeholder="Buscar joyas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-neutral-200 bg-white/90 px-5 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-gold transition shadow-inner"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">🔍</span>
        </div>
      </div>

      {/* Grid de Productos */}
      {loading ? (
        <div className="py-20 text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold mx-auto"></div>
          <p className="text-neutral-500 font-medium font-serif">Descubriendo joyas...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-16 text-center card p-8 space-y-3">
          <span className="text-4xl block">✨</span>
          <h3 className="text-xl font-serif font-semibold text-neutral-800">No encontramos piezas disponibles</h3>
          <p className="text-neutral-600 max-w-md mx-auto text-sm">
            Prueba ajustando los filtros o buscando otros materiales o nombres.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((prod) => (
            <article
              key={prod.id}
              className="card p-5 flex flex-col gap-4 group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="aspect-square rounded-2xl overflow-hidden border border-white/70 relative">
                <img
                  src={prod.image}
                  alt={prod.name}
                  className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                {!prod.available && (
                  <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-[2px] flex items-center justify-center">
                    <span className="bg-white/90 text-neutral-800 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase shadow-md">
                      Agotado / Bajo Encargo
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="badge">
                  {categories.find((c) => c.id === prod.category)?.name || prod.category}
                </span>
                {prod.price && (
                  <span className="font-semibold text-neutral-900 text-lg">
                    ${prod.price.toLocaleString('es-CL')}
                  </span>
                )}
              </div>

              <div className="space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-serif font-semibold text-neutral-900 leading-tight">
                    {prod.name}
                  </h3>
                  <p className="text-neutral-600 text-sm line-clamp-2 mt-1">
                    {prod.description}
                  </p>
                </div>
                
                {prod.materials && (
                  <p className="text-xs text-neutral-500 font-sans italic mt-2">
                    Materiales: {prod.materials}
                  </p>
                )}
              </div>

              <a
                href={`/tienda/producto?id=${prod.id}`}
                className="button-ghost text-sm text-center py-2.5 w-full mt-2"
              >
                Ver detalles
              </a>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default StoreGallery;
