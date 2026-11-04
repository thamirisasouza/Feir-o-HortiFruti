import React, { useState, useEffect } from 'react';

interface FigmaPrototypeStudioProps {
  isOpen: boolean;
  onClose: () => void;
}

const ASSET_PATHS = {
  logo: '/assets/aistudio/file_0000000083e4820ea22b0f81959d3438_19ea954d.png',
  banner: '/images/banner_1.jpg',
  morango: '/images/morango.jpg',
  manga: '/images/manga.jpg',
  laranja: '/images/mamao.jpg',
  uva: '/images/uva.jpg',
  abacate: '/images/abacate.jpg',
  banana: '/images/banana.jpg',
};

async function urlToBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : '');
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return '';
  }
}

export const FigmaPrototypeStudio: React.FC<FigmaPrototypeStudioProps> = ({
  isOpen,
  onClose,
}) => {
  const [zoom, setZoom] = useState<number>(0.58);
  const [selectedArtboard, setSelectedArtboard] = useState<string>('all');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [copiedFeedback, setCopiedFeedback] = useState<string | null>(null);
  const [embeddedAssets, setEmbeddedAssets] = useState<Record<string, string>>(ASSET_PATHS);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    (async () => {
      const entries = await Promise.all(
        Object.entries(ASSET_PATHS).map(async ([key, path]) => {
          const b64 = await urlToBase64(path);
          return [key, b64 || path] as const;
        })
      );
      if (active) {
        setEmbeddedAssets(Object.fromEntries(entries));
      }
    })();
    return () => {
      active = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  /**
   * Builds a 100% vector + embedded-image SVG file structured with named <g id="..."> frames.
   * When dragged into Figma or pasted via Ctrl+V on the Figma canvas, Figma converts every group
   * into an editable Frame, every <text> into an editable Text Layer, and every <rect> into a shape.
   */
  const buildEditableFigmaSvg = (assets: Record<string, string>) => {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="3520" height="1120" viewBox="0 0 3520 1120" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <clipPath id="logoClipHeader1"><rect x="656" y="136" width="42" height="42" rx="21"/></clipPath>
    <clipPath id="logoClipDesignSystem"><rect x="108" y="182" width="88" height="88" rx="44"/></clipPath>
    <clipPath id="bannerClipMobile"><rect x="640" y="192" width="390" height="168"/></clipPath>
    <clipPath id="cardImg1"><rect x="656" y="446" width="171" height="122" rx="12"/></clipPath>
    <clipPath id="cardImg2"><rect x="843" y="446" width="171" height="122" rx="12"/></clipPath>
    <clipPath id="cardImg3"><rect x="656" y="686" width="171" height="122" rx="12"/></clipPath>
    <clipPath id="cardImg4"><rect x="843" y="686" width="171" height="122" rx="12"/></clipPath>
    <clipPath id="modalImgClip"><rect x="1134" y="340" width="342" height="210" rx="14"/></clipPath>
    <clipPath id="cartThumb1"><rect x="1614" y="294" width="58" height="52" rx="8"/></clipPath>
    <clipPath id="cartThumb2"><rect x="1614" y="374" width="58" height="52" rx="8"/></clipPath>
    <clipPath id="desktopBannerClip"><rect x="2080" y="200" width="1360" height="310"/></clipPath>
    <clipPath id="desktopLogoClip"><rect x="2140" y="134" width="50" height="50" rx="25"/></clipPath>
    <clipPath id="dCard1"><rect x="2140" y="614" width="290" height="175" rx="14"/></clipPath>
    <clipPath id="dCard2"><rect x="2456" y="614" width="290" height="175" rx="14"/></clipPath>
    <clipPath id="dCard3"><rect x="2772" y="614" width="290" height="175" rx="14"/></clipPath>
    <clipPath id="dCard4"><rect x="3088" y="614" width="290" height="175" rx="14"/></clipPath>
  </defs>

  <!-- CANVAS BACKGROUND -->
  <rect id="Figma-Canvas-Background" width="3520" height="1120" fill="#1E1E1E"/>

  <!-- HEADER TITLE ON CANVAS -->
  <g id="Apresentacao-Cabecalho">
    <text x="80" y="58" fill="#FFFFFF" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="24" font-weight="700">FEIRÃO HORTIFRUTI — PROTÓTIPO EDITÁVEL DO SISTEMA (MOBILE-FIRST &amp; DESKTOP)</text>
    <text x="80" y="86" fill="#A3B8A5" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="14" font-weight="500">Arquivo 100% vetorial e editável no Figma · Cores da Logo (#0F6E16, #FF6600, #FFD000) · Cards Mobile-First · Pagamento em Dinheiro com Troco</text>
  </g>

  <!-- ===================================================================== -->
  <!-- FRAME 01: DESIGN SYSTEM & IDENTIDADE VISUAL (480 x 920)               -->
  <!-- ===================================================================== -->
  <g id="Frame 01 - Design System Feirao Hortifruti">
    <text x="80" y="114" fill="#FF8800" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="13" font-weight="700">01 · DESIGN SYSTEM &amp; MARCA</text>
    <rect x="80" y="126" width="480" height="920" rx="20" fill="#F7FAF7" stroke="#0F6E16" stroke-width="2"/>

    <!-- Brand Header Card -->
    <rect x="100" y="150" width="440" height="150" rx="16" fill="#0F6E16"/>
    <rect x="100" y="294" width="440" height="6" fill="#FF6600"/>
    <circle cx="152" cy="226" r="46" fill="#FFFFFF" stroke="#FF6600" stroke-width="3"/>
    <g clip-path="url(#logoClipDesignSystem)">
      <image href="${assets.logo}" x="108" y="182" width="88" height="88" preserveAspectRatio="xMidYMid slice"/>
    </g>
    <text x="216" y="218" fill="#FFFFFF" font-family="Fraunces, Georgia, serif" font-size="28" font-weight="700">FEIRÃO</text>
    <text x="216" y="246" fill="#FF8800" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="18" font-weight="800" letter-spacing="1.5">HORTIFRUTI</text>
    <text x="216" y="272" fill="#E8F6E9" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="12" font-weight="500">Feira fresca com pedido direto no WhatsApp</text>

    <!-- Color Palette Section -->
    <text x="104" y="338" fill="#112A15" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="14" font-weight="700">PALETA DE CORES OFICIAL (EXTRAÍDA DA LOGO)</text>

    <!-- Swatch 1 -->
    <rect x="104" y="354" width="100" height="86" rx="12" fill="#0F6E16"/>
    <text x="114" y="414" fill="#FFFFFF" font-family="JetBrains Mono, monospace" font-size="12" font-weight="700">#0F6E16</text>
    <text x="114" y="430" fill="#D5E6D6" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="10">Verde Feirão</text>

    <!-- Swatch 2 -->
    <rect x="216" y="354" width="100" height="86" rx="12" fill="#FF6600"/>
    <text x="226" y="414" fill="#FFFFFF" font-family="JetBrains Mono, monospace" font-size="12" font-weight="700">#FF6600</text>
    <text x="226" y="430" fill="#FFF2E8" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="10">Laranja Horti</text>

    <!-- Swatch 3 -->
    <rect x="328" y="354" width="100" height="86" rx="12" fill="#FFD000"/>
    <text x="338" y="414" fill="#112A15" font-family="JetBrains Mono, monospace" font-size="12" font-weight="700">#FFD000</text>
    <text x="338" y="430" fill="#112A15" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="10">Amarelo Sol</text>

    <!-- Swatch 4 -->
    <rect x="440" y="354" width="96" height="86" rx="12" fill="#E8F6E9" stroke="#CBE5CD" stroke-width="1.5"/>
    <text x="450" y="414" fill="#112A15" font-family="JetBrains Mono, monospace" font-size="12" font-weight="700">#E8F6E9</text>
    <text x="450" y="430" fill="#4A634E" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="10">Superfície</text>

    <!-- Typography Section -->
    <text x="104" y="476" fill="#112A15" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="14" font-weight="700">TIPOGRAFIA DO SISTEMA</text>
    <rect x="104" y="490" width="432" height="130" rx="12" fill="#FFFFFF" stroke="#D5E6D6"/>
    <text x="124" y="526" fill="#112A15" font-family="Fraunces, Georgia, serif" font-size="22" font-weight="700">Fraunces Bold — Títulos &amp; Destaques</text>
    <text x="124" y="560" fill="#1F4224" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="15" font-weight="600">Plus Jakarta Sans — Interface Mobile-First &amp; Botões</text>
    <text x="124" y="594" fill="#0F6E16" font-family="JetBrains Mono, monospace" font-size="16" font-weight="700">JetBrains Mono — Preços: R$ 12,90 · R$ 7,90</text>

    <!-- UI Components Section -->
    <text x="104" y="656" fill="#112A15" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="14" font-weight="700">COMPONENTES MOBILE-FIRST &amp; PAGAMENTO</text>
    <rect x="104" y="670" width="432" height="350" rx="14" fill="#FFFFFF" stroke="#D5E6D6"/>

    <!-- Button Primary -->
    <rect x="124" y="694" width="190" height="42" rx="12" fill="#0F6E16"/>
    <text x="176" y="720" fill="#FFFFFF" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="13" font-weight="700">+ Adicionar</text>

    <!-- Stepper Active -->
    <rect x="330" y="694" width="186" height="42" rx="12" fill="#F7FAF7" stroke="#FF6600" stroke-width="2"/>
    <rect x="338" y="701" width="28" height="28" rx="8" fill="#FFFFFF"/>
    <text x="348" y="720" fill="#FF6600" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="16" font-weight="800">-</text>
    <text x="388" y="720" fill="#0F6E16" font-family="JetBrains Mono, monospace" font-size="12" font-weight="700">2 na cesta</text>
    <rect x="480" y="701" width="28" height="28" rx="8" fill="#0F6E16"/>
    <text x="489" y="720" fill="#FFFFFF" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="16" font-weight="800">+</text>

    <!-- Payment Badges -->
    <text x="124" y="768" fill="#112A15" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="12" font-weight="700">Meios de Pagamento na Entrega:</text>
    <rect x="124" y="780" width="190" height="36" rx="8" fill="#FF6600"/>
    <text x="142" y="803" fill="#FFFFFF" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="12" font-weight="700">✓ Dinheiro na entrega</text>
    <rect x="326" y="780" width="190" height="36" rx="8" fill="#FFFFFF" stroke="#BBD9BE"/>
    <text x="344" y="803" fill="#1F4224" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="12" font-weight="600">Pix após conferência</text>

    <rect x="124" y="826" width="392" height="58" rx="8" fill="#FFF5EC" stroke="#FFD2B3"/>
    <text x="138" y="846" fill="#B34200" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="11" font-weight="700">Precisa de troco para quanto? (opcional)</text>
    <rect x="138" y="854" width="364" height="22" rx="4" fill="#FFFFFF" stroke="#FFB380"/>
    <text x="148" y="869" fill="#112A15" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="11">Troco para R$ 100,00</text>

    <!-- Rules Summary -->
    <rect x="124" y="900" width="392" height="98" rx="10" fill="#E8F6E9"/>
    <text x="140" y="924" fill="#0F6E16" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="12" font-weight="700">Diretrizes Aplicadas no Protótipo:</text>
    <text x="140" y="946" fill="#1F4224" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="11">• Cards de frutas 100% Mobile-First (2 por linha no celular)</text>
    <text x="140" y="966" fill="#1F4224" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="11">• Removida opção de ponto de maturação / apresentação da fruta</text>
    <text x="140" y="986" fill="#1F4224" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="11">• Adicionado pagamento em Dinheiro + cálculo de troco no WhatsApp</text>
  </g>

  <!-- ===================================================================== -->
  <!-- FRAME 02: MOBILE HOME & CATÁLOGO (390 x 920)                          -->
  <!-- ===================================================================== -->
  <g id="Frame 02 - Mobile Home e Catalogo (390px)">
    <text x="640" y="114" fill="#FF8800" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="13" font-weight="700">02 · MOBILE — HOME &amp; CARDS MOBILE-FIRST (390px)</text>
    <rect x="640" y="126" width="390" height="920" rx="28" fill="#F7FAF7" stroke="#0F6E16" stroke-width="2"/>

    <!-- Mobile Top Header -->
    <rect x="640" y="126" width="390" height="62" rx="20" fill="#0F6E16"/>
    <rect x="640" y="184" width="390" height="4" fill="#FF6600"/>
    <circle cx="677" cy="157" r="22" fill="#FFFFFF" stroke="#FF6600" stroke-width="2"/>
    <g clip-path="url(#logoClipHeader1)">
      <image href="${assets.logo}" x="656" y="136" width="42" height="42" preserveAspectRatio="xMidYMid slice"/>
    </g>
    <text x="708" y="154" fill="#FFFFFF" font-family="Fraunces, Georgia, serif" font-size="16" font-weight="700">FEIRÃO</text>
    <text x="708" y="170" fill="#FF8800" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="11" font-weight="800" letter-spacing="1">HORTIFRUTI</text>

    <!-- Basket Icon Top Right -->
    <rect x="974" y="138" width="40" height="38" rx="10" fill="#FFFFFF" stroke="#FF6600" stroke-width="2"/>
    <circle cx="1012" cy="138" r="10" fill="#FF6600"/>
    <text x="1008" y="142" fill="#FFFFFF" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700">2</text>

    <!-- Mobile Promo Banner -->
    <g clip-path="url(#bannerClipMobile)">
      <rect x="640" y="192" width="390" height="168" fill="#0A520F"/>
      <image href="${assets.banner}" x="640" y="192" width="390" height="168" preserveAspectRatio="xMidYMid slice" opacity="0.45"/>
      <rect x="640" y="192" width="390" height="168" fill="#0A520F" fill-opacity="0.65"/>
      <text x="658" y="218" fill="#FFD000" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="10" font-weight="800" letter-spacing="1">SUPER QUARTA E QUINTA DAS FRUTAS</text>
      <text x="658" y="244" fill="#FFFFFF" font-family="Fraunces, Georgia, serif" font-size="20" font-weight="700">Frutas Doces e Frescas</text>
      <text x="658" y="268" fill="#FFFFFF" font-family="Fraunces, Georgia, serif" font-size="20" font-weight="700">Colhidas Hoje</text>
      <rect x="658" y="286" width="128" height="32" rx="10" fill="#FF6600" stroke="#FFD000"/>
      <text x="674" y="306" fill="#FFFFFF" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="11" font-weight="700">Aproveitar Oferta</text>

      <!-- Price Stamp on Banner -->
      <rect x="900" y="262" width="114" height="68" rx="12" fill="#FFFFFF" stroke="#FF6600" stroke-width="2"/>
      <text x="912" y="280" fill="#FF6600" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="8" font-weight="800">A PARTIR DE</text>
      <text x="912" y="304" fill="#0F6E16" font-family="JetBrains Mono, monospace" font-size="20" font-weight="700">R$ 7,90</text>
      <text x="912" y="320" fill="#3F5943" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="9">Seleção do Dia</text>
    </g>

    <!-- Category Pills Mobile -->
    <rect x="656" y="372" width="358" height="36" rx="10" fill="#E6F2E7" stroke="#CBE5CD"/>
    <rect x="660" y="376" width="84" height="28" rx="8" fill="#FF6600"/>
    <text x="684" y="394" fill="#FFFFFF" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="11" font-weight="700">Todos</text>
    <text x="768" y="394" fill="#1F4224" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="11" font-weight="700">Frutas</text>
    <text x="850" y="394" fill="#1F4224" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="11" font-weight="700">Verduras</text>
    <text x="942" y="394" fill="#1F4224" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="11" font-weight="700">Legumes</text>

    <!-- Search Input -->
    <rect x="656" y="414" width="358" height="24" rx="8" fill="#FFFFFF" stroke="#BBD9BE"/>
    <text x="672" y="430" fill="#66806A" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="10">🔍 Buscar fruta, verdura ou legume...</text>

    <!-- MOBILE CARD 1: MORANGO (In Cart) -->
    <g id="Card-Mobile-Morango">
      <rect x="656" y="446" width="171" height="226" rx="14" fill="#FFFFFF" stroke="#D5E6D6"/>
      <g clip-path="url(#cardImg1)">
        <rect x="656" y="446" width="171" height="122" fill="#EFF7F0"/>
        <image href="${assets.morango}" x="656" y="446" width="171" height="122" preserveAspectRatio="xMidYMid slice"/>
      </g>
      <rect x="664" y="454" width="52" height="18" rx="5" fill="#FFFFFF"/>
      <text x="670" y="466" fill="#FF6600" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="9" font-weight="800">FRUTAS</text>
      <circle cx="810" cy="463" r="11" fill="#FF6600" stroke="#FFFFFF" stroke-width="1.5"/>
      <text x="806" y="467" fill="#FFFFFF" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700">1</text>

      <text x="668" y="590" fill="#112A15" font-family="Fraunces, Georgia, serif" font-size="15" font-weight="700">Morango</text>
      <text x="668" y="612" fill="#0F6E16" font-family="JetBrains Mono, monospace" font-size="15" font-weight="800">R$ 12,90</text>
      <text x="752" y="611" fill="#4A634E" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="10">Bandeja 250g</text>

      <!-- Active Stepper on Card -->
      <rect x="666" y="624" width="151" height="36" rx="10" fill="#F7FAF7" stroke="#FF6600" stroke-width="1.8"/>
      <rect x="671" y="629" width="26" height="26" rx="7" fill="#FFFFFF"/>
      <text x="680" y="647" fill="#FF6600" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="15" font-weight="800">-</text>
      <text x="712" y="646" fill="#0F6E16" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700">1 na cesta</text>
      <rect x="786" y="629" width="26" height="26" rx="7" fill="#0F6E16"/>
      <text x="794" y="647" fill="#FFFFFF" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="15" font-weight="800">+</text>
    </g>

    <!-- MOBILE CARD 2: MANGA (In Cart) -->
    <g id="Card-Mobile-Manga">
      <rect x="843" y="446" width="171" height="226" rx="14" fill="#FFFFFF" stroke="#D5E6D6"/>
      <g clip-path="url(#cardImg2)">
        <rect x="843" y="446" width="171" height="122" fill="#EFF7F0"/>
        <image href="${assets.manga}" x="843" y="446" width="171" height="122" preserveAspectRatio="xMidYMid slice"/>
      </g>
      <rect x="851" y="454" width="52" height="18" rx="5" fill="#FFFFFF"/>
      <text x="857" y="466" fill="#FF6600" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="9" font-weight="800">FRUTAS</text>
      <circle cx="997" cy="463" r="11" fill="#FF6600" stroke="#FFFFFF" stroke-width="1.5"/>
      <text x="993" y="467" fill="#FFFFFF" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700">1</text>

      <text x="855" y="590" fill="#112A15" font-family="Fraunces, Georgia, serif" font-size="15" font-weight="700">Manga</text>
      <text x="855" y="612" fill="#0F6E16" font-family="JetBrains Mono, monospace" font-size="15" font-weight="800">R$ 7,90</text>
      <text x="938" y="611" fill="#4A634E" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="10">Unidade 550g</text>

      <rect x="853" y="624" width="151" height="36" rx="10" fill="#F7FAF7" stroke="#FF6600" stroke-width="1.8"/>
      <rect x="858" y="629" width="26" height="26" rx="7" fill="#FFFFFF"/>
      <text x="867" y="647" fill="#FF6600" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="15" font-weight="800">-</text>
      <text x="899" y="646" fill="#0F6E16" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700">1 na cesta</text>
      <rect x="973" y="629" width="26" height="26" rx="7" fill="#0F6E16"/>
      <text x="981" y="647" fill="#FFFFFF" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="15" font-weight="800">+</text>
    </g>

    <!-- MOBILE CARD 3: LARANJA BAHIA -->
    <g id="Card-Mobile-Laranja">
      <rect x="656" y="686" width="171" height="226" rx="14" fill="#FFFFFF" stroke="#D5E6D6"/>
      <g clip-path="url(#cardImg3)">
        <rect x="656" y="686" width="171" height="122" fill="#EFF7F0"/>
        <image href="${assets.laranja}" x="656" y="686" width="171" height="122" preserveAspectRatio="xMidYMid slice"/>
      </g>
      <rect x="664" y="694" width="52" height="18" rx="5" fill="#FFFFFF"/>
      <text x="670" y="706" fill="#FF6600" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="9" font-weight="800">FRUTAS</text>

      <text x="668" y="830" fill="#112A15" font-family="Fraunces, Georgia, serif" font-size="15" font-weight="700">Laranja Bahia</text>
      <text x="668" y="852" fill="#0F6E16" font-family="JetBrains Mono, monospace" font-size="15" font-weight="800">R$ 9,80</text>
      <text x="760" y="851" fill="#4A634E" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="10">Rede 1kg</text>

      <rect x="666" y="864" width="151" height="36" rx="10" fill="#0F6E16"/>
      <text x="706" y="886" fill="#FFFFFF" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="12" font-weight="700">+ Adicionar</text>
    </g>

    <!-- MOBILE CARD 4: UVA SEM SEMENTE -->
    <g id="Card-Mobile-Uva">
      <rect x="843" y="686" width="171" height="226" rx="14" fill="#FFFFFF" stroke="#D5E6D6"/>
      <g clip-path="url(#cardImg4)">
        <rect x="843" y="686" width="171" height="122" fill="#EFF7F0"/>
        <image href="${assets.uva}" x="843" y="686" width="171" height="122" preserveAspectRatio="xMidYMid slice"/>
      </g>
      <rect x="851" y="694" width="52" height="18" rx="5" fill="#FFFFFF"/>
      <text x="857" y="706" fill="#FF6600" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="9" font-weight="800">FRUTAS</text>

      <text x="855" y="830" fill="#112A15" font-family="Fraunces, Georgia, serif" font-size="15" font-weight="700">Uva S/ Semente</text>
      <text x="855" y="852" fill="#0F6E16" font-family="JetBrains Mono, monospace" font-size="15" font-weight="800">R$ 14,90</text>
      <text x="938" y="851" fill="#4A634E" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="10">Bandeja 500g</text>

      <rect x="853" y="864" width="151" height="36" rx="10" fill="#0F6E16"/>
      <text x="893" y="886" fill="#FFFFFF" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="12" font-weight="700">+ Adicionar</text>
    </g>

    <!-- Sticky Bottom Mobile Cart Bar -->
    <rect x="656" y="974" width="358" height="52" rx="16" fill="#0F6E16" stroke="#FF6600" stroke-width="2"/>
    <circle cx="682" cy="1000" r="13" fill="#FF6600"/>
    <text x="678" y="1004" fill="#FFFFFF" font-family="JetBrains Mono, monospace" font-size="12" font-weight="700">2</text>
    <text x="704" y="1005" fill="#FFFFFF" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="13" font-weight="700">Ver Minha Cesta</text>
    <text x="926" y="1005" fill="#FFD000" font-family="JetBrains Mono, monospace" font-size="14" font-weight="800">R$ 20,80</text>
  </g>

  <!-- ===================================================================== -->
  <!-- FRAME 03: MOBILE MODAL DETALHE DO PRODUTO (390 x 920)                 -->
  <!-- ===================================================================== -->
  <g id="Frame 03 - Mobile Modal Produto Sem Ponto de Fruta (390px)">
    <text x="1110" y="114" fill="#FF8800" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="13" font-weight="700">03 · MOBILE — MODAL DO PRODUTO LIMPO (390px)</text>
    <rect x="1110" y="126" width="390" height="920" rx="28" fill="#112A15" fill-opacity="0.85" stroke="#0F6E16" stroke-width="2"/>

    <!-- Bottom Sheet Modal -->
    <rect x="1110" y="270" width="390" height="776" rx="24" fill="#FFFFFF" stroke="#0F6E16" stroke-width="2"/>
    <rect x="1110" y="270" width="390" height="310" rx="24" fill="#E8F6E9"/>
    <text x="1134" y="314" fill="#FF6600" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="11" font-weight="800">FRUTAS · MINAS GERAIS</text>
    <circle cx="1464" cy="308" r="16" fill="#FFFFFF" stroke="#CBE5CD"/>
    <text x="1459" y="313" fill="#112A15" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="13" font-weight="700">✕</text>

    <g clip-path="url(#modalImgClip)">
      <image href="${assets.morango}" x="1134" y="340" width="342" height="210" preserveAspectRatio="xMidYMid slice"/>
    </g>
    <rect x="1134" y="340" width="342" height="210" rx="14" stroke="#FF6600" stroke-width="2"/>

    <!-- Product Info Clean (No ripeness/presentation selector!) -->
    <text x="1134" y="616" fill="#0F6E16" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="12" font-weight="700">Colheita do dia · Disponível na banca</text>
    <text x="1134" y="654" fill="#112A15" font-family="Fraunces, Georgia, serif" font-size="28" font-weight="700">Morango</text>

    <rect x="1134" y="672" width="104" height="28" rx="8" fill="#E8F6E9"/>
    <text x="1146" y="690" fill="#0F6E16" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="12" font-weight="700">Bandeja 250g</text>

    <text x="1134" y="742" fill="#0F6E16" font-family="JetBrains Mono, monospace" font-size="32" font-weight="800">R$ 12,90</text>
    <text x="1290" y="740" fill="#4A634E" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="13">por bandeja 250g</text>

    <text x="1134" y="784" fill="#1F4224" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="13">Morangos vermelhos, doces e suculentos</text>
    <text x="1134" y="804" fill="#1F4224" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="13">selecionados um a um na feira.</text>

    <!-- Quantity Row -->
    <line x1="1134" y1="846" x2="1476" y2="846" stroke="#E0EDE1" stroke-width="1.5"/>
    <text x="1134" y="888" fill="#1F4224" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="14" font-weight="600">Quantidade</text>
    <rect x="1356" y="864" width="36" height="36" rx="10" fill="#FFFFFF" stroke="#CBE5CD"/>
    <text x="1370" y="888" fill="#112A15" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="18" font-weight="700">-</text>
    <text x="1412" y="888" fill="#112A15" font-family="JetBrains Mono, monospace" font-size="15" font-weight="700">1</text>
    <rect x="1440" y="864" width="36" height="36" rx="10" fill="#FFFFFF" stroke="#CBE5CD"/>
    <text x="1452" y="888" fill="#112A15" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="18" font-weight="700">+</text>

    <!-- CTA Add to Basket -->
    <rect x="1134" y="924" width="342" height="54" rx="14" fill="#0F6E16"/>
    <text x="1198" y="956" fill="#FFFFFF" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="15" font-weight="700">Adicionar à Cesta · R$ 12,90</text>
  </g>

  <!-- ===================================================================== -->
  <!-- FRAME 04: MOBILE CHECKOUT WHATSAPP & DINHEIRO (390 x 920)             -->
  <!-- ===================================================================== -->
  <g id="Frame 04 - Mobile Checkout WhatsApp e Dinheiro (390px)">
    <text x="1580" y="114" fill="#FF8800" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="13" font-weight="700">04 · MOBILE — CHECKOUT &amp; PAGAMENTO DINHEIRO (390px)</text>
    <rect x="1580" y="126" width="390" height="920" rx="28" fill="#F7FAF7" stroke="#0F6E16" stroke-width="2"/>

    <!-- Drawer Top Header -->
    <rect x="1580" y="126" width="390" height="64" rx="20" fill="#0F6E16"/>
    <rect x="1580" y="186" width="390" height="4" fill="#FF6600"/>
    <text x="1604" y="164" fill="#FFFFFF" font-family="Fraunces, Georgia, serif" font-size="18" font-weight="700">Minha Cesta · Feirão Hortifruti</text>
    <text x="1936" y="164" fill="#FFFFFF" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="16" font-weight="700">✕</text>

    <!-- Free Delivery Bar -->
    <rect x="1580" y="190" width="390" height="48" fill="#E8F6E9"/>
    <text x="1600" y="210" fill="#112A15" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="10" font-weight="600">Faltam R$ 99,20 para entrega grátis na região</text>
    <rect x="1600" y="220" width="350" height="8" rx="4" fill="#CBE5CD"/>
    <rect x="1600" y="220" width="76" height="8" rx="4" fill="#FF6600"/>

    <!-- Selected Items -->
    <text x="1600" y="266" fill="#112A15" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="13" font-weight="700">Itens escolhidos (2)</text>
    <rect x="1600" y="278" width="350" height="162" rx="12" fill="#FFFFFF" stroke="#CBE5CD"/>

    <!-- Item 1 -->
    <g clip-path="url(#cartThumb1)">
      <image href="${assets.morango}" x="1614" y="294" width="58" height="52" preserveAspectRatio="xMidYMid slice"/>
    </g>
    <text x="1684" y="310" fill="#112A15" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="13" font-weight="700">Morango</text>
    <text x="1684" y="326" fill="#4A634E" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="11">Bandeja 250g</text>
    <text x="1684" y="344" fill="#0F6E16" font-family="JetBrains Mono, monospace" font-size="12" font-weight="700">R$ 12,90</text>

    <line x1="1600" y1="358" x2="1950" y2="358" stroke="#E0EDE1"/>

    <!-- Item 2 -->
    <g clip-path="url(#cartThumb2)">
      <image href="${assets.manga}" x="1614" y="374" width="58" height="52" preserveAspectRatio="xMidYMid slice"/>
    </g>
    <text x="1684" y="390" fill="#112A15" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="13" font-weight="700">Manga</text>
    <text x="1684" y="406" fill="#4A634E" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="11">Unidade 550g</text>
    <text x="1684" y="424" fill="#0F6E16" font-family="JetBrains Mono, monospace" font-size="12" font-weight="700">R$ 7,90</text>

    <!-- Address & Customer Fields -->
    <text x="1600" y="470" fill="#112A15" font-family="Fraunces, Georgia, serif" font-size="15" font-weight="700">Combinar Entrega pelo WhatsApp</text>
    <rect x="1600" y="484" width="350" height="36" rx="8" fill="#FFFFFF" stroke="#BBD9BE"/>
    <text x="1612" y="506" fill="#112A15" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="12">Cliente: Mariana Costa · (11) 98765-4321</text>

    <rect x="1600" y="528" width="350" height="36" rx="8" fill="#FFFFFF" stroke="#BBD9BE"/>
    <text x="1612" y="550" fill="#112A15" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="12">Rua das Laranjeiras, 340 - Vila Madalena</text>

    <!-- Payment Method Section Highlighting Cash -->
    <text x="1600" y="592" fill="#1F4224" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="12" font-weight="700">Forma de pagamento no recebimento</text>

    <rect x="1600" y="602" width="170" height="38" rx="8" fill="#FFFFFF" stroke="#BBD9BE"/>
    <text x="1612" y="625" fill="#1F4224" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="11" font-weight="600">Pix após conferência</text>

    <rect x="1780" y="602" width="170" height="38" rx="8" fill="#FF6600"/>
    <text x="1794" y="625" fill="#FFFFFF" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="11" font-weight="700">✓ Dinheiro na entrega</text>

    <rect x="1600" y="648" width="170" height="38" rx="8" fill="#FFFFFF" stroke="#BBD9BE"/>
    <text x="1612" y="671" fill="#1F4224" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="11" font-weight="600">Cartão na maquininha</text>

    <rect x="1780" y="648" width="170" height="38" rx="8" fill="#FFFFFF" stroke="#BBD9BE"/>
    <text x="1794" y="671" fill="#1F4224" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="11" font-weight="600">Vale Alimentação</text>

    <!-- Cash Change Box -->
    <rect x="1600" y="698" width="350" height="72" rx="10" fill="#FFF5EC" stroke="#FFD2B3" stroke-width="1.5"/>
    <text x="1614" y="720" fill="#B34200" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="11" font-weight="700">Precisa de troco para quanto? (opcional)</text>
    <rect x="1614" y="730" width="322" height="30" rx="6" fill="#FFFFFF" stroke="#FFB380"/>
    <text x="1624" y="749" fill="#112A15" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="11">Troco para R$ 50,00</text>

    <!-- Sticky Checkout Footer -->
    <rect x="1580" y="886" width="390" height="160" rx="20" fill="#FFFFFF" stroke="#CBE5CD"/>
    <text x="1604" y="914" fill="#4A634E" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="12">Subtotal: R$ 20,80 · Entrega: R$ 9,90</text>
    <text x="1604" y="942" fill="#112A15" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="15" font-weight="700">Total estimado do pedido</text>
    <text x="1868" y="942" fill="#0F6E16" font-family="JetBrains Mono, monospace" font-size="16" font-weight="800">R$ 30,70</text>

    <rect x="1604" y="962" width="342" height="52" rx="14" fill="#0F6E16"/>
    <text x="1668" y="993" fill="#FFFFFF" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="14" font-weight="700">Enviar Pedido pelo WhatsApp</text>
  </g>

  <!-- ===================================================================== -->
  <!-- FRAME 05: DESKTOP VITRINE COMPLETA (1360 x 920)                       -->
  <!-- ===================================================================== -->
  <g id="Frame 05 - Desktop Home Completa (1360px)">
    <text x="2080" y="114" fill="#FF8800" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="13" font-weight="700">05 · DESKTOP — VITRINE COMPLETA FEIRÃO HORTIFRUTI (1440px)</text>
    <rect x="2080" y="126" width="1360" height="920" rx="20" fill="#F7FAF7" stroke="#0F6E16" stroke-width="2"/>

    <!-- Desktop Header -->
    <rect x="2080" y="126" width="1360" height="70" rx="16" fill="#0F6E16"/>
    <rect x="2080" y="192" width="1360" height="4" fill="#FF6600"/>
    <circle cx="2165" cy="159" r="26" fill="#FFFFFF" stroke="#FF6600" stroke-width="2.5"/>
    <g clip-path="url(#desktopLogoClip)">
      <image href="${assets.logo}" x="2140" y="134" width="50" height="50" preserveAspectRatio="xMidYMid slice"/>
    </g>
    <text x="2204" y="158" fill="#FFFFFF" font-family="Fraunces, Georgia, serif" font-size="22" font-weight="700">FEIRÃO</text>
    <text x="2204" y="176" fill="#FF8800" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="13" font-weight="800" letter-spacing="1.5">HORTIFRUTI</text>

    <!-- Desktop Nav -->
    <text x="2620" y="166" fill="#FFD000" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="14" font-weight="700">Todos</text>
    <text x="2695" y="166" fill="#FFFFFF" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="14" font-weight="600">Frutas</text>
    <text x="2770" y="166" fill="#FFFFFF" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="14" font-weight="600">Verduras</text>
    <text x="2860" y="166" fill="#FFFFFF" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="14" font-weight="600">Legumes</text>

    <rect x="3336" y="140" width="44" height="42" rx="12" fill="#FFFFFF" stroke="#FF6600" stroke-width="2"/>
    <circle cx="3378" cy="140" r="10" fill="#FF6600"/>
    <text x="3374" y="144" fill="#FFFFFF" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700">2</text>

    <!-- Desktop Hero Banner -->
    <g clip-path="url(#desktopBannerClip)">
      <rect x="2080" y="200" width="1360" height="310" fill="#0A520F"/>
      <image href="${assets.banner}" x="2080" y="200" width="1360" height="310" preserveAspectRatio="xMidYMid slice" opacity="0.5"/>
      <rect x="2080" y="200" width="1360" height="310" fill="#0A520F" fill-opacity="0.62"/>
      <text x="2140" y="266" fill="#FFD000" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="13" font-weight="800" letter-spacing="1.5">SUPER QUARTA E QUINTA DAS FRUTAS</text>
      <text x="2140" y="316" fill="#FFFFFF" font-family="Fraunces, Georgia, serif" font-size="42" font-weight="700">Frutas Doces, Suculentas e Colhidas Hoje</text>
      <text x="2140" y="352" fill="#E8F6E9" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="16">Morango vermelho brilhante, manga sem fiapos, laranja suculenta e uvas frescas selecionadas a mão.</text>
      <rect x="2140" y="380" width="170" height="44" rx="12" fill="#FF6600" stroke="#FFD000" stroke-width="1.5"/>
      <text x="2168" y="407" fill="#FFFFFF" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="14" font-weight="700">Aproveitar Oferta</text>

      <!-- Desktop Price Stamp -->
      <rect x="3130" y="286" width="230" height="128" rx="20" fill="#FFFFFF" stroke="#FF6600" stroke-width="3"/>
      <text x="3156" y="320" fill="#FF6600" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="12" font-weight="800">FESTIVAL A PARTIR DE</text>
      <text x="3156" y="368" fill="#0F6E16" font-family="JetBrains Mono, monospace" font-size="38" font-weight="800">R$ 7,90</text>
      <text x="3156" y="394" fill="#3F5943" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="13" font-weight="600">Seleção Especial do Dia</text>
    </g>

    <!-- Desktop Filter Bar -->
    <rect x="2140" y="538" width="380" height="42" rx="12" fill="#E6F2E7" stroke="#CBE5CD"/>
    <rect x="2146" y="544" width="86" height="30" rx="8" fill="#FF6600"/>
    <text x="2171" y="564" fill="#FFFFFF" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="12" font-weight="700">Todos</text>
    <text x="2258" y="564" fill="#1F4224" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="12" font-weight="700">Frutas</text>
    <text x="2342" y="564" fill="#1F4224" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="12" font-weight="700">Verduras</text>
    <text x="2438" y="564" fill="#1F4224" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="12" font-weight="700">Legumes</text>

    <rect x="3100" y="538" width="278" height="42" rx="10" fill="#FFFFFF" stroke="#BBD9BE"/>
    <text x="3120" y="564" fill="#66806A" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="12">🔍 Buscar fruta, verdura ou legume...</text>

    <!-- Desktop 4-Column Product Grid -->
    <!-- Card 1 -->
    <g id="Desktop-Card-1">
      <rect x="2140" y="614" width="290" height="320" rx="16" fill="#FFFFFF" stroke="#D5E6D6"/>
      <g clip-path="url(#dCard1)">
        <image href="${assets.morango}" x="2140" y="614" width="290" height="175" preserveAspectRatio="xMidYMid slice"/>
      </g>
      <text x="2160" y="818" fill="#112A15" font-family="Fraunces, Georgia, serif" font-size="18" font-weight="700">Morango</text>
      <text x="2160" y="846" fill="#0F6E16" font-family="JetBrains Mono, monospace" font-size="20" font-weight="800">R$ 12,90</text>
      <text x="2330" y="844" fill="#4A634E" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="12">Bandeja 250g</text>
      <rect x="2160" y="868" width="250" height="44" rx="12" fill="#F7FAF7" stroke="#FF6600" stroke-width="2"/>
      <text x="2248" y="895" fill="#0F6E16" font-family="JetBrains Mono, monospace" font-size="13" font-weight="800">1 na cesta</text>
    </g>

    <!-- Card 2 -->
    <g id="Desktop-Card-2">
      <rect x="2456" y="614" width="290" height="320" rx="16" fill="#FFFFFF" stroke="#D5E6D6"/>
      <g clip-path="url(#dCard2)">
        <image href="${assets.manga}" x="2456" y="614" width="290" height="175" preserveAspectRatio="xMidYMid slice"/>
      </g>
      <text x="2476" y="818" fill="#112A15" font-family="Fraunces, Georgia, serif" font-size="18" font-weight="700">Manga</text>
      <text x="2476" y="846" fill="#0F6E16" font-family="JetBrains Mono, monospace" font-size="20" font-weight="800">R$ 7,90</text>
      <text x="2644" y="844" fill="#4A634E" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="12">Unidade 550g</text>
      <rect x="2476" y="868" width="250" height="44" rx="12" fill="#F7FAF7" stroke="#FF6600" stroke-width="2"/>
      <text x="2564" y="895" fill="#0F6E16" font-family="JetBrains Mono, monospace" font-size="13" font-weight="800">1 na cesta</text>
    </g>

    <!-- Card 3 -->
    <g id="Desktop-Card-3">
      <rect x="2772" y="614" width="290" height="320" rx="16" fill="#FFFFFF" stroke="#D5E6D6"/>
      <g clip-path="url(#dCard3)">
        <image href="${assets.laranja}" x="2772" y="614" width="290" height="175" preserveAspectRatio="xMidYMid slice"/>
      </g>
      <text x="2792" y="818" fill="#112A15" font-family="Fraunces, Georgia, serif" font-size="18" font-weight="700">Laranja Bahia</text>
      <text x="2792" y="846" fill="#0F6E16" font-family="JetBrains Mono, monospace" font-size="20" font-weight="800">R$ 9,80</text>
      <text x="2978" y="844" fill="#4A634E" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="12">Rede 1kg</text>
      <rect x="2792" y="868" width="250" height="44" rx="12" fill="#0F6E16"/>
      <text x="2878" y="895" fill="#FFFFFF" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="14" font-weight="700">+ Adicionar</text>
    </g>

    <!-- Card 4 -->
    <g id="Desktop-Card-4">
      <rect x="3088" y="614" width="290" height="320" rx="16" fill="#FFFFFF" stroke="#D5E6D6"/>
      <g clip-path="url(#dCard4)">
        <image href="${assets.uva}" x="3088" y="614" width="290" height="175" preserveAspectRatio="xMidYMid slice"/>
      </g>
      <text x="3108" y="818" fill="#112A15" font-family="Fraunces, Georgia, serif" font-size="18" font-weight="700">Uva Sem Semente</text>
      <text x="3108" y="846" fill="#0F6E16" font-family="JetBrains Mono, monospace" font-size="20" font-weight="800">R$ 14,90</text>
      <text x="3278" y="844" fill="#4A634E" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="12">Bandeja 500g</text>
      <rect x="3108" y="868" width="250" height="44" rx="12" fill="#0F6E16"/>
      <text x="3194" y="895" fill="#FFFFFF" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="14" font-weight="700">+ Adicionar</text>
    </g>
  </g>
</svg>`;
  };

  const handleDownloadFigmaSvg = async () => {
    setIsExporting(true);
    try {
      const svgContent = buildEditableFigmaSvg(embeddedAssets);
      const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Feirao-Hortifruti-Prototipo-Editavel-Figma.svg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setCopiedFeedback('Arquivo .SVG baixado! Basta arrastar para dentro do Figma para editar.');
      setTimeout(() => setCopiedFeedback(null), 5000);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyForFigma = async () => {
    setIsExporting(true);
    try {
      const svgContent = buildEditableFigmaSvg(embeddedAssets);
      await navigator.clipboard.writeText(svgContent);
      setCopiedFeedback(
        'Copiado! Abra o Figma e pressione Ctrl+V (ou Cmd+V) para colar todos os quadros editáveis.'
      );
      setTimeout(() => setCopiedFeedback(null), 5000);
    } catch {
      setCopiedFeedback('Use o botão "Baixar Arquivo Editável (.SVG)" e arraste para o Figma.');
      setTimeout(() => setCopiedFeedback(null), 5000);
    } finally {
      setIsExporting(false);
    }
  };

  const ARTBOARDS = [
    { id: 'all', label: 'Visão Geral (5 Quadros)' },
    { id: 'ds', label: '01 · Design System & Logo' },
    { id: 'home-mobile', label: '02 · Mobile Home (Mobile-First)' },
    { id: 'modal-mobile', label: '03 · Mobile Modal Produto' },
    { id: 'checkout-mobile', label: '04 · Mobile Cesta & Dinheiro' },
    { id: 'desktop', label: '05 · Desktop Vitrine 1440px' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-[#1E1E1E] text-white select-none"
      role="dialog"
      aria-modal="true"
      aria-label="Protótipo Editável Figma — Feirão Hortifruti"
    >
      {/* Top Figma-Style Toolbar */}
      <div className="h-14 bg-[#2C2C2C] border-b border-[#3E3E3E] px-3 sm:px-5 flex items-center justify-between gap-2 shrink-0">
        {/* Left: File Title & Badge */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#0F6E16] border border-[#FF6600] flex items-center justify-center font-bold text-xs text-white shrink-0">
            FIG
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-white truncate">
                Feirão Hortifruti — Protótipo Executivo &amp; UI Kit
              </span>
              <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#FF6600] text-white rounded-md">
                100% Editável no Figma
              </span>
            </div>
            <p className="text-[11px] text-[#A8A8A8] hidden sm:block">
              Arraste o arquivo .SVG baixado para o Figma ou clique em &quot;Copiar para o Figma&quot; e pressione Ctrl+V
            </p>
          </div>
        </div>

        {/* Center: Zoom Controls */}
        <div className="hidden lg:flex items-center gap-1.5 bg-[#1E1E1E] px-2.5 py-1 rounded-lg border border-[#3E3E3E]">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.35, Number((z - 0.1).toFixed(2))))}
            className="w-6 h-6 rounded hover:bg-[#383838] text-xs font-bold cursor-pointer"
            title="Diminuir zoom"
          >
            -
          </button>
          <span className="text-xs font-mono-tabular w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(1.1, Number((z + 0.1).toFixed(2))))}
            className="w-6 h-6 rounded hover:bg-[#383838] text-xs font-bold cursor-pointer"
            title="Aumentar zoom"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => setZoom(0.58)}
            className="ml-1 px-1.5 py-0.5 text-[10px] bg-[#333333] hover:bg-[#444444] rounded cursor-pointer"
          >
            Ajustar
          </button>
        </div>

        {/* Right: Editable Export Actions & Close */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopyForFigma}
            disabled={isExporting}
            className="px-3 py-2 text-xs font-bold bg-[#383838] hover:bg-[#4A4A4A] text-white rounded-lg border border-[#555555] transition-colors cursor-pointer whitespace-nowrap"
          >
            Copiar para Colar no Figma (Ctrl+V)
          </button>
          <button
            type="button"
            onClick={handleDownloadFigmaSvg}
            disabled={isExporting}
            className="px-3.5 py-2 text-xs font-bold bg-[#FF6600] hover:bg-[#E05500] text-white rounded-lg shadow-sm transition-colors cursor-pointer whitespace-nowrap"
          >
            ⬇ Baixar Arquivo Editável (.SVG Figma)
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 text-xs font-semibold bg-[#0F6E16] hover:bg-[#0B5410] text-white rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            Voltar ao Site
          </button>
        </div>
      </div>

      {/* Feedback Toast Banner */}
      {copiedFeedback && (
        <div className="bg-[#0F6E16] border-b border-[#FF6600] px-4 py-2 text-center text-xs font-bold text-white flex items-center justify-center gap-2">
          <span>✓ {copiedFeedback}</span>
        </div>
      )}

      {/* Sub-Bar: Artboard Filter Tabs + How to Open in Figma */}
      <div className="bg-[#252525] border-b border-[#383838] px-4 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {ARTBOARDS.map((ab) => (
            <button
              key={ab.id}
              type="button"
              onClick={() => {
                setSelectedArtboard(ab.id);
                if (ab.id === 'all') setZoom(0.58);
                else setZoom(0.85);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                selectedArtboard === ab.id
                  ? 'bg-[#0F6E16] text-white border border-[#FF6600]'
                  : 'text-[#BDBDBD] hover:text-white hover:bg-[#333333]'
              }`}
            >
              {ab.label}
            </button>
          ))}
        </div>

        <div className="text-[11px] text-[#CFCFCF] hidden xl:flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-[#333333] text-[#FFD000] font-semibold">
            Como editar no Figma:
          </span>
          <span>
            1. Clique em &quot;Baixar Arquivo Editável (.SVG Figma)&quot; · 2. Arraste o arquivo para qualquer projeto no Figma · 3. Todos os textos, cores e cards ficam editáveis!
          </span>
        </div>
      </div>

      {/* Main Interactive Figma Canvas Area */}
      <div className="flex-1 overflow-auto p-6 sm:p-10 bg-[#181818]">
        <div
          className="origin-top-left transition-transform duration-150 inline-block"
          style={{
            transform: `scale(${zoom})`,
          }}
        >
          <div
            className="rounded-2xl overflow-hidden shadow-2xl border border-[#333333]"
            dangerouslySetInnerHTML={{
              __html: buildEditableFigmaSvg(embeddedAssets),
            }}
          />
        </div>
      </div>
    </div>
  );
};
