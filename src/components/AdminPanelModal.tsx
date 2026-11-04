import React, { useState, useMemo, useRef } from 'react';
import { CategoryItem, ProductItem, UnitType } from '../data/products';
import {
  ADMIN_TEST_CREDENTIALS,
  BannerItem,
  DEFAULT_SITE_SETTINGS,
  SiteCustomization,
  isAdminAuthenticated,
  setAdminAuthenticated,
  compressBannerImage,
  compressLogoImage,
} from '../data/catalogStorage';
import {
  CustomCloseCrossIcon,
  ProductArtIllustration,
} from './HortifrutiIllustrations';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductItem[];
  categories: CategoryItem[];
  banners: BannerItem[];
  siteSettings: SiteCustomization;
  onSaveProduct: (product: ProductItem) => void;
  onDeleteProduct: (productId: string) => void;
  onAddCategory: (categoryName: string) => void;
  onDeleteCategory: (categoryId: string) => void;
  onSaveBanners: (banners: BannerItem[]) => void;
  onSaveSiteSettings: (settings: SiteCustomization) => void;
  onResetCatalog: () => void;
}

const COLOR_PRESETS = [
  { label: 'Verde Feira', color: '#0F6E16' },
  { label: 'Laranja Vibrante', color: '#FF6600' },
  { label: 'Vermelho Morango', color: '#D32F2F' },
  { label: 'Azul Hortifruti', color: '#1565C0' },
  { label: 'Roxo Uva', color: '#6A1B9A' },
  { label: 'Ambar Dourado', color: '#D97706' },
  { label: 'Esmeralda', color: '#059669' },
  { label: 'Preto Elegante', color: '#1A1A1A' },
];

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  products,
  categories,
  banners,
  siteSettings,
  onSaveProduct,
  onDeleteProduct,
  onAddCategory,
  onDeleteCategory,
  onSaveBanners,
  onSaveSiteSettings,
  onResetCatalog,
}) => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(isAdminAuthenticated);
  const [loginInput, setLoginInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Admin panel UI state - Tabs: 'produtos' | 'categorias' | 'banners' | 'personalizacao'
  const [activeTab, setActiveTab] = useState<'produtos' | 'categorias' | 'banners' | 'personalizacao'>('produtos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState('todos');

  // Product editing modal state
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [newCatNameInput, setNewCatNameInput] = useState('');
  const [inlineCatError, setInlineCatError] = useState<string | null>(null);
  const [showNewCatModal, setShowNewCatModal] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Customization state
  const [customSettings, setCustomSettings] = useState<SiteCustomization>(siteSettings);

  // Hidden file inputs
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const bannerUploadInputRef = useRef<HTMLInputElement>(null);
  const newBannerUploadInputRef = useRef<HTMLInputElement>(null);
  const logoUploadInputRef = useRef<HTMLInputElement>(null);
  const logoCameraInputRef = useRef<HTMLInputElement>(null);
  const [targetBannerIdForPhoto, setTargetBannerIdForPhoto] = useState<string | null>(null);

  const showToast = (message: string) => {
    setSuccessToast(message);
    setTimeout(() => {
      setSuccessToast(null);
    }, 3500);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      loginInput.trim() === ADMIN_TEST_CREDENTIALS.login &&
      passwordInput.trim() === ADMIN_TEST_CREDENTIALS.password
    ) {
      setIsAuthenticated(true);
      setAdminAuthenticated(true);
      setLoginError(null);
      showToast('Acesso administrativo liberado com sucesso!');
    } else {
      setLoginError('Login ou senha incorretos. Use 12345 para login e 12345 para senha para testes.');
    }
  };

  const handleQuickFillTest = () => {
    setLoginInput(ADMIN_TEST_CREDENTIALS.login);
    setPasswordInput(ADMIN_TEST_CREDENTIALS.password);
    setLoginError(null);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAdminAuthenticated(false);
    setLoginInput('');
    setPasswordInput('');
    setEditingProduct(null);
    showToast('Você saiu do painel administrativo.');
  };

  // Filter products in admin
  const filteredAdminProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCatFilter === 'todos' || p.categoryId === selectedCatFilter;
      const q = searchTerm.trim().toLowerCase();
      const matchQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.categoryLabel.toLowerCase().includes(q) ||
        p.unitLabel.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [products, selectedCatFilter, searchTerm]);

  // Quick toggle Oferta on a product
  const handleToggleOferta = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    const updated = { ...prod, isOferta: !prod.isOferta };
    onSaveProduct(updated);
    showToast(`"${prod.name}" ${updated.isOferta ? 'adicionado às Ofertas' : 'removido das Ofertas'}!`);
  };

  // Quick toggle Favorito on a product
  const handleToggleFavorito = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    const updated = { ...prod, isFavorito: !prod.isFavorito };
    onSaveProduct(updated);
    showToast(`"${prod.name}" ${updated.isFavorito ? 'adicionado aos Favoritos' : 'removido dos Favoritos'}!`);
  };

  // Handle adding a new category
  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCatNameInput.trim();
    if (!trimmed) {
      setInlineCatError('Informe o nome da categoria.');
      return;
    }
    const slug = trimmed
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const alreadyExists = categories.some((c) => c.id === slug || c.label.toLowerCase() === trimmed.toLowerCase());
    if (alreadyExists) {
      setInlineCatError('Essa categoria já existe.');
      return;
    }

    onAddCategory(trimmed);
    setNewCatNameInput('');
    setInlineCatError(null);
    setShowNewCatModal(false);
    showToast(`Categoria "${trimmed}" criada com sucesso!`);
  };

  // Start creating new product
  const handleStartNewProduct = () => {
    const firstCat = categories.find((c) => c.id !== 'todos') || { id: 'frutas', label: 'Frutas' };
    const emptyProduct: ProductItem = {
      id: `prod-${Date.now()}`,
      name: '',
      categoryId: firstCat.id,
      categoryLabel: firstCat.label,
      unitType: 'kg',
      unitLabel: '1kg',
      price: 9.90,
      artId: 'morango',
      nutritionalHighlight: 'Produto fresco e selecionado a mão.',
      isOferta: false,
      isFavorito: false,
    };
    setEditingProduct(emptyProduct);
  };

  // Image Processing from Camera or Upload
  const handleImageFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 700;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          setEditingProduct((prev) => (prev ? { ...prev, artId: compressedDataUrl } : null));
          showToast('Foto capturada e otimizada!');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDeletePhoto = () => {
    setEditingProduct((prev) => (prev ? { ...prev, artId: '' } : null));
    showToast('Foto removida. Agora você pode bater uma nova foto ou fazer upload.');
  };

  // Save product from form
  const handleSaveProductForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    if (!editingProduct.name.trim()) {
      alert('Por favor, informe o nome do produto.');
      return;
    }
    if (editingProduct.price <= 0) {
      alert('Por favor, informe um preço válido.');
      return;
    }

    const cat = categories.find((c) => c.id === editingProduct.categoryId);
    const updated: ProductItem = {
      ...editingProduct,
      name: editingProduct.name.trim(),
      categoryLabel: cat ? cat.label : editingProduct.categoryId,
      unitLabel: editingProduct.unitLabel.trim() || '1kg',
      artId: editingProduct.artId || 'morango',
    };

    onSaveProduct(updated);
    setEditingProduct(null);
    showToast(`Produto "${updated.name}" salvo com sucesso!`);
  };

  // BANNER MANAGEMENT HANDLERS (IMAGE ONLY)
  const handleTriggerChangeBannerPhoto = (bannerId: string) => {
    setTargetBannerIdForPhoto(bannerId);
    bannerUploadInputRef.current?.click();
  };

  const handleBannerPhotoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !targetBannerIdForPhoto) return;

    try {
      const compressedImage = await compressBannerImage(file);
      const updated = banners.map((b) =>
        b.id === targetBannerIdForPhoto ? { ...b, src: compressedImage } : b
      );
      onSaveBanners(updated);
      showToast('Imagem do banner atualizada com sucesso!');
    } catch {
      alert('Erro ao processar imagem do banner.');
    } finally {
      e.target.value = '';
      setTargetBannerIdForPhoto(null);
    }
  };

  // Add new banner image directly via upload (up to 5)
  const handleAddNewBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (banners.length >= 5) {
      alert('O limite máximo é de 5 banners.');
      return;
    }

    try {
      const compressedImage = await compressBannerImage(file);
      const newBanner: BannerItem = {
        id: `banner-${Date.now()}`,
        src: compressedImage,
        alt: `Banner Promocional ${banners.length + 1}`,
      };
      onSaveBanners([...banners, newBanner]);
      showToast('Novo banner adicionado ao carrossel!');
    } catch {
      alert('Erro ao carregar imagem do banner.');
    } finally {
      e.target.value = '';
    }
  };

  // Delete banner (min 1 banner)
  const handleDeleteBanner = (bannerId: string) => {
    if (banners.length <= 1) {
      alert('É necessário manter pelo menos 1 banner no carrossel.');
      return;
    }
    if (window.confirm('Deseja realmente remover esta foto de banner?')) {
      const updated = banners.filter((b) => b.id !== bannerId);
      onSaveBanners(updated);
      showToast('Banner removido com sucesso!');
    }
  };

  // LOGO UPLOAD HANDLER (SEM BORDAS)
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressedLogo = await compressLogoImage(file);
      const updated = { ...customSettings, logoUrl: compressedLogo };
      setCustomSettings(updated);
      onSaveSiteSettings(updated);
      showToast('Logo atualizada com sucesso na nav e no rodapé!');
    } catch {
      alert('Erro ao carregar a logo.');
    } finally {
      e.target.value = '';
    }
  };

  const handleSaveCustomization = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSiteSettings(customSettings);
    showToast('Personalização salva e aplicada com sucesso!');
  };

  const handleConfirmReset = () => {
    if (window.confirm('Tem certeza que deseja restaurar o catálogo de produtos e configurações para o padrão original?')) {
      onResetCatalog();
      setCustomSettings(DEFAULT_SITE_SETTINGS);
      setEditingProduct(null);
      showToast('Catálogo e configurações restaurados para o padrão!');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      {/* TELA GRANDE: max-w-6xl w-full h-full sm:h-[94vh] */}
      <div className="relative w-full h-full sm:h-[94vh] sm:max-w-6xl bg-white sm:rounded-2xl shadow-2xl border-0 sm:border-2 border-[#0F6E16] flex flex-col overflow-hidden text-[#112A15]">
        {/* Hidden File Inputs */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleImageFileSelected}
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageFileSelected}
        />
        <input
          ref={bannerUploadInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleBannerPhotoSelected}
        />
        <input
          ref={newBannerUploadInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAddNewBannerUpload}
        />
        <input
          ref={logoUploadInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleLogoUpload}
        />
        <input
          ref={logoCameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleLogoUpload}
        />

        {/* Toast feedback */}
        {successToast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-[#0F6E16] text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-bold flex items-center gap-2 border border-emerald-300 animate-in slide-in-from-top duration-150 max-w-[90%] text-center">
            <svg className="w-4 h-4 text-[#FFD000] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            <span className="truncate">{successToast}</span>
          </div>
        )}

        {/* Modal Sticky Header */}
        <div className="flex items-center justify-between px-4 sm:px-8 py-3.5 sm:py-4 bg-[#0F6E16] text-white border-b-2 border-[#FF6600] shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white border border-white/20 shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="truncate">
              <h2 className="text-base sm:text-lg font-bold font-display leading-tight truncate">
                Painel Administrativo
              </h2>
              <p className="text-xs text-white/80 leading-none truncate mt-0.5">
                {isAuthenticated ? 'Produtos, Ofertas, Favoritos, Categorias, Banners e Personalização' : 'Acesso Restrito'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isAuthenticated && (
              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Desconectar do painel"
              >
                Sair
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              aria-label="Fechar painel"
            >
              <CustomCloseCrossIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#F7FAF7]">
          {!isAuthenticated ? (
            /* Login Form */
            <div className="max-w-md mx-auto my-auto bg-white p-6 sm:p-8 rounded-2xl border border-[#D5E6D6] shadow-sm space-y-4">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 mx-auto rounded-full bg-[#E6F2E7] flex items-center justify-center text-[#0F6E16] mb-1.5">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold font-display text-[#112A15]">
                  Entrar no Painel Administrativo
                </h3>
                <p className="text-xs text-[#4A634E]">
                  Área para editar produtos, ofertas, favoritos, categorias, banners e cores do site.
                </p>
              </div>

              {/* Test credentials highlight box */}
              <div className="p-3.5 bg-[#FFF8E7] rounded-xl border border-[#FFE082] text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#8A5200] flex items-center gap-1 text-xs">
                    Credenciais de Teste
                  </span>
                  <button
                    type="button"
                    onClick={handleQuickFillTest}
                    className="text-xs font-bold text-[#0F6E16] hover:underline cursor-pointer bg-white px-2 py-0.5 rounded shadow-2xs border border-[#FFE082]"
                  >
                    Auto-preencher (12345)
                  </button>
                </div>
                <div className="flex items-center gap-3 text-xs text-[#5D3A00]">
                  <span>Login: <strong className="font-mono bg-white/70 px-1 rounded">12345</strong></span>
                  <span>Senha: <strong className="font-mono bg-white/70 px-1 rounded">12345</strong></span>
                </div>
              </div>

              {loginError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#1F4224] mb-1">
                    Login / Usuário
                  </label>
                  <input
                    type="text"
                    value={loginInput}
                    onChange={(e) => setLoginInput(e.target.value)}
                    placeholder="Digite seu login (ex: 12345)"
                    autoFocus
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#BBD9BE] rounded-xl text-[#112A15] placeholder:text-[#66806A] focus:outline-none focus:border-[#0F6E16]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1F4224] mb-1">
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Digite sua senha (ex: 12345)"
                      className="w-full pl-3.5 pr-12 py-2.5 text-sm bg-white border border-[#BBD9BE] rounded-xl text-[#112A15] placeholder:text-[#66806A] focus:outline-none focus:border-[#0F6E16]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#4A634E] hover:text-[#0F6E16] cursor-pointer"
                    >
                      {showPassword ? 'Ocultar' : 'Ver'}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-[#0F6E16] hover:bg-[#0A520F] text-white font-bold text-sm transition-all shadow-md active:scale-[0.99] cursor-pointer"
                >
                  Entrar no Painel
                </button>
              </form>
            </div>
          ) : (
            /* Admin Dashboard Content */
            <div className="space-y-5">
              {/* Top Navigation Tabs - Tela Grande */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-[#D5E6D6] shadow-2xs">
                {/* 4 Tabs */}
                <div className="flex items-center gap-1.5 p-1.5 bg-[#E6F2E7] rounded-xl border border-[#CBE5CD] overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('produtos');
                      setEditingProduct(null);
                    }}
                    className={`px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer text-center ${
                      activeTab === 'produtos' && !editingProduct
                        ? 'bg-[#0F6E16] text-white shadow-xs'
                        : 'text-[#1F4224] hover:text-[#0F6E16]'
                    }`}
                  >
                    Produtos ({products.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('categorias');
                      setEditingProduct(null);
                    }}
                    className={`px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer text-center ${
                      activeTab === 'categorias' && !editingProduct
                        ? 'bg-[#0F6E16] text-white shadow-xs'
                        : 'text-[#1F4224] hover:text-[#0F6E16]'
                    }`}
                  >
                    Categorias ({categories.filter((c) => c.id !== 'todos').length})
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('banners');
                      setEditingProduct(null);
                    }}
                    className={`px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer text-center ${
                      activeTab === 'banners'
                        ? 'bg-[#0F6E16] text-white shadow-xs'
                        : 'text-[#1F4224] hover:text-[#0F6E16]'
                    }`}
                  >
                    🖼️ Banners ({banners.length}/5)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('personalizacao');
                      setEditingProduct(null);
                    }}
                    className={`px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer text-center ${
                      activeTab === 'personalizacao'
                        ? 'bg-[#0F6E16] text-white shadow-xs'
                        : 'text-[#1F4224] hover:text-[#0F6E16]'
                    }`}
                  >
                    🎨 Personalização
                  </button>
                </div>

                {/* Primary Actions based on Active Tab */}
                <div className="flex items-center gap-2.5">
                  {activeTab === 'produtos' && (
                    <button
                      type="button"
                      onClick={handleStartNewProduct}
                      className="min-h-[42px] inline-flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-[#FF6600] hover:bg-[#E05500] rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Novo Produto</span>
                    </button>
                  )}

                  {activeTab === 'categorias' && (
                    <button
                      type="button"
                      onClick={() => setShowNewCatModal(true)}
                      className="min-h-[42px] inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-[#0F6E16] bg-[#E6F2E7] hover:bg-[#D4EBD6] border border-[#CBE5CD] rounded-xl transition-colors cursor-pointer"
                    >
                      <span>+ Nova Categoria</span>
                    </button>
                  )}

                  {activeTab === 'banners' && banners.length < 5 && (
                    <button
                      type="button"
                      onClick={() => newBannerUploadInputRef.current?.click()}
                      className="min-h-[42px] inline-flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-[#FF6600] hover:bg-[#E05500] rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Adicionar Foto de Banner ({banners.length}/5)</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleConfirmReset}
                    title="Restaurar dados originais"
                    className="p-2.5 text-xs text-[#66806A] hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* TAB 4: PERSONALIZAÇÃO DO SITE */}
              {activeTab === 'personalizacao' && (
                <div className="space-y-6">
                  <form onSubmit={handleSaveCustomization} className="space-y-6">
                    {/* SECTION 1: LOGO DO SITE (SEM BORDAS) */}
                    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#D5E6D6] shadow-2xs space-y-4">
                      <div className="border-b border-[#EBF2EB] pb-3">
                        <h4 className="text-base font-bold text-[#112A15] font-display flex items-center gap-2">
                          <span>📷</span>
                          <span>Logo do Site (Nav e Rodapé)</span>
                        </h4>
                        <p className="text-xs text-[#4A634E] mt-0.5">
                          Edite a imagem da logo do site. A logo é exibida limpa e sem bordas tanto no topo (nav) quanto no rodapé.
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-5">
                        {/* Logo Preview (SEM BORDAS) */}
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#F7FAF7] flex items-center justify-center p-2 shrink-0">
                          <img
                            src={customSettings.logoUrl}
                            alt="Preview da Logo"
                            className="w-full h-full object-contain"
                          />
                        </div>

                        {/* Logo Upload Actions */}
                        <div className="flex-1 w-full space-y-2.5">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <button
                              type="button"
                              onClick={() => logoCameraInputRef.current?.click()}
                              className="min-h-[42px] px-4 py-2 rounded-xl bg-[#0F6E16] hover:bg-[#0A520F] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span>Tirar Foto da Logo (Câmera)</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => logoUploadInputRef.current?.click()}
                              className="min-h-[42px] px-4 py-2 rounded-xl bg-[#FF6600] hover:bg-[#E05500] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                              </svg>
                              <span>Upload de Imagem (Celular / PC)</span>
                            </button>
                          </div>

                          <div className="pt-1">
                            <span className="text-[11px] text-[#4A634E]">
                              Dica: Use PNG com fundo transparente ou imagem quadrada nítida.
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 2: MOSTRAR NOME DA EMPRESA OU SOMENTE A LOGO */}
                    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#D5E6D6] shadow-2xs space-y-4">
                      <div className="border-b border-[#EBF2EB] pb-3">
                        <h4 className="text-base font-bold text-[#112A15] font-display flex items-center gap-2">
                          <span>🏷️</span>
                          <span>Nome da Empresa ao lado da Logo</span>
                        </h4>
                        <p className="text-xs text-[#4A634E] mt-0.5">
                          Escolha se o nome da empresa deve aparecer ao lado da logo ou se deseja deixar apenas a foto da logo.
                        </p>
                      </div>

                      {/* Toggle Option */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3.5 ${
                          customSettings.showBrandName
                            ? 'bg-[#F0F8F1] border-[#0F6E16] shadow-xs'
                            : 'bg-white border-[#D5E6D6] hover:border-[#0F6E16]/50'
                        }`}>
                          <input
                            type="radio"
                            name="showBrandName"
                            checked={customSettings.showBrandName === true}
                            onChange={() => setCustomSettings({ ...customSettings, showBrandName: true })}
                            className="w-5 h-5 text-[#0F6E16] focus:ring-[#0F6E16] cursor-pointer"
                          />
                          <div>
                            <span className="block text-sm font-bold text-[#112A15]">
                              Logo + Nome da Empresa
                            </span>
                            <span className="text-xs text-[#4A634E]">
                              Exibe a logo acompanhada do nome lado a lado
                            </span>
                          </div>
                        </label>

                        <label className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3.5 ${
                          !customSettings.showBrandName
                            ? 'bg-[#F0F8F1] border-[#0F6E16] shadow-xs'
                            : 'bg-white border-[#D5E6D6] hover:border-[#0F6E16]/50'
                        }`}>
                          <input
                            type="radio"
                            name="showBrandName"
                            checked={customSettings.showBrandName === false}
                            onChange={() => setCustomSettings({ ...customSettings, showBrandName: false })}
                            className="w-5 h-5 text-[#0F6E16] focus:ring-[#0F6E16] cursor-pointer"
                          />
                          <div>
                            <span className="block text-sm font-bold text-[#112A15]">
                              Somente a Logo
                            </span>
                            <span className="text-xs text-[#4A634E]">
                              Oculta o texto do nome e exibe apenas a imagem da logo
                            </span>
                          </div>
                        </label>
                      </div>

                      {/* Brand Name Text Fields (if enabled) */}
                      {customSettings.showBrandName && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                          <div>
                            <label className="block text-xs font-bold text-[#1F4224] mb-1">
                              Primeira Palavra do Nome
                            </label>
                            <input
                              type="text"
                              value={customSettings.brandNameFirst}
                              onChange={(e) =>
                                setCustomSettings({ ...customSettings, brandNameFirst: e.target.value })
                              }
                              placeholder="Ex: Feirão"
                              className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#BBD9BE] rounded-xl text-[#112A15] focus:outline-none focus:border-[#0F6E16]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-[#1F4224] mb-1">
                              Segunda Palavra (Destaque Laranja)
                            </label>
                            <input
                              type="text"
                              value={customSettings.brandNameSecond}
                              onChange={(e) =>
                                setCustomSettings({ ...customSettings, brandNameSecond: e.target.value })
                              }
                              placeholder="Ex: Hortifruti"
                              className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#BBD9BE] rounded-xl text-[#112A15] focus:outline-none focus:border-[#0F6E16]"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* SECTION 3: CORES DOS BOTÕES */}
                    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#D5E6D6] shadow-2xs space-y-4">
                      <div className="border-b border-[#EBF2EB] pb-3">
                        <h4 className="text-base font-bold text-[#112A15] font-display flex items-center gap-2">
                          <span>🎨</span>
                          <span>Cores dos Botões do Site</span>
                        </h4>
                        <p className="text-xs text-[#4A634E] mt-0.5">
                          Escolha as cores dos botões de ação, compra, filtros e destaques da loja.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Primary Button Color */}
                        <div className="space-y-3">
                          <label className="block text-xs font-bold text-[#1F4224]">
                            Cor Principal dos Botões (Adicionar, Carrinho, Salvar)
                          </label>

                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              value={customSettings.primaryButtonColor}
                              onChange={(e) =>
                                setCustomSettings({ ...customSettings, primaryButtonColor: e.target.value })
                              }
                              className="w-12 h-12 rounded-xl border border-gray-200 cursor-pointer p-0.5 bg-white"
                            />
                            <input
                              type="text"
                              value={customSettings.primaryButtonColor}
                              onChange={(e) =>
                                setCustomSettings({ ...customSettings, primaryButtonColor: e.target.value })
                              }
                              placeholder="#0F6E16"
                              className="w-32 px-3 py-2 text-xs sm:text-sm font-mono font-bold uppercase bg-white border border-[#BBD9BE] rounded-xl text-[#112A15]"
                            />
                          </div>

                          {/* Quick color chips */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            {COLOR_PRESETS.map((p) => (
                              <button
                                key={p.color}
                                type="button"
                                onClick={() =>
                                  setCustomSettings({ ...customSettings, primaryButtonColor: p.color })
                                }
                                className="px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1.5"
                                style={{
                                  backgroundColor: customSettings.primaryButtonColor === p.color ? p.color : '#FFFFFF',
                                  color: customSettings.primaryButtonColor === p.color ? '#FFFFFF' : '#112A15',
                                  borderColor: p.color,
                                }}
                              >
                                <span
                                  className="w-2.5 h-2.5 rounded-full shrink-0"
                                  style={{ backgroundColor: p.color }}
                                />
                                <span>{p.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Accent/Secondary Button Color */}
                        <div className="space-y-3">
                          <label className="block text-xs font-bold text-[#1F4224]">
                            Cor de Destaque / Secundária (Ofertas, Filtro Ativo, Badges)
                          </label>

                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              value={customSettings.accentButtonColor}
                              onChange={(e) =>
                                setCustomSettings({ ...customSettings, accentButtonColor: e.target.value })
                              }
                              className="w-12 h-12 rounded-xl border border-gray-200 cursor-pointer p-0.5 bg-white"
                            />
                            <input
                              type="text"
                              value={customSettings.accentButtonColor}
                              onChange={(e) =>
                                setCustomSettings({ ...customSettings, accentButtonColor: e.target.value })
                              }
                              placeholder="#FF6600"
                              className="w-32 px-3 py-2 text-xs sm:text-sm font-mono font-bold uppercase bg-white border border-[#BBD9BE] rounded-xl text-[#112A15]"
                            />
                          </div>

                          {/* Quick color chips */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            {COLOR_PRESETS.map((p) => (
                              <button
                                key={p.color}
                                type="button"
                                onClick={() =>
                                  setCustomSettings({ ...customSettings, accentButtonColor: p.color })
                                }
                                className="px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1.5"
                                style={{
                                  backgroundColor: customSettings.accentButtonColor === p.color ? p.color : '#FFFFFF',
                                  color: customSettings.accentButtonColor === p.color ? '#FFFFFF' : '#112A15',
                                  borderColor: p.color,
                                }}
                              >
                                <span
                                  className="w-2.5 h-2.5 rounded-full shrink-0"
                                  style={{ backgroundColor: p.color }}
                                />
                                <span>{p.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Live Button Preview Box */}
                      <div className="p-4 bg-[#F7FAF7] rounded-xl border border-[#D5E6D6] space-y-2 mt-4">
                        <span className="text-xs font-bold text-[#4A634E] uppercase tracking-wider block">
                          Prévia dos Botões com as Novas Cores
                        </span>
                        <div className="flex items-center gap-3 flex-wrap">
                          <button
                            type="button"
                            style={{ backgroundColor: customSettings.primaryButtonColor }}
                            className="px-5 py-2.5 rounded-xl text-white font-bold text-xs shadow-xs"
                          >
                            + Adicionar à Cesta
                          </button>
                          <button
                            type="button"
                            style={{ backgroundColor: customSettings.accentButtonColor }}
                            className="px-5 py-2.5 rounded-xl text-white font-bold text-xs shadow-xs"
                          >
                            🔥 Oferta Especial
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Submit Bar */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setCustomSettings(siteSettings)}
                        className="min-h-[44px] px-5 py-2 text-xs sm:text-sm font-bold text-[#4A634E] hover:text-[#112A15] bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
                      >
                        Descartar Alterações
                      </button>
                      <button
                        type="submit"
                        className="min-h-[44px] px-7 py-2 text-xs sm:text-sm font-bold text-white bg-[#0F6E16] hover:bg-[#0A520F] rounded-xl transition-all shadow-md active:scale-[0.99] cursor-pointer"
                      >
                        Salvar Personalização do Site
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 3: BANNERS (SOMENTE IMAGENS, SEM TEXTOS, CARD REMOVIDO, SEM BOTÃO RESTAURAR) */}
              {activeTab === 'banners' && (
                <div className="space-y-4">
                  {/* Clean Info Box: Only ideal size and count */}
                  <div className="bg-[#EBF7EE] p-4 rounded-2xl border-2 border-[#0F6E16]/30 shadow-xs space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#0F6E16] text-white flex items-center justify-center text-xs font-bold">
                        📐
                      </span>
                      <h4 className="text-sm font-bold text-[#0F6E16] font-display">
                        Fotos do Carrossel de Banner (Somente Imagens)
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs text-[#1F4224]">
                      <div className="bg-white p-3 rounded-xl border border-[#CBE5CD]">
                        <span className="block text-[10px] font-bold text-[#4A634E] uppercase">
                          Tamanho Ideal Recomendado
                        </span>
                        <strong className="text-sm text-[#0F6E16]">1600 × 600 px</strong>
                        <span className="block text-[11px] text-[#4A634E] mt-0.5">
                          Formato horizontal panorâmico (~16:6 ou 16:9)
                        </span>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-[#CBE5CD]">
                        <span className="block text-[10px] font-bold text-[#4A634E] uppercase">
                          Capacidade do Carrossel
                        </span>
                        <strong className="text-sm text-[#FF6600]">{banners.length} de até 5 fotos</strong>
                        <span className="block text-[11px] text-[#4A634E] mt-0.5">
                          O banner exibe somente as fotos puras, sem textos
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Banners Image Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {banners.map((b, idx) => (
                      <div
                        key={b.id}
                        className="bg-white rounded-2xl border-2 border-[#D5E6D6] overflow-hidden shadow-xs hover:border-[#0F6E16] transition-all flex flex-col"
                      >
                        {/* Pure Image Banner View */}
                        <div className="relative aspect-[21/9] w-full bg-[#0A520F] overflow-hidden group">
                          <img
                            src={b.src}
                            alt={`Banner ${idx + 1}`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
                          />
                          <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md bg-black/65 backdrop-blur-xs text-white text-xs font-bold font-mono">
                            Foto #{idx + 1}
                          </span>
                        </div>

                        {/* Action Buttons for this Banner */}
                        <div className="p-3.5 bg-white flex items-center justify-between gap-2 border-t border-[#EBF2EB]">
                          <button
                            type="button"
                            onClick={() => handleTriggerChangeBannerPhoto(b.id)}
                            className="flex-1 min-h-[40px] px-4 py-2 rounded-xl bg-[#0F6E16] hover:bg-[#0A520F] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-2xs active:scale-95"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            <span>Trocar Foto (Upload)</span>
                          </button>

                          {banners.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleDeleteBanner(b.id)}
                              className="min-h-[40px] px-3 py-2 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-colors cursor-pointer text-xs font-bold flex items-center gap-1.5"
                              title="Excluir este banner"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              <span>Excluir</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Add banner card if < 5 */}
                    {banners.length < 5 && (
                      <button
                        type="button"
                        onClick={() => newBannerUploadInputRef.current?.click()}
                        className="aspect-[21/9] rounded-2xl border-2 border-dashed border-[#BBD9BE] hover:border-[#0F6E16] bg-[#F7FAF7] hover:bg-[#EBF7EE] p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
                      >
                        <div className="w-12 h-12 rounded-full bg-[#0F6E16]/10 text-[#0F6E16] group-hover:bg-[#0F6E16] group-hover:text-white flex items-center justify-center mb-2 transition-colors">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                          </svg>
                        </div>
                        <span className="text-sm font-bold text-[#0F6E16]">
                          Adicionar Nova Foto de Banner
                        </span>
                        <span className="text-xs text-[#4A634E] mt-0.5">
                          Faça upload do celular ou PC (Restam {5 - banners.length} vagas)
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* 
                ACTIVE PRODUCT EDIT FORM (TELA GRANDE)
                With Ofertas and Favoritos selectors, Dropdown unit, camera/upload photo
              */}
              {activeTab === 'produtos' && editingProduct ? (
                <div className="bg-white rounded-2xl border-2 border-[#0F6E16] p-5 sm:p-7 shadow-md space-y-5 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between border-b border-[#E0EDE1] pb-3">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold font-display text-[#112A15]">
                        {products.some((p) => p.id === editingProduct.id)
                          ? `Editar Produto: ${editingProduct.name || 'Sem Nome'}`
                          : 'Novo Produto'}
                      </h3>
                      <p className="text-xs text-[#4A634E]">
                        Configure nome, preço, unidade, foto e escolha se aparece nas Ofertas ou Favoritos da tela inicial.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingProduct(null)}
                      className="text-xs font-bold text-[#66806A] hover:text-[#112A15] px-3 py-1.5 rounded-lg border border-gray-200 cursor-pointer"
                    >
                      Voltar à Lista
                    </button>
                  </div>

                  <form onSubmit={handleSaveProductForm} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Name */}
                      <div>
                        <label className="block text-xs font-bold text-[#1F4224] mb-1">
                          Nome do Produto *
                        </label>
                        <input
                          type="text"
                          required
                          value={editingProduct.name}
                          onChange={(e) =>
                            setEditingProduct({ ...editingProduct, name: e.target.value })
                          }
                          placeholder="Ex: Morango Especial, Queijo Minas, Melancia..."
                          className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#BBD9BE] rounded-xl text-[#112A15] focus:outline-none focus:border-[#0F6E16]"
                        />
                      </div>

                      {/* Price */}
                      <div>
                        <label className="block text-xs font-bold text-[#1F4224] mb-1">
                          Preço de Venda (R$) *
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#0F6E16]">
                            R$
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            min="0.10"
                            required
                            value={editingProduct.price}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                price: parseFloat(e.target.value) || 0,
                              })
                            }
                            placeholder="0,00"
                            className="w-full pl-9 pr-3.5 py-2.5 text-sm font-mono-tabular font-bold bg-white border border-[#BBD9BE] rounded-xl text-[#112A15] focus:outline-none focus:border-[#0F6E16]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Category Selection */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-[#1F4224]">
                            Categoria *
                          </label>
                          <button
                            type="button"
                            onClick={() => setShowNewCatModal(true)}
                            className="text-xs font-bold text-[#FF6600] hover:underline cursor-pointer"
                          >
                            + Nova Categoria
                          </button>
                        </div>
                        <select
                          value={editingProduct.categoryId}
                          onChange={(e) => {
                            const found = categories.find((c) => c.id === e.target.value);
                            setEditingProduct({
                              ...editingProduct,
                              categoryId: e.target.value,
                              categoryLabel: found ? found.label : e.target.value,
                            });
                          }}
                          className="w-full px-3.5 py-2.5 text-sm font-semibold bg-white border border-[#BBD9BE] rounded-xl text-[#112A15] focus:outline-none focus:border-[#0F6E16] cursor-pointer"
                        >
                          {categories
                            .filter((c) => c.id !== 'todos')
                            .map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.label}
                              </option>
                            ))}
                        </select>
                      </div>

                      {/* Unit Type in Dropdown Select */}
                      <div>
                        <label className="block text-xs font-bold text-[#0F6E16] mb-1">
                          Tipo de Unidade de Medida (obrigatório) *
                        </label>
                        <select
                          required
                          value={editingProduct.unitType}
                          onChange={(e) => {
                            const newType = e.target.value as UnitType;
                            const defaultLabel =
                              newType === 'kg'
                                ? '1kg'
                                : newType === 'pct'
                                ? 'Pacote'
                                : newType === 'unidade'
                                ? 'Unidade'
                                : '500g';
                            setEditingProduct({
                              ...editingProduct,
                              unitType: newType,
                              unitLabel: defaultLabel,
                            });
                          }}
                          className="w-full px-3.5 py-2.5 text-sm font-semibold bg-white border border-[#BBD9BE] rounded-xl text-[#112A15] focus:outline-none focus:border-[#0F6E16] cursor-pointer"
                        >
                          <option value="kg">Quilograma (kg)</option>
                          <option value="pct">Pacote (pct / maço / bandeja)</option>
                          <option value="unidade">Unidade (un)</option>
                          <option value="gramas">Gramas (g)</option>
                        </select>
                      </div>
                    </div>

                    {/* Display Label in Store */}
                    <div>
                      <label className="block text-xs font-semibold text-[#1F4224] mb-1">
                        Rótulo Exibido na Loja (ex: "1kg", "Bandeja 250g", "Maço 300g", "Unidade 500g")
                      </label>
                      <input
                        type="text"
                        value={editingProduct.unitLabel}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, unitLabel: e.target.value })
                        }
                        placeholder="Ex: 1kg, Bandeja 250g, Maço, Unidade..."
                        className="w-full px-3.5 py-2 text-sm bg-white border border-[#BBD9BE] rounded-xl text-[#112A15] focus:outline-none focus:border-[#0F6E16]"
                      />
                    </div>

                    {/* SELEÇÃO PARA OFERTAS OU FAVORITOS NA TELA INICIAL */}
                    <div className="bg-[#FFF8F0] p-4 rounded-xl border-2 border-[#FFD0B0] space-y-2.5">
                      <label className="text-xs font-bold text-[#B34700] uppercase tracking-wider block">
                        Destaque na Página Inicial
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3 ${
                          editingProduct.isOferta
                            ? 'bg-white border-[#FF6600] shadow-2xs'
                            : 'bg-white/60 border-[#E8D0C0] hover:border-[#FF6600]/60'
                        }`}>
                          <input
                            type="checkbox"
                            checked={Boolean(editingProduct.isOferta)}
                            onChange={(e) =>
                              setEditingProduct({ ...editingProduct, isOferta: e.target.checked })
                            }
                            className="w-5 h-5 text-[#FF6600] rounded focus:ring-[#FF6600] cursor-pointer"
                          />
                          <div>
                            <span className="block text-xs sm:text-sm font-bold text-[#112A15] flex items-center gap-1.5">
                              <span>🔥</span>
                              <span>Ofertas Imperdíveis</span>
                            </span>
                            <span className="text-[11px] text-[#4A634E]">
                              Exibir na seção de ofertas da tela inicial
                            </span>
                          </div>
                        </label>

                        <label className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3 ${
                          editingProduct.isFavorito
                            ? 'bg-white border-[#0F6E16] shadow-2xs'
                            : 'bg-white/60 border-[#E8D0C0] hover:border-[#0F6E16]/60'
                        }`}>
                          <input
                            type="checkbox"
                            checked={Boolean(editingProduct.isFavorito)}
                            onChange={(e) =>
                              setEditingProduct({ ...editingProduct, isFavorito: e.target.checked })
                            }
                            className="w-5 h-5 text-[#0F6E16] rounded focus:ring-[#0F6E16] cursor-pointer"
                          />
                          <div>
                            <span className="block text-xs sm:text-sm font-bold text-[#112A15] flex items-center gap-1.5">
                              <span>⭐</span>
                              <span>Favoritos do dia a dia</span>
                            </span>
                            <span className="text-[11px] text-[#4A634E]">
                              Exibir na seção de favoritos da tela inicial
                            </span>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* PRODUCT PHOTO: CAMERA OR FILE UPLOAD (NO LINKS!) */}
                    <div className="bg-[#FFF9F3] p-4 rounded-xl border border-[#FFE0CC] space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-[#C84B00] flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Foto do Produto (Câmera ou Arquivo)
                        </label>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-[#FF6600] bg-white shadow-sm shrink-0">
                          {editingProduct.artId ? (
                            <ProductArtIllustration
                              artId={editingProduct.artId}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center text-[#8A9E8D] bg-gray-50">
                              <svg className="w-8 h-8 opacity-40 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="text-[10px]">Sem foto</span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 w-full space-y-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => cameraInputRef.current?.click()}
                              className="min-h-[42px] px-3.5 py-2 rounded-xl bg-[#0F6E16] hover:bg-[#0A520F] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-95"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span>Bater Foto da Câmera</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => galleryInputRef.current?.click()}
                              className="min-h-[42px] px-3.5 py-2 rounded-xl bg-[#FF6600] hover:bg-[#E05500] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-95"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                              </svg>
                              <span>Upload Celular / PC</span>
                            </button>
                          </div>

                          {editingProduct.artId && (
                            <button
                              type="button"
                              onClick={handleDeletePhoto}
                              className="w-full min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              <span>Excluir Foto e Bater Novamente</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Form Action Buttons */}
                    <div className="flex items-center justify-between pt-3 border-t border-[#E0EDE1] gap-2">
                      {products.some((p) => p.id === editingProduct.id) ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Deseja realmente excluir o produto "${editingProduct.name}"?`)) {
                              onDeleteProduct(editingProduct.id);
                              setEditingProduct(null);
                              showToast('Produto excluído com sucesso!');
                            }
                          }}
                          className="min-h-[44px] px-4 py-2 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                        >
                          Excluir
                        </button>
                      ) : (
                        <span />
                      )}

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingProduct(null)}
                          className="min-h-[44px] px-4 py-2 text-xs font-bold text-[#4A634E] hover:text-[#112A15] bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="min-h-[44px] px-7 py-2 text-xs sm:text-sm font-bold text-white bg-[#0F6E16] hover:bg-[#0A520F] rounded-xl transition-all shadow-md active:scale-[0.99] cursor-pointer"
                        >
                          Salvar Alterações
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              ) : null}

              {/* Tab 1: Products List with Quick Oferta & Favorito Toggles */}
              {activeTab === 'produtos' && !editingProduct && (
                <div className="space-y-3.5">
                  {/* Category Pills & Search */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                      {categories.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setSelectedCatFilter(c.id)}
                          className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                            selectedCatFilter === c.id
                              ? 'bg-[#FF6600] text-white shadow-xs'
                              : 'bg-white text-[#1F4224] hover:bg-[#E6F2E7] border border-[#CBE5CD]'
                          }`}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>

                    <div className="relative">
                      <input
                        type="search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar por nome..."
                        className="w-full sm:w-64 px-3.5 py-2 text-xs bg-white border border-[#BBD9BE] rounded-lg text-[#112A15] focus:outline-none focus:border-[#0F6E16]"
                      />
                    </div>
                  </div>

                  {/* Products Table with Quick Oferta/Favorito toggles */}
                  <div className="bg-white rounded-2xl border border-[#D5E6D6] overflow-hidden shadow-xs divide-y divide-[#EBF2EB]">
                    {filteredAdminProducts.length === 0 ? (
                      <div className="p-8 text-center text-xs text-[#66806A]">
                        Nenhum produto encontrado.
                      </div>
                    ) : (
                      filteredAdminProducts.map((prod) => (
                        <div
                          key={prod.id}
                          className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F9FCF9] transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border border-[#D5E6D6] bg-[#EFF7F0] shrink-0">
                              <ProductArtIllustration artId={prod.artId} className="w-full h-full object-cover" />
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-sm font-bold text-[#112A15] truncate">
                                  {prod.name}
                                </h4>
                                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-[#E6F2E7] text-[#0F6E16] uppercase">
                                  {prod.categoryLabel}
                                </span>
                                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-[#FFF2E8] text-[#FF6600] uppercase font-mono">
                                  {prod.unitType || 'kg'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-[#4A634E] mt-0.5">
                                <span className="font-bold text-[#0F6E16] font-mono-tabular">
                                  R$ {prod.price.toFixed(2).replace('.', ',')}
                                </span>
                                <span>·</span>
                                <span className="truncate">{prod.unitLabel}</span>
                              </div>
                            </div>
                          </div>

                          {/* Quick Actions: Toggle Ofertas, Toggle Favoritos, Edit & Delete */}
                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center flex-wrap">
                            <button
                              type="button"
                              onClick={() => handleToggleOferta(prod.id)}
                              className={`min-h-[36px] px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                                prod.isOferta
                                  ? 'bg-[#FF6600] text-white border-[#E05500] shadow-2xs'
                                  : 'bg-white text-[#8A5200] border-[#FFD0B0] hover:bg-[#FFF4EC]'
                              }`}
                              title={prod.isOferta ? 'Remover de Ofertas da tela inicial' : 'Colocar em Ofertas da tela inicial'}
                            >
                              <span>🔥</span>
                              <span>Oferta</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleFavorito(prod.id)}
                              className={`min-h-[36px] px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                                prod.isFavorito
                                  ? 'bg-[#0F6E16] text-white border-[#0A520F] shadow-2xs'
                                  : 'bg-white text-[#1F4224] border-[#CBE5CD] hover:bg-[#E6F2E7]'
                              }`}
                              title={prod.isFavorito ? 'Remover de Favoritos da tela inicial' : 'Colocar em Favoritos da tela inicial'}
                            >
                              <span>⭐</span>
                              <span>Favorito</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setEditingProduct(prod)}
                              className="min-h-[36px] px-3.5 py-1 text-xs font-bold text-[#0F6E16] bg-[#E6F2E7] hover:bg-[#D5EBD6] rounded-lg transition-colors cursor-pointer"
                            >
                              Editar
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Deseja excluir "${prod.name}"?`)) {
                                  onDeleteProduct(prod.id);
                                  showToast('Produto excluído!');
                                }
                              }}
                              title="Excluir produto"
                              className="p-2 text-[#8A9E8D] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Tab 2: Categories Management */}
              {activeTab === 'categorias' && !editingProduct && (
                <div className="space-y-4">
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#D5E6D6] shadow-2xs space-y-2.5">
                    <h4 className="text-sm font-bold text-[#112A15] font-display flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-md bg-[#FF6600] text-white flex items-center justify-center text-xs">
                        +
                      </span>
                      Adicionar Nova Categoria
                    </h4>
                    <p className="text-xs text-[#4A634E]">
                      Exemplos: Padaria, Laticínios, Temperos, Bebidas, Orgânicos, Doces & Conservas.
                    </p>

                    <form onSubmit={handleCreateCategory} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={newCatNameInput}
                        onChange={(e) => {
                          setNewCatNameInput(e.target.value);
                          setInlineCatError(null);
                        }}
                        placeholder="Nome da categoria (ex: Padaria, Queijos...)"
                        className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-white border border-[#BBD9BE] rounded-xl text-[#112A15] focus:outline-none focus:border-[#0F6E16]"
                      />
                      <button
                        type="submit"
                        className="min-h-[40px] px-5 py-2 text-xs sm:text-sm font-bold text-white bg-[#0F6E16] hover:bg-[#0A520F] rounded-xl transition-all shadow-xs shrink-0 cursor-pointer"
                      >
                        Salvar Categoria
                      </button>
                    </form>
                    {inlineCatError && (
                      <p className="text-xs text-red-600 font-semibold">{inlineCatError}</p>
                    )}
                  </div>

                  <div className="bg-white rounded-2xl border border-[#D5E6D6] overflow-hidden shadow-2xs divide-y divide-[#EBF2EB]">
                    {categories.map((cat) => {
                      const count =
                        cat.id === 'todos'
                          ? products.length
                          : products.filter((p) => p.categoryId === cat.id).length;
                      const isDefault = ['todos', 'frutas', 'verduras', 'legumes'].includes(cat.id);

                      return (
                        <div
                          key={cat.id}
                          className="px-4 py-3.5 flex items-center justify-between gap-2 hover:bg-[#F9FCF9] transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#0F6E16]" />
                            <span className="text-sm font-bold text-[#112A15]">
                              {cat.label}
                            </span>
                          </div>

                          <div className="flex items-center gap-2.5">
                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#E6F2E7] text-[#0F6E16]">
                              {count} {count === 1 ? 'item' : 'itens'}
                            </span>

                            {!isDefault && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (count > 0) {
                                    if (!window.confirm(`A categoria "${cat.label}" possui ${count} produtos. Deseja excluí-la?`)) {
                                      return;
                                    }
                                  }
                                  onDeleteCategory(cat.id);
                                  showToast(`Categoria "${cat.label}" removida!`);
                                }}
                                className="text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                                title="Excluir categoria"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Bottom Status Bar */}
        <div className="px-4 sm:px-8 py-2.5 bg-white border-t border-[#D5E6D6] flex items-center justify-between text-xs text-[#4A634E] shrink-0">
          <span>{isAuthenticated ? 'Modo Administrador Ativo · Tela Cheia' : 'Protegido por senha'}</span>
          <span className="font-mono text-[#0F6E16]">Feirão Hortifruti ADM v3.5</span>
        </div>
      </div>

      {/* Quick Category Modal */}
      {showNewCatModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm border-2 border-[#0F6E16] shadow-2xl space-y-3">
            <h4 className="text-base font-bold font-display text-[#112A15]">
              Criar Nova Categoria
            </h4>
            <p className="text-xs text-[#4A634E]">
              Exemplos: Padaria, Laticínios, Temperos, Bebidas, Orgânicos...
            </p>
            <form onSubmit={handleCreateCategory} className="space-y-3">
              <input
                type="text"
                autoFocus
                value={newCatNameInput}
                onChange={(e) => {
                  setNewCatNameInput(e.target.value);
                  setInlineCatError(null);
                }}
                placeholder="Nome da categoria"
                className="w-full px-3.5 py-2 text-sm bg-white border border-[#BBD9BE] rounded-xl text-[#112A15] focus:outline-none focus:border-[#0F6E16]"
              />
              {inlineCatError && (
                <p className="text-xs text-red-600 font-semibold">{inlineCatError}</p>
              )}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewCatModal(false)}
                  className="min-h-[40px] px-3.5 py-2 text-xs font-bold text-[#4A634E] hover:text-[#112A15] rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="min-h-[40px] px-5 py-2 text-xs font-bold text-white bg-[#0F6E16] hover:bg-[#0A520F] rounded-xl shadow-xs cursor-pointer"
                >
                  Criar Categoria
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
