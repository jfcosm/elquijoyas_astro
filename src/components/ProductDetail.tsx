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
  const [whatsappNumber, setWhatsappNumber] = useState<string>('56931983075'); // Fallback

  useEffect(() => {
    const fetchProduct = async () => {
      // 1. Obtener ID de la URL
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id');

      if (!id) {
        setError('No se especificó ningún producto.');
        setLoading(false);
        return;
      }

      try {
        // Cargar número de WhatsApp de la portada si existe
        const contactDoc = await getDoc(doc(db, 'sections', 'contact'));
        if (contactDoc.exists()) {
          const contactData = contactDoc.data();
          if (contactData.whatsappPhone) {
            setWhatsappNumber(contactData.whatsappPhone);
          }
        }

        // Cargar Categorías para mapear el nombre
        const catSnapshot = await getDocs(collection(db, 'categories'));
        const catList: Category[] = [];
        catSnapshot.forEach((doc) => {
          catList.push({ id: doc.id, ...(doc.data() as { name: string }) });
        });
        setCategories(catList);

        // Cargar Detalle del Producto
        const docRef = doc(db, 'jewels', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...(docSnap.data() as any) });
        } else {
          setError('El producto solicitado no existe.');
        }
      } catch (err) {
        console.error('Error fetching product detail:', err);
        setError('Ocurrió un error al cargar la joya.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, []);

  if (loading) {
    return (
      <div className="py-32 text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold mx-auto"></div>
        <p className="text-neutral-500 font-serif font-medium">Cargando detalles de la pieza...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="py-24 text-center max-w-md mx-auto space-y-6">
        <span className="text-5xl block">🔎</span>
        <h2 className="text-2xl font-serif font-semibold text-neutral-800">Ups, algo salió mal</h2>
        <p className="text-neutral-600 text-sm">{error || 'No pudimos encontrar la joya seleccionada.'}</p>
        <a href="/tienda" className="button-primary inline-flex">
          Volver a la Tienda
        </a>
      </div>
    );
  }

  const categoryName = categories.find((c) => c.id === product.category)?.name || product.category;
  
  // Mensaje de WhatsApp personalizado
  const whatsappMessage = `Hola Nicolás, me encantaría consultar por la joya "${product.name}" (${categoryName}) de tu catálogo. ¿Está disponible para compra o encargo personalizado?`;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="card p-6 md:p-10 bg-white/95 backdrop-blur-sm shadow-xl border border-white/60">
      <div className="grid md:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Imagen */}
        <div className="md:col-span-6 relative aspect-square rounded-2xl overflow-hidden shadow-lg border border-neutral-100">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {!product.available && (
            <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-[1.5px] flex items-center justify-center">
              <span className="bg-white/95 text-neutral-800 px-5 py-2 rounded-full text-xs font-semibold tracking-wider uppercase shadow-md">
                Pieza no disponible / Solo encargo
              </span>
            </div>
          )}
        </div>

        {/* Detalles */}
        <div className="md:col-span-6 space-y-6">
          <div className="space-y-2">
            <span className="badge">{categoryName}</span>
            <h1 className="text-3xl lg:text-4xl font-serif font-semibold text-neutral-900 leading-tight">
              {product.name}
            </h1>
            {product.price && (
              <p className="text-2xl font-semibold text-gold font-sans pt-1">
                ${product.price.toLocaleString('es-CL')}
              </p>
            )}
          </div>

          <div className="border-t border-neutral-100 pt-4 space-y-3">
            <h3 className="text-xs uppercase font-semibold text-neutral-400 tracking-wider">Descripción</h3>
            <p className="text-neutral-700 leading-relaxed text-sm lg:text-base">
              {product.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-neutral-100 pt-4">
            {product.materials && (
              <div>
                <h4 className="text-xs uppercase font-semibold text-neutral-400 tracking-wider mb-1">Materiales</h4>
                <p className="text-neutral-800 text-sm font-medium">{product.materials}</p>
              </div>
            )}
            <div>
              <h4 className="text-xs uppercase font-semibold text-neutral-400 tracking-wider mb-1">Estado</h4>
              <p className="text-sm font-semibold">
                {product.available ? (
                  <span className="text-green-600">🟢 Disponible</span>
                ) : (
                  <span className="text-amber-600">🟡 Solo bajo encargo</span>
                )}
              </p>
            </div>
          </div>

          {product.tags && (
            <div className="border-t border-neutral-100 pt-4">
              <h4 className="text-xs uppercase font-semibold text-neutral-400 tracking-wider mb-2">Etiquetas</h4>
              <div className="flex flex-wrap gap-1.5">
                {product.tags.split(',').map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-neutral-100 text-neutral-600 text-[10px] rounded font-medium border border-neutral-200/50"
                  >
                    #{tag.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-neutral-100">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="button-primary flex-1 inline-flex items-center justify-center gap-2"
            >
              <span className="text-lg">💬</span> Consultar por WhatsApp
            </a>
            
            {product.instagramUrl && (
              <a
                href={product.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="button-ghost inline-flex items-center justify-center gap-2"
              >
                <span>📸</span> Ver en Instagram
              </a>
            )}
          </div>
          
          <div className="text-center sm:text-left">
            <a href="/tienda" className="text-xs font-semibold text-neutral-500 hover:text-gold transition">
              ← Volver al catálogo
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
