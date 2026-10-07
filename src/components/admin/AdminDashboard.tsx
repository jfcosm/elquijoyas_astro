import React, { useState, useEffect } from 'react';
import { auth, db, storage } from '../../services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
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

export interface ReelItem {
  id: string;
  title: string;
  url: string;
  caption?: string;
  thumbnail?: string;
  tag?: string;
}

const defaultReelsData: ReelItem[] = [
  {
    id: 'reel-1',
    title: 'Cincelado y Texturas Lunares en Plata',
    url: 'https://www.instagram.com/elqui_joyas',
    caption: 'Dando forma a los relieves inspirados en los cráteres lunares del Cerro Mamalluca.',
    thumbnail: '/images/jewels/joya1.png',
    tag: 'Proceso de Forja'
  },
  {
    id: 'reel-2',
    title: 'Engaste de Cuarzo y Piedra Verde',
    url: 'https://www.instagram.com/elqui_joyas',
    caption: 'Fijación milimétrica de gemas nobles seleccionadas en el Valle de Elqui.',
    thumbnail: '/images/jewels/joya2.png',
    tag: 'Engaste Artesanal'
  },
  {
    id: 'reel-3',
    title: 'Fundición de Bronce & Pulido Espejo',
    url: 'https://www.instagram.com/elqui_joyas',
    caption: 'El brillo cálido del metal dorado tras horas de acabado a mano.',
    thumbnail: '/images/jewels/joya3.png',
    tag: 'Acabado & Pulido'
  }
];

const AdminDashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<'portada' | 'reels' | 'categorias' | 'productos'>('portada');

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

  // Estados de Sección Videos/Reels
  const [reelsSectionData, setReelsSectionData] = useState({
    badge: 'El Taller en Vivo',
    title: 'Procesos, Forja & Mística en Video',
    description: 'Mira el fuego, el martillo y la dedicación detrás de cada joya hecha a mano. Síguenos en Instagram para ver nuevos procesos y piezas en creación.',
    instagramUrl: 'https://instagram.com/elquijoyas'
  });

  const [reelsList, setReelsList] = useState<ReelItem[]>([]);
  const [newReel, setNewReel] = useState<Omit<ReelItem, 'id'>>({
    title: '',
    url: '',
    caption: '',
    tag: 'Proceso de Forja',
    thumbnail: ''
  });
  const [reelImageFile, setReelImageFile] = useState<File | null>(null);
  const [editingReelId, setEditingReelId] = useState<string | null>(null);
  const [editingReel, setEditingReel] = useState<ReelItem | null>(null);
  const [editingReelImageFile, setEditingReelImageFile] = useState<File | null>(null);

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

      const reelsSecDoc = await getDoc(doc(db, 'sections', 'reels'));
      if (reelsSecDoc.exists()) setReelsSectionData(reelsSecDoc.data() as any);

      // 2. Cargar Categorías
      const catSnapshot = await getDocs(collection(db, 'categories'));
      const catList: Category[] = [];
      catSnapshot.forEach((d) => {
        catList.push({ id: d.id, ...(d.data() as { name: string }) });
      });
      setCategories(catList);

      // 3. Cargar Productos
      const prodSnapshot = await getDocs(collection(db, 'jewels'));
      const prodList: Jewel[] = [];
      prodSnapshot.forEach((d) => {
        prodList.push({ id: d.id, ...(d.data() as any) });
      });
      setProducts(prodList);

      // 4. Cargar Reels
      const reelsSnapshot = await getDocs(collection(db, 'reels'));
      const loadedReels: ReelItem[] = [];
      reelsSnapshot.forEach((d) => {
        loadedReels.push({ id: d.id, ...(d.data() as any) });
      });
      setReelsList(loadedReels.length > 0 ? loadedReels : defaultReelsData);
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
      await setDoc(doc(db, 'sections', 'reels'), reelsSectionData);

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
        const jewelData = {
          name: jewel.name,
          category: jewel.category.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-'),
          description: jewel.description,
          image: '/' + jewel.image,
          instagramUrl: jewel.instagramUrl,
          price: 45000 + Math.floor(Math.random() * 8) * 10000,
          available: true,
          materials: jewel.category === 'Anillo' || jewel.category === 'Aros' ? 'Plata 950' : 'Bronce, Cuero',
          tags: 'artesanal, valle-de-elqui'
        };
        await setDoc(doc(db, 'jewels', jewel.id), jewelData);
      }

      // 4. Importar reels de ejemplo
      for (const reel of defaultReelsData) {
        await setDoc(doc(db, 'reels', reel.id), reel);
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

  // Guardar datos de la sección Reels/Videos
  const handleSaveReelsSection = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'sections', 'reels'), reelsSectionData);
      showStatus('Configuración de la sección de videos actualizada.');
    } catch (err) {
      console.error(err);
      showStatus('Error al guardar la configuración de videos.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Gestión de Videos/Reels
  const handleAddReel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReel.title.trim() || !newReel.url.trim()) {
      showStatus('El título y el enlace de Instagram son obligatorios.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      let thumbnail = newReel.thumbnail || '/images/logo-watercolor.jpg';

      if (reelImageFile) {
        const fileRef = ref(storage, `reels/${Date.now()}_${reelImageFile.name}`);
        const uploadResult = await uploadBytes(fileRef, reelImageFile);
        thumbnail = await getDownloadURL(uploadResult.ref);
      }

      const reelId = `reel-${Date.now().toString().slice(-6)}`;
      const reelData: ReelItem = {
        id: reelId,
        title: newReel.title.trim(),
        url: newReel.url.trim(),
        caption: newReel.caption || '',
        tag: newReel.tag || 'Taller en Vivo',
        thumbnail
      };

      await setDoc(doc(db, 'reels', reelId), reelData);

      // Reset
      setNewReel({
        title: '',
        url: '',
        caption: '',
        tag: 'Proceso de Forja',
        thumbnail: ''
      });
      setReelImageFile(null);
      const fileInput = document.getElementById('reelImage') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      await fetchData();
      showStatus('Video de Instagram agregado con éxito.');
    } catch (err) {
      console.error(err);
      showStatus('Error al agregar el video de Instagram.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditReelClick = (reel: ReelItem) => {
    setEditingReelId(reel.id);
    setEditingReel({ ...reel });
    setEditingReelImageFile(null);
  };

  const handleUpdateReel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReel || !editingReelId) return;

    setIsSaving(true);
    try {
      let thumbnail = editingReel.thumbnail || '/images/logo-watercolor.jpg';

      if (editingReelImageFile) {
        const fileRef = ref(storage, `reels/${Date.now()}_${editingReelImageFile.name}`);
        const uploadResult = await uploadBytes(fileRef, editingReelImageFile);
        thumbnail = await getDownloadURL(uploadResult.ref);
      }

      const reelData = {
        title: editingReel.title.trim(),
        url: editingReel.url.trim(),
        caption: editingReel.caption || '',
        tag: editingReel.tag || 'Taller en Vivo',
        thumbnail
      };

      await updateDoc(doc(db, 'reels', editingReelId), reelData);

      setEditingReelId(null);
      setEditingReel(null);
      setEditingReelImageFile(null);

      await fetchData();
      showStatus('Video actualizado con éxito.');
    } catch (err) {
      console.error(err);
      showStatus('Error al actualizar el video.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteReel = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar este video?')) return;
    try {
      await deleteDoc(doc(db, 'reels', id));
      await fetchData();
      showStatus('Video eliminado.');
    } catch (err) {
      console.error(err);
      showStatus('Error al eliminar video.', 'error');
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
      let imageUrl = '/images/jewels/joya1.png';

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
      <div className="min-h-screen flex items-center justify-center bg-[#FAF6F0]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald mx-auto"></div>
          <p className="text-ink-medium font-serif">Verificando sesión del taller...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex flex-col md:flex-row text-ink-deep">
      {/* Sidebar de navegación */}
      <aside className="w-full md:w-64 bg-white/90 backdrop-blur-md border-b md:border-b-0 md:border-r border-[#E8DFC8] flex flex-col justify-between shrink-0 shadow-sm">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border border-[#D4C3AE] bg-white p-0.5 shrink-0 shadow-sm">
              <img src="/images/logo-watercolor.jpg" alt="Logo" className="w-full h-full object-cover rounded-xl" />
            </div>
            <div>
              <h2 className="font-serif font-semibold text-lg leading-tight text-ink-deep">Elqui Joyas</h2>
              <span className="text-xs uppercase tracking-wider text-emerald font-semibold">Panel de Control</span>
            </div>
          </div>

          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab('portada')}
              className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-medium transition flex items-center gap-3 ${
                activeTab === 'portada' ? 'bg-emerald text-white font-semibold shadow-md' : 'text-ink-medium hover:bg-emerald-light/50'
              }`}
            >
              <span>🏠</span> Portada del Sitio
            </button>
            <button
              onClick={() => setActiveTab('reels')}
              className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-medium transition flex items-center gap-3 ${
                activeTab === 'reels' ? 'bg-emerald text-white font-semibold shadow-md' : 'text-ink-medium hover:bg-emerald-light/50'
              }`}
            >
              <span>🎥</span> Videos & Reels Instagram
            </button>
            <button
              onClick={() => setActiveTab('categorias')}
              className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-medium transition flex items-center gap-3 ${
                activeTab === 'categorias' ? 'bg-emerald text-white font-semibold shadow-md' : 'text-ink-medium hover:bg-emerald-light/50'
              }`}
            >
              <span>📁</span> Categorías
            </button>
            <button
              onClick={() => setActiveTab('productos')}
              className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-medium transition flex items-center gap-3 ${
                activeTab === 'productos' ? 'bg-emerald text-white font-semibold shadow-md' : 'text-ink-medium hover:bg-emerald-light/50'
              }`}
            >
              <span>💍</span> Joyas (Catálogo)
            </button>

            <div className="pt-2">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-left px-4 py-3 rounded-2xl text-sm font-medium transition flex items-center justify-between text-ink-medium bg-emerald-light/30 hover:bg-emerald-light/70 border border-emerald/20 group"
              >
                <div className="flex items-center gap-3">
                  <span>🌐</span>
                  <span className="font-semibold text-emerald-dark">Ver Landing Page</span>
                </div>
                <span className="text-xs text-emerald group-hover:translate-x-0.5 transition-transform">↗</span>
              </a>
            </div>
          </nav>
        </div>

        <div className="p-6 border-t border-[#E8DFC8] space-y-4 bg-white/50">
          <div className="text-xs text-ink-muted">
            Conectado como <strong className="block text-ink-deep">{user?.email}</strong>
          </div>
          <button
            onClick={handleLogout}
            className="w-full inline-flex items-center justify-center px-4 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-2xl text-xs font-semibold tracking-wider uppercase transition"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-5xl">
        {statusMessage && (
          <div
            className={`fixed top-6 right-6 z-50 p-4 rounded-2xl shadow-xl border text-sm font-medium transition max-w-sm animate-bounce ${
              statusMessage.type === 'success'
                ? 'bg-emerald-light border-emerald text-emerald-dark'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-ink-deep">
              {activeTab === 'portada' && 'Editar Portada'}
              {activeTab === 'reels' && 'Configurar Videos de Instagram (Reels)'}
              {activeTab === 'categorias' && 'Gestionar Categorías'}
              {activeTab === 'productos' && 'Administrar Catálogo de Joyas'}
            </h1>
            <p className="text-ink-medium text-sm mt-1">
              {activeTab === 'portada' && 'Actualiza los textos y configuraciones principales de la página de inicio.'}
              {activeTab === 'reels' && 'Gestiona los videos de Instagram y reels de procesos del taller.'}
              {activeTab === 'categorias' && 'Crea o elimina clasificaciones para agrupar tus productos.'}
              {activeTab === 'productos' && 'Añade, edita o elimina joyas de la tienda en tiempo real.'}
            </p>
          </div>

          {products.length === 0 && (
            <button
              onClick={handleImportInitialData}
              disabled={isImporting}
              className="button-ghost text-xs font-semibold self-start sm:self-center"
            >
              {isImporting ? 'Importando...' : '📥 Cargar catálogo inicial'}
            </button>
          )}
        </div>

        {/* Pestaña: Portada */}
        {activeTab === 'portada' && (
          <form onSubmit={handleSavePortada} className="space-y-8">
            {/* Sección Hero */}
            <div className="card p-6 sm:p-8 space-y-4 bg-white/90 border-[#E8DFC8]">
              <h3 className="text-xl font-serif font-semibold border-b border-[#EBDDCB] pb-2 text-ink-deep">Sección Inicio (Hero)</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink-muted uppercase mb-1">Badge Superior</label>
                  <input
                    type="text"
                    value={heroData.badge}
                    onChange={(e) => setHeroData({ ...heroData, badge: e.target.value })}
                    className="w-full rounded-2xl border border-[#E0CCB4] bg-[#FAF6F0] px-4 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-muted uppercase mb-1">Título Principal</label>
                  <input
                    type="text"
                    value={heroData.title}
                    onChange={(e) => setHeroData({ ...heroData, title: e.target.value })}
                    className="w-full rounded-2xl border border-[#E0CCB4] bg-[#FAF6F0] px-4 py-2.5 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-muted uppercase mb-1">Descripción del Hero</label>
                <textarea
                  rows={3}
                  value={heroData.description}
                  onChange={(e) => setHeroData({ ...heroData, description: e.target.value })}
                  className="w-full rounded-2xl border border-[#E0CCB4] bg-[#FAF6F0] px-4 py-2.5 text-sm"
                ></textarea>
              </div>
            </div>

            {/* Sección Acerca de */}
            <div className="card p-6 sm:p-8 space-y-4 bg-white/90 border-[#E8DFC8]">
              <h3 className="text-xl font-serif font-semibold border-b border-[#EBDDCB] pb-2 text-ink-deep">Sección Acerca de Nicolás Cordero</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink-muted uppercase mb-1">Título</label>
                  <input
                    type="text"
                    value={aboutData.title}
                    onChange={(e) => setAboutData({ ...aboutData, title: e.target.value })}
                    className="w-full rounded-2xl border border-[#E0CCB4] bg-[#FAF6F0] px-4 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-muted uppercase mb-1">Badge</label>
                  <input
                    type="text"
                    value={aboutData.badge}
                    onChange={(e) => setAboutData({ ...aboutData, badge: e.target.value })}
                    className="w-full rounded-2xl border border-[#E0CCB4] bg-[#FAF6F0] px-4 py-2.5 text-sm"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink-muted uppercase mb-1">Párrafo 1</label>
                  <textarea
                    rows={4}
                    value={aboutData.description1}
                    onChange={(e) => setAboutData({ ...aboutData, description1: e.target.value })}
                    className="w-full rounded-2xl border border-[#E0CCB4] bg-[#FAF6F0] px-4 py-2.5 text-sm"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-muted uppercase mb-1">Párrafo 2</label>
                  <textarea
                    rows={4}
                    value={aboutData.description2}
                    onChange={(e) => setAboutData({ ...aboutData, description2: e.target.value })}
                    className="w-full rounded-2xl border border-[#E0CCB4] bg-[#FAF6F0] px-4 py-2.5 text-sm"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Sección Contacto */}
            <div className="card p-6 sm:p-8 space-y-4 bg-white/90 border-[#E8DFC8]">
              <h3 className="text-xl font-serif font-semibold border-b border-[#EBDDCB] pb-2 text-ink-deep">Sección Contacto & Redes</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink-muted uppercase mb-1">Teléfono WhatsApp</label>
                  <input
                    type="text"
                    value={contactData.whatsappPhone}
                    onChange={(e) => setContactData({ ...contactData, whatsappPhone: e.target.value })}
                    className="w-full rounded-2xl border border-[#E0CCB4] bg-[#FAF6F0] px-4 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-muted uppercase mb-1">URL Instagram</label>
                  <input
                    type="text"
                    value={contactData.instagramUrl}
                    onChange={(e) => setContactData({ ...contactData, instagramUrl: e.target.value })}
                    className="w-full rounded-2xl border border-[#E0CCB4] bg-[#FAF6F0] px-4 py-2.5 text-sm"
                  />
                </div>
              </div>
            </div>

            <button type="submit" disabled={isSaving} className="button-primary !py-3.5 !px-8 text-sm">
              {isSaving ? 'Guardando cambios...' : 'Guardar Textos de Portada ✦'}
            </button>
          </form>
        )}

        {/* Pestaña: Reels / Videos de Instagram */}
        {activeTab === 'reels' && (
          <div className="space-y-8">
            {/* 1. Configuración de la Sección */}
            <form onSubmit={handleSaveReelsSection} className="card p-6 sm:p-8 space-y-4 bg-white/90 border-[#E8DFC8]">
              <h3 className="text-xl font-serif font-semibold border-b border-[#EBDDCB] pb-2 text-ink-deep flex items-center justify-between">
                <span>1. Textos Generales de la Sección de Videos</span>
                <span className="text-xs uppercase font-sans text-emerald font-semibold">Portada</span>
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink-muted uppercase mb-1">Insignia / Badge</label>
                  <input
                    type="text"
                    value={reelsSectionData.badge}
                    onChange={(e) => setReelsSectionData({ ...reelsSectionData, badge: e.target.value })}
                    className="w-full rounded-2xl border border-[#E0CCB4] bg-[#FAF6F0] px-4 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-muted uppercase mb-1">Título de la Sección</label>
                  <input
                    type="text"
                    value={reelsSectionData.title}
                    onChange={(e) => setReelsSectionData({ ...reelsSectionData, title: e.target.value })}
                    className="w-full rounded-2xl border border-[#E0CCB4] bg-[#FAF6F0] px-4 py-2.5 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-muted uppercase mb-1">Descripción / Bajada</label>
                <textarea
                  rows={2}
                  value={reelsSectionData.description}
                  onChange={(e) => setReelsSectionData({ ...reelsSectionData, description: e.target.value })}
                  className="w-full rounded-2xl border border-[#E0CCB4] bg-[#FAF6F0] px-4 py-2.5 text-sm"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-muted uppercase mb-1">Enlace Cuenta de Instagram</label>
                <input
                  type="url"
                  value={reelsSectionData.instagramUrl}
                  onChange={(e) => setReelsSectionData({ ...reelsSectionData, instagramUrl: e.target.value })}
                  className="w-full rounded-2xl border border-[#E0CCB4] bg-[#FAF6F0] px-4 py-2.5 text-sm"
                  placeholder="https://instagram.com/elquijoyas"
                />
              </div>

              <div className="pt-2">
                <button type="submit" disabled={isSaving} className="button-primary !py-2.5 !px-6 text-xs">
                  {isSaving ? 'Guardando...' : 'Guardar Textos de la Sección ✦'}
                </button>
              </div>
            </form>

            {/* 2. Agregar Nuevo Video / Reel */}
            <div className="card p-6 sm:p-8 space-y-4 bg-white/90 border-[#E8DFC8]">
              <h3 className="text-xl font-serif font-semibold border-b border-[#EBDDCB] pb-2 text-ink-deep">
                2. Añadir Nuevo Video o Reel de Instagram
              </h3>
              
              <form onSubmit={handleAddReel} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-ink-muted uppercase mb-1">
                      Título del Video / Proceso *
                    </label>
                    <input
                      type="text"
                      required
                      value={newReel.title}
                      onChange={(e) => setNewReel({ ...newReel, title: e.target.value })}
                      placeholder="Ej. Cincelado de Plata y Piedra Luna"
                      className="w-full rounded-2xl border border-[#E0CCB4] bg-[#FAF6F0] px-4 py-2.5 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink-muted uppercase mb-1">
                      Enlace del Reel de Instagram *
                    </label>
                    <input
                      type="url"
                      required
                      value={newReel.url}
                      onChange={(e) => setNewReel({ ...newReel, url: e.target.value })}
                      placeholder="https://www.instagram.com/reel/C8XYZ12345/ o https://instagram.com/p/..."
                      className="w-full rounded-2xl border border-[#E0CCB4] bg-[#FAF6F0] px-4 py-2.5 text-sm"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-ink-muted uppercase mb-1">
                      Etiqueta Temática
                    </label>
                    <input
                      type="text"
                      value={newReel.tag}
                      onChange={(e) => setNewReel({ ...newReel, tag: e.target.value })}
                      placeholder="Ej. Proceso de Forja, Engaste, Nueva Joya"
                      className="w-full rounded-2xl border border-[#E0CCB4] bg-[#FAF6F0] px-4 py-2.5 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink-muted uppercase mb-1">
                      Imagen de Portada (Opcional)
                    </label>
                    <input
                      id="reelImage"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setReelImageFile(e.target.files ? e.target.files[0] : null)}
                      className="w-full text-xs text-ink-muted file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-light file:text-emerald-dark hover:file:bg-emerald hover:file:text-white transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-muted uppercase mb-1">
                    Pie de foto / Descripción Corta
                  </label>
                  <textarea
                    rows={2}
                    value={newReel.caption}
                    onChange={(e) => setNewReel({ ...newReel, caption: e.target.value })}
                    placeholder="Breve explicación de la técnica o mineral que se muestra en el video..."
                    className="w-full rounded-2xl border border-[#E0CCB4] bg-[#FAF6F0] px-4 py-2.5 text-sm"
                  ></textarea>
                </div>

                <button type="submit" disabled={isSaving} className="button-primary !py-3 !px-7 text-xs">
                  {isSaving ? 'Subiendo video...' : 'Publicar Video en la Web ✦'}
                </button>
              </form>
            </div>

            {/* 3. Modal o Formulario de Edición */}
            {editingReel && (
              <div className="card p-6 sm:p-8 space-y-4 bg-white border-2 border-emerald shadow-xl animate-fade-in">
                <div className="flex items-center justify-between border-b border-[#EBDDCB] pb-2">
                  <h3 className="text-xl font-serif font-semibold text-ink-deep">
                    ✏️ Editar Video: {editingReel.title}
                  </h3>
                  <button
                    onClick={() => {
                      setEditingReel(null);
                      setEditingReelId(null);
                    }}
                    className="text-xs text-ink-muted hover:text-red-500 font-bold"
                  >
                    Cancelar ✕
                  </button>
                </div>

                <form onSubmit={handleUpdateReel} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-ink-muted uppercase mb-1">Título</label>
                      <input
                        type="text"
                        required
                        value={editingReel.title}
                        onChange={(e) => setEditingReel({ ...editingReel, title: e.target.value })}
                        className="w-full rounded-2xl border border-[#E0CCB4] bg-[#FAF6F0] px-4 py-2.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-ink-muted uppercase mb-1">Enlace de Instagram</label>
                      <input
                        type="url"
                        required
                        value={editingReel.url}
                        onChange={(e) => setEditingReel({ ...editingReel, url: e.target.value })}
                        className="w-full rounded-2xl border border-[#E0CCB4] bg-[#FAF6F0] px-4 py-2.5 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-ink-muted uppercase mb-1">Etiqueta</label>
                      <input
                        type="text"
                        value={editingReel.tag}
                        onChange={(e) => setEditingReel({ ...editingReel, tag: e.target.value })}
                        className="w-full rounded-2xl border border-[#E0CCB4] bg-[#FAF6F0] px-4 py-2.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-ink-muted uppercase mb-1">Cambiar Portada</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setEditingReelImageFile(e.target.files ? e.target.files[0] : null)}
                        className="w-full text-xs text-ink-muted file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-light file:text-emerald-dark"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink-muted uppercase mb-1">Descripción</label>
                    <textarea
                      rows={2}
                      value={editingReel.caption}
                      onChange={(e) => setEditingReel({ ...editingReel, caption: e.target.value })}
                      className="w-full rounded-2xl border border-[#E0CCB4] bg-[#FAF6F0] px-4 py-2.5 text-sm"
                    ></textarea>
                  </div>

                  <div className="flex gap-3">
                    <button type="submit" disabled={isSaving} className="button-primary !py-2.5 !px-6 text-xs">
                      {isSaving ? 'Guardando...' : 'Actualizar Video'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingReel(null);
                        setEditingReelId(null);
                      }}
                      className="button-ghost !py-2.5 !px-5 text-xs"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 4. Listado de Videos Activos */}
            <div className="card p-6 sm:p-8 space-y-4 bg-white/90 border-[#E8DFC8]">
              <h3 className="text-xl font-serif font-semibold border-b border-[#EBDDCB] pb-2 text-ink-deep flex items-center justify-between">
                <span>3. Videos Publicados ({reelsList.length})</span>
              </h3>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {reelsList.map((reel) => (
                  <div key={reel.id} className="card p-4 flex flex-col justify-between gap-3 border border-[#EBDDCB] bg-white">
                    <div className="space-y-2">
                      <div className="aspect-[4/3] rounded-xl overflow-hidden bg-[#FAF6F0] relative border border-[#EBDDCB]">
                        <img
                          src={reel.thumbnail || '/images/logo-watercolor.jpg'}
                          alt={reel.title}
                          className="w-full h-full object-cover"
                        />
                        {reel.tag && (
                          <span className="absolute top-2 left-2 bg-white/90 text-emerald-dark px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">
                            {reel.tag}
                          </span>
                        )}
                      </div>
                      <h4 className="font-serif font-bold text-base text-ink-deep leading-snug">{reel.title}</h4>
                      {reel.caption && (
                        <p className="text-xs text-ink-medium line-clamp-2">{reel.caption}</p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-[#EBDDCB] flex items-center justify-between gap-2">
                      <a
                        href={reel.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-semibold text-emerald hover:underline truncate max-w-[120px]"
                      >
                        Abrir Reel ↗
                      </a>
                      <div className="flex gap-1.5 shrink-0">
                        <button
                          onClick={() => handleEditReelClick(reel)}
                          className="px-2.5 py-1 text-xs font-semibold bg-emerald-light/60 text-emerald-dark hover:bg-emerald hover:text-white rounded-lg transition"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteReel(reel.id)}
                          className="px-2.5 py-1 text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Pestaña: Categorías */}
        {activeTab === 'categorias' && (
          <div className="space-y-6">
            <div className="card p-6 space-y-4 bg-white/90 border-[#E8DFC8]">
              <h3 className="text-lg font-serif font-semibold border-b border-[#EBDDCB] pb-2 text-ink-deep">Crear Nueva Categoría</h3>
              <form onSubmit={handleAddCategory} className="flex gap-4">
                <input
                  type="text"
                  placeholder="Nombre de la categoría (Ej. Collares, Anillos)"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="flex-1 rounded-2xl border border-[#E0CCB4] bg-[#FAF6F0] px-4 py-2.5 text-sm"
                />
                <button type="submit" className="button-primary !py-2.5 !px-6 text-xs">
                  Añadir Categoría
                </button>
              </form>
            </div>

            {/* Listado de Categorías */}
            <div className="card p-6 space-y-4 bg-white/90 border-[#E8DFC8]">
              <h3 className="text-lg font-serif font-semibold border-b border-[#EBDDCB] pb-2 text-ink-deep">Categorías Existentes ({categories.length})</h3>
              <div className="divide-y divide-[#EBDDCB]">
                {categories.map((cat) => (
                  <div key={cat.id} className="py-3 flex items-center justify-between">
                    {editingCatId === cat.id ? (
                      <form onSubmit={handleUpdateCategory} className="flex gap-2 flex-1 mr-4">
                        <input
                          type="text"
                          value={editingCatName}
                          onChange={(e) => setEditingCatName(e.target.value)}
                          className="flex-1 rounded-xl border border-[#E0CCB4] px-3 py-1.5 text-sm"
                        />
                        <button type="submit" className="button-primary !py-1 !px-3 text-xs">
                          Guardar
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCatId(null)}
                          className="button-ghost !py-1 !px-3 text-xs"
                        >
                          Cancelar
                        </button>
                      </form>
                    ) : (
                      <span className="font-medium text-sm text-ink-deep">{cat.name}</span>
                    )}

                    {editingCatId !== cat.id && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingCatId(cat.id);
                            setEditingCatName(cat.name);
                          }}
                          className="px-3 py-1 text-xs font-semibold text-ink-medium hover:text-emerald border border-[#E0CCB4] rounded-lg"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 rounded-lg"
                        >
                          Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Pestaña: Productos */}
        {activeTab === 'productos' && (
          <div className="space-y-6">
            <div className="card p-6 sm:p-8 space-y-4 bg-white/90 border-[#E8DFC8]">
              <h3 className="text-xl font-serif font-semibold border-b border-[#EBDDCB] pb-2 text-ink-deep">
                {editingProductId ? '✏️ Editar Joya' : 'Añadir Nueva Joya'}
              </h3>
              
              <form onSubmit={editingProductId ? handleUpdateProduct : handleAddProduct} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-ink-muted uppercase mb-1">Nombre de la Joya *</label>
                    <input
                      type="text"
                      required
                      value={editingProductId && editingProduct ? editingProduct.name : newProduct.name}
                      onChange={(e) => {
                        if (editingProductId && editingProduct) {
                          setEditingProduct({ ...editingProduct, name: e.target.value });
                        } else {
                          setNewProduct({ ...newProduct, name: e.target.value });
                        }
                      }}
                      className="w-full rounded-2xl border border-[#E0CCB4] bg-[#FAF6F0] px-4 py-2.5 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink-muted uppercase mb-1">Categoría *</label>
                    <select
                      required
                      value={editingProductId && editingProduct ? editingProduct.category : newProduct.category}
                      onChange={(e) => {
                        if (editingProductId && editingProduct) {
                          setEditingProduct({ ...editingProduct, category: e.target.value });
                        } else {
                          setNewProduct({ ...newProduct, category: e.target.value });
                        }
                      }}
                      className="w-full rounded-2xl border border-[#E0CCB4] bg-[#FAF6F0] px-4 py-2.5 text-sm"
                    >
                      <option value="">Selecciona una categoría</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-ink-muted uppercase mb-1">Precio (CLP)</label>
                    <input
                      type="number"
                      value={editingProductId && editingProduct ? editingProduct.price : newProduct.price}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (editingProductId && editingProduct) {
                          setEditingProduct({ ...editingProduct, price: val });
                        } else {
                          setNewProduct({ ...newProduct, price: val });
                        }
                      }}
                      className="w-full rounded-2xl border border-[#E0CCB4] bg-[#FAF6F0] px-4 py-2.5 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink-muted uppercase mb-1">Materiales</label>
                    <input
                      type="text"
                      placeholder="Ej. Plata 950, Cuarzo Verde"
                      value={editingProductId && editingProduct ? editingProduct.materials : newProduct.materials}
                      onChange={(e) => {
                        if (editingProductId && editingProduct) {
                          setEditingProduct({ ...editingProduct, materials: e.target.value });
                        } else {
                          setNewProduct({ ...newProduct, materials: e.target.value });
                        }
                      }}
                      className="w-full rounded-2xl border border-[#E0CCB4] bg-[#FAF6F0] px-4 py-2.5 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink-muted uppercase mb-1">Disponibilidad</label>
                    <select
                      value={editingProductId && editingProduct ? (editingProduct.available ? 'true' : 'false') : (newProduct.available ? 'true' : 'false')}
                      onChange={(e) => {
                        const val = e.target.value === 'true';
                        if (editingProductId && editingProduct) {
                          setEditingProduct({ ...editingProduct, available: val });
                        } else {
                          setNewProduct({ ...newProduct, available: val });
                        }
                      }}
                      className="w-full rounded-2xl border border-[#E0CCB4] bg-[#FAF6F0] px-4 py-2.5 text-sm"
                    >
                      <option value="true">🟢 Disponible para compra</option>
                      <option value="false">🟡 Solo bajo encargo / Agotado</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-muted uppercase mb-1">Descripción</label>
                  <textarea
                    rows={3}
                    value={editingProductId && editingProduct ? editingProduct.description : newProduct.description}
                    onChange={(e) => {
                      if (editingProductId && editingProduct) {
                        setEditingProduct({ ...editingProduct, description: e.target.value });
                      } else {
                        setNewProduct({ ...newProduct, description: e.target.value });
                      }
                    }}
                    className="w-full rounded-2xl border border-[#E0CCB4] bg-[#FAF6F0] px-4 py-2.5 text-sm"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-muted uppercase mb-1">
                    {editingProductId ? 'Reemplazar Fotografía de la Joya' : 'Fotografía de la Joya *'}
                  </label>
                  <input
                    id="productImage"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (editingProductId) {
                        setEditingImageFile(e.target.files ? e.target.files[0] : null);
                      } else {
                        setProductImageFile(e.target.files ? e.target.files[0] : null);
                      }
                    }}
                    className="w-full text-xs text-ink-muted file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-light file:text-emerald-dark"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={isSaving} className="button-primary !py-3 !px-7 text-xs">
                    {isSaving ? 'Guardando...' : (editingProductId ? 'Actualizar Joya' : 'Publicar Joya ✦')}
                  </button>
                  {editingProductId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProductId(null);
                        setEditingProduct(null);
                      }}
                      className="button-ghost !py-3 !px-5 text-xs"
                    >
                      Cancelar Edición
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Listado de Productos */}
            <div className="card p-6 space-y-4 bg-white/90 border-[#E8DFC8]">
              <h3 className="text-lg font-serif font-semibold border-b border-[#EBDDCB] pb-2 text-ink-deep">Catálogo de Joyas ({products.length})</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-ink-deep">
                  <thead>
                    <tr className="border-b border-[#EBDDCB] text-xs uppercase text-ink-muted">
                      <th className="py-3 px-2">Foto</th>
                      <th className="py-3 px-2">Nombre</th>
                      <th className="py-3 px-2">Categoría</th>
                      <th className="py-3 px-2">Precio</th>
                      <th className="py-3 px-2">Estado</th>
                      <th className="py-3 px-2 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EBDDCB]">
                    {products.map((prod) => (
                      <tr key={prod.id} className="hover:bg-emerald-light/20 transition">
                        <td className="py-3 px-2">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-11 h-11 object-cover rounded-xl border border-[#EBDDCB]"
                          />
                        </td>
                        <td className="py-3 px-2 font-medium">{prod.name}</td>
                        <td className="py-3 px-2">
                          <span className="badge !text-[10px]">
                            {categories.find(c => c.id === prod.category)?.name || prod.category}
                          </span>
                        </td>
                        <td className="py-3 px-2 font-semibold">
                          {prod.price ? `$${prod.price.toLocaleString('es-CL')}` : 'N/A'}
                        </td>
                        <td className="py-3 px-2">
                          {prod.available ? (
                            <span className="text-emerald text-xs font-semibold">🟢 Disponible</span>
                          ) : (
                            <span className="text-terracotta text-xs font-semibold">🟡 Bajo encargo</span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEditProductClick(prod)}
                              className="px-2.5 py-1 text-xs font-semibold text-ink-deep border border-[#EBDDCB] rounded-lg hover:bg-emerald-light/60"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod.id)}
                              className="px-2.5 py-1 text-xs font-semibold text-red-600 border border-red-100 hover:bg-red-50 rounded-lg"
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
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
