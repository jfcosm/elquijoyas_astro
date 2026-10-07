import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';

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

const ProductDetail: React.FC = () => {
  const [product, setProduct] = useState<Jewel | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [whatsappNumber, setWhatsappNumber] = useState<string>('56931983075');

  useEffect(() => {
    const fetchProduct = async () => {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id');

      if (!id) {
        setError('No se especificó ninguna joya.');
        setLoading(false);
        return;
      }

      try {
        const contactDoc = await getDoc(doc(db, 'sections', 'contact'));
        if (contactDoc.exists()) {
          const contactData = contactDoc.data();
          if (contactData.whatsappPhone) {
            setWhatsappNumber(contactData.whatsappPhone);
          }
        }

        const catSnapshot = await getDocs(collection(db, 'categories'));
        const catList: Category[] = [];
        catSnapshot.forEach((d) => {
          catList.push({ id: d.id, ...(d.data() as { name: string }) });
        });
        setCategories(catList);

        const docRef = doc(db, 'jewels', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...(docSnap.data() as any) });
        } else {
          setError('La pieza solicitada no fue encontrada en el catálogo.');
        }
      } catch (err) {
        console.error('Error fetching product detail:', err);
        setError('Ocurrió un inconveniente al cargar los detalles de la pieza.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, []);

  if (loading) {
    return (
      <div className="py-32 text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald mx-auto"></div>
        <p className="text-ink-muted font-serif text-lg italic">Cargando detalles de la obra...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="py-24 text-center max-w-md mx-auto space-y-6 card p-8 bg-white/85 border-[#E8DFC8]">
        <span className="text-5xl block">🔎</span>
        <h2 className="text-2xl font-serif font-semibold text-ink-deep">Pieza no encontrada</h2>
        <p className="text-ink-medium text-sm">{error || 'No pudimos localizar la joya solicitada.'}</p>
        <a href="/tienda" className="button-primary inline-flex">
          ← Volver a la Tienda
        </a>
      </div>
    );
  }

  const categoryName = categories.find((c) => c.id === product.category)?.name || product.category;
  
  const whatsappMessage = `Hola Nicolás, me gustaría consultar por la joya de autor "${product.name}" (${categoryName}) de tu catálogo Elqui Joyas. ¿Está disponible para entrega inmediata o encargo personalizado?`;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="card p-6 md:p-10 bg-white/90 backdrop-blur-md shadow-watercolor border border-[#E8DFC8]">
      <div className="grid md:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Imagen de la joya */}
        <div className="md:col-span-6 relative aspect-square rounded-3xl overflow-hidden shadow-md border border-[#E8DFC8] bg-[#FAF6F0]">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {!product.available && (
            <div className="absolute inset-0 bg-ink-deep/60 backdrop-blur-[2px] flex items-center justify-center">
              <span className="bg-white/95 text-ink-deep px-5 py-2 rounded-full text-xs font-bold tracking-wider uppercase shadow-md">
                Pieza Bajo Encargo
              </span>
            </div>
          )}
        </div>

        {/* Información y Compra */}
        <div className="md:col-span-6 space-y-6">
          <div className="space-y-2">
            <span className="badge !text-[11px]">{categoryName}</span>
            <h1 className="text-3xl lg:text-4xl font-serif font-semibold text-ink-deep leading-tight">
              {product.name}
            </h1>
            {product.price && (
              <p className="text-3xl font-bold text-ink-deep font-sans pt-1">
                ${product.price.toLocaleString('es-CL')}
              </p>
            )}
          </div>

          <div className="border-t border-[#EBDDCB] pt-4 space-y-2">
            <h3 className="text-xs uppercase font-bold text-ink-muted tracking-wider">Descripción de la obra</h3>
            <p className="text-ink-medium leading-relaxed text-sm lg:text-base">
              {product.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-[#EBDDCB] pt-4">
            {product.materials && (
              <div>
                <h4 className="text-xs uppercase font-bold text-ink-muted tracking-wider mb-1">Materiales</h4>
                <p className="text-ink-deep text-sm font-medium">{product.materials}</p>
              </div>
            )}
            <div>
              <h4 className="text-xs uppercase font-bold text-ink-muted tracking-wider mb-1">Disponibilidad</h4>
              <p className="text-sm font-semibold">
                {product.available ? (
                  <span className="text-emerald font-medium">🟢 Disponible en Taller</span>
                ) : (
                  <span className="text-terracotta font-medium">🟡 Elaboración bajo encargo</span>
                )}
              </p>
            </div>
          </div>

          {product.tags && (
            <div className="border-t border-[#EBDDCB] pt-4">
              <h4 className="text-xs uppercase font-bold text-ink-muted tracking-wider mb-2">Características</h4>
              <div className="flex flex-wrap gap-1.5">
                {product.tags.split(',').map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-parchment-200/80 text-ink-medium text-[11px] rounded-lg font-medium border border-[#E0CCB4]"
                  >
                    #{tag.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-[#EBDDCB]">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="button-primary flex-1 inline-flex items-center justify-center gap-2 text-sm"
            >
              <span>💬</span> Consultar con Nicolás por WhatsApp
            </a>
            
            {product.instagramUrl && (
              <a
                href={product.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="button-ghost inline-flex items-center justify-center gap-2 text-sm"
              >
                <span>📸</span> Ver en Instagram
              </a>
            )}
          </div>
          
          <div className="pt-2">
            <a href="/tienda" className="text-xs font-semibold text-ink-muted hover:text-emerald transition flex items-center gap-1.5">
              ← Volver al catálogo completo
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
