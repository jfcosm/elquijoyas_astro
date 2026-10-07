import React from 'react';

interface Props {
  phone?: string;
  message?: string;
}

const FloatingWhatsAppButton: React.FC<Props> = ({
  phone = '56931983075',
  message = 'Hola Nicolás, me comunico desde la web Elqui Joyas para consultar por tus joyas artesanales.'
}) => {
  const href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-emerald to-emerald-dark text-white px-5 py-3.5 shadow-watercolor hover:shadow-glow-emerald transition-all duration-300 transform hover:-translate-y-1 border border-white/30"
    >
      <span className="text-xl">💬</span>
      <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider">WhatsApp</span>
    </a>
  );
};

export default FloatingWhatsAppButton;
