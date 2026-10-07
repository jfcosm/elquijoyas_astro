import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

export interface ReelItem {
  id: string;
  title: string;
  url: string;
  caption?: string;
  thumbnail?: string;
  tag?: string;
}

interface SectionData {
  badge: string;
  title: string;
  description: string;
  instagramUrl: string;
}

// Datos predeterminados iniciales con estética de orfebrería y acuarela
const defaultSectionData: SectionData = {
  badge: 'El Taller en Vivo',
  title: 'Procesos, Forja & Mística en Video',
  description: 'Mira el fuego, el martillo y la dedicación detrás de cada joya hecha a mano. Síguenos en Instagram para ver nuevos procesos y piezas en creación.',
  instagramUrl: 'https://instagram.com/elquijoyas'
};

const defaultReels: ReelItem[] = [
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

// Helper para extraer el ID o código de un Reel/Post de Instagram
function getInstagramEmbedUrl(url: string): string | null {
  if (!url) return null;
  // Match reel or post ID
  const match = url.match(/instagram\.com\/(?:reel|p|tv)\/([^/?#&]+)/i);
  if (match && match[1]) {
    return `https://www.instagram.com/reel/${match[1]}/embed/captioned/`;
  }
  return null;
}

const InstagramReelsSection: React.FC = () => {
  const [sectionData, setSectionData] = useState<SectionData>(defaultSectionData);
  const [reels, setReels] = useState<ReelItem[]>(defaultReels);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedEmbedUrl, setSelectedEmbedUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchReelsData = async () => {
      try {
        // 1. Cargar textos de la sección
        const secDoc = await getDoc(doc(db, 'sections', 'reels'));
        if (secDoc.exists()) {
          setSectionData({ ...defaultSectionData, ...(secDoc.data() as SectionData) });
        }

        // 2. Cargar lista de reels
        const snapshot = await getDocs(collection(db, 'reels'));
        if (!snapshot.empty) {
          const list: ReelItem[] = [];
          snapshot.forEach((d) => {
            list.push({ id: d.id, ...(d.data() as any) });
          });
          setReels(list);
        }
      } catch (err) {
        console.error('Error cargando videos de Instagram:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReelsData();
  }, []);

  return (
    <section id="videos" className="section-padding relative overflow-hidden">
      {/* Luces de acuarela atmosféricas */}
      <div className="absolute top-1/3 left-10 w-96 h-96 bg-quartz-mist/50 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-light/40 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <div className="container mx-auto px-4 space-y-12">
        {/* Cabecera de la Sección */}
        <div className="space-y-4 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold tracking-widest uppercase border border-quartz/30 bg-white/70 backdrop-blur-sm text-emerald">
            <span>🎥</span> <span id="reels-badge">{sectionData.badge}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-semibold text-ink-deep leading-tight" id="reels-title">
            {sectionData.title}
          </h2>
          <p className="font-script text-2xl sm:text-3xl text-terracotta">
            La alquimia del taller de Nicolás Cordero
          </p>
          <p className="text-sm sm:text-base text-ink-medium max-w-2xl mx-auto" id="reels-desc">
            {sectionData.description}
          </p>
        </div>

        {/* Galería de Videos / Reels */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald mx-auto"></div>
            <p className="text-ink-muted font-serif italic text-sm">Cargando videos del taller...</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {reels.map((reel) => {
              const embedUrl = getInstagramEmbedUrl(reel.url);

              return (
                <article
                  key={reel.id}
                  className="card p-6 flex flex-col gap-4 bg-white/85 border-[#E8DFC8] group hover:shadow-watercolor transition-all duration-500"
                >
                  {/* Vista previa o Reproductor Embebido */}
                  <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-[#E5D4C0] bg-[#FAF6F0] shadow-inner group">
                    {embedUrl ? (
                      <iframe
                        src={embedUrl}
                        className="w-full h-full border-0 rounded-2xl"
                        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                        allowFullScreen
                        title={reel.title}
                        loading="lazy"
                      ></iframe>
                    ) : (
                      <>
                        <img
                          src={reel.thumbnail || '/images/logo-watercolor.jpg'}
                          alt={reel.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-ink-deep/80 via-ink-deep/20 to-transparent flex flex-col justify-between p-4">
                          <div className="flex justify-end">
                            <span className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm text-ink-deep flex items-center justify-center shadow-md text-sm">
                              📸
                            </span>
                          </div>
                          <div className="flex items-center justify-center">
                            <a
                              href={reel.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-14 h-14 rounded-full bg-white/90 text-emerald-dark flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform text-xl pl-1 border border-white/50"
                            >
                              ▶
                            </a>
                          </div>
                          <p className="text-white text-xs font-semibold uppercase tracking-wider drop-shadow">
                            Ver en Instagram
                          </p>
                        </div>
                      </>
                    )}

                    {reel.tag && (
                      <div className="absolute top-3 left-3 pointer-events-none">
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/90 text-emerald-dark shadow-sm border border-emerald/20">
                          {reel.tag}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Textos del Reel */}
                  <div className="space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-serif font-semibold text-ink-deep leading-snug group-hover:text-emerald transition-colors">
                        {reel.title}
                      </h3>
                      {reel.caption && (
                        <p className="text-ink-medium text-xs sm:text-sm mt-1 line-clamp-2 leading-relaxed">
                          {reel.caption}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-[#EBDDCB]/60 flex items-center justify-between">
                      <a
                        href={reel.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="button-ghost !py-2 !px-4 text-xs font-semibold inline-flex items-center gap-1.5"
                      >
                        <span>📸</span> Abrir en Instagram →
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Botón CTA a Instagram */}
        <div className="text-center pt-4">
          <a
            href={sectionData.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="button-primary text-sm inline-flex items-center gap-2"
          >
            <span>📸</span> Seguir a @elquijoyas en Instagram
          </a>
        </div>
      </div>
    </section>
  );
};

export default InstagramReelsSection;
