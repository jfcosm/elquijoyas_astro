import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs, limit, query } from 'firebase/firestore';

interface Jewel {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  instagramUrl: string;
  price?: number;
  available?: boolean;
}

interface Category {
  id: string;
  name: string;
}

const HomeJewels: React.FC = () => {
  const [jewels, setJewels] = useState<Jewel[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
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

        // Cargar hasta 6 Joyas para la portada
        const q = query(collection(db, 'jewels'), limit(6));
        const prodSnapshot = await getDocs(q);
        const prodList: Jewel[] = [];
        prodSnapshot.forEach((doc) => {
          prodList.push({ id: doc.id, ...(doc.data() as any) });
        });
        setJewels(prodList);
      } catch (err) {
        console.error('Error loading home jewels:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="py-12 text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold mx-auto"></div>
        <p className="text-neutral-500 font-medium text-sm">Cargando colección...</p>
      </div>
    );
  }

  if (jewels.length === 0) {
    return null; // Oculta si no hay joyas cargadas
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {jewels.map((jewel) => {
        const catName = categories.find((c) => c.id === jewel.category)?.name || jewel.category;
        return (
          <article className="card p-5 flex flex-col gap-4 group hover:shadow-lg transition-all duration-300" key={jewel.id}>
            <div className="aspect-square rounded-xl overflow-hidden border border-white/70 relative">
              <img src={jewel.image} alt={jewel.name} className="w-full h-full object-cover group-hover:scale-102 transition duration-300" loading="lazy" />
              {!jewel.available && (
                <div className="absolute inset-0 bg-neutral-900/50 flex items-center justify-center">
                  <span className="bg-white/90 text-neutral-800 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    Bajo Encargo
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="badge">{catName}</span>
              <a href={`/tienda/producto?id=${jewel.id}`} className="text-sm font-medium text-gold hover:text-terracotta transition">
                Ver detalles
              </a>
            </div>
            <div className="space-y-2 flex-1">
              <h3 className="text-xl font-serif font-semibold text-neutral-900">{jewel.name}</h3>
              <p className="text-neutral-700 leading-relaxed text-sm line-clamp-2">{jewel.description}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
};

export default HomeJewels;
