import { CATEGORIES, CategoryItem, PRODUCTS, ProductItem, UnitType } from './products';

const PRODUCTS_STORAGE_KEY = 'feirao_products_v3';
const CATEGORIES_STORAGE_KEY = 'feirao_categories_v3';
const BANNERS_STORAGE_KEY = 'feirao_banners_v3';
const SITE_SETTINGS_STORAGE_KEY = 'feirao_site_settings_v3';
const ADMIN_AUTH_KEY = 'feirao_admin_auth_v2';

export const ADMIN_TEST_CREDENTIALS = {
  login: '12345',
  password: '12345',
};

export const UNIT_TYPES: { id: UnitType; label: string; short: string; defaultUnitLabel: string }[] = [
  { id: 'kg', label: 'Quilograma (Kg)', short: 'kg', defaultUnitLabel: '1kg' },
  { id: 'pct', label: 'Pacote (pct / maço / bandeja)', short: 'pct', defaultUnitLabel: 'Pacote' },
  { id: 'unidade', label: 'Unidade (un)', short: 'un', defaultUnitLabel: 'Unidade' },
  { id: 'gramas', label: 'Gramas (g)', short: 'g', defaultUnitLabel: '500g' },
];

export interface BannerItem {
  id: string;
  src: string;
  alt?: string;
}

export const DEFAULT_BANNERS: BannerItem[] = [
  {
    id: 'banner-1',
    src: '/images/banner_1.jpg',
    alt: 'Banner 1 - Feirão Hortifruti',
  },
  {
    id: 'banner-2',
    src: '/images/banner_2.jpg',
    alt: 'Banner 2 - Feirão Hortifruti',
  },
  {
    id: 'banner-3',
    src: '/images/banner_3.jpg',
    alt: 'Banner 3 - Feirão Hortifruti',
  },
  {
    id: 'banner-4',
    src: '/images/banner_frutas_1.jpg',
    alt: 'Banner 4 - Feirão Hortifruti',
  },
];

export interface SiteCustomization {
  logoUrl: string;
  showBrandName: boolean;
  brandNameFirst: string;
  brandNameSecond: string;
  primaryButtonColor: string; // e.g. '#0F6E16'
  accentButtonColor: string;  // e.g. '#FF6600'
  brandFontSize?: string;     // e.g. '36px'
  brandFontFamily?: string;   // 'display' | 'sans' | 'serif' | 'rounded' | 'impact' | 'cursive'
}

export const DEFAULT_SITE_SETTINGS: SiteCustomization = {
  logoUrl: '/assets/aistudio/file_0000000083e4820ea22b0f81959d3438_19ea954d.png',
  showBrandName: true,
  brandNameFirst: 'Feirão',
  brandNameSecond: 'Hortifruti',
  primaryButtonColor: '#0F6E16',
  accentButtonColor: '#FF6600',
  brandFontSize: '36px',
  brandFontFamily: 'display',
};

export function getBrandFontFamilyStyle(fontFamily?: string): string {
  switch (fontFamily) {
    case 'sans':
      return 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    case 'serif':
      return 'Georgia, Cambria, "Times New Roman", Times, serif';
    case 'rounded':
      return '"Nunito", "Quicksand", ui-rounded, "SF Pro Rounded", "Arial Rounded MT Bold", sans-serif';
    case 'impact':
      return 'Impact, "Arial Black", "Trebuchet MS", sans-serif';
    case 'cursive':
      return '"Caveat", "Brush Script MT", "Segoe Script", cursive';
    case 'display':
    default:
      return 'inherit';
  }
}

export function getStoredProducts(): ProductItem[] {
  try {
    const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (!raw) return PRODUCTS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.error('Erro ao ler produtos do localStorage:', err);
  }
  return PRODUCTS;
}

export function saveStoredProducts(products: ProductItem[]): void {
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  } catch (err) {
    console.error('Erro ao salvar produtos no localStorage:', err);
  }
}

export function getStoredCategories(): CategoryItem[] {
  try {
    const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (!raw) return CATEGORIES;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const hasTodos = parsed.some((c) => c.id === 'todos');
      if (!hasTodos) {
        return [{ id: 'todos', label: 'Todos' }, ...parsed];
      }
      return parsed;
    }
  } catch (err) {
    console.error('Erro ao ler categorias do localStorage:', err);
  }
  return CATEGORIES;
}

export function saveStoredCategories(categories: CategoryItem[]): void {
  try {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
  } catch (err) {
    console.error('Erro ao salvar categorias no localStorage:', err);
  }
}

export function getStoredBanners(): BannerItem[] {
  try {
    const raw = localStorage.getItem(BANNERS_STORAGE_KEY);
    if (!raw) return DEFAULT_BANNERS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.slice(0, 5); // Max 5 banners
    }
  } catch (err) {
    console.error('Erro ao ler banners do localStorage:', err);
  }
  return DEFAULT_BANNERS;
}

export function saveStoredBanners(banners: BannerItem[]): void {
  try {
    localStorage.setItem(BANNERS_STORAGE_KEY, JSON.stringify(banners.slice(0, 5)));
  } catch (err) {
    console.error('Erro ao salvar banners no localStorage:', err);
  }
}

export function getStoredSiteSettings(): SiteCustomization {
  try {
    const raw = localStorage.getItem(SITE_SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SITE_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SITE_SETTINGS, ...parsed };
  } catch (err) {
    console.error('Erro ao ler configurações do site:', err);
    return DEFAULT_SITE_SETTINGS;
  }
}

export function saveStoredSiteSettings(settings: SiteCustomization): void {
  try {
    localStorage.setItem(SITE_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Erro ao salvar configurações do site:', err);
  }
}

export function resetCatalogToDefault(): {
  products: ProductItem[];
  categories: CategoryItem[];
  banners: BannerItem[];
  siteSettings: SiteCustomization;
} {
  try {
    localStorage.removeItem(PRODUCTS_STORAGE_KEY);
    localStorage.removeItem(CATEGORIES_STORAGE_KEY);
    localStorage.removeItem(BANNERS_STORAGE_KEY);
    localStorage.removeItem(SITE_SETTINGS_STORAGE_KEY);
  } catch (err) {
    console.error('Erro ao resetar catálogo:', err);
  }
  return {
    products: PRODUCTS,
    categories: CATEGORIES,
    banners: DEFAULT_BANNERS,
    siteSettings: DEFAULT_SITE_SETTINGS,
  };
}

export function isAdminAuthenticated(): boolean {
  try {
    return sessionStorage.getItem(ADMIN_AUTH_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setAdminAuthenticated(authenticated: boolean): void {
  try {
    if (authenticated) {
      sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
    } else {
      sessionStorage.removeItem(ADMIN_AUTH_KEY);
    }
  } catch (err) {
    console.error('Erro ao salvar sessão admin:', err);
  }
}

/**
 * Client-side banner compressor:
 * Resizes large photos up to 1600x650 with bicubic smoothing,
 * outputting an ultra-sharp ~90-140KB JPEG without visible loss.
 */
export function compressBannerImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Falha ao ler arquivo'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Falha ao carregar imagem'));
      img.onload = () => {
        const MAX_WIDTH = 1600;
        const MAX_HEIGHT = 650;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const compressed = canvas.toDataURL('image/jpeg', 0.85);
        resolve(compressed);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Client-side logo compressor:
 * Preserves transparency if PNG, resizes to max 500x500.
 */
export function compressLogoImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Falha ao ler logo'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Falha ao carregar logo'));
      img.onload = () => {
        const MAX_DIM = 500;
        let width = img.width;
        let height = img.height;

        if (width > MAX_DIM || height > MAX_DIM) {
          const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Keep PNG format for transparent logos, or WebP/JPEG
        const isPng = file.type.includes('png');
        const compressed = canvas.toDataURL(isPng ? 'image/png' : 'image/jpeg', 0.9);
        resolve(compressed);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
