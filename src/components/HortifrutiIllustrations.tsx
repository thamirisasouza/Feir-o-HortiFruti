import React, { useState } from 'react';

export interface IconProps {
  className?: string;
}

/**
 * Brand Logo for "Feirão Hortifruti" using the official logo asset
 */
export const FeiraoHortifrutiLogo: React.FC<IconProps> = ({ className = 'w-11 h-11' }) => (
  <img
    src="/assets/aistudio/file_0000000083e4820ea22b0f81959d3438_19ea954d.png"
    alt="Logo Feirão Hortifruti"
    className={`rounded-full object-contain bg-white shadow-sm shrink-0 ${className}`}
  />
);

export const PomarDaVilaLogo = FeiraoHortifrutiLogo;

export const CustomWovenBasketIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M8.5 4.5C8.5 3.11929 9.61929 2 11 2H13C14.3807 2 15.5 3.11929 15.5 4.5V8H8.5V4.5Z"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    />
    <path
      d="M3.5 8.5H20.5L18.8 19.2C18.58 20.55 17.41 21.5 16.04 21.5H7.96C6.59 21.5 5.42 20.55 5.2 19.2L3.5 8.5Z"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinejoin="round"
    />
    <path
      d="M8.5 12.5L10.5 17.5M15.5 12.5L13.5 17.5M7 15H17"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
);

export const CustomLeafSearchIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <circle cx="10.5" cy="10.5" r="7" stroke="currentColor" strokeWidth="1.75" />
    <path
      d="M15.8 15.8L20.5 20.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M8.5 12C8.5 9.5 10.5 7.8 13 7.8C13 10.3 11.3 12 8.5 12Z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
  </svg>
);

export const CustomWhatsAppLeafIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M12 2.75C6.89 2.75 2.75 6.89 2.75 12C2.75 13.76 3.24 15.41 4.1 16.82L2.85 21.15L7.32 19.93C8.69 20.72 10.29 21.25 12 21.25C17.11 21.25 21.25 17.11 21.25 12C21.25 6.89 17.11 2.75 12 2.75Z"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinejoin="round"
    />
    <path
      d="M9.1 8.4C8.85 7.85 8.58 7.83 8.34 7.82C8.14 7.81 7.91 7.81 7.68 7.81C7.45 7.81 7.08 7.9 6.76 8.25C6.44 8.6 5.55 9.43 5.55 11.12C5.55 12.81 6.79 14.45 6.96 14.68C7.13 14.91 9.36 18.51 12.88 19.89C15.81 21.04 16.41 20.81 17.04 20.75C17.67 20.69 19.08 19.91 19.37 19.1C19.66 18.29 19.66 17.6 19.57 17.45C19.48 17.3 19.25 17.21 18.9 17.04C18.55 16.87 16.86 16.03 16.54 15.91C16.22 15.79 15.99 15.73 15.76 16.08C15.53 16.43 14.87 17.21 14.67 17.44C14.47 17.67 14.27 17.7 13.92 17.53C13.57 17.36 12.46 16.99 11.14 15.81C10.11 14.89 9.42 13.75 9.22 13.4C9.02 13.05 9.2 12.86 9.38 12.69C9.53 12.53 9.73 12.29 9.9 12.09C10.07 11.89 10.13 11.74 10.24 11.51C10.35 11.28 10.29 11.08 10.21 10.91C10.13 10.74 9.46 9.04 9.1 8.4Z"
      fill="currentColor"
      transform="scale(0.82) translate(2.6, 2.2)"
    />
  </svg>
);

export const CustomPlusStemIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
    <path d="M10 4.25V15.75M4.25 10H15.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const CustomMinusStemIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
    <path d="M4.5 10H15.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const CustomCloseCrossIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export const CustomTrashBinIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
    <path d="M3.5 5.5H16.5M7.5 5.5V4C7.5 3.45 7.95 3 8.5 3H11.5C12.05 3 12.5 3.45 12.5 4V5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M5.5 5.5L6.2 15.5C6.25 16.3 6.9 17 7.7 17H12.3C13.1 17 13.75 16.3 13.8 15.5L14.5 5.5" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export const REAL_PRODUCT_PHOTOS: Record<string, { src: string; alt: string; label: string }> = {
  morango: {
    src: '/images/morango.jpg',
    alt: 'Morangos orgânicos vermelhos recém-colhidos',
    label: 'Morango',
  },
  abacate: {
    src: '/images/abacate.jpg',
    alt: 'Abacate Avocado Hass fresco cortado ao meio',
    label: 'Abacate',
  },
  mamao: {
    src: '/images/mamao.jpg',
    alt: 'Laranja Bahia suculenta cortada ao meio com gomo fresco',
    label: 'Laranja / Mamão',
  },
  banana: {
    src: '/images/banana.jpg',
    alt: 'Penca de Banana Prata madura selecionada',
    label: 'Banana',
  },
  uva: {
    src: '/images/uva.jpg',
    alt: 'Uvas frescas suculentas com gotas de água',
    label: 'Uva',
  },
  manga: {
    src: '/images/manga.jpg',
    alt: 'Manga madura suculenta cortada ao meio sem fiapos',
    label: 'Manga',
  },
  melancia: {
    src: '/images/melancia.jpg',
    alt: 'Fatia de melancia fresca e doce',
    label: 'Melancia',
  },
  tangerina: {
    src: '/images/tangerina.jpg',
    alt: 'Tangerina Ponkan fresca e doce',
    label: 'Tangerina',
  },
  roma: {
    src: '/images/roma.jpg',
    alt: 'Romã vermelha aberta com grãos brilhantes e suco fresco',
    label: 'Romã',
  },
  maca: {
    src: '/images/maca.jpg',
    alt: 'Maçã Gala fresca e crocante cortada ao meio',
    label: 'Maçã',
  },
  alface: {
    src: '/images/alface.jpg',
    alt: 'Folhas de alface verde crocante hidropônica',
    label: 'Alface',
  },
  brocolis: {
    src: '/images/brocolis.jpg',
    alt: 'Brócolis fresco com floretes verdes',
    label: 'Brócolis',
  },
  tomate: {
    src: '/images/tomate.jpg',
    alt: 'Tomates vermelhos suculentos colhidos na rama',
    label: 'Tomate',
  },
  cenoura: {
    src: '/images/cenoura.jpg',
    alt: 'Maço de cenouras frescas do campo',
    label: 'Cenoura',
  },
  queijo: {
    src: '/images/queijo.jpg',
    alt: 'Queijo artesanal fresco',
    label: 'Queijo',
  },
  pao: {
    src: '/images/pao.jpg',
    alt: 'Pão caseiro fresquinho',
    label: 'Pão',
  },
};

/**
 * Real Photographs of Juicy Fruits, Greens, and Vegetables
 * Includes studio color enhancement and resilient fallback container.
 */
export const ProductArtIllustration: React.FC<{ artId: string; className?: string }> = ({
  artId,
  className = 'w-full h-full',
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  // If artId is a direct URL or path (e.g. /images/... or http...)
  const isDirectUrl = artId && (artId.startsWith('/') || artId.startsWith('http') || artId.startsWith('data:'));
  const photo = REAL_PRODUCT_PHOTOS[artId];
  const imgSrc = isDirectUrl ? artId : (photo ? photo.src : REAL_PRODUCT_PHOTOS.morango.src);
  const imgAlt = photo ? photo.alt : 'Foto do produto Feirão Hortifruti';

  if (imgFailed) {
    return (
      <div className={`flex items-center justify-center bg-[#EAE3D5] text-[#1E5631] ${className}`}>
        <CustomWovenBasketIcon className="w-10 h-10 opacity-50" />
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={imgAlt}
      referrerPolicy="no-referrer"
      onError={() => setImgFailed(true)}
      className={`object-cover object-center saturate-[1.18] contrast-[1.04] ${className}`}
      loading="lazy"
    />
  );
};
