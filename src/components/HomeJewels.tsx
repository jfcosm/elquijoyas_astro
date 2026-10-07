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
      <div className="py-16 text-center space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald mx-auto"></div>
        <p className="text-ink-muted font-serif text-base italic">Descubriendo joyas del taller...</p>
      </div>
    );
  }

  if (jewels.length === 0) {
    return null;
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {jewels.map((jewel) => {
        const catName = categories.find((c) => c.id === jewel.category)?.name || jewel.category;
        return (
          <article
            className="card p-6 flex flex-col gap-4 group hover:shadow-watercolor transition-all duration-500 bg-white/85 border-[#E8DFC8]"
            key={jewel.id}
          >
            <div className="aspect-square rounded-2xl overflow-hidden border border-[#E8DFC8] relative bg-[#FAF6F0]">
              <img
                src={jewel.image}
                alt={jewel.name}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                loading="lazy"
              />
              {!jewel.available && (
                <div className="absolute inset-0 bg-ink-deep/60 backdrop-blur-[2px] flex items-center justify-center">
                  <span className="bg-white/95 text-ink-deep px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-md">
                    Bajo Encargo
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="badge !text-[11px]">{catName}</span>
              {jewel.price && (
                <span className="text-base font-bold text-ink-deep font-sans">
                  ${jewel.price.toLocaleString('es-CL')}
                </span>
              )}
            </div>

            <div className="space-y-2 flex-1">
              <h3 className="text-2xl font-serif font-semibold text-ink-deep leading-snug group-hover:text-emerald transition-colors">
                {jewel.name}
              </h3>
              <p className="text-ink-medium leading-relaxed text-sm line-clamp-2">
                {jewel.description}
              </p>
            </div>

            <div className="pt-2 border-t border-[#EBDDCB]/60">
              <a
                href={`/tienda/producto?id=${jewel.id}`}
                className="button-ghost !py-2 !w-full text-xs font-semibold text-center"
              >
                Ver Detalle de Pieza ✦
              </a>
            </div>
          </article>
        );
      })}
    </div>
  );
};

export default HomeJewels;
