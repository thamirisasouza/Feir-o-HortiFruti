import React, { useState } from 'react';
import { ProductItem } from '../data/products';
import {
  CustomCloseCrossIcon,
  CustomMinusStemIcon,
  CustomPlusStemIcon,
  CustomWovenBasketIcon,
  ProductArtIllustration,
} from './HortifrutiIllustrations';

interface ProductDetailModalProps {
  product: ProductItem | null;
  onClose: () => void;
  onAddToCart: (product: ProductItem, quantity: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState<number>(1);

  React.useEffect(() => {
    if (product) {
      setQuantity(1);
    }
  }, [product]);

  if (!product) return null;

  const handleConfirm = () => {
    onAddToCart(product, quantity);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#112A15]/60 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdp-title"
    >
      <div className="relative w-full max-w-2xl bg-[#F7FAF7] rounded-t-2xl sm:rounded-2xl border-t-2 sm:border-2 border-[#0F6E16] shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 p-2 rounded-full bg-white/95 text-[#112A15] hover:text-[#FF6600] border border-[#CBE5CD] shadow-xs transition-colors cursor-pointer"
          aria-label="Fechar detalhes do produto"
        >
          <CustomCloseCrossIcon className="w-5 h-5" />
        </button>

        {/* Left Column: Photo Gallery */}
        <div className="bg-[#E8F6E9] p-4 sm:p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#CBE5CD]">
          <div className="text-xs font-medium text-[#1F4224]">
            <span className="text-[#FF6600] font-bold uppercase tracking-wider">{product.categoryLabel}</span>
            <span className="mx-1.5" aria-hidden="true">·</span>
            <span>{product.origin}</span>
          </div>

          <div className="my-3 sm:my-5 aspect-[16/10] sm:aspect-[4/3] w-full rounded-xl overflow-hidden border-2 border-[#FF6600] bg-white shadow-sm">
            <ProductArtIllustration artId={product.artId} className="w-full h-full" />
          </div>

          <p className="text-xs text-[#1F4224] leading-relaxed">
            {product.nutritionalHighlight}
          </p>
        </div>

        {/* Right Column: Purchase Module (without ripeness/presentation selector) */}
        <div className="p-5 sm:p-7 flex flex-col justify-between bg-white space-y-5">
          <div className="space-y-3">
            <div className="text-xs text-[#4A634E] flex flex-wrap items-center gap-1">
              <span>{product.harvestNote}</span>
              <span aria-hidden="true">·</span>
              {product.isEsgotado ? (
                <span className="text-red-600 font-bold uppercase">Produto Esgotado</span>
              ) : (
                <span className="text-[#0F6E16] font-semibold">Disponível na banca</span>
              )}
            </div>

            <h2 id="pdp-title" className="text-xl sm:text-2xl font-bold text-[#112A15] font-display leading-snug">
              {product.name}
            </h2>

            <div className="flex items-center gap-2">
              <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#E8F6E9] text-[#0F6E16] text-xs font-semibold">
                {product.unitLabel}
              </div>
              {product.isEsgotado && (
                <span className="px-2.5 py-1 rounded-md bg-red-100 text-red-700 text-xs font-black uppercase">
                  Esgotado
                </span>
              )}
            </div>

            <div className="pt-1 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold font-mono-tabular text-[#0F6E16]">
                R$ {product.price.toFixed(2).replace('.', ',')}
              </span>
              <span className="text-xs text-[#4A634E]">por {product.unitLabel.toLowerCase()}</span>
            </div>
          </div>

          {/* Quantity & Add to Basket Action */}
          <div className="pt-4 border-t border-[#E0EDE1] space-y-3">
            {product.isEsgotado ? (
              <div className="w-full py-4 px-4 bg-gray-100 border border-gray-200 rounded-xl text-center">
                <span className="text-sm font-bold text-gray-500">
                  🚫 Produto temporariamente esgotado
                </span>
                <p className="text-xs text-gray-400 mt-0.5">
                  Estamos aguardando nova colheita do produtor.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#1F4224]">Quantidade</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#CBE5CD] text-[#112A15] hover:bg-[#E8F6E9] transition-colors cursor-pointer"
                      aria-label="Reduzir quantidade"
                    >
                      <CustomMinusStemIcon className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center text-sm font-mono-tabular font-semibold text-[#112A15]">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#CBE5CD] text-[#112A15] hover:bg-[#E8F6E9] transition-colors cursor-pointer"
                      aria-label="Aumentar quantidade"
                    >
                      <CustomPlusStemIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleConfirm}
                  className="w-full inline-flex items-center justify-center gap-2.5 px-5 py-3.5 text-sm font-semibold text-white bg-[#0F6E16] hover:bg-[#FF6600] rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
                >
                  <CustomWovenBasketIcon className="w-5 h-5" />
                  <span>
                    Adicionar à Cesta · R$ {(product.price * quantity).toFixed(2).replace('.', ',')}
                  </span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
