import React, { useState, useMemo, useRef } from 'react';
import { CategoryItem, ProductItem } from '../data/products';
import {
  ADMIN_TEST_CREDENTIALS,
  BannerItem,
  DEFAULT_SITE_SETTINGS,
  SiteCustomization,
  getBrandFontFamilyStyle,
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
  onEditCategory: (categoryId: string, newLabel: string) => void;
  onDeleteCategory: (categoryId: string) => void;
  onSaveBanners: (banners: BannerItem[]) => void;
  onSaveSiteSettings: (settings: SiteCustomization) => void;
  onResetCatalog: () => void;
}

const FONT_FAMILY_OPTIONS = [
  { id: 'display', name: 'Display Marcante', desc: 'Geométrica e encorpada (Padrão)', sample: 'Outfit / Display bold' },
  { id: 'sans', name: 'Sans-serif Limpa', desc: 'Minimalista e legível', sample: 'Inter / System Sans' },
  { id: 'rounded', name: 'Arredondada', desc: 'Acolhedora e amigável', sample: 'Nunito / Quicksand' },
  { id: 'serif', name: 'Serif Elegante', desc: 'Clássica e refinada', sample: 'Georgia / Serif' },
  { id: 'impact', name: 'Impacto Comercial', desc: 'Forte e destacada', sample: 'Impact / Black' },
  { id: 'cursive', name: 'Manuscrita / Rústica', desc: 'Estilo feira artesanal', sample: 'Caveat / Cursive' },
];

const FONT_SIZE_PRESETS = [
  { label: 'Pequeno', value: '26px' },
  { label: 'Médio', value: '32px' },
  { label: 'Padrão', value: '36px' },
  { label: 'Grande', value: '44px' },
  { label: 'Extra Grande', value: '52px' },
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
  onEditCategory,
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState('todos');

  // Product editing modal state
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);

  // Category state (creation + inline editing)
  const [newCatNameInput, setNewCatNameInput] = useState('');
  const [inlineCatError, setInlineCatError] = useState<string | null>(null);
  const [showNewCatModal, setShowNewCatModal] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatLabel, setEditingCatLabel] = useState<string>('');

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

  // Handle inline edit category
  const handleSaveInlineCategoryEdit = (catId: string) => {
    const trimmed = editingCatLabel.trim();
    if (!trimmed) {
      alert('O nome da categoria não pode ficar vazio.');
      return;
    }
    onEditCategory(catId, trimmed);
    setEditingCatId(null);
    setEditingCatLabel('');
    showToast(`Categoria atualizada para "${trimmed}"!`);
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
      className="fixed inset-0 z-50 w-screen h-screen bg-[#F7FAF7] flex flex-col text-[#112A15] overflow-hidden select-none animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
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

      {/* Floating Feedback Toast */}
      {successToast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-[#0F6E16] text-white px-5 py-3 rounded-xl shadow-2xl text-xs sm:text-sm font-bold flex items-center gap-2.5 border border-emerald-300 animate-in slide-in-from-top duration-150 max-w-[90%] text-center">
          <svg className="w-5 h-5 text-[#FFD000] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          <span className="truncate">{successToast}</span>
        </div>
      )}

      {/* TOP HEADER BAR (Full Screen Header) */}
      <header className="w-full bg-[#0F6E16] text-white border-b-4 border-[#FF6600] px-4 sm:px-6 py-3 flex items-center justify-between shrink-0 shadow-sm z-30">
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile hamburger menu toggle */}
          {isAuthenticated && (
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              aria-label="Abrir menu lateral"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}

          {/* Admin title and icon */}
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
            <h2 className="text-sm sm:text-base font-bold font-display leading-tight truncate">
              Painel Administrativo
            </h2>
            <p className="text-[11px] text-white/80 leading-none truncate mt-0.5">
              {isAuthenticated ? 'Gestão de Produtos, Categorias, Banners e Personalização' : 'Acesso Restrito'}
            </p>
          </div>
        </div>

        {/* Right header buttons: Ver Loja, Logout, Close */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-white text-[#0F6E16] hover:bg-emerald-50 transition-colors cursor-pointer shadow-xs"
            title="Voltar para a Loja"
          >
            <span>Ver Loja</span>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </button>

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
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Fechar painel"
          >
            <CustomCloseCrossIcon className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      {!isAuthenticated ? (
        /* Login Screen (Centered in full-screen) */
        <div className="flex-1 flex items-center justify-center p-4 bg-[#F7FAF7] overflow-y-auto">
          <div className="max-w-md w-full bg-white p-6 sm:p-8 rounded-3xl border border-[#D5E6D6] shadow-xl space-y-5">
            <div className="text-center space-y-1">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#E6F2E7] flex items-center justify-center text-[#0F6E16] mb-2 shadow-2xs">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold font-display text-[#112A15]">
                Acesso ao Painel de Controle
              </h3>
              <p className="text-xs text-[#4A634E]">
                Gerencie produtos, categorias, fotos de banners e personalização do site.
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
                  className="px-2 py-0.5 rounded bg-[#FF6600] text-white font-bold text-[10px] hover:bg-[#E05500] cursor-pointer"
                >
                  Preencher 12345
                </button>
              </div>
              <p className="text-[11px] text-[#8A5200]">
                Login: <strong className="font-mono">{ADMIN_TEST_CREDENTIALS.login}</strong> · Senha: <strong className="font-mono">{ADMIN_TEST_CREDENTIALS.password}</strong>
              </p>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1F4224] mb-1">
                  Login
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
        </div>
      ) : (
        /* Authenticated 2-Column Full Screen Layout: Menu Lateral + Conteúdo */
        <div className="flex-1 flex overflow-hidden min-h-0 relative">
          {/* Mobile Menu Backdrop */}
          {isMobileMenuOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}

          {/* ========================================================= */}
          {/* MENU LATERAL (SIDEBAR)                                    */}
          {/* ========================================================= */}
          <aside
            className={`fixed md:static inset-y-0 left-0 z-40 w-64 lg:w-72 bg-white border-r border-[#D5E6D6] flex flex-col shrink-0 h-full justify-between p-4 shadow-sm transition-transform duration-200 md:translate-x-0 ${
              isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
            }`}
          >
            <div className="space-y-5 overflow-y-auto">
              {/* Brand Preview in Sidebar */}
              <div className="p-3 bg-[#F7FAF7] rounded-2xl border border-[#D5E6D6] flex items-center gap-3">
                <img
                  src={siteSettings.logoUrl}
                  alt="Logo"
                  className="w-10 h-10 object-contain shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="text-xs font-extrabold text-[#112A15] truncate">
                    {siteSettings.brandNameFirst} {siteSettings.brandNameSecond}
                  </h4>
                  <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#E6F2E7] text-[#0F6E16] mt-0.5">
                    Modo Administrador
                  </span>
                </div>
              </div>

              {/* Navigation Items (Menu Lateral) */}
              <div className="space-y-1">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-[#66806A] px-2 mb-2">
                  Navegação Principal
                </span>

                {/* 1. Produtos */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('produtos');
                    setEditingProduct(null);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeTab === 'produtos' && !editingProduct
                      ? 'bg-[#0F6E16] text-white shadow-sm'
                      : 'text-[#1F4224] hover:bg-[#E6F2E7]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">📦</span>
                    <span>Produtos</span>
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      activeTab === 'produtos' && !editingProduct
                        ? 'bg-white/20 text-white'
                        : 'bg-[#E6F2E7] text-[#0F6E16]'
                    }`}
                  >
                    {products.length}
                  </span>
                </button>

                {/* 2. Categorias */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('categorias');
                    setEditingProduct(null);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeTab === 'categorias' && !editingProduct
                      ? 'bg-[#0F6E16] text-white shadow-sm'
                      : 'text-[#1F4224] hover:bg-[#E6F2E7]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">🏷️</span>
                    <span>Categorias</span>
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      activeTab === 'categorias' && !editingProduct
                        ? 'bg-white/20 text-white'
                        : 'bg-[#E6F2E7] text-[#0F6E16]'
                    }`}
                  >
                    {categories.filter((c) => c.id !== 'todos').length}
                  </span>
                </button>

                {/* 3. Banners */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('banners');
                    setEditingProduct(null);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeTab === 'banners'
                      ? 'bg-[#0F6E16] text-white shadow-sm'
                      : 'text-[#1F4224] hover:bg-[#E6F2E7]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">🖼️</span>
                    <span>Banners</span>
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      activeTab === 'banners'
                        ? 'bg-white/20 text-white'
                        : 'bg-[#E6F2E7] text-[#0F6E16]'
                    }`}
                  >
                    {banners.length}/5
                  </span>
                </button>

                {/* 4. Personalização */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('personalizacao');
                    setEditingProduct(null);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeTab === 'personalizacao'
                      ? 'bg-[#0F6E16] text-white shadow-sm'
                      : 'text-[#1F4224] hover:bg-[#E6F2E7]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">🎨</span>
                    <span>Personalização</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      activeTab === 'personalizacao'
                        ? 'bg-white/20 text-white'
                        : 'bg-emerald-50 text-emerald-800'
                    }`}
                  >
                    Cores / Fontes
                  </span>
                </button>
              </div>

              {/* Contextual Action CTA inside Sidebar */}
              <div className="pt-2">
                {activeTab === 'produtos' && (
                  <button
                    type="button"
                    onClick={() => {
                      handleStartNewProduct();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full min-h-[42px] inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#FF6600] hover:bg-[#E05500] rounded-xl transition-all shadow-sm cursor-pointer active:scale-95"
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
                    onClick={() => {
                      setShowNewCatModal(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full min-h-[42px] inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-[#0F6E16] bg-[#E6F2E7] hover:bg-[#D4EBD6] border border-[#CBE5CD] rounded-xl transition-colors cursor-pointer"
                  >
                    <span>+ Nova Categoria</span>
                  </button>
                )}

                {activeTab === 'banners' && banners.length < 5 && (
                  <button
                    type="button"
                    onClick={() => {
                      newBannerUploadInputRef.current?.click();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full min-h-[42px] inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#FF6600] hover:bg-[#E05500] rounded-xl transition-all shadow-sm cursor-pointer active:scale-95"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Adicionar Banner ({banners.length}/5)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Sidebar Footer Controls */}
            <div className="pt-4 border-t border-[#EBF2EB] space-y-2">
              <button
                type="button"
                onClick={handleConfirmReset}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#66806A] hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Restaurar Catálogo Padrão</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-bold text-[#1F4224] bg-[#F7FAF7] hover:bg-[#E6F2E7] border border-[#D5E6D6] rounded-xl transition-colors cursor-pointer"
              >
                <span>Voltar ao Site</span>
              </button>
            </div>
          </aside>

          {/* ========================================================= */}
          {/* MAIN CONTENT WORKSPACE (TELA TODA)                        */}
          {/* ========================================================= */}
          <main className="flex-1 h-full overflow-y-auto bg-[#F7FAF7] p-4 sm:p-6 lg:p-8 min-w-0">
            {/* ------------------------------------------------------- */}
            {/* TAB 1: PRODUTOS                                         */}
            {/* ------------------------------------------------------- */}
            {activeTab === 'produtos' && !editingProduct && (
              <div className="space-y-4 max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-[#D5E6D6] shadow-2xs">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold font-display text-[#112A15]">
                      Gerenciamento de Produtos ({products.length})
                    </h3>
                    <p className="text-xs text-[#4A634E] mt-0.5">
                      Edite preços, fotos, unidades e marque produtos em Ofertas 🔥 ou Favoritos ⭐ da tela inicial.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleStartNewProduct}
                    className="min-h-[42px] inline-flex items-center justify-center gap-2 px-5 py-2 text-xs sm:text-sm font-bold text-white bg-[#FF6600] hover:bg-[#E05500] rounded-xl transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Novo Produto</span>
                  </button>
                </div>

                {/* Filter and search bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedCatFilter(c.id)}
                        className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-colors whitespace-nowrap cursor-pointer ${
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
                      placeholder="Buscar por nome ou unidade..."
                      className="w-full sm:w-72 px-3.5 py-2 text-xs bg-white border border-[#BBD9BE] rounded-xl text-[#112A15] focus:outline-none focus:border-[#0F6E16]"
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

            {/* ------------------------------------------------------- */}
            {/* EDIT PRODUCT FORM                                       */}
            {/* ------------------------------------------------------- */}
            {activeTab === 'produtos' && editingProduct && (
              <div className="bg-white rounded-3xl border-2 border-[#0F6E16] p-5 sm:p-8 shadow-md space-y-6 max-w-4xl mx-auto animate-in fade-in duration-150">
                <div className="flex items-center justify-between border-b border-[#E0EDE1] pb-4">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold font-display text-[#112A15]">
                      {products.some((p) => p.id === editingProduct.id)
                        ? `Editar Produto: ${editingProduct.name || 'Sem Nome'}`
                        : 'Novo Produto'}
                    </h3>
                    <p className="text-xs text-[#4A634E]">
                      Configure nome, preço, unidade, foto e escolha se aparece nas Ofertas ou Favoritos.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="px-3 py-1.5 text-xs font-semibold text-[#4A634E] hover:text-[#112A15] bg-[#F7FAF7] rounded-lg cursor-pointer"
                  >
                    ← Voltar à Lista
                  </button>
                </div>

                <form onSubmit={handleSaveProductForm} className="space-y-6">
                  {/* Photo management */}
                  <div className="p-4 bg-[#F7FAF7] rounded-2xl border border-[#D5E6D6] space-y-3">
                    <label className="block text-xs font-bold text-[#1F4224]">
                      Foto do Produto (Câmera ou Upload)
                    </label>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-[#0F6E16] bg-white shrink-0 shadow-2xs">
                        <ProductArtIllustration artId={editingProduct.artId} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => cameraInputRef.current?.click()}
                          className="px-4 py-2 text-xs font-bold rounded-xl bg-[#0F6E16] hover:bg-[#0A520F] text-white flex items-center gap-2 cursor-pointer shadow-xs"
                        >
                          <span>📷</span>
                          <span>Tirar Foto (Câmera)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => galleryInputRef.current?.click()}
                          className="px-4 py-2 text-xs font-bold rounded-xl bg-[#FF6600] hover:bg-[#E05500] text-white flex items-center gap-2 cursor-pointer shadow-xs"
                        >
                          <span>📁</span>
                          <span>Upload de Imagem</span>
                        </button>
                        {editingProduct.artId && (
                          <button
                            type="button"
                            onClick={handleDeletePhoto}
                            className="px-3 py-2 text-xs font-semibold rounded-xl text-red-600 hover:bg-red-50 cursor-pointer"
                          >
                            Remover Foto
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Name and Price */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#1F4224] mb-1">
                        Nome do Produto *
                      </label>
                      <input
                        type="text"
                        value={editingProduct.name}
                        onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                        placeholder="Ex: Morango Selecionado"
                        required
                        className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#BBD9BE] rounded-xl text-[#112A15] focus:outline-none focus:border-[#0F6E16]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1F4224] mb-1">
                        Preço (R$) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editingProduct.price}
                        onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                        required
                        className="w-full px-3.5 py-2.5 text-sm font-mono font-bold bg-white border border-[#BBD9BE] rounded-xl text-[#112A15] focus:outline-none focus:border-[#0F6E16]"
                      />
                    </div>
                  </div>

                  {/* Category and Unit */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#1F4224] mb-1">
                        Categoria *
                      </label>
                      <select
                        value={editingProduct.categoryId}
                        onChange={(e) => {
                          const cat = categories.find((c) => c.id === e.target.value);
                          setEditingProduct({
                            ...editingProduct,
                            categoryId: e.target.value,
                            categoryLabel: cat ? cat.label : e.target.value,
                          });
                        }}
                        className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#BBD9BE] rounded-xl text-[#112A15] focus:outline-none focus:border-[#0F6E16]"
                      >
                        {categories
                          .filter((c) => c.id !== 'todos')
                          .map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.label}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1F4224] mb-1">
                        Rótulo da Unidade (Ex: 1kg, 500g, Maço, Bandeja)
                      </label>
                      <input
                        type="text"
                        value={editingProduct.unitLabel}
                        onChange={(e) => setEditingProduct({ ...editingProduct, unitLabel: e.target.value })}
                        placeholder="Ex: 1kg, 500g, Bandeja 250g..."
                        className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#BBD9BE] rounded-xl text-[#112A15] focus:outline-none focus:border-[#0F6E16]"
                      />
                    </div>
                  </div>

                  {/* Oferta and Favorito Toggles */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <label className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3 ${
                      editingProduct.isOferta
                        ? 'bg-[#FFF5EC] border-[#FF6600]'
                        : 'bg-white border-[#D5E6D6]'
                    }`}>
                      <input
                        type="checkbox"
                        checked={!!editingProduct.isOferta}
                        onChange={(e) => setEditingProduct({ ...editingProduct, isOferta: e.target.checked })}
                        className="w-5 h-5 text-[#FF6600] rounded focus:ring-[#FF6600] cursor-pointer"
                      />
                      <div>
                        <span className="block text-sm font-bold text-[#112A15]">
                          🔥 Incluir em Ofertas Imperdíveis
                        </span>
                        <span className="text-xs text-[#4A634E]">
                          Aparece no carrossel de ofertas da tela inicial
                        </span>
                      </div>
                    </label>

                    <label className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3 ${
                      editingProduct.isFavorito
                        ? 'bg-[#EBF7EE] border-[#0F6E16]'
                        : 'bg-white border-[#D5E6D6]'
                    }`}>
                      <input
                        type="checkbox"
                        checked={!!editingProduct.isFavorito}
                        onChange={(e) => setEditingProduct({ ...editingProduct, isFavorito: e.target.checked })}
                        className="w-5 h-5 text-[#0F6E16] rounded focus:ring-[#0F6E16] cursor-pointer"
                      />
                      <div>
                        <span className="block text-sm font-bold text-[#112A15]">
                          ⭐ Incluir em Favoritos do Dia a Dia
                        </span>
                        <span className="text-xs text-[#4A634E]">
                          Aparece no carrossel de favoritos da tela inicial
                        </span>
                      </div>
                    </label>
                  </div>

                  {/* Form actions */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E0EDE1]">
                    <button
                      type="button"
                      onClick={() => setEditingProduct(null)}
                      className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-[#4A634E] hover:text-[#112A15] cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="min-h-[44px] px-8 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#0F6E16] hover:bg-[#0A520F] rounded-xl transition-all shadow-md active:scale-[0.99] cursor-pointer"
                    >
                      Salvar Produto
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ------------------------------------------------------- */}
            {/* TAB 2: CATEGORIAS (EDIÇÃO E EXCLUSÃO)                   */}
            {/* ------------------------------------------------------- */}
            {activeTab === 'categorias' && !editingProduct && (
              <div className="space-y-5 max-w-4xl mx-auto">
                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#D5E6D6] shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold font-display text-[#112A15]">
                        Gerenciamento de Categorias
                      </h3>
                      <p className="text-xs text-[#4A634E] mt-0.5">
                        Categorias podem ser criadas, editadas e excluídas. Clique no lápis para renomear ou na lixeira para excluir.
                      </p>
                    </div>
                  </div>

                  {/* Add New Category Form */}
                  <form onSubmit={handleCreateCategory} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
                    <input
                      type="text"
                      value={newCatNameInput}
                      onChange={(e) => {
                        setNewCatNameInput(e.target.value);
                        setInlineCatError(null);
                      }}
                      placeholder="Nome da nova categoria (ex: Padaria, Queijos, Bebidas...)"
                      className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-white border border-[#BBD9BE] rounded-xl text-[#112A15] focus:outline-none focus:border-[#0F6E16]"
                    />
                    <button
                      type="submit"
                      className="min-h-[42px] px-6 py-2 text-xs sm:text-sm font-bold text-white bg-[#0F6E16] hover:bg-[#0A520F] rounded-xl transition-all shadow-xs shrink-0 cursor-pointer"
                    >
                      + Criar Categoria
                    </button>
                  </form>
                  {inlineCatError && (
                    <p className="text-xs text-red-600 font-semibold">{inlineCatError}</p>
                  )}
                </div>

                {/* Categories List */}
                <div className="bg-white rounded-2xl border border-[#D5E6D6] overflow-hidden shadow-2xs divide-y divide-[#EBF2EB]">
                  {categories.map((cat) => {
                    const count =
                      cat.id === 'todos'
                        ? products.length
                        : products.filter((p) => p.categoryId === cat.id).length;
                    const isSystemAll = cat.id === 'todos';
                    const isEditing = editingCatId === cat.id;

                    return (
                      <div
                        key={cat.id}
                        className="px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3 hover:bg-[#F9FCF9] transition-colors"
                      >
                        {/* Name or inline edit */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#0F6E16] shrink-0" />
                          {isEditing ? (
                            <div className="flex items-center gap-2 flex-1 max-w-sm">
                              <input
                                type="text"
                                value={editingCatLabel}
                                onChange={(e) => setEditingCatLabel(e.target.value)}
                                autoFocus
                                className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border-2 border-[#0F6E16] rounded-lg text-[#112A15] focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveInlineCategoryEdit(cat.id)}
                                className="px-3 py-1.5 text-xs font-bold text-white bg-[#0F6E16] hover:bg-[#0A520F] rounded-lg cursor-pointer shrink-0"
                              >
                                Salvar
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingCatId(null)}
                                className="px-2.5 py-1.5 text-xs font-semibold text-[#4A634E] hover:text-[#112A15] bg-[#E6F2E7] rounded-lg cursor-pointer shrink-0"
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <span className="text-sm font-bold text-[#112A15] truncate">
                              {cat.label} {isSystemAll && <span className="text-xs font-normal text-[#66806A]">(Exibir todos)</span>}
                            </span>
                          )}
                        </div>

                        {/* Items badge & Action buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#E6F2E7] text-[#0F6E16]">
                            {count} {count === 1 ? 'item' : 'itens'}
                          </span>

                          {!isSystemAll && !isEditing && (
                            <>
                              {/* Edit Category Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingCatId(cat.id);
                                  setEditingCatLabel(cat.label);
                                }}
                                className="text-xs font-semibold text-[#0F6E16] hover:bg-emerald-50 p-2 rounded-lg transition-colors cursor-pointer"
                                title="Editar nome da categoria"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </button>

                              {/* Delete Category Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  if (count > 0) {
                                    if (!window.confirm(`A categoria "${cat.label}" possui ${count} produtos. Deseja excluí-la? Os produtos serão preservados no catálogo geral.`)) {
                                      return;
                                    }
                                  } else {
                                    if (!window.confirm(`Deseja realmente excluir a categoria "${cat.label}"?`)) {
                                      return;
                                    }
                                  }
                                  onDeleteCategory(cat.id);
                                  showToast(`Categoria "${cat.label}" excluída com sucesso!`);
                                }}
                                className="text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors cursor-pointer"
                                title="Excluir categoria"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ------------------------------------------------------- */}
            {/* TAB 3: BANNERS                                          */}
            {/* ------------------------------------------------------- */}
            {activeTab === 'banners' && (
              <div className="space-y-5 max-w-5xl mx-auto">
                <div className="bg-[#EBF7EE] p-5 rounded-2xl border-2 border-[#0F6E16]/30 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-[#0F6E16] text-white flex items-center justify-center text-xs font-bold">
                        📐
                      </span>
                      <h4 className="text-base font-bold text-[#0F6E16] font-display">
                        Fotos do Carrossel de Banner (Somente Imagens)
                      </h4>
                    </div>
                    {banners.length < 5 && (
                      <button
                        type="button"
                        onClick={() => newBannerUploadInputRef.current?.click()}
                        className="px-4 py-2 text-xs font-bold text-white bg-[#FF6600] hover:bg-[#E05500] rounded-xl transition-all shadow-xs cursor-pointer"
                      >
                        + Adicionar Foto
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs text-[#1F4224]">
                    <div className="bg-white p-3.5 rounded-xl border border-[#CBE5CD]">
                      <span className="block text-[10px] font-bold text-[#4A634E] uppercase">
                        Tamanho Ideal Recomendado
                      </span>
                      <strong className="text-sm text-[#0F6E16]">1600 × 600 px</strong>
                      <span className="block text-[11px] text-[#4A634E] mt-0.5">
                        Formato panorâmico (~16:6 ou 16:9)
                      </span>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-[#CBE5CD]">
                      <span className="block text-[10px] font-bold text-[#4A634E] uppercase">
                        Capacidade do Carrossel
                      </span>
                      <strong className="text-sm text-[#FF6600]">{banners.length} de até 5 fotos</strong>
                      <span className="block text-[11px] text-[#4A634E] mt-0.5">
                        O carrossel exibe as fotos diretamente, sem cards ou títulos
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

                      <div className="p-3.5 bg-white flex items-center justify-between gap-2 border-t border-[#EBF2EB]">
                        <button
                          type="button"
                          onClick={() => handleTriggerChangeBannerPhoto(b.id)}
                          className="flex-1 min-h-[40px] px-4 py-2 rounded-xl bg-[#0F6E16] hover:bg-[#0A520F] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-2xs active:scale-95"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          <span>Trocar Foto</span>
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
                        Restam {5 - banners.length} vagas de banner
                      </span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ------------------------------------------------------- */}
            {/* TAB 4: PERSONALIZAÇÃO DO SITE                           */}
            {/* ------------------------------------------------------- */}
            {activeTab === 'personalizacao' && (
              <div className="space-y-6 max-w-4xl mx-auto">
                <form onSubmit={handleSaveCustomization} className="space-y-6">
                  {/* SECTION 1: LOGO DO SITE (SEM BORDAS) */}
                  <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#D5E6D6] shadow-2xs space-y-4">
                    <div className="border-b border-[#EBF2EB] pb-3">
                      <h4 className="text-base font-bold text-[#112A15] font-display flex items-center gap-2">
                        <span>📷</span>
                        <span>Logo do Site (Nav e Rodapé)</span>
                      </h4>
                      <p className="text-xs text-[#4A634E] mt-0.5">
                        Edite a imagem da logo do site. A logo é exibida limpa e sem bordas no topo e no rodapé.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-5">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#F7FAF7] flex items-center justify-center p-2 shrink-0 border border-[#D5E6D6]">
                        <img
                          src={customSettings.logoUrl}
                          alt="Preview da Logo"
                          className="w-full h-full object-contain"
                        />
                      </div>

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
                            Dica: Use PNG com fundo transparente ou imagem nítida.
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: NOME DA EMPRESA E TIPOGRAFIA (FONTE E TAMANHO) */}
                  <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#D5E6D6] shadow-2xs space-y-5">
                    <div className="border-b border-[#EBF2EB] pb-3">
                      <h4 className="text-base font-bold text-[#112A15] font-display flex items-center gap-2">
                        <span>🏷️</span>
                        <span>Nome da Empresa e Tipografia</span>
                      </h4>
                      <p className="text-xs text-[#4A634E] mt-0.5">
                        Configure o texto, a fonte (estilo tipográfico) e o tamanho da fonte do nome da empresa.
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

                    {customSettings.showBrandName && (
                      <div className="space-y-4 pt-1">
                        {/* Words */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-[#1F4224] mb-1">
                              Primeira Palavra (Cor Principal)
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
                              Segunda Palavra (Cor de Destaque)
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

                        {/* Fonte do Nome da Empresa */}
                        <div className="space-y-2 pt-2 border-t border-[#EBF2EB]">
                          <label className="block text-xs font-bold text-[#1F4224]">
                            Fonte do Nome da Empresa
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                            {FONT_FAMILY_OPTIONS.map((f) => {
                              const active = (customSettings.brandFontFamily || 'display') === f.id;
                              return (
                                <button
                                  key={f.id}
                                  type="button"
                                  onClick={() =>
                                    setCustomSettings({ ...customSettings, brandFontFamily: f.id })
                                  }
                                  className={`p-3 text-left rounded-xl border-2 transition-all cursor-pointer ${
                                    active
                                      ? 'bg-[#EBF7EE] border-[#0F6E16] shadow-xs'
                                      : 'bg-white border-[#D5E6D6] hover:border-[#0F6E16]/50'
                                  }`}
                                >
                                  <div
                                    className="text-base font-black truncate text-[#112A15]"
                                    style={{ fontFamily: getBrandFontFamilyStyle(f.id) }}
                                  >
                                    {customSettings.brandNameFirst || 'Feirão'} {customSettings.brandNameSecond || 'Hortifruti'}
                                  </div>
                                  <div className="mt-1 flex items-center justify-between">
                                    <span className="text-xs font-bold text-[#112A15]">{f.name}</span>
                                    {active && <span className="text-[10px] font-bold text-[#0F6E16]">Ativo</span>}
                                  </div>
                                  <span className="block text-[10px] text-[#4A634E] mt-0.5">{f.desc}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Tamanho da Fonte do Nome da Empresa */}
                        <div className="space-y-2 pt-2 border-t border-[#EBF2EB]">
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-bold text-[#1F4224]">
                              Tamanho da Fonte do Nome da Empresa
                            </label>
                            <span className="text-xs font-bold font-mono text-[#0F6E16]">
                              {customSettings.brandFontSize || '36px'}
                            </span>
                          </div>

                          {/* Quick size presets */}
                          <div className="flex flex-wrap items-center gap-2">
                            {FONT_SIZE_PRESETS.map((preset) => {
                              const active = (customSettings.brandFontSize || '36px') === preset.value;
                              return (
                                <button
                                  key={preset.value}
                                  type="button"
                                  onClick={() =>
                                    setCustomSettings({ ...customSettings, brandFontSize: preset.value })
                                  }
                                  className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                                    active
                                      ? 'bg-[#0F6E16] text-white border-[#0F6E16] shadow-2xs'
                                      : 'bg-white text-[#1F4224] border-[#D5E6D6] hover:bg-[#E6F2E7]'
                                  }`}
                                >
                                  {preset.label} ({preset.value})
                                </button>
                              );
                            })}
                          </div>

                          {/* Numeric Slider for fine adjustments */}
                          <div className="pt-1 flex items-center gap-3">
                            <span className="text-[11px] text-[#66806A] font-bold">20px</span>
                            <input
                              type="range"
                              min="20"
                              max="60"
                              step="2"
                              value={parseInt(customSettings.brandFontSize || '36', 10) || 36}
                              onChange={(e) =>
                                setCustomSettings({
                                  ...customSettings,
                                  brandFontSize: `${e.target.value}px`,
                                })
                              }
                              className="flex-1 accent-[#0F6E16] cursor-pointer"
                            />
                            <span className="text-[11px] text-[#66806A] font-bold">60px</span>
                          </div>
                        </div>

                        {/* Live Brand Preview Card */}
                        <div className="p-4 bg-[#F7FAF7] rounded-xl border border-[#D5E6D6] space-y-1.5 mt-2">
                          <span className="block text-[10px] font-bold uppercase text-[#66806A] tracking-wider">
                            Prévia ao vivo do Cabeçalho
                          </span>
                          <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-[#EBF2EB]">
                            <img
                              src={customSettings.logoUrl}
                              alt="Logo"
                              className="h-10 w-auto object-contain shrink-0"
                            />
                            <div
                              className="flex items-center gap-1.5 whitespace-nowrap leading-none transition-all"
                              style={{
                                fontFamily: getBrandFontFamilyStyle(customSettings.brandFontFamily),
                              }}
                            >
                              <span
                                className="font-black uppercase tracking-tight"
                                style={{
                                  color: customSettings.primaryButtonColor,
                                  fontSize: customSettings.brandFontSize || '36px',
                                }}
                              >
                                {customSettings.brandNameFirst || 'Feirão'}
                              </span>
                              <span
                                className="font-black uppercase tracking-tight"
                                style={{
                                  color: customSettings.accentButtonColor,
                                  fontSize: customSettings.brandFontSize || '36px',
                                }}
                              >
                                {customSettings.brandNameSecond || 'Hortifruti'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* SECTION 3: CORES DOS BOTÕES DO SITE (SEM TAGS PRÉ-DEFINIDAS) */}
                  <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#D5E6D6] shadow-2xs space-y-4">
                    <div className="border-b border-[#EBF2EB] pb-3">
                      <h4 className="text-base font-bold text-[#112A15] font-display flex items-center gap-2">
                        <span>🎨</span>
                        <span>Cores dos Botões do Site</span>
                      </h4>
                      <p className="text-xs text-[#4A634E] mt-0.5">
                        Escolha as cores livremente no seletor ou digite o código hexadecimal. Tags pré-definidas foram removidas.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Primary Button Color */}
                      <div className="space-y-2.5">
                        <label className="block text-xs font-bold text-[#1F4224]">
                          Cor Principal dos Botões (Comprar, Carrinho, Salvar)
                        </label>

                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={customSettings.primaryButtonColor}
                            onChange={(e) =>
                              setCustomSettings({ ...customSettings, primaryButtonColor: e.target.value })
                            }
                            className="w-12 h-12 rounded-xl border border-gray-200 cursor-pointer p-0.5 bg-white shrink-0"
                          />
                          <input
                            type="text"
                            value={customSettings.primaryButtonColor}
                            onChange={(e) =>
                              setCustomSettings({ ...customSettings, primaryButtonColor: e.target.value })
                            }
                            placeholder="#0F6E16"
                            className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm font-mono font-bold uppercase bg-white border border-[#BBD9BE] rounded-xl text-[#112A15] focus:outline-none focus:border-[#0F6E16]"
                          />
                        </div>
                      </div>

                      {/* Accent/Secondary Button Color */}
                      <div className="space-y-2.5">
                        <label className="block text-xs font-bold text-[#1F4224]">
                          Cor de Destaque / Secundária (Ofertas, Badges, Botão Laranja)
                        </label>

                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={customSettings.accentButtonColor}
                            onChange={(e) =>
                              setCustomSettings({ ...customSettings, accentButtonColor: e.target.value })
                            }
                            className="w-12 h-12 rounded-xl border border-gray-200 cursor-pointer p-0.5 bg-white shrink-0"
                          />
                          <input
                            type="text"
                            value={customSettings.accentButtonColor}
                            onChange={(e) =>
                              setCustomSettings({ ...customSettings, accentButtonColor: e.target.value })
                            }
                            placeholder="#FF6600"
                            className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm font-mono font-bold uppercase bg-white border border-[#BBD9BE] rounded-xl text-[#112A15] focus:outline-none focus:border-[#0F6E16]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Live Button Preview Box */}
                    <div className="p-4 bg-[#F7FAF7] rounded-xl border border-[#D5E6D6] space-y-2 mt-4">
                      <span className="block text-[10px] font-bold uppercase text-[#66806A] tracking-wider">
                        Prévia dos Botões com as Cores Escolhidas
                      </span>
                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        <button
                          type="button"
                          className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white shadow-xs cursor-default"
                          style={{ backgroundColor: customSettings.primaryButtonColor }}
                        >
                          + Adicionar à Cesta
                        </button>
                        <button
                          type="button"
                          className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white shadow-xs cursor-default"
                          style={{ backgroundColor: customSettings.accentButtonColor }}
                        >
                          🔥 Oferta Imperdível
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Save customization CTA */}
                  <div className="flex items-center justify-end gap-3 pt-3">
                    <button
                      type="submit"
                      className="min-h-[46px] px-8 py-3 text-sm font-bold text-white bg-[#0F6E16] hover:bg-[#0A520F] rounded-xl transition-all shadow-md active:scale-[0.99] cursor-pointer"
                    >
                      Salvar Todas as Personalizações
                    </button>
                  </div>
                </form>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
};
