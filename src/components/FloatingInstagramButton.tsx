import React from 'react';

// Cambia url para apuntar a la cuenta o pieza de Instagram
interface Props {
  url?: string;
}

const FloatingInstagramButton: React.FC<Props> = ({ url = 'https://instagram.com/elquijoyas' }) => {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 right-6 z-40 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-terracotta to-gold text-white px-4 py-3 shadow-xl hover:shadow-2xl transition transform hover:-translate-y-0.5"
    >
      <span className="text-xl">📸</span>
      <span className="hidden sm:inline text-sm font-semibold">Instagram</span>
    </a>
  );
};

export default FloatingInstagramButton;
