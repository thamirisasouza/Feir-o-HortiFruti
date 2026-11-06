import React, { useState, useMemo } from 'react';
import { ProductItem } from '../data/products';
import {
  CustomCloseCrossIcon,
  CustomMinusStemIcon,
  CustomPlusStemIcon,
  CustomTrashBinIcon,
  CustomWhatsAppLeafIcon,
  CustomWovenBasketIcon,
} from './HortifrutiIllustrations';

export interface CartEntry {
  key: string;
  product: ProductItem;
  quantity: number;
}

interface WhatsAppCheckoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartEntry[];
  onUpdateQuantity: (key: string, delta: number) => void;
  onRemoveItem: (key: string) => void;
  onClearCart: () => void;
}

type CheckoutStep = 'produtos' | 'entrega' | 'pagamento' | 'confirmar';

const DELIVERY_WINDOWS = [
  'Manhã (08h às 11h30 - Horário de Brasília)',
  'Tarde (13h às 16h30 - Horário de Brasília)',
  'Fim de Tarde (17h às 19h30 - Horário de Brasília)',
  'Combinar melhor horário pelo WhatsApp',
];

const PAYMENT_METHODS = [
  'Pix após conferência da feira',
  'Dinheiro na entrega',
  'Cartão na maquininha na entrega',
  'Vale Alimentação na maquininha',
];

export const WhatsAppCheckoutDrawer: React.FC<WhatsAppCheckoutDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  // Stepper flow state: 'produtos' -> 'entrega' -> 'pagamento' -> 'confirmar'
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('produtos');

  // Customer & Delivery info
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [deliveryWindow, setDeliveryWindow] = useState(DELIVERY_WINDOWS[0]);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [cashChangeFor, setCashChangeFor] = useState('');
  const [pickerNotes, setPickerNotes] = useState('');
  const [orderSentCode, setOrderSentCode] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const subtotal = useMemo(
    () => cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0),
    [cart]
  );

  const freeShippingThreshold = 120;
  const deliveryFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 9.90;
  const totalAmount = subtotal + deliveryFee;
  const remainingForFreeDelivery = Math.max(0, freeShippingThreshold - subtotal);

  const currentOrderReference = useMemo(() => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `FEIRAO-${randomNum}`;
  }, [cart.length]);

  const formattedWhatsAppMessage = useMemo(() => {
    const brasiliaDateHora = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date());

    const lines: string[] = [
      `Olá, equipe *HortiFeirão*!`,
      `Gostaria de finalizar meu pedido *#${orderSentCode || currentOrderReference}* (${brasiliaDateHora} - Horário de Brasília) e combinar a entrega:`,
      ``,
      `*ITENS SELECIONADOS NA FEIRA:*`,
    ];

    cart.forEach((entry) => {
      const lineTotal = (entry.product.price * entry.quantity).toFixed(2).replace('.', ',');
      lines.push(
        `- ${entry.quantity}x *${entry.product.name}* (${entry.product.unitLabel}) — R$ ${lineTotal}`
      );
    });

    lines.push(``);
    lines.push(`*RESUMO DE VALORES:*`);
    lines.push(`Subtotal dos produtos: R$ ${subtotal.toFixed(2).replace('.', ',')}`);
    lines.push(
      `Taxa de entrega: ${
        deliveryFee === 0
          ? 'Grátis (Cortesia acima de R$ 120,00)'
          : `R$ ${deliveryFee.toFixed(2).replace('.', ',')} (a confirmar por região)`
      }`
    );
    lines.push(`*Total estimado: R$ ${totalAmount.toFixed(2).replace('.', ',')}*`);
    lines.push(``);
    lines.push(`*DADOS PARA COMBINAR A ENTREGA:*`);
    lines.push(`Cliente: ${customerName.trim() || 'A informar na conversa'}`);
    if (customerPhone.trim()) {
      lines.push(`Contato: ${customerPhone.trim()}`);
    }
    lines.push(
      `Endereço: ${streetAddress.trim() || 'A confirmar'}${
        neighborhood.trim() ? ` - Bairro ${neighborhood.trim()}` : ''
      }`
    );
    lines.push(`Janela preferida: ${deliveryWindow}`);

    if (paymentMethod === 'Dinheiro na entrega') {
      const trocoInfo = cashChangeFor.trim()
        ? ` (Troco para: ${cashChangeFor.trim()})`
        : ' (Sem necessidade de troco)';
      lines.push(`Pagamento na entrega: ${paymentMethod}${trocoInfo}`);
    } else {
      lines.push(`Pagamento na entrega: ${paymentMethod}`);
    }

    if (pickerNotes.trim()) {
      lines.push(`Recado para o selecionador: ${pickerNotes.trim()}`);
    }

    lines.push(``);
    lines.push(`Aguardo a confirmação do pedido e saída para entrega. Obrigado!`);

    return lines.join('\n');
  }, [
    cart,
    subtotal,
    deliveryFee,
    totalAmount,
    customerName,
    customerPhone,
    streetAddress,
    neighborhood,
    deliveryWindow,
    paymentMethod,
    cashChangeFor,
    pickerNotes,
    orderSentCode,
    currentOrderReference,
  ]);

  // Enviar para 11988530209 (sem mostrar número na UI)
  const whatsappUrl = `https://wa.me/5511988530209?text=${encodeURIComponent(
    formattedWhatsAppMessage
  )}`;

  const handleAdvanceToDelivery = () => {
    if (cart.length === 0) return;
    setValidationError(null);
    setCurrentStep('entrega');
  };

  const handleAdvanceToPayment = () => {
    if (!customerName.trim()) {
      setValidationError('Por favor, informe seu nome completo.');
      return;
    }
    if (!streetAddress.trim()) {
      setValidationError('Por favor, informe seu endereço de entrega.');
      return;
    }
    setValidationError(null);
    setCurrentStep('pagamento');
  };

  const handleAdvanceToConfirm = () => {
    setValidationError(null);
    setCurrentStep('confirmar');
  };

  const handleTriggerSendWhatsApp = () => {
    setOrderSentCode(currentOrderReference);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#112A15]/50 backdrop-blur-[2px] transition-opacity duration-150 animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
    >
      <div className="relative flex flex-col w-full max-w-xl bg-[#F7FAF7] h-full shadow-2xl border-l-2 border-[#0F6E16] overflow-hidden text-[#112A15]">
        {/* Drawer Top Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 bg-[#0F6E16] text-white border-b-4 border-[#FF6600] shrink-0">
          <div>
            <h2 id="drawer-title" className="text-lg sm:text-xl font-bold text-white font-display">
              Minha Cesta
            </h2>
            <p className="text-xs text-white/80">
              HortiFeirão · Finalização do Pedido
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-white/90 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
            aria-label="Fechar cesta"
          >
            <CustomCloseCrossIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Progress Bar (Caminho para cada parte da finalização) */}
        {cart.length > 0 && (
          <div className="px-4 sm:px-6 py-3 bg-white border-b border-[#D5E6D6] shrink-0">
            <div className="flex items-center justify-between relative">
              {/* Connecting line */}
              <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-[#E0EDE1] -translate-y-1/2 -z-0" />

              {/* Step 1: Produtos */}
              <button
                type="button"
                onClick={() => setCurrentStep('produtos')}
                className="relative z-10 flex flex-col items-center gap-1 group cursor-pointer"
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    currentStep === 'produtos'
                      ? 'bg-[#0F6E16] text-white shadow-sm ring-3 ring-[#0F6E16]/20'
                      : 'bg-[#E6F2E7] text-[#0F6E16]'
                  }`}
                >
                  1
                </div>
                <span
                  className={`text-[11px] font-bold ${
                    currentStep === 'produtos' ? 'text-[#0F6E16]' : 'text-[#58735C]'
                  }`}
                >
                  Produtos
                </span>
              </button>

              {/* Step 2: Entrega */}
              <button
                type="button"
                onClick={() => {
                  if (cart.length > 0) setCurrentStep('entrega');
                }}
                className="relative z-10 flex flex-col items-center gap-1 group cursor-pointer"
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    currentStep === 'entrega'
                      ? 'bg-[#0F6E16] text-white shadow-sm ring-3 ring-[#0F6E16]/20'
                      : ['pagamento', 'confirmar'].includes(currentStep)
                      ? 'bg-[#0F6E16] text-white'
                      : 'bg-[#E6F2E7] text-[#58735C]'
                  }`}
                >
                  {['pagamento', 'confirmar'].includes(currentStep) ? '✓' : '2'}
                </div>
                <span
                  className={`text-[11px] font-bold ${
                    currentStep === 'entrega' ? 'text-[#0F6E16]' : 'text-[#58735C]'
                  }`}
                >
                  Entrega
                </span>
              </button>

              {/* Step 3: Pagamento */}
              <button
                type="button"
                onClick={() => {
                  if (customerName.trim() && streetAddress.trim()) setCurrentStep('pagamento');
                }}
                className="relative z-10 flex flex-col items-center gap-1 group cursor-pointer"
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    currentStep === 'pagamento'
                      ? 'bg-[#0F6E16] text-white shadow-sm ring-3 ring-[#0F6E16]/20'
                      : currentStep === 'confirmar'
                      ? 'bg-[#0F6E16] text-white'
                      : 'bg-[#E6F2E7] text-[#58735C]'
                  }`}
                >
                  {currentStep === 'confirmar' ? '✓' : '3'}
                </div>
                <span
                  className={`text-[11px] font-bold ${
                    currentStep === 'pagamento' ? 'text-[#0F6E16]' : 'text-[#58735C]'
                  }`}
                >
                  Pagamento
                </span>
              </button>

              {/* Step 4: Finalizar */}
              <button
                type="button"
                onClick={() => {
                  if (customerName.trim() && streetAddress.trim()) setCurrentStep('confirmar');
                }}
                className="relative z-10 flex flex-col items-center gap-1 group cursor-pointer"
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    currentStep === 'confirmar'
                      ? 'bg-[#FF6600] text-white shadow-sm ring-3 ring-[#FF6600]/25'
                      : 'bg-[#E6F2E7] text-[#58735C]'
                  }`}
                >
                  4
                </div>
                <span
                  className={`text-[11px] font-bold ${
                    currentStep === 'confirmar' ? 'text-[#FF6600]' : 'text-[#58735C]'
                  }`}
                >
                  Finalizar
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Free Delivery Bar */}
        {cart.length > 0 && currentStep === 'produtos' && (
          <div className="px-5 sm:px-6 py-2.5 bg-[#E8F6E9] border-b border-[#CBE5CD] shrink-0">
            <div className="flex items-center justify-between text-xs text-[#112A15] mb-1">
              <span className="font-medium">
                {remainingForFreeDelivery === 0
                  ? '🎉 Parabéns! Sua feira ganhou entrega cortesia na região.'
                  : `Faltam R$ ${remainingForFreeDelivery.toFixed(2).replace('.', ',')} para entrega grátis`}
              </span>
              <span className="font-mono-tabular font-bold text-[#0F6E16]">
                {Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100))}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#CBE5CD] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#FF6600] transition-transform duration-200 origin-left"
                style={{
                  transform: `scaleX(${Math.min(1, subtotal / freeShippingThreshold)})`,
                }}
              />
            </div>
          </div>
        )}

        {/* Drawer Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-6">
          {cart.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#E8F6E9] text-[#0F6E16] flex items-center justify-center">
                <CustomWovenBasketIcon className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="text-lg font-semibold text-[#112A15] font-display">
                  Sua cesta está vazia
                </h3>
                <p className="text-xs text-[#4A634E]">
                  Adicione frutas, verduras e legumes frescos para iniciar seu pedido.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-[#0F6E16] hover:bg-[#FF6600] rounded-xl transition-colors cursor-pointer"
              >
                Explorar a Feira
              </button>
            </div>
          ) : (
            <>
              {/* Validation alert banner */}
              {validationError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold flex items-center gap-2 animate-in fade-in">
                  <svg className="w-4 h-4 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>{validationError}</span>
                </div>
              )}

              {/* Order Sent Confirmation if triggered */}
              {orderSentCode && (
                <div className="p-4 bg-[#E8F6E9] border-2 border-[#0F6E16] rounded-xl space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-[#FF6600]">
                        Pedido #{orderSentCode} gerado com sucesso!
                      </p>
                      <h4 className="text-sm font-bold text-[#112A15] font-display mt-0.5">
                        Mensagem enviada para o WhatsApp
                      </h4>
                      <p className="text-xs text-[#4A634E] mt-1">
                        Aguarde a confirmação de horário e separação da sua feira fresca.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setOrderSentCode(null);
                        onClearCart();
                        setCurrentStep('produtos');
                      }}
                      className="text-xs font-semibold text-[#0F6E16] underline hover:text-[#FF6600] whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Novo pedido
                    </button>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* PASSO 1: PRODUTOS                                         */}
              {/* ========================================================= */}
              {currentStep === 'produtos' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-[#112A15] font-display">
                        1. Produtos Selecionados
                      </h3>
                      <p className="text-xs text-[#4A634E]">
                        Revise os itens e ajuste as quantidades necessárias
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={onClearCart}
                      className="text-xs text-[#4A634E] hover:text-red-600 transition-colors cursor-pointer"
                    >
                      Esvaziar cesta
                    </button>
                  </div>

                  <div className="divide-y divide-[#E0EDE1] bg-white rounded-2xl border border-[#CBE5CD] shadow-2xs overflow-hidden">
                    {cart.map((entry) => (
                      <div key={entry.key} className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-[#112A15] truncate">
                            {entry.product.name}
                          </h4>
                          <p className="text-xs text-[#4A634E] truncate">
                            {entry.product.unitLabel} · R$ {entry.product.price.toFixed(2).replace('.', ',')} cada
                          </p>
                          <p className="text-xs font-mono-tabular font-bold text-[#0F6E16] mt-0.5">
                            R$ {(entry.product.price * entry.quantity).toFixed(2).replace('.', ',')}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 bg-[#F7FAF7] p-1 rounded-xl border border-[#D5E6D6]">
                          <button
                            type="button"
                            onClick={() =>
                              entry.quantity === 1
                                ? onRemoveItem(entry.key)
                                : onUpdateQuantity(entry.key, -1)
                            }
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-[#CBE5CD] text-[#112A15] hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer"
                            aria-label="Diminuir quantidade"
                          >
                            {entry.quantity === 1 ? (
                              <CustomTrashBinIcon className="w-3.5 h-3.5 text-[#D94E00]" />
                            ) : (
                              <CustomMinusStemIcon className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <span className="w-7 text-center text-xs font-mono-tabular font-bold text-[#112A15]">
                            {entry.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(entry.key, 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-[#CBE5CD] text-[#0F6E16] hover:bg-emerald-50 hover:border-[#0F6E16] transition-colors cursor-pointer"
                            aria-label="Aumentar quantidade"
                          >
                            <CustomPlusStemIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* PASSO 2: DADOS DA ENTREGA                                 */}
              {/* ========================================================= */}
              {currentStep === 'entrega' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-[#112A15] font-display">
                      2. Dados da Entrega
                    </h3>
                    <p className="text-xs text-[#4A634E]">
                      Informe o endereço e a melhor janela de horário para receber sua feira
                    </p>
                  </div>

                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#CBE5CD] shadow-2xs space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#1F4224] mb-1">
                          Seu Nome Completo *
                        </label>
                        <input
                          type="text"
                          value={customerName}
                          onChange={(e) => {
                            setCustomerName(e.target.value);
                            if (validationError) setValidationError(null);
                          }}
                          placeholder="Ex: Mariana Costa"
                          className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F7FAF7] border border-[#BBD9BE] rounded-xl text-[#112A15] placeholder:text-[#78927B] focus:bg-white focus:outline-none focus:border-[#0F6E16]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#1F4224] mb-1">
                          Telefone / WhatsApp de Contato
                        </label>
                        <input
                          type="tel"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="Ex: (11) 98765-4321"
                          className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F7FAF7] border border-[#BBD9BE] rounded-xl text-[#112A15] placeholder:text-[#78927B] focus:bg-white focus:outline-none focus:border-[#0F6E16]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-[#1F4224] mb-1">
                          Rua, Número e Complemento *
                        </label>
                        <input
                          type="text"
                          value={streetAddress}
                          onChange={(e) => {
                            setStreetAddress(e.target.value);
                            if (validationError) setValidationError(null);
                          }}
                          placeholder="Ex: Rua das Laranjeiras, 340, Apto 52"
                          className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F7FAF7] border border-[#BBD9BE] rounded-xl text-[#112A15] placeholder:text-[#78927B] focus:bg-white focus:outline-none focus:border-[#0F6E16]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#1F4224] mb-1">
                          Bairro
                        </label>
                        <input
                          type="text"
                          value={neighborhood}
                          onChange={(e) => setNeighborhood(e.target.value)}
                          placeholder="Ex: Centro / Vila Nova"
                          className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F7FAF7] border border-[#BBD9BE] rounded-xl text-[#112A15] placeholder:text-[#78927B] focus:bg-white focus:outline-none focus:border-[#0F6E16]"
                        />
                      </div>
                    </div>

                    {/* Janela de horário */}
                    <div>
                      <label className="block text-xs font-bold text-[#1F4224] mb-1.5">
                        Janela de Horário Preferida para Receber
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {DELIVERY_WINDOWS.map((win) => {
                          const active = deliveryWindow === win;
                          return (
                            <button
                              key={win}
                              type="button"
                              onClick={() => setDeliveryWindow(win)}
                              className={`px-3 py-2 text-left text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                                active
                                  ? 'bg-[#0F6E16] text-white border-[#0F6E16] shadow-xs'
                                  : 'bg-[#F7FAF7] text-[#1F4224] border-[#CBE5CD] hover:border-[#0F6E16]'
                              }`}
                            >
                              {win}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Recado / Observações */}
                    <div>
                      <label className="block text-xs font-bold text-[#1F4224] mb-1">
                        Recado para o Selecionador (opcional)
                      </label>
                      <textarea
                        rows={2}
                        value={pickerNotes}
                        onChange={(e) => setPickerNotes(e.target.value)}
                        placeholder="Ex: Deixar na portaria com Sr. Antônio ou escolher mamão mais maduro."
                        className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#F7FAF7] border border-[#BBD9BE] rounded-xl text-[#112A15] placeholder:text-[#78927B] focus:bg-white focus:outline-none focus:border-[#0F6E16]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* PASSO 3: MEIOS DE PAGAMENTO                               */}
              {/* ========================================================= */}
              {currentStep === 'pagamento' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-[#112A15] font-display">
                      3. Meio de Pagamento
                    </h3>
                    <p className="text-xs text-[#4A634E]">
                      Escolha como prefere pagar ao receber a sua encomenda
                    </p>
                  </div>

                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#CBE5CD] shadow-2xs space-y-3.5">
                    <div className="grid grid-cols-1 gap-2.5">
                      {PAYMENT_METHODS.map((method) => {
                        const active = paymentMethod === method;
                        return (
                          <button
                            key={method}
                            type="button"
                            onClick={() => setPaymentMethod(method)}
                            className={`p-3.5 text-left text-xs sm:text-sm font-bold rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                              active
                                ? 'bg-[#0F6E16] text-white border-[#0F6E16] shadow-xs'
                                : 'bg-[#F7FAF7] text-[#1F4224] border-[#CBE5CD] hover:border-[#0F6E16]'
                            }`}
                          >
                            <span>{method}</span>
                            <span
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                active ? 'border-white bg-white' : 'border-[#9AB39E]'
                              }`}
                            >
                              {active && <span className="w-2 h-2 rounded-full bg-[#0F6E16]" />}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {paymentMethod === 'Dinheiro na entrega' && (
                      <div className="p-3.5 bg-[#FFF5EC] border border-[#FFD2B3] rounded-xl space-y-1.5 animate-in fade-in">
                        <label className="block text-xs font-bold text-[#B34200]">
                          Precisa de troco para quanto? (opcional)
                        </label>
                        <input
                          type="text"
                          value={cashChangeFor}
                          onChange={(e) => setCashChangeFor(e.target.value)}
                          placeholder="Ex: Troco para R$ 100,00 ou Não preciso de troco"
                          className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-[#FFB380] rounded-lg text-[#112A15] placeholder:text-[#9A6B4C] focus:outline-none focus:border-[#FF6600]"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* PASSO 4: FINALIZAR E ENVIAR MENSAGEM PARA O WHATSAPP      */}
              {/* ========================================================= */}
              {currentStep === 'confirmar' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-[#112A15] font-display">
                      4. Revisão e Envio do Pedido
                    </h3>
                    <p className="text-xs text-[#4A634E]">
                      Confira todos os dados antes de enviar o pedido pelo WhatsApp
                    </p>
                  </div>

                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#CBE5CD] shadow-2xs space-y-4 divide-y divide-[#EBF2EB]">
                    {/* Summary: Items */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-[#112A15]">
                        <span className="flex items-center gap-1.5">
                          <span>📦</span> Itens do Pedido ({cart.reduce((s, i) => s + i.quantity, 0)})
                        </span>
                        <button
                          type="button"
                          onClick={() => setCurrentStep('produtos')}
                          className="text-[#0F6E16] hover:underline font-semibold cursor-pointer"
                        >
                          Alterar
                        </button>
                      </div>
                      <div className="text-xs text-[#4A634E] space-y-1 max-h-36 overflow-y-auto pr-1">
                        {cart.map((entry) => (
                          <div key={entry.key} className="flex items-center justify-between">
                            <span className="truncate">
                              {entry.quantity}x {entry.product.name} ({entry.product.unitLabel})
                            </span>
                            <span className="font-mono-tabular shrink-0 text-[#112A15] font-semibold">
                              R$ {(entry.product.price * entry.quantity).toFixed(2).replace('.', ',')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Summary: Delivery */}
                    <div className="pt-3 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold text-[#112A15]">
                        <span className="flex items-center gap-1.5">
                          <span>📍</span> Endereço de Entrega
                        </span>
                        <button
                          type="button"
                          onClick={() => setCurrentStep('entrega')}
                          className="text-[#0F6E16] hover:underline font-semibold cursor-pointer"
                        >
                          Editar
                        </button>
                      </div>
                      <p className="text-xs text-[#112A15] font-semibold">
                        {customerName || 'Cliente'} {customerPhone && `· ${customerPhone}`}
                      </p>
                      <p className="text-xs text-[#4A634E]">
                        {streetAddress} {neighborhood && `· ${neighborhood}`}
                      </p>
                      <p className="text-[11px] text-[#0F6E16] font-medium">
                        Horário: {deliveryWindow}
                      </p>
                    </div>

                    {/* Summary: Payment */}
                    <div className="pt-3 space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-[#112A15]">
                        <span className="flex items-center gap-1.5">
                          <span>💳</span> Forma de Pagamento
                        </span>
                        <button
                          type="button"
                          onClick={() => setCurrentStep('pagamento')}
                          className="text-[#0F6E16] hover:underline font-semibold cursor-pointer"
                        >
                          Alterar
                        </button>
                      </div>
                      <p className="text-xs text-[#112A15] font-semibold">
                        {paymentMethod}
                        {paymentMethod === 'Dinheiro na entrega' && cashChangeFor && ` (${cashChangeFor})`}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Dynamic Multi-Step Bottom Footer */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 bg-white border-t border-[#CBE5CD] shrink-0 space-y-3">
            {/* Price Breakdown */}
            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between text-[#4A634E]">
                <span>Subtotal dos produtos</span>
                <span className="font-mono-tabular">
                  R$ {subtotal.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <div className="flex items-center justify-between text-[#4A634E]">
                <span>Taxa de entrega estimada</span>
                <span className="font-mono-tabular font-bold text-[#FF6600]">
                  {deliveryFee === 0 ? 'Cortesia' : `R$ ${deliveryFee.toFixed(2).replace('.', ',')}`}
                </span>
              </div>
              <div className="flex items-center justify-between text-base font-bold text-[#112A15] pt-0.5 border-t border-[#EBF2EB]">
                <span>Total estimado</span>
                <span className="font-mono-tabular text-[#0F6E16] text-lg">
                  R$ {totalAmount.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>

            {/* Step Action Buttons */}
            <div>
              {/* Step 1: Avançar para Dados da Entrega */}
              {currentStep === 'produtos' && (
                <button
                  type="button"
                  onClick={handleAdvanceToDelivery}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-bold text-white bg-[#0F6E16] hover:bg-[#0A520F] rounded-xl transition-all shadow-md cursor-pointer active:scale-[0.99]"
                >
                  <span>Avançar para Dados da Entrega</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              )}

              {/* Step 2: Voltar / Avançar para Meios de Pagamento */}
              {currentStep === 'entrega' && (
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setCurrentStep('produtos')}
                    className="px-4 py-3.5 text-xs sm:text-sm font-bold text-[#1F4224] bg-[#E6F2E7] hover:bg-[#D4EBD6] rounded-xl transition-colors cursor-pointer shrink-0"
                  >
                    ← Voltar
                  </button>
                  <button
                    type="button"
                    onClick={handleAdvanceToPayment}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 text-xs sm:text-sm font-bold text-white bg-[#0F6E16] hover:bg-[#0A520F] rounded-xl transition-all shadow-md cursor-pointer active:scale-[0.99]"
                  >
                    <span>Avançar para Meios de Pagamento</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Step 3: Voltar / Avançar para Revisar e Enviar */}
              {currentStep === 'pagamento' && (
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setCurrentStep('entrega')}
                    className="px-4 py-3.5 text-xs sm:text-sm font-bold text-[#1F4224] bg-[#E6F2E7] hover:bg-[#D4EBD6] rounded-xl transition-colors cursor-pointer shrink-0"
                  >
                    ← Voltar
                  </button>
                  <button
                    type="button"
                    onClick={handleAdvanceToConfirm}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 text-xs sm:text-sm font-bold text-white bg-[#0F6E16] hover:bg-[#0A520F] rounded-xl transition-all shadow-md cursor-pointer active:scale-[0.99]"
                  >
                    <span>Avançar para Revisar Pedido</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Step 4: Enviar Mensagem para WhatsApp (sem mostrar número) */}
              {currentStep === 'confirmar' && (
                <div className="space-y-2">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleTriggerSendWhatsApp}
                    className="w-full inline-flex items-center justify-center gap-2.5 px-5 py-3.5 text-sm sm:text-base font-extrabold text-white bg-[#0F6E16] hover:bg-[#25D366] rounded-xl transition-all text-center whitespace-nowrap cursor-pointer shadow-lg active:scale-[0.99]"
                  >
                    <CustomWhatsAppLeafIcon className="w-5 h-5 shrink-0" />
                    <span>Enviar Pedido pelo WhatsApp</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setCurrentStep('pagamento')}
                    className="w-full text-center text-xs font-semibold text-[#4A634E] hover:text-[#0F6E16] cursor-pointer py-1"
                  >
                    ← Voltar para Meios de Pagamento
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
