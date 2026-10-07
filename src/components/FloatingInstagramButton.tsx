import React from 'react';

interface Props {
  url?: string;
}

const FloatingInstagramButton: React.FC<Props> = ({ url = 'https://instagram.com/elquijoyas' }) => {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Ver perfil de Instagram"
      className="fixed bottom-24 right-6 z-50 inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-terracotta to-quartz text-white px-5 py-3.5 shadow-watercolor hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-white/30"
    >
      <span className="text-xl">📸</span>
      <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider">Instagram</span>
    </a>
  );
};

export default FloatingInstagramButton;
