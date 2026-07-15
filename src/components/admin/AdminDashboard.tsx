import React, { useState, useEffect } from 'react';
import { auth, db, storage } from '../../services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { jewels as initialJewels } from '../../data/jewels';

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

const AdminDashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<'portada' | 'categorias' | 'productos'>('portada');

  // Estados de Portada
  const [heroData, setHeroData] = useState({
    badge: 'Joyería artesanal en el Valle de Elqui',
    title: 'Joyas hechas con pasión y alma',
    description: 'Piezas únicas creadas a mano por Nicolás Cordero, inspiradas en la luz y la naturaleza del Valle de Elqui. Cada joya es un homenaje al Cerro Mamalluca y a la artesanía responsable.',
    featuredTitle: 'Luz del Mamalluca',
    featuredSub: 'Colección 2024',
    featuredDesc: 'Diseños elegantes que combinan plata, bronce y piedras naturales seleccionadas en el Valle de Elqui. Cada pieza es creada lentamente, respetando el material y el entorno.'
  });

  const [aboutData, setAboutData] = useState({
    badge: 'Acerca de Nicolás Cordero',
    title: 'Orfebre del Valle de Elqui',
    description1: 'Soy Nicolás Cordero, orfebre con más de 15 años dedicados a la creación de joyas que cuentan historias. Cada pieza nace en mi taller en Vicuña, a los pies del Cerro Mamalluca, donde la luz nocturna y la naturaleza del Valle de Elqui inspiran cada curva y textura.',
    description2: 'Trabajo 100% artesanal, seleccionando materiales nobles y técnicas tradicionales para asegurar calidad, sostenibilidad y autenticidad en cada joya. Mi misión es crear piezas que acompañen momentos significativos con calidez y carácter.',
    experienceYears: '15+',
    handmadePercent: '100%',
    qualityBadge: 'Calidad',
    locationText: 'Ubicado en el Valle de Elqui, Vicuña, Chile, a los pies del Cerro Mamalluca.',
    processTitle: 'Proceso artesanal',
    processDesc: 'Desde el diseño hasta el pulido final, cada pieza pasa por mis manos. Uso herramientas tradicionales y técnicas de orfebrería moderna para lograr acabados delicados y duraderos.',
    processItems: 'Selección consciente de materiales y proveedores locales.\nProducción a pequeña escala para mantener la autenticidad.\nInspiración en los cielos despejados y la flora del Valle de Elqui.'
  });

  const [contactData, setContactData] = useState({
    whatsappPhone: '56931983075',
    instagramUrl: 'https://instagram.com/elqui_joyas',
    title: 'Cuéntanos tu idea',
    description: 'Envía tu mensaje y coordinamos juntos la pieza perfecta.'
  });

  // Estados de Categorías
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState('');

  // Estados de Productos
  const [products, setProducts] = useState<Jewel[]>([]);
  const [newProduct, setNewProduct] = useState<Omit<Jewel, 'id' | 'image'>>({
    name: '',
    category: '',
    description: '',
    instagramUrl: '',
    price: 0,
    available: true,
    materials: '',
    tags: ''
  });
  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Jewel | null>(null);
  const [editingImageFile, setEditingImageFile] = useState<File | null>(null);

  // Estados de carga/guardado globales
  const [isSaving, setIsSaving] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        window.location.href = '/admin/login';
      } else {
        setUser(currentUser);
        fetchData();
      }
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  const fetchData = async () => {
    try {
      // 1. Cargar datos de Portada (si existen)
      const heroDoc = await getDoc(doc(db, 'sections', 'hero'));
      if (heroDoc.exists()) setHeroData(heroDoc.data() as any);
      
      const aboutDoc = await getDoc(doc(db, 'sections', 'about'));
      if (aboutDoc.exists()) setAboutData(aboutDoc.data() as any);

      const contactDoc = await getDoc(doc(db, 'sections', 'contact'));
      if (contactDoc.exists()) setContactData(contactDoc.data() as any);

      // 2. Cargar Categorías
      const catSnapshot = await getDocs(collection(db, 'categories'));
      const catList: Category[] = [];
      catSnapshot.forEach((doc) => {
        catList.push({ id: doc.id, ...(doc.data() as { name: string }) });
      });
      setCategories(catList);

      // 3. Cargar Productos
      const prodSnapshot = await getDocs(collection(db, 'jewels'));
      const prodList: Jewel[] = [];
      prodSnapshot.forEach((doc) => {
        prodList.push({ id: doc.id, ...(doc.data() as any) });
      });
      setProducts(prodList);
    } catch (err) {
      console.error('Error fetching data from Firestore:', err);
    }
  };

  const showStatus = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = '/admin/login';
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  };

  // Importar datos iniciales si no existen
  const handleImportInitialData = async () => {
    setIsImporting(true);
    showStatus('Importando datos iniciales, por favor espera...', 'success');
    try {
      // 1. Guardar secciones predeterminadas
      await setDoc(doc(db, 'sections', 'hero'), heroData);
      await setDoc(doc(db, 'sections', 'about'), aboutData);
      await setDoc(doc(db, 'sections', 'contact'), contactData);

      // 2. Crear categorías iniciales basadas en los productos estáticos
      const initialCategories = Array.from(new Set(initialJewels.map(j => j.category)));
      const createdCats: Category[] = [];
      for (const catName of initialCategories) {
        const catId = catName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-');
        await setDoc(doc(db, 'categories', catId), { name: catName });
        createdCats.push({ id: catId, name: catName });
      }
      setCategories(createdCats);

      // 3. Importar joyas
      for (const jewel of initialJewels) {
        // Mapeamos los campos a la estructura dinámica
        const jewelData = {
          name: jewel.name,
          category: jewel.category.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-'),
          description: jewel.description,
          image: '/' + jewel.image, // Mantenemos la ruta relativa local del proyecto
          instagramUrl: jewel.instagramUrl,
          price: 45000 + Math.floor(Math.random() * 8) * 10000, // Precios de ejemplo
          available: true,
          materials: jewel.category === 'Anillo' || jewel.category === 'Aros' ? 'Plata 950' : 'Bronce, Cuero',
          tags: 'artesanal, valle-de-elqui'
        };
        await setDoc(doc(db, 'jewels', jewel.id), jewelData);
      }
      
      await fetchData();
      showStatus('Datos iniciales importados con éxito.');
    } catch (err) {
      console.error(err);
      showStatus('Error al importar los datos iniciales.', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  // Guardar datos de portada
  const handleSavePortada = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'sections', 'hero'), heroData);
      await setDoc(doc(db, 'sections', 'about'), aboutData);
      await setDoc(doc(db, 'sections', 'contact'), contactData);
      showStatus('Secciones de portada actualizadas con éxito.');
    } catch (err) {
      console.error(err);
      showStatus('Error al guardar los datos de portada.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Gestión de Categorías
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const catId = newCatName.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-');
    
    try {
      await setDoc(doc(db, 'categories', catId), { name: newCatName.trim() });
      setNewCatName('');
      await fetchData();
      showStatus('Categoría agregada con éxito.');
    } catch (err) {
      console.error(err);
      showStatus('Error al agregar categoría.', 'error');
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCatId || !editingCatName.trim()) return;
    try {
      await updateDoc(doc(db, 'categories', editingCatId), { name: editingCatName.trim() });
      setEditingCatId(null);
      setEditingCatName('');
      await fetchData();
      showStatus('Categoría actualizada con éxito.');
    } catch (err) {
      console.error(err);
      showStatus('Error al actualizar categoría.', 'error');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar esta categoría?')) return;
    try {
      await deleteDoc(doc(db, 'categories', id));
      await fetchData();
      showStatus('Categoría eliminada.');
    } catch (err) {
      console.error(err);
      showStatus('Error al eliminar categoría.', 'error');
    }
  };

  // Gestión de Productos
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.category) {
      showStatus('El nombre y la categoría son obligatorios.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      let imageUrl = '/images/jewels/joya1.png'; // Fallback por defecto

      if (productImageFile) {
        const fileRef = ref(storage, `jewels/${Date.now()}_${productImageFile.name}`);
        const uploadResult = await uploadBytes(fileRef, productImageFile);
        imageUrl = await getDownloadURL(uploadResult.ref);
      }

      const slug = newProduct.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const uniqueId = `${slug}-${Date.now().toString().slice(-4)}`;

      const productData = {
        ...newProduct,
        price: Number(newProduct.price),
        image: imageUrl
      };

      await setDoc(doc(db, 'jewels', uniqueId), productData);

      // Reset
      setNewProduct({
        name: '',
        category: '',
        description: '',
        instagramUrl: '',
        price: 0,
        available: true,
        materials: '',
        tags: ''
      });
      setProductImageFile(null);
      const fileInput = document.getElementById('productImage') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      await fetchData();
      showStatus('Producto creado con éxito.');
    } catch (err) {
      console.error(err);
      showStatus('Error al crear el producto.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditProductClick = (product: Jewel) => {
    setEditingProductId(product.id);
    setEditingProduct({ ...product });
    setEditingImageFile(null);
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProductId) return;

    setIsSaving(true);
    try {
      let imageUrl = editingProduct.image;

      if (editingImageFile) {
        const fileRef = ref(storage, `jewels/${Date.now()}_${editingImageFile.name}`);
        const uploadResult = await uploadBytes(fileRef, editingImageFile);
        imageUrl = await getDownloadURL(uploadResult.ref);
      }

      const productData = {
        name: editingProduct.name,
        category: editingProduct.category,
        description: editingProduct.description,
        instagramUrl: editingProduct.instagramUrl || '',
        price: Number(editingProduct.price) || 0,
        available: editingProduct.available ?? true,
        materials: editingProduct.materials || '',
        tags: editingProduct.tags || '',
        image: imageUrl
      };

      await updateDoc(doc(db, 'jewels', editingProductId), productData);

      setEditingProductId(null);
      setEditingProduct(null);
      setEditingImageFile(null);

      await fetchData();
      showStatus('Producto actualizado con éxito.');
    } catch (err) {
      console.error(err);
      showStatus('Error al actualizar el producto.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar este producto?')) return;
    try {
      await deleteDoc(doc(db, 'jewels', id));
      await fetchData();
      showStatus('Producto eliminado.');
    } catch (err) {
      console.error(err);
      showStatus('Error al eliminar producto.', 'error');
    }
  };

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sand">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold mx-auto"></div>
          <p className="text-neutral-600 font-medium">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col md:flex-row">
      {/* Sidebar de navegación */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-neutral-200 flex flex-col justify-between shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center font-bold text-gold">EJ</div>
            <div>
              <h2 className="font-serif font-semibold text-lg leading-tight">Elqui Joyas</h2>
              <span className="text-xs text-neutral-500">Panel de Control</span>
            </div>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('portada')}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition flex items-center gap-3 ${
                activeTab === 'portada' ? 'bg-gold/10 text-gold font-semibold' : 'text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              <span>🏠</span> Portada del Sitio
            </button>
            <button
              onClick={() => setActiveTab('categorias')}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition flex items-center gap-3 ${
                activeTab === 'categorias' ? 'bg-gold/10 text-gold font-semibold' : 'text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              <span>📁</span> Categorías
            </button>
            <button
              onClick={() => setActiveTab('productos')}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition flex items-center gap-3 ${
                activeTab === 'productos' ? 'bg-gold/10 text-gold font-semibold' : 'text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              <span>💍</span> Joyas (Catálogo)
            </button>
          </nav>
        </div>

        <div className="p-6 border-t border-neutral-100 space-y-4 bg-neutral-50/50">
          <div className="text-xs text-neutral-600">
            Conectado como <strong className="block text-neutral-800">{user?.email}</strong>
          </div>
          <button
            onClick={handleLogout}
            className="w-full inline-flex items-center justify-center px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-sm font-medium transition"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-5xl">
        {statusMessage && (
          <div
            className={`fixed top-6 right-6 z-50 p-4 rounded-xl shadow-lg border text-sm font-medium transition max-w-sm animate-bounce ${
              statusMessage.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-serif font-semibold text-neutral-900">
              {activeTab === 'portada' && 'Editar Portada'}
              {activeTab === 'categorias' && 'Gestionar Categorías'}
              {activeTab === 'productos' && 'Administrar Catálogo de Joyas'}
            </h1>
            <p className="text-neutral-600 text-sm">
              {activeTab === 'portada' && 'Actualiza los textos y configuraciones principales de la página de inicio.'}
              {activeTab === 'categorias' && 'Crea o elimina clasificaciones para agrupar tus productos.'}
              {activeTab === 'productos' && 'Añade, edita o elimina joyas de la tienda en tiempo real.'}
            </p>
          </div>

          {products.length === 0 && (
            <button
              onClick={handleImportInitialData}
              disabled={isImporting}
              className="button-ghost text-sm self-start sm:self-center"
            >
              {isImporting ? 'Importando...' : '📥 Cargar catálogo inicial'}
            </button>
          )}
        </div>

        {/* Pestaña: Portada */}
        {activeTab === 'portada' && (
          <form onSubmit={handleSavePortada} className="space-y-8">
            {/* Sección Hero */}
            <div className="card p-6 space-y-4">
              <h3 className="text-lg font-serif font-semibold border-b pb-2 text-neutral-900">Sección Inicio (Hero)</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">Badge Superior</label>
                  <input
                    type="text"
                    value={heroData.badge}
                    onChange={(e) => setHeroData({ ...heroData, badge: e.target.value })}
                    className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">Título de Portada</label>
                  <input
                    type="text"
                    value={heroData.title}
                    onChange={(e) => setHeroData({ ...heroData, title: e.target.value })}
                    className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">Descripción Principal</label>
                  <textarea
                    rows={3}
                    value={heroData.description}
                    onChange={(e) => setHeroData({ ...heroData, description: e.target.value })}
                    className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">Tarjeta Destacada: Categoría / Subtítulo</label>
                  <input
                    type="text"
                    value={heroData.featuredSub}
                    onChange={(e) => setHeroData({ ...heroData, featuredSub: e.target.value })}
                    className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">Tarjeta Destacada: Título Joya</label>
                  <input
                    type="text"
                    value={heroData.featuredTitle}
                    onChange={(e) => setHeroData({ ...heroData, featuredTitle: e.target.value })}
                    className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">Tarjeta Destacada: Descripción de Joya</label>
                  <textarea
                    rows={2}
                    value={heroData.featuredDesc}
                    onChange={(e) => setHeroData({ ...heroData, featuredDesc: e.target.value })}
                    className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Sección Acerca de */}
            <div className="card p-6 space-y-4">
              <h3 className="text-lg font-serif font-semibold border-b pb-2 text-neutral-900">Sección Acerca de</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">Título de Sección</label>
                  <input
                    type="text"
                    value={aboutData.title}
                    onChange={(e) => setAboutData({ ...aboutData, title: e.target.value })}
                    className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">Ubicación física / Leyenda</label>
                  <input
                    type="text"
                    value={aboutData.locationText}
                    onChange={(e) => setAboutData({ ...aboutData, locationText: e.target.value })}
                    className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">Párrafo Introducción 1</label>
                  <textarea
                    rows={3}
                    value={aboutData.description1}
                    onChange={(e) => setAboutData({ ...aboutData, description1: e.target.value })}
                    className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">Párrafo Introducción 2</label>
                  <textarea
                    rows={3}
                    value={aboutData.description2}
                    onChange={(e) => setAboutData({ ...aboutData, description2: e.target.value })}
                    className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">Años de Oficio</label>
                  <input
                    type="text"
                    value={aboutData.experienceYears}
                    onChange={(e) => setAboutData({ ...aboutData, experienceYears: e.target.value })}
                    className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">% Hecho a Mano</label>
                  <input
                    type="text"
                    value={aboutData.handmadePercent}
                    onChange={(e) => setAboutData({ ...aboutData, handmadePercent: e.target.value })}
                    className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm"
                  />
                </div>
                <div className="md:col-span-2 border-t pt-4 mt-2">
                  <h4 className="font-semibold text-sm text-neutral-800 mb-3">Tarjeta Proceso Artesanal</h4>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">Título Proceso</label>
                  <input
                    type="text"
                    value={aboutData.processTitle}
                    onChange={(e) => setAboutData({ ...aboutData, processTitle: e.target.value })}
                    className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">Descripción Proceso</label>
                  <textarea
                    rows={2}
                    value={aboutData.processDesc}
                    onChange={(e) => setAboutData({ ...aboutData, processDesc: e.target.value })}
                    className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">Puntos Clave (uno por línea)</label>
                  <textarea
                    rows={3}
                    value={aboutData.processItems}
                    onChange={(e) => setAboutData({ ...aboutData, processItems: e.target.value })}
                    className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-sans"
                    placeholder="Punto 1&#10;Punto 2&#10;Punto 3"
                  />
                </div>
              </div>
            </div>

            {/* Sección Contacto y Redes */}
            <div className="card p-6 space-y-4">
              <h3 className="text-lg font-serif font-semibold border-b pb-2 text-neutral-900">Sección Contacto y Redes</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">Teléfono WhatsApp (sin +)</label>
                  <input
                    type="text"
                    value={contactData.whatsappPhone}
                    onChange={(e) => setContactData({ ...contactData, whatsappPhone: e.target.value })}
                    className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm"
                    placeholder="56931983075"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">Instagram URL</label>
                  <input
                    type="url"
                    value={contactData.instagramUrl}
                    onChange={(e) => setContactData({ ...contactData, instagramUrl: e.target.value })}
                    className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">Título Formulario</label>
                  <input
                    type="text"
                    value={contactData.title}
                    onChange={(e) => setContactData({ ...contactData, title: e.target.value })}
                    className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">Descripción Formulario</label>
                  <input
                    type="text"
                    value={contactData.description}
                    onChange={(e) => setContactData({ ...contactData, description: e.target.value })}
                    className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="button-primary min-w-[150px]"
              >
                {isSaving ? 'Guardando...' : '💾 Guardar Todo'}
              </button>
            </div>
          </form>
        )}

        {/* Pestaña: Categorías */}
        {activeTab === 'categorias' && (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Crear Categoría */}
            <div className="card p-6 self-start md:col-span-1 space-y-4">
              <h3 className="text-lg font-serif font-semibold border-b pb-2 text-neutral-900">Nueva Categoría</h3>
              <form onSubmit={handleAddCategory} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">Nombre</label>
                  <input
                    type="text"
                    required
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 px-4 py-2 text-sm"
                    placeholder="Ej: Anillos"
                  />
                </div>
                <button type="submit" className="button-primary w-full text-sm">
                  Agregar
                </button>
              </form>
            </div>

            {/* Listado de Categorías */}
            <div className="card p-6 md:col-span-2 space-y-4">
              <h3 className="text-lg font-serif font-semibold border-b pb-2 text-neutral-900 font-sans">Categorías Existentes</h3>
              {categories.length === 0 ? (
                <p className="text-neutral-500 text-sm">No hay categorías creadas aún. Importa los datos iniciales o crea una.</p>
              ) : (
                <div className="divide-y divide-neutral-100">
                  {categories.map((cat) => (
                    <div key={cat.id} className="py-3 flex items-center justify-between gap-4">
                      {editingCatId === cat.id ? (
                        <form onSubmit={handleUpdateCategory} className="flex-1 flex gap-2">
                          <input
                            type="text"
                            required
                            value={editingCatName}
                            onChange={(e) => setEditingCatName(e.target.value)}
                            className="flex-1 rounded-xl border border-neutral-200 px-3 py-1.5 text-sm"
                          />
                          <button type="submit" className="px-3 py-1.5 bg-green-600 text-white rounded-xl text-xs font-semibold hover:bg-green-700">
                            Guardar
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCatId(null)}
                            className="px-3 py-1.5 bg-neutral-200 text-neutral-700 rounded-xl text-xs font-semibold hover:bg-neutral-300"
                          >
                            Cancelar
                          </button>
                        </form>
                      ) : (
                        <>
                          <div>
                            <p className="font-semibold text-neutral-800 text-sm">{cat.name}</p>
                            <p className="text-[10px] text-neutral-400 font-mono">ID/Slug: {cat.id}</p>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={() => {
                                setEditingCatId(cat.id);
                                setEditingCatName(cat.name);
                              }}
                              className="px-2.5 py-1.5 text-neutral-700 border border-neutral-200 rounded-lg text-xs font-semibold hover:bg-neutral-50 transition"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(cat.id)}
                              className="px-2.5 py-1.5 text-red-600 border border-red-100 hover:bg-red-50 rounded-lg text-xs font-semibold transition"
                            >
                              Eliminar
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pestaña: Catálogo de Joyas */}
        {activeTab === 'productos' && (
          <div className="space-y-8">
            {/* Formulario Crear/Editar Producto */}
            <div className="card p-6 space-y-4">
              <h3 className="text-lg font-serif font-semibold border-b pb-2 text-neutral-900">
                {editingProductId ? `Editar Joya: ${editingProduct?.name}` : 'Añadir Nueva Joya'}
              </h3>
              
              <form
                onSubmit={editingProductId ? handleUpdateProduct : handleAddProduct}
                className="grid md:grid-cols-2 gap-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">Nombre de la Joya</label>
                  <input
                    type="text"
                    required
                    value={editingProductId ? (editingProduct?.name || '') : newProduct.name}
                    onChange={(e) => {
                      if (editingProductId && editingProduct) {
                        setEditingProduct({ ...editingProduct, name: e.target.value });
                      } else {
                        setNewProduct({ ...newProduct, name: e.target.value });
                      }
                    }}
                    className="w-full rounded-xl border border-neutral-200 px-4 py-2 text-sm"
                    placeholder="Ej: Anillo Sol Andino"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">Categoría</label>
                  <select
                    required
                    value={editingProductId ? (editingProduct?.category || '') : newProduct.category}
                    onChange={(e) => {
                      if (editingProductId && editingProduct) {
                        setEditingProduct({ ...editingProduct, category: e.target.value });
                      } else {
                        setNewProduct({ ...newProduct, category: e.target.value });
                      }
                    }}
                    className="w-full rounded-xl border border-neutral-200 px-4 py-2 text-sm"
                  >
                    <option value="">Selecciona una categoría</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">Precio (CLP)</label>
                  <input
                    type="number"
                    value={editingProductId ? (editingProduct?.price || 0) : newProduct.price}
                    onChange={(e) => {
                      if (editingProductId && editingProduct) {
                        setEditingProduct({ ...editingProduct, price: Number(e.target.value) });
                      } else {
                        setNewProduct({ ...newProduct, price: Number(e.target.value) });
                      }
                    }}
                    className="w-full rounded-xl border border-neutral-200 px-4 py-2 text-sm"
                    placeholder="Ej: 55000"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">URL de Instagram (opcional)</label>
                  <input
                    type="url"
                    value={editingProductId ? (editingProduct?.instagramUrl || '') : newProduct.instagramUrl}
                    onChange={(e) => {
                      if (editingProductId && editingProduct) {
                        setEditingProduct({ ...editingProduct, instagramUrl: e.target.value });
                      } else {
                        setNewProduct({ ...newProduct, instagramUrl: e.target.value });
                      }
                    }}
                    className="w-full rounded-xl border border-neutral-200 px-4 py-2 text-sm"
                    placeholder="https://instagram.com/p/..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">Materiales</label>
                  <input
                    type="text"
                    value={editingProductId ? (editingProduct?.materials || '') : newProduct.materials}
                    onChange={(e) => {
                      if (editingProductId && editingProduct) {
                        setEditingProduct({ ...editingProduct, materials: e.target.value });
                      } else {
                        setNewProduct({ ...newProduct, materials: e.target.value });
                      }
                    }}
                    className="w-full rounded-xl border border-neutral-200 px-4 py-2 text-sm"
                    placeholder="Ej: Plata 950, Lapislázuli"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">Etiquetas (separadas por coma)</label>
                  <input
                    type="text"
                    value={editingProductId ? (editingProduct?.tags || '') : newProduct.tags}
                    onChange={(e) => {
                      if (editingProductId && editingProduct) {
                        setEditingProduct({ ...editingProduct, tags: e.target.value });
                      } else {
                        setNewProduct({ ...newProduct, tags: e.target.value });
                      }
                    }}
                    className="w-full rounded-xl border border-neutral-200 px-4 py-2 text-sm"
                    placeholder="Ej: único, mamalluca, plata"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">Descripción</label>
                  <textarea
                    rows={3}
                    value={editingProductId ? (editingProduct?.description || '') : newProduct.description}
                    onChange={(e) => {
                      if (editingProductId && editingProduct) {
                        setEditingProduct({ ...editingProduct, description: e.target.value });
                      } else {
                        setNewProduct({ ...newProduct, description: e.target.value });
                      }
                    }}
                    className="w-full rounded-xl border border-neutral-200 px-4 py-2 text-sm"
                    placeholder="Describe los detalles de la pieza..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">Imagen del Producto</label>
                  <input
                    type="file"
                    id="productImage"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      if (editingProductId) {
                        setEditingImageFile(file);
                      } else {
                        setProductImageFile(file);
                      }
                    }}
                    className="w-full text-sm text-neutral-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-gold/10 file:text-gold hover:file:bg-gold/20"
                  />
                  {editingProductId && editingProduct?.image && !editingImageFile && (
                    <p className="text-[10px] text-neutral-500 mt-1">Actualmente: {editingProduct.image.slice(0, 50)}...</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="productAvailable"
                    checked={editingProductId ? (editingProduct?.available ?? true) : newProduct.available}
                    onChange={(e) => {
                      if (editingProductId && editingProduct) {
                        setEditingProduct({ ...editingProduct, available: e.target.checked });
                      } else {
                        setNewProduct({ ...newProduct, available: e.target.checked });
                      }
                    }}
                    className="h-4 w-4 text-gold border-neutral-300 rounded focus:ring-gold"
                  />
                  <label htmlFor="productAvailable" className="text-sm font-medium text-neutral-700">
                    Disponible para venta/encargo
                  </label>
                </div>

                <div className="md:col-span-2 flex justify-end gap-2 pt-2 border-t mt-2">
                  {editingProductId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProductId(null);
                        setEditingProduct(null);
                        setEditingImageFile(null);
                      }}
                      className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 rounded-xl text-sm font-semibold transition"
                    >
                      Cancelar Edición
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="button-primary min-w-[120px] text-sm"
                  >
                    {isSaving ? 'Guardando...' : (editingProductId ? 'Actualizar Joya' : 'Añadir Joya')}
                  </button>
                </div>
              </form>
            </div>

            {/* Listado de Productos */}
            <div className="card p-6 space-y-4">
              <h3 className="text-lg font-serif font-semibold border-b pb-2 text-neutral-900">Listado de Joyas</h3>
              {products.length === 0 ? (
                <p className="text-neutral-500 text-sm">No hay joyas creadas en la base de datos.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-neutral-600">
                    <thead>
                      <tr className="border-b border-neutral-200 text-neutral-500 text-xs uppercase">
                        <th className="py-3 px-2">Imagen</th>
                        <th className="py-3 px-2">Nombre</th>
                        <th className="py-3 px-2">Categoría</th>
                        <th className="py-3 px-2">Precio</th>
                        <th className="py-3 px-2">Estado</th>
                        <th className="py-3 px-2 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {products.map((prod) => (
                        <tr key={prod.id} className="hover:bg-neutral-50/50 transition">
                          <td className="py-3 px-2">
                            <img
                              src={prod.image}
                              alt={prod.name}
                              className="w-10 h-10 object-cover rounded-lg border border-neutral-200"
                            />
                          </td>
                          <td className="py-3 px-2 font-medium text-neutral-900">{prod.name}</td>
                          <td className="py-3 px-2">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800">
                              {categories.find(c => c.id === prod.category)?.name || prod.category}
                            </span>
                          </td>
                          <td className="py-3 px-2 font-semibold">
                            {prod.price ? `$${prod.price.toLocaleString('es-CL')}` : 'N/A'}
                          </td>
                          <td className="py-3 px-2">
                            {prod.available ? (
                              <span className="text-green-600 text-xs font-semibold">🟢 Disponible</span>
                            ) : (
                              <span className="text-red-500 text-xs font-semibold">🔴 Agotado</span>
                            )}
                          </td>
                          <td className="py-3 px-2 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleEditProductClick(prod)}
                                className="px-2 py-1 text-xs font-semibold text-neutral-700 border border-neutral-200 rounded-md hover:bg-neutral-50"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(prod.id)}
                                className="px-2 py-1 text-xs font-semibold text-red-600 border border-red-100 hover:bg-red-50 rounded-md"
                              >
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
