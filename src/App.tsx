import React, { useState, useMemo, useEffect, useRef } from 'react';
import { CategoryId, CategoryItem, ProductItem } from './data/products';
import {
  BannerItem,
  SiteCustomization,
  getStoredBanners,
  getStoredCategories,
  getStoredProducts,
  getStoredSiteSettings,
  saveStoredBanners,
  saveStoredCategories,
  saveStoredProducts,
  saveStoredSiteSettings,
  resetCatalogToDefault,
} from './data/catalogStorage';
import {
  CustomLeafSearchIcon,
  CustomMinusStemIcon,
  CustomPlusStemIcon,
  CustomWovenBasketIcon,
  ProductArtIllustration,
} from './components/HortifrutiIllustrations';
import { CartEntry, WhatsAppCheckoutDrawer } from './components/WhatsAppCheckoutDrawer';
import { ProductDetailModal } from './components/ProductDetailModal';
import { AdminPanelModal } from './components/AdminPanelModal';

function getBrasiliaTimeFormatted(): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date());
}

const CATEGORY_IMAGE_MAP: Record<string, string> = {
  frutas: '/images/morango.jpg',
  verduras: '/images/alface.jpg',
  legumes: '/images/cenoura.jpg',
  padaria: '/images/pao.jpg',
  laticinios: '/images/queijo.jpg',
  temperos: '/images/tomate.jpg',
  todos: '/images/banner_frutas_1.jpg',
};

function getCategoryVisual(catId: string, prods: ProductItem[]): string {
  if (CATEGORY_IMAGE_MAP[catId]) return CATEGORY_IMAGE_MAP[catId];
  const prod = prods.find((p) => p.categoryId === catId);
  if (prod) {
    if (prod.artId.startsWith('data:') || prod.artId.startsWith('/') || prod.artId.startsWith('http')) {
      return prod.artId;
    }
    return `/images/${prod.artId}.jpg`;
  }
  return '/images/banner_frutas_1.jpg';
}

export default function App() {
  // Navigation mode: 'home' shows sections, 'store' shows full catalog
  const [currentView, setCurrentView] = useState<'home' | 'store'>('home');

  // Products, Categories, Banners and Site Settings with LocalStorage persistence
  const [products, setProducts] = useState<ProductItem[]>(getStoredProducts);
  const [categories, setCategories] = useState<CategoryItem[]>(getStoredCategories);
  const [banners, setBanners] = useState<BannerItem[]>(getStoredBanners);
  const [siteSettings, setSiteSettings] = useState<SiteCustomization>(getStoredSiteSettings);

  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [brasiliaTime, setBrasiliaTime] = useState<string>(getBrasiliaTimeFormatted);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [isBannerPaused, setIsBannerPaused] = useState(false);

  // Cart starts completely empty as requested
  const [cart, setCart] = useState<CartEntry[]>([]);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeProductModal, setActiveProductModal] = useState<ProductItem | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Horizontal scroll refs for Home sections
  const ofertasScrollRef = useRef<HTMLDivElement>(null);
  const favoritosScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setBrasiliaTime(getBrasiliaTimeFormatted());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isBannerPaused || currentView !== 'home' || banners.length <= 1) return;
    const rollTimer = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % banners.length);
    }, 4500);
    return () => clearInterval(rollTimer);
  }, [isBannerPaused, currentView, banners.length]);

  // Open store with specific category
  const handleOpenStore = (catId: CategoryId = 'todos') => {
    setSelectedCategory(catId);
    setCurrentView('store');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Horizontal scroll controllers
  const scrollOfertas = (direction: 'left' | 'right') => {
    if (ofertasScrollRef.current) {
      const step = 280;
      ofertasScrollRef.current.scrollBy({
        left: direction === 'left' ? -step : step,
        behavior: 'smooth',
      });
    }
  };

  const scrollFavoritos = (direction: 'left' | 'right') => {
    if (favoritosScrollRef.current) {
      const step = 280;
      favoritosScrollRef.current.scrollBy({
        left: direction === 'left' ? -step : step,
        behavior: 'smooth',
      });
    }
  };

  // Product management callbacks
  const handleSaveProduct = (updatedProduct: ProductItem) => {
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === updatedProduct.id);
      let next: ProductItem[];
      if (idx > -1) {
        next = [...prev];
        next[idx] = updatedProduct;
      } else {
        next = [updatedProduct, ...prev];
      }
      saveStoredProducts(next);
      return next;
    });

    // Update cart item if this product was already in cart
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === updatedProduct.id
          ? { ...item, product: updatedProduct }
          : item
      )
    );
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => {
      const next = prev.filter((p) => p.id !== productId);
      saveStoredProducts(next);
      return next;
    });
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleAddCategory = (categoryName: string) => {
    const slug = categoryName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const newCategory: CategoryItem = {
      id: slug || `cat-${Date.now()}`,
      label: categoryName,
    };

    setCategories((prev) => {
      const next = [...prev, newCategory];
      saveStoredCategories(next);
      return next;
    });
  };

  const handleDeleteCategory = (categoryId: string) => {
    setCategories((prev) => {
      const next = prev.filter((c) => c.id !== categoryId);
      saveStoredCategories(next);
      return next;
    });
    if (selectedCategory === categoryId) {
      setSelectedCategory('todos');
    }
  };

  const handleSaveBanners = (updatedBanners: BannerItem[]) => {
    setBanners(updatedBanners);
    saveStoredBanners(updatedBanners);
    if (bannerIndex >= updatedBanners.length) {
      setBannerIndex(0);
    }
  };

  const handleSaveSiteSettings = (newSettings: SiteCustomization) => {
    setSiteSettings(newSettings);
    saveStoredSiteSettings(newSettings);
  };

  const handleResetCatalog = () => {
    const { products: defaultProds, categories: defaultCats, banners: defaultBanners } =
      resetCatalogToDefault();
    setProducts(defaultProds);
    setCategories(defaultCats);
    setBanners(defaultBanners);
    setSelectedCategory('todos');
    setBannerIndex(0);
  };

  // Filtered products in store mode
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === 'todos' || product.categoryId === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        product.name.toLowerCase().includes(q) ||
        product.categoryLabel.toLowerCase().includes(q) ||
        product.unitLabel.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Curated lists for Home sections with admin selection support
  const ofertasImperdiveis = useMemo(() => {
    const flagged = products.filter((p) => p.isOferta);
    if (flagged.length > 0) return flagged;
    const dealIds = ['prod-manga', 'prod-laranja', 'prod-alface', 'prod-cenoura', 'prod-morango', 'prod-brocolis'];
    const matched = products.filter((p) => dealIds.includes(p.id));
    return matched.length > 0 ? matched : products.slice(0, 6);
  }, [products]);

  const favoritosDoDia = useMemo(() => {
    const flagged = products.filter((p) => p.isFavorito);
    if (flagged.length > 0) return flagged;
    const favIds = ['prod-banana', 'prod-morango', 'prod-maca', 'prod-tomate', 'prod-uva', 'prod-abacate'];
    const matched = products.filter((p) => favIds.includes(p.id));
    return matched.length > 0 ? matched : products.slice(2, 8);
  }, [products]);

  const totalItemsInCart = useMemo(
    () => cart.reduce((acc, item) => acc + item.quantity, 0),
    [cart]
  );

  const totalCartPrice = useMemo(
    () => cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0),
    [cart]
  );

  const handleAddToCart = (product: ProductItem, quantityToAdd = 1) => {
    const key = product.id;
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.key === key);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantityToAdd,
        };
        return updated;
      }
      return [
        ...prev,
        {
          key,
          product,
          quantity: quantityToAdd,
        },
      ];
    });
  };

  const handleUpdateQuantity = (key: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.key === key ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveItem = (key: string) => {
    setCart((prev) => prev.filter((item) => item.key !== key));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const getQuantityForProduct = (productId: string) => {
    const found = cart.find((item) => item.key === productId);
    return found ? found.quantity : 0;
  };

  // Reusable Product Card renderer
  const renderProductCard = (
    product: ProductItem,
    highlightBadge?: string,
    isCarouselItem: boolean = false
  ) => {
    const qtyInCart = getQuantityForProduct(product.id);

    return (
      <article
        key={product.id}
        className={`group bg-white rounded-2xl border border-[#D5E6D6] hover:border-[#FF6600]/60 overflow-hidden flex flex-col justify-between transition-all duration-150 shadow-2xs ${
          isCarouselItem ? 'w-[168px] sm:w-[220px] md:w-[240px] shrink-0 snap-start flex-none' : ''
        }`}
      >
        <div>
          <div
            onClick={() => setActiveProductModal(product)}
            className="relative aspect-[5/4] sm:aspect-[4/3] w-full bg-[#EFF7F0] border-b border-[#E0EDE1] overflow-hidden cursor-pointer"
          >
            <ProductArtIllustration
              artId={product.artId}
              className="w-full h-full transition-transform duration-200 group-hover:scale-[1.03]"
            />

            <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
              <span
                className="px-2 py-0.5 rounded-md bg-white/95 backdrop-blur-xs text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider shadow-2xs"
                style={{ color: siteSettings.accentButtonColor }}
              >
                {product.categoryLabel}
              </span>
              {highlightBadge && (
                <span
                  className="px-2 py-0.5 rounded-md text-white text-[9px] sm:text-[10px] font-bold shadow-2xs uppercase"
                  style={{ backgroundColor: siteSettings.primaryButtonColor }}
                >
                  {highlightBadge}
                </span>
              )}
            </div>

            {product.unitType && (
              <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[9px] font-mono font-bold uppercase text-white shadow-2xs">
                {product.unitType}
              </span>
            )}

            {qtyInCart > 0 && (
              <span
                className="absolute top-2 right-2 min-w-[22px] h-[22px] px-1.5 rounded-full text-white text-[11px] font-mono-tabular font-bold flex items-center justify-center shadow-xs border border-white"
                style={{ backgroundColor: siteSettings.accentButtonColor }}
              >
                {qtyInCart}
              </span>
            )}
          </div>

          <div className="p-2.5 sm:p-4 pb-1.5 sm:pb-2">
            <button
              type="button"
              onClick={() => setActiveProductModal(product)}
              className="text-left w-full text-xs sm:text-base font-bold text-[#112A15] hover:text-[#0F6E16] transition-colors font-display leading-tight line-clamp-1 cursor-pointer"
            >
              {product.name}
            </button>

            <div className="mt-1 flex items-baseline justify-between gap-1">
              <span
                className="text-sm sm:text-lg font-extrabold font-mono-tabular leading-none"
                style={{ color: siteSettings.primaryButtonColor }}
              >
                R$ {product.price.toFixed(2).replace('.', ',')}
              </span>
              <span className="text-[10px] sm:text-xs font-medium text-[#4A634E] truncate">
                {product.unitLabel}
              </span>
            </div>
          </div>
        </div>

        <div className="p-2.5 pt-2 sm:px-4 sm:pb-4 sm:pt-2">
          {qtyInCart > 0 ? (
            <div
              className="w-full flex items-center justify-between bg-[#F7FAF7] px-1.5 py-1 rounded-xl border-2"
              style={{ borderColor: siteSettings.accentButtonColor }}
            >
              <button
                type="button"
                onClick={() => handleUpdateQuantity(product.id, -1)}
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-white hover:bg-orange-50 active:scale-95 transition-all cursor-pointer shadow-2xs"
                style={{ color: siteSettings.accentButtonColor }}
                aria-label="Diminuir quantidade na cesta"
              >
                <CustomMinusStemIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <span
                className="text-[11px] sm:text-sm font-mono-tabular font-extrabold"
                style={{ color: siteSettings.primaryButtonColor }}
              >
                {qtyInCart} na cesta
              </span>
              <button
                type="button"
                onClick={() => handleAddToCart(product, 1)}
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg text-white active:scale-95 transition-all cursor-pointer shadow-2xs"
                style={{ backgroundColor: siteSettings.primaryButtonColor }}
                aria-label="Adicionar mais uma unidade"
              >
                <CustomPlusStemIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => handleAddToCart(product, 1)}
              style={{ backgroundColor: siteSettings.primaryButtonColor }}
              className="w-full min-h-[36px] sm:min-h-[40px] inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-bold text-white hover:brightness-110 active:scale-[0.99] rounded-xl transition-all whitespace-nowrap cursor-pointer shadow-2xs"
            >
              <CustomPlusStemIcon className="w-3.5 h-3.5" />
              <span>Adicionar</span>
            </button>
          )}
        </div>
      </article>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7FAF7] text-[#112A15] pb-20 sm:pb-0">
      {/* 
        CONDITIONAL TOP NAVIGATION & BANNER:
        Shown ONLY on 'home' view. When the user clicks any category, 
        currentView becomes 'store', hiding both nav and banner as requested!
      */}
      {currentView === 'home' && (
        <header id="topo" className="w-full">
          {/* WHITE NAVBAR (matching footer style, side-by-side title without line break, borderless logo) */}
          <div className="w-full bg-white border-b-4 border-[#FF6600] shadow-sm">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-8 px-3 sm:px-6 py-2.5 sm:py-4">
              <a
                href="#topo"
                onClick={() => setCurrentView('home')}
                className="inline-flex items-center gap-3 sm:gap-4 tracking-tight font-display whitespace-nowrap shrink-0 group py-1"
              >
                {/* Logo GRANDE E SEM BORDAS */}
                <img
                  src={siteSettings.logoUrl}
                  alt="Logo"
                  className="h-14 sm:h-20 md:h-24 w-auto max-w-[140px] sm:max-w-[220px] md:max-w-[280px] object-contain shrink-0 transition-transform group-hover:scale-105 drop-shadow-xs"
                />

                {/* Nome lado a lado sem pular linha ou somente logo conforme configurado */}
                {siteSettings.showBrandName && (
                  <div className="flex items-center gap-1.5 sm:gap-2 whitespace-nowrap leading-none">
                    <span
                      className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight"
                      style={{ color: siteSettings.primaryButtonColor }}
                    >
                      {siteSettings.brandNameFirst || 'Feirão'}
                    </span>
                    <span
                      className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight"
                      style={{ color: siteSettings.accentButtonColor }}
                    >
                      {siteSettings.brandNameSecond || 'Hortifruti'}
                    </span>
                  </div>
                )}
              </a>

              {/* Dynamic Top Navigation across categories */}
              <nav className="hidden md:flex items-center gap-2 lg:gap-3 text-sm font-bold text-[#1F4224] overflow-x-auto">
                {categories.slice(0, 7).map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleOpenStore(cat.id)}
                    className="px-3 py-1.5 rounded-xl text-[#1F4224] hover:text-white transition-all whitespace-nowrap shrink-0 cursor-pointer text-xs lg:text-sm font-bold border border-transparent hover:border-[#0F6E16]"
                    style={{
                      ['--hover-bg' as string]: siteSettings.primaryButtonColor,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = siteSettings.primaryButtonColor;
                      e.currentTarget.style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#1F4224';
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </nav>

              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                {/* Basket Toggle */}
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(true)}
                  aria-label={`Minha Cesta (${totalItemsInCart} itens)`}
                  title={`Minha Cesta · R$ ${totalCartPrice.toFixed(2).replace('.', ',')}`}
                  className="relative inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 bg-[#F7FAF7] hover:bg-[#FFF5EC] border-2 rounded-xl transition-colors shrink-0 cursor-pointer shadow-xs"
                  style={{
                    borderColor: siteSettings.accentButtonColor,
                    color: siteSettings.primaryButtonColor,
                  }}
                >
                  <CustomWovenBasketIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                  {totalItemsInCart > 0 && (
                    <span
                      className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] px-1 rounded-full text-white text-[10px] font-mono-tabular font-extrabold flex items-center justify-center shadow-xs border-2 border-white"
                      style={{ backgroundColor: siteSettings.accentButtonColor }}
                    >
                      {totalItemsInCart}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Promotional Billboard Carousel on Home (up to 5 banners) - SOMENTE IMAGENS, SEM TEXTOS */}
          {banners.length > 0 && (
            <div
              className="relative w-full overflow-hidden bg-zinc-900"
              onMouseEnter={() => setIsBannerPaused(true)}
              onMouseLeave={() => setIsBannerPaused(false)}
            >
              <div
                className="flex transition-transform duration-700 ease-out will-change-transform"
                style={{ transform: `translateX(-${bannerIndex * 100}%)` }}
              >
                {banners.map((poster) => (
                  <div
                    key={poster.id}
                    className="w-full shrink-0 relative aspect-[21/9] sm:aspect-[24/8] md:aspect-[3/1] max-h-[380px] overflow-hidden flex items-center justify-center bg-zinc-950"
                  >
                    <img
                      src={poster.src}
                      alt={poster.alt || 'Banner Promocional'}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                ))}
              </div>

              {/* Navigation Controls */}
              {banners.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setBannerIndex((prev) => (prev - 1 + banners.length) % banners.length)
                    }
                    aria-label="Banner anterior"
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-black/50 hover:bg-[#FF6600] text-white flex items-center justify-center transition-colors cursor-pointer shadow-md backdrop-blur-xs"
                  >
                    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true">
                      <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBannerIndex((prev) => (prev + 1) % banners.length)}
                    aria-label="Próximo banner"
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-black/50 hover:bg-[#FF6600] text-white flex items-center justify-center transition-colors cursor-pointer shadow-md backdrop-blur-xs"
                  >
                    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true">
                      <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  {/* Indicators */}
                  <div className="absolute bottom-2 sm:bottom-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:gap-2 px-3 py-1 rounded-full bg-black/40 backdrop-blur-xs">
                    {banners.map((poster, idx) => (
                      <button
                        key={poster.id}
                        type="button"
                        onClick={() => setBannerIndex(idx)}
                        aria-label={`Ir para banner ${idx + 1}`}
                        className={`h-1.5 sm:h-2 rounded-full transition-all cursor-pointer ${
                          bannerIndex === idx
                            ? 'w-6 sm:w-7 bg-[#FF6600]'
                            : 'w-1.5 sm:w-2 bg-white/60 hover:bg-white/90'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </header>
      )}

      {/* VIEW 1: HOME PAGE */}
      {currentView === 'home' && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-6 sm:py-10 space-y-10 sm:space-y-14">
          {/* DEPARTAMENTOS DA FEIRA: Centralizado, Solto na seção, sem caixa de card, ícones redondos */}
          <section aria-labelledby="departamentos-heading" className="space-y-5 text-center">
            <div className="space-y-1 max-w-xl mx-auto">
              <h3 id="departamentos-heading" className="text-xl sm:text-2xl font-black font-display text-[#112A15] tracking-tight">
                Departamentos da Feira
              </h3>
              <p className="text-xs sm:text-sm text-[#4A634E]">
                Toque na categoria para navegar pelos produtos colhidos no dia
              </p>
            </div>

            {/* Ícones Redondos Soltos e Centralizados */}
            <div className="flex items-center justify-center gap-4 sm:gap-7 overflow-x-auto pb-2 scrollbar-none mx-auto max-w-full">
              {categories.map((cat) => {
                const visual = getCategoryVisual(cat.id, products);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleOpenStore(cat.id)}
                    className="flex flex-col items-center gap-2 group cursor-pointer shrink-0 transition-transform active:scale-95"
                  >
                    <div
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden shadow-xs transition-all duration-200 group-hover:scale-105 group-hover:shadow-md border-2 border-transparent group-hover:border-[#FF6600] bg-white p-0.5"
                    >
                      <img
                        src={visual}
                        alt={cat.label}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-[#112A15] group-hover:text-[#0F6E16] transition-colors text-center whitespace-nowrap">
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Botão ver todos escondidinho abaixo */}
            <div className="flex justify-center pt-1">
              <button
                type="button"
                onClick={() => handleOpenStore('todos')}
                className="text-xs text-[#8A9E8D] hover:text-[#0F6E16] hover:underline transition-colors cursor-pointer py-1 px-3"
              >
                ver todos os produtos →
              </button>
            </div>
          </section>

          {/* SECTION 1: OFERTAS IMPERDÍVEIS - SEM QUEBRA DE LINHA, COM SETAS DE NAVEGAÇÃO LATERAL */}
          <section aria-labelledby="section-ofertas" className="space-y-4 sm:space-y-5">
            <div className="flex items-center justify-between gap-3 border-b-2 border-[#FF6600]/30 pb-3">
              <div>
                <h2 id="section-ofertas" className="text-xl sm:text-3xl font-extrabold font-display text-[#112A15] tracking-tight">
                  Ofertas Imperdíveis
                </h2>
                <p className="text-xs sm:text-sm text-[#4A634E]">
                  Preços especiais selecionados diretamente do produtor para você.
                </p>
              </div>

              {/* Setas para andar para o lado */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => scrollOfertas('left')}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white hover:bg-[#EFF7F0] border border-[#CBE5CD] text-[#0F6E16] flex items-center justify-center transition-all active:scale-90 shadow-2xs cursor-pointer"
                  aria-label="Rolar ofertas para esquerda"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => scrollOfertas('right')}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white hover:bg-[#EFF7F0] border border-[#CBE5CD] text-[#0F6E16] flex items-center justify-center transition-all active:scale-90 shadow-2xs cursor-pointer"
                  aria-label="Rolar ofertas para direita"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Container horizontal com scroll suave sem quebra de linha */}
            <div
              ref={ofertasScrollRef}
              className="flex flex-nowrap overflow-x-auto scroll-smooth gap-3 sm:gap-4 pb-3 pt-1 scrollbar-none snap-x snap-mandatory"
            >
              {ofertasImperdiveis.map((product) => renderProductCard(product, undefined, true))}
            </div>

            {/* Botão de ver todos escondidinho abaixo */}
            <div className="flex justify-center pt-0.5">
              <button
                type="button"
                onClick={() => handleOpenStore('todos')}
                className="text-xs text-[#8A9E8D] hover:text-[#0F6E16] hover:underline transition-colors cursor-pointer py-1 px-3"
              >
                ver todas as ofertas →
              </button>
            </div>
          </section>

          {/* SECTION 2: FAVORITOS DO DIA A DIA - SEM QUEBRA DE LINHA, COM SETAS DE NAVEGAÇÃO LATERAL */}
          <section aria-labelledby="section-favoritos" className="space-y-4 sm:space-y-5">
            <div className="flex items-center justify-between gap-3 border-b-2 border-[#0F6E16]/30 pb-3">
              <div>
                <h2 id="section-favoritos" className="text-xl sm:text-3xl font-extrabold font-display text-[#112A15] tracking-tight">
                  Favoritos do dia a dia
                </h2>
                <p className="text-xs sm:text-sm text-[#4A634E]">
                  Os itens frescos e indispensáveis que não podem faltar na sua mesa.
                </p>
              </div>

              {/* Setas para andar para o lado */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => scrollFavoritos('left')}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white hover:bg-[#EFF7F0] border border-[#CBE5CD] text-[#0F6E16] flex items-center justify-center transition-all active:scale-90 shadow-2xs cursor-pointer"
                  aria-label="Rolar favoritos para esquerda"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => scrollFavoritos('right')}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white hover:bg-[#EFF7F0] border border-[#CBE5CD] text-[#0F6E16] flex items-center justify-center transition-all active:scale-90 shadow-2xs cursor-pointer"
                  aria-label="Rolar favoritos para direita"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Container horizontal com scroll suave sem quebra de linha */}
            <div
              ref={favoritosScrollRef}
              className="flex flex-nowrap overflow-x-auto scroll-smooth gap-3 sm:gap-4 pb-3 pt-1 scrollbar-none snap-x snap-mandatory"
            >
              {favoritosDoDia.map((product) => renderProductCard(product, undefined, true))}
            </div>

            {/* Botão de ver todos escondidinho abaixo */}
            <div className="flex justify-center pt-0.5">
              <button
                type="button"
                onClick={() => handleOpenStore('todos')}
                className="text-xs text-[#8A9E8D] hover:text-[#0F6E16] hover:underline transition-colors cursor-pointer py-1 px-3"
              >
                ver todos os favoritos →
              </button>
            </div>
          </section>
        </main>
      )}

      {/* VIEW 2: MODO CATÁLOGO / PRODUTOS (STORE VIEW) - NAV E BANNER ESCONDIDOS */}
      {currentView === 'store' && (
        <div className="flex-1 flex flex-col">
          {/* Dedicated Store Bar (Nav and Banner are hidden!) */}
          <div className="sticky top-0 z-30 w-full bg-white border-b-2 border-[#D5E6D6] shadow-xs">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-4">
              <div className="flex items-center justify-between sm:justify-start gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentView('home')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E6F2E7] hover:bg-[#0F6E16] text-[#0F6E16] hover:text-white text-xs font-bold transition-all border border-[#CBE5CD] cursor-pointer shadow-2xs shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Voltar ao Início</span>
                </button>

                <div className="flex items-center gap-2 whitespace-nowrap">
                  {/* Logo GRANDE E SEM BORDAS */}
                  <img
                    src={siteSettings.logoUrl}
                    alt="Logo"
                    className="h-9 sm:h-12 w-auto max-w-[120px] sm:max-w-[180px] object-contain shrink-0"
                  />
                  {siteSettings.showBrandName && (
                    <span className="text-sm sm:text-base font-extrabold font-display whitespace-nowrap">
                      <span style={{ color: siteSettings.primaryButtonColor }}>
                        {siteSettings.brandNameFirst || 'Feirão'}
                      </span>{' '}
                      <span style={{ color: siteSettings.accentButtonColor }}>
                        {siteSettings.brandNameSecond || 'Hortifruti'}
                      </span>
                    </span>
                  )}
                </div>

                {/* Mobile Basket trigger in store bar */}
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(true)}
                  className="sm:hidden relative p-2 text-[#0F6E16] bg-[#E6F2E7] rounded-xl border border-[#CBE5CD]"
                >
                  <CustomWovenBasketIcon className="w-5 h-5" />
                  {totalItemsInCart > 0 && (
                    <span
                      className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                      style={{ backgroundColor: siteSettings.accentButtonColor }}
                    >
                      {totalItemsInCart}
                    </span>
                  )}
                </button>
              </div>

              {/* Search Bar + Desktop Basket Trigger */}
              <div className="flex items-center gap-2.5 flex-1 sm:justify-end">
                <div className="relative flex-1 sm:max-w-xs">
                  <CustomLeafSearchIcon className="w-4 h-4 text-[#0F6E16] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar produto..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F7FAF7] border border-[#BBD9BE] rounded-xl text-[#112A15] placeholder:text-[#66806A] focus:outline-none focus:border-[#FF6600]"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(true)}
                  style={{ backgroundColor: siteSettings.primaryButtonColor }}
                  className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl hover:brightness-110 text-white text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
                >
                  <CustomWovenBasketIcon className="w-4 h-4 text-[#FFD000]" />
                  <span>Minha Cesta ({totalItemsInCart})</span>
                  {totalItemsInCart > 0 && (
                    <span className="ml-1 text-[11px] font-mono-tabular text-[#FFD000]">
                      R$ {totalCartPrice.toFixed(2).replace('.', ',')}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Category Buttons Bar for Navigation ("navegar somente pelos botões de categoria") */}
            <div className="bg-[#F0F7F1] border-t border-[#D5E6D6] px-3 sm:px-6 py-2">
              <div className="max-w-7xl mx-auto flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                <span className="text-[11px] font-bold text-[#4A634E] uppercase tracking-wider mr-1 hidden sm:inline shrink-0">
                  Categorias:
                </span>
                {categories.map((cat) => {
                  const active = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                        active
                          ? 'text-white shadow-xs'
                          : 'bg-white text-[#1F4224] hover:bg-[#E0EDE1] border border-[#CBE5CD]'
                      }`}
                      style={{
                        backgroundColor: active ? siteSettings.accentButtonColor : undefined,
                      }}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Product Grid Area in Catalog */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-2.5 sm:px-6 py-4 sm:py-8 space-y-4">
            <div className="flex items-center justify-between text-xs text-[#4A634E] px-1">
              <span>
                Exibindo <strong>{filteredProducts.length}</strong> produtos na categoria{' '}
                <strong style={{ color: siteSettings.primaryButtonColor }}>
                  {categories.find((c) => c.id === selectedCategory)?.label || selectedCategory}
                </strong>
              </span>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-xs hover:underline font-bold"
                  style={{ color: siteSettings.accentButtonColor }}
                >
                  Limpar busca "{searchQuery}"
                </button>
              )}
            </div>

            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#D5E6D6] p-8 sm:p-12 text-center space-y-3">
                <h2 className="text-base sm:text-lg font-bold text-[#112A15] font-display">
                  Nenhum item encontrado para essa busca
                </h2>
                <p className="text-xs sm:text-sm text-[#4A634E]">
                  Tente buscar por outro termo ou mude a categoria acima.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('todos');
                    setSearchQuery('');
                  }}
                  style={{ backgroundColor: siteSettings.primaryButtonColor }}
                  className="px-4 py-2 text-xs font-semibold text-white hover:brightness-110 rounded-xl cursor-pointer"
                >
                  Mostrar Todos os Produtos
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-5">
                {filteredProducts.map((product) => renderProductCard(product, undefined, false))}
              </div>
            )}
          </main>
        </div>
      )}

      {/* Mobile Sticky Bottom Basket Bar */}
      {totalItemsInCart > 0 && (
        <div className="fixed bottom-3 inset-x-3 z-40 sm:hidden">
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            style={{
              backgroundColor: siteSettings.primaryButtonColor,
              borderColor: siteSettings.accentButtonColor,
            }}
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-white border-2 shadow-xl cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <span
                className="min-w-[26px] h-[26px] px-1.5 rounded-full text-white text-xs font-mono-tabular font-extrabold flex items-center justify-center"
                style={{ backgroundColor: siteSettings.accentButtonColor }}
              >
                {totalItemsInCart}
              </span>
              <span className="text-xs font-bold">Ver Minha Cesta</span>
            </div>
            <span className="text-sm font-mono-tabular font-extrabold text-[#FFD000]">
              R$ {totalCartPrice.toFixed(2).replace('.', ',')}
            </span>
          </button>
        </div>
      )}

      {/* Organized Footer with Brasília Time, Brand Info, Operating Hours & Subtle Admin Link */}
      <footer className="bg-white border-t-4 border-[#FF6600] mt-10 sm:mt-14">
        {/* Main Footer Information Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 pb-8 border-b border-[#E5EFE6]">
            {/* Column 1: Brand & About */}
            <div className="space-y-3.5">
              <div className="flex items-center gap-3">
                {/* Logo GRANDE E SEM BORDAS */}
                <img
                  src={siteSettings.logoUrl}
                  alt="Logo"
                  className="h-12 sm:h-14 w-auto max-w-[150px] object-contain shrink-0"
                />
                {siteSettings.showBrandName && (
                  <p className="text-xl sm:text-2xl font-black font-display whitespace-nowrap leading-tight">
                    <span style={{ color: siteSettings.primaryButtonColor }}>
                      {siteSettings.brandNameFirst || 'Feirão'}
                    </span>{' '}
                    <span style={{ color: siteSettings.accentButtonColor }}>
                      {siteSettings.brandNameSecond || 'Hortifruti'}
                    </span>
                  </p>
                )}
              </div>

              <p className="text-xs sm:text-sm text-[#4A634E] leading-relaxed max-w-sm">
                Colheita fresca e produtos de qualidade selecionados a mão diretamente do produtor. Faça seu pedido com facilidade e receba com rapidez.
              </p>

              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#F0F7F1] border border-[#D5E6D6] text-[11px] text-[#2F5233]">
                <span className="w-2 h-2 rounded-full bg-[#0F6E16] animate-pulse shrink-0" />
                <span>Horário de Brasília: <strong>{brasiliaTime}</strong></span>
              </div>
            </div>

            {/* Column 2: Hours & Ordering */}
            <div className="space-y-3">
              <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#112A15]">
                Atendimento & Entregas
              </h4>
              <ul className="space-y-1.5 text-xs sm:text-sm text-[#4A634E]">
                <li className="flex items-center gap-2">
                  <span className="text-[#0F6E16] font-bold">✓</span>
                  <span>Segunda a Sábado: 07h00 às 20h00</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#0F6E16] font-bold">✓</span>
                  <span>Domingos e Feriados: 07h00 às 14h00</span>
                </li>
                <li className="pt-1 text-xs text-[#3E5C42]">
                  Entregas rápidas combinadas e agendadas diretamente pelo WhatsApp.
                </li>
              </ul>
            </div>

            {/* Column 3: Payment Options & Security */}
            <div className="space-y-3">
              <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#112A15]">
                Pagamento Seguro na Entrega
              </h4>
              <p className="text-xs sm:text-sm text-[#4A634E]">
                Pague com total segurança somente após conferir seus produtos frescos:
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="px-2.5 py-1 rounded-md bg-[#F4F8F4] border border-[#D0E4D2] text-[11px] font-semibold text-[#1C3B20]">
                  ⚡ Pix
                </span>
                <span className="px-2.5 py-1 rounded-md bg-[#F4F8F4] border border-[#D0E4D2] text-[11px] font-semibold text-[#1C3B20]">
                  💳 Cartão (Débito/Crédito)
                </span>
                <span className="px-2.5 py-1 rounded-md bg-[#F4F8F4] border border-[#D0E4D2] text-[11px] font-semibold text-[#1C3B20]">
                  💵 Dinheiro (com troco)
                </span>
                <span className="px-2.5 py-1 rounded-md bg-[#F4F8F4] border border-[#D0E4D2] text-[11px] font-semibold text-[#1C3B20]">
                  🥗 Vale Alimentação
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Bar: Copyright & Subtle Admin Link */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6F8873]">
            <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
              <span>
                © {new Date().getFullYear()} {siteSettings.brandNameFirst} {siteSettings.brandNameSecond}. Todos os direitos reservados.
              </span>
              <span className="hidden sm:inline">·</span>
              <a
                href="https://cozycode.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#0F6E16] hover:underline transition-colors whitespace-nowrap"
              >
                Criado por CozyCode
              </a>
            </div>

            {/* Botão de Painel ADM Bem Sutil */}
            <button
              type="button"
              onClick={() => setIsAdminOpen(true)}
              className="inline-flex items-center gap-1.5 text-[11px] text-[#93A595] hover:text-[#0F6E16] transition-colors py-1 px-2 rounded-md hover:bg-[#F2F7F2] cursor-pointer"
              title="Acesso Administrativo"
              aria-label="Acesso ao Painel Administrativo"
            >
              <svg
                className="w-3 h-3 text-[#A8BAAA]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <span>Painel</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={activeProductModal}
        onClose={() => setActiveProductModal(null)}
        onAddToCart={handleAddToCart}
      />

      {/* WhatsApp Checkout Drawer */}
      <WhatsAppCheckoutDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />

      {/* Full Admin Management Modal (Large screen, mobile first, site customization) */}
      <AdminPanelModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        products={products}
        categories={categories}
        banners={banners}
        siteSettings={siteSettings}
        onSaveProduct={handleSaveProduct}
        onDeleteProduct={handleDeleteProduct}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
        onSaveBanners={handleSaveBanners}
        onSaveSiteSettings={handleSaveSiteSettings}
        onResetCatalog={handleResetCatalog}
      />
    </div>
  );
}
