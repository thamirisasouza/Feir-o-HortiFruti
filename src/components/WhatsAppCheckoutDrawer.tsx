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
      `Olá, equipe *Feirão Hortifruti*!`,
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
    lines.push(`Aguardo a confirmação do horário de saída da entrega. Obrigado!`);

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

  const whatsappUrl = `https://wa.me/5511999999999?text=${encodeURIComponent(
    formattedWhatsAppMessage
  )}`;

  const handlePrepareSend = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!customerName.trim() || !streetAddress.trim()) {
      e.preventDefault();
      setValidationError(
        'Por favor, preencha seu nome e o endereço de entrega para enviarmos o pedido pelo WhatsApp.'
      );
      return;
    }
    setValidationError(null);
    setOrderSentCode(currentOrderReference);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#112A15]/50 backdrop-blur-[2px] transition-opacity duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
    >
      <div className="relative flex flex-col w-full max-w-xl bg-[#F7FAF7] h-full shadow-2xl border-l-2 border-[#0F6E16] overflow-hidden">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-[#0F6E16] text-white border-b-4 border-[#FF6600]">
          <div>
            <h2 id="drawer-title" className="text-xl font-bold text-white font-display">
              Minha Cesta · Feirão Hortifruti
            </h2>
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

        {/* Free Delivery Progress Bar */}
        {cart.length > 0 && (
          <div className="px-6 py-3 bg-[#E8F6E9] border-b border-[#CBE5CD]">
            <div className="flex items-center justify-between text-xs text-[#112A15] mb-1.5">
              <span className="font-medium">
                {remainingForFreeDelivery === 0
                  ? 'Parabéns! Sua feira ganhou entrega cortesia na região.'
                  : `Faltam R$ ${remainingForFreeDelivery.toFixed(2).replace('.', ',')} para entrega grátis na região`}
              </span>
              <span className="font-mono-tabular font-bold text-[#0F6E16]">
                {Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100))}%
              </span>
            </div>
            <div className="w-full h-2 bg-[#CBE5CD] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#FF6600] transition-transform duration-150 origin-left"
                style={{
                  transform: `scaleX(${Math.min(1, subtotal / freeShippingThreshold)})`,
                }}
              />
            </div>
          </div>
        )}

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
          {cart.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#E8F6E9] text-[#0F6E16] flex items-center justify-center">
                <CustomWovenBasketIcon className="w-8 h-8" />
              </div>
              <div className="space-y-1.5 max-w-sm mx-auto">
                <h3 className="text-lg font-semibold text-[#112A15] font-display">
                  Sua cesta ainda está vazia
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-[#0F6E16] hover:bg-[#FF6600] rounded-lg transition-colors cursor-pointer"
              >
                Escolher Produtos Frescos
              </button>
            </div>
          ) : (
            <>
              {/* Confirmation Banner if order was just triggered */}
              {orderSentCode && (
                <div className="p-5 bg-[#E8F6E9] border-2 border-[#0F6E16] rounded-xl space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-[#FF6600]">
                        Pedido #{orderSentCode} enviado para o WhatsApp
                      </p>
                      <h3 className="text-base font-bold text-[#112A15] font-display mt-0.5">
                        Aguarde a confirmação do horário na conversa
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setOrderSentCode(null);
                        onClearCart();
                      }}
                      className="text-xs font-semibold text-[#0F6E16] underline hover:text-[#FF6600] whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Novo pedido
                    </button>
                  </div>
                </div>
              )}

              {/* 1. Selected Items List - SEM FOTOS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#112A15]">
                    Itens escolhidos ({cart.reduce((sum, i) => sum + i.quantity, 0)})
                  </h3>
                  <button
                    type="button"
                    onClick={onClearCart}
                    className="text-xs text-[#4A634E] hover:text-[#B91C1C] transition-colors cursor-pointer"
                  >
                    Esvaziar cesta
                  </button>
                </div>

                <div className="divide-y divide-[#E0EDE1] bg-white rounded-xl border border-[#CBE5CD]">
                  {cart.map((entry) => (
                    <div key={entry.key} className="p-4 flex items-center justify-between gap-3.5">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-[#112A15] truncate">
                          {entry.product.name}
                        </h4>
                        <p className="text-xs text-[#4A634E] mt-0.5 truncate">
                          {entry.product.unitLabel}
                        </p>
                        <p className="text-xs font-mono-tabular font-bold text-[#0F6E16] mt-1">
                          R$ {(entry.product.price * entry.quantity).toFixed(2).replace('.', ',')}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            entry.quantity === 1
                              ? onRemoveItem(entry.key)
                              : onUpdateQuantity(entry.key, -1)
                          }
                          className="w-8 h-8 flex items-center justify-center rounded-md border border-[#CBE5CD] text-[#112A15] hover:bg-[#FFF2E8] transition-colors cursor-pointer"
                          aria-label="Diminuir quantidade"
                        >
                          {entry.quantity === 1 ? (
                            <CustomTrashBinIcon className="w-3.5 h-3.5 text-[#D94E00]" />
                          ) : (
                            <CustomMinusStemIcon className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <span className="w-6 text-center text-xs font-mono-tabular font-bold text-[#112A15]">
                          {entry.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(entry.key, 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-md border border-[#CBE5CD] text-[#0F6E16] hover:bg-[#E8F6E9] transition-colors cursor-pointer"
                          aria-label="Aumentar quantidade"
                        >
                          <CustomPlusStemIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Delivery & Scheduling Form */}
              <div className="space-y-4 pt-2 border-t border-[#CBE5CD]">
                <div>
                  <h3 className="text-base font-bold text-[#112A15] font-display">
                    Combinar Entrega pelo WhatsApp
                  </h3>
                  <p className="text-xs text-[#4A634E] mt-0.5">
                    Informe onde entregar e qual janela de horário fica melhor para sua rotina.
                  </p>
                </div>

                {validationError && (
                  <div className="p-3 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#991B1B] font-medium">
                    {validationError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-medium text-[#1F4224] mb-1">
                      Seu nome completo *
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => {
                        setCustomerName(e.target.value);
                        if (validationError) setValidationError(null);
                      }}
                      placeholder="Ex: Mariana Costa"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#BBD9BE] rounded-lg text-[#112A15] placeholder:text-[#78927B] focus:outline-none focus:border-[#FF6600]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#1F4224] mb-1">
                      Seu telefone ou WhatsApp
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Ex: (11) 98765-4321"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#BBD9BE] rounded-lg text-[#112A15] placeholder:text-[#78927B] focus:outline-none focus:border-[#FF6600]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-[#1F4224] mb-1">
                      Rua, número e complemento *
                    </label>
                    <input
                      type="text"
                      value={streetAddress}
                      onChange={(e) => {
                        setStreetAddress(e.target.value);
                        if (validationError) setValidationError(null);
                      }}
                      placeholder="Ex: Rua das Laranjeiras, 340, Apto 52"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#BBD9BE] rounded-lg text-[#112A15] placeholder:text-[#78927B] focus:outline-none focus:border-[#FF6600]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#1F4224] mb-1">
                      Bairro
                    </label>
                    <input
                      type="text"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      placeholder="Ex: Vila Madalena"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#BBD9BE] rounded-lg text-[#112A15] placeholder:text-[#78927B] focus:outline-none focus:border-[#FF6600]"
                    />
                  </div>
                </div>

                {/* Delivery Window Selector */}
                <div>
                  <label className="block text-xs font-medium text-[#1F4224] mb-1.5">
                    Período preferido para receber a feira
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {DELIVERY_WINDOWS.map((win) => {
                      const active = deliveryWindow === win;
                      return (
                        <button
                          key={win}
                          type="button"
                          onClick={() => setDeliveryWindow(win)}
                          className={`px-3 py-2 text-left text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                            active
                              ? 'bg-[#0F6E16] text-white border-[#0F6E16]'
                              : 'bg-white text-[#1F4224] border-[#BBD9BE] hover:border-[#0F6E16]'
                          }`}
                        >
                          {win}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-2.5">
                  <label className="block text-xs font-medium text-[#1F4224]">
                    Forma de pagamento no recebimento
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {PAYMENT_METHODS.map((method) => {
                      const active = paymentMethod === method;
                      return (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPaymentMethod(method)}
                          className={`px-3.5 py-2.5 text-left text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                            active
                              ? 'bg-[#FF6600] text-white border-[#FF6600] shadow-2xs'
                              : 'bg-white text-[#1F4224] border-[#BBD9BE] hover:border-[#FF6600]'
                          }`}
                        >
                          {method}
                        </button>
                      );
                    })}
                  </div>

                  {paymentMethod === 'Dinheiro na entrega' && (
                    <div className="p-3 bg-[#FFF5EC] border border-[#FFD2B3] rounded-lg space-y-1.5">
                      <label className="block text-xs font-semibold text-[#B34200]">
                        Precisa de troco para quanto? (opcional)
                      </label>
                      <input
                        type="text"
                        value={cashChangeFor}
                        onChange={(e) => setCashChangeFor(e.target.value)}
                        placeholder="Ex: R$ 100,00 ou Não preciso de troco"
                        className="w-full px-3 py-2 text-xs bg-white border border-[#FFB380] rounded-md text-[#112A15] placeholder:text-[#9A6B4C] focus:outline-none focus:border-[#FF6600]"
                      />
                    </div>
                  )}
                </div>

                {/* Picker Notes */}
                <div>
                  <label className="block text-xs font-medium text-[#1F4224] mb-1">
                    Recado para o selecionador (opcional)
                  </label>
                  <textarea
                    rows={2}
                    value={pickerNotes}
                    onChange={(e) => setPickerNotes(e.target.value)}
                    placeholder="Ex: Deixar na portaria com Sr. Antônio ou escolher mamão menor."
                    className="w-full px-3.5 py-2 text-sm bg-white border border-[#BBD9BE] rounded-lg text-[#112A15] placeholder:text-[#78927B] focus:outline-none focus:border-[#FF6600]"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Sticky Checkout Footer */}
        {cart.length > 0 && (
          <div className="p-6 bg-white border-t border-[#CBE5CD] space-y-4">
            <div className="space-y-1 text-sm">
              <div className="flex items-center justify-between text-xs text-[#4A634E]">
                <span>Subtotal dos produtos</span>
                <span className="font-mono-tabular">
                  R$ {subtotal.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-[#4A634E]">
                <span>Taxa de entrega estimada</span>
                <span className="font-mono-tabular font-medium text-[#FF6600]">
                  {deliveryFee === 0
                    ? 'Cortesia'
                    : `R$ ${deliveryFee.toFixed(2).replace('.', ',')}`}
                </span>
              </div>
              <div className="flex items-center justify-between text-base font-bold text-[#112A15] pt-1">
                <span>Total estimado do pedido</span>
                <span className="font-mono-tabular text-[#0F6E16]">
                  R$ {totalAmount.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handlePrepareSend}
              className="w-full inline-flex items-center justify-center gap-2.5 px-5 py-3.5 text-sm font-bold text-white bg-[#0F6E16] hover:bg-[#FF6600] rounded-xl transition-colors text-center whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
            >
              <CustomWhatsAppLeafIcon className="w-5 h-5 shrink-0" />
              <span>Enviar Pedido pelo WhatsApp</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
