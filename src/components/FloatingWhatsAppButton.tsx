import React from 'react';

// Cambia phone para actualizar el número de contacto de WhatsApp
interface Props {
  phone?: string;
  message?: string;
}

const FloatingWhatsAppButton: React.FC<Props> = ({
  phone = '56931983075',
  message = 'Hola, quiero saber más sobre las joyas Elqui Joyas'
}) => {
  const href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full bg-green-500 text-white px-4 py-3 shadow-xl hover:shadow-2xl transition transform hover:-translate-y-0.5"
    >
      <span className="text-xl">💬</span>
      <span className="hidden sm:inline text-sm font-semibold">WhatsApp</span>
    </a>
  );
};

export default FloatingWhatsAppButton;
