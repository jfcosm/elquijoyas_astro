// Actualiza esta data para modificar la colección y reemplaza las imágenes en /public/images/jewels
export interface Jewel {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  instagramUrl: string;
}

export const jewels: Jewel[] = [
  {
    id: 'anillo-sol-andino',
    name: 'Anillo Sol Andino',
    category: 'Anillo',
    description: 'Plata martillada con detalle solar inspirado en los cielos de Mamalluca.',
    image: '/images/jewels/anillo-sol.svg',
    instagramUrl: 'https://instagram.com/elquijoyas/anillo-sol'
  },
  {
    id: 'collar-luz-mamalluca',
    name: 'Collar Luz de Mamalluca',
    category: 'Collar',
    description: 'Colgante de bronce y piedra verde que refleja las noches claras del valle.',
    image: '/images/jewels/collar-luz.svg',
    instagramUrl: 'https://instagram.com/elquijoyas/collar-luz'
  },
  {
    id: 'aros-rio-elqui',
    name: 'Aros Río Elqui',
    category: 'Aros',
    description: 'Aros fluidos en plata reciclada, inspirados en el cauce del río Elqui.',
    image: '/images/jewels/aros-rio.svg',
    instagramUrl: 'https://instagram.com/elquijoyas/aros-rio'
  },
  {
    id: 'pulsera-tierra',
    name: 'Pulsera Tierra Viva',
    category: 'Pulsera',
    description: 'Trenzado de cuero y metal que celebra los tonos del desierto florido.',
    image: '/images/jewels/pulsera-tierra.svg',
    instagramUrl: 'https://instagram.com/elquijoyas/pulsera-tierra'
  },
  {
    id: 'anillo-lunacion',
    name: 'Anillo Lunación',
    category: 'Anillo',
    description: 'Texturas lunares en plata ennegrecida con destellos dorados.',
    image: '/images/jewels/anillo-luna.svg',
    instagramUrl: 'https://instagram.com/elquijoyas/anillo-luna'
  },
  {
    id: 'collar-cactus',
    name: 'Collar Cactus Florido',
    category: 'Collar',
    description: 'Pieza en bronce con silueta de cactus y cuarzo rosado del valle.',
    image: '/images/jewels/collar-cactus.svg',
    instagramUrl: 'https://instagram.com/elquijoyas/collar-cactus'
  }
];
