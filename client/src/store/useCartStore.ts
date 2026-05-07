import { create } from 'zustand';

export interface CartProduct {
  id: string;
  name: string;
  sellPrice: number;
  stockQty: number;
}

export interface CartItem extends CartProduct {
  cartQty: number;
}

interface CartState {
  cart: CartItem[];
  discount: number;
  paymentMode: string;
  addToCart: (product: CartProduct) => void;
  removeFromCart: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  setDiscount: (discount: number) => void;
  setPaymentMode: (mode: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  cart: [],
  discount: 0,
  paymentMode: 'CASH',

  addToCart: (product) =>
    set((state) => {
      const existing = state.cart.find((item) => item.id === product.id);
      if (existing) {
        if (existing.cartQty >= product.stockQty) return state;
        return {
          cart: state.cart.map((item) =>
            item.id === product.id ? { ...item, cartQty: item.cartQty + 1 } : item
          ),
        };
      }
      return { cart: [...state.cart, { ...product, cartQty: 1 }] };
    }),

  removeFromCart: (productId) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.id !== productId),
    })),

  updateQty: (productId, qty) =>
    set((state) => ({
      cart: state.cart.map((item) =>
        item.id === productId ? { ...item, cartQty: Math.max(1, qty) } : item
      ),
    })),

  setDiscount: (discount) => set({ discount }),
  setPaymentMode: (paymentMode) => set({ paymentMode }),
  clearCart: () => set({ cart: [], discount: 0, paymentMode: 'CASH' }),
}));
