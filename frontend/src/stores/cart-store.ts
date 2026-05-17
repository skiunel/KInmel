import { create } from 'zustand';
import { toast } from 'sonner';
import { cartService, type CartSummary } from '@/services/cart.service';
import type { CartItem } from '@/types';

function getErrMsg(err: unknown): string {
  const e = err as { response?: { data?: { message?: string }; status?: number } };
  if (e?.response?.status === 401) return 'Please log in to add items to your cart';
  return e?.response?.data?.message || 'Something went wrong';
}

interface CartState {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  totalAmount: number;
  isLoading: boolean;
  isUpdating: boolean;
  drawerOpen: boolean;

  openDrawer: () => void;
  closeDrawer: () => void;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  updateItem: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  reset: () => void;
}

const initialState = {
  items: [] as CartItem[],
  itemCount: 0,
  subtotal: 0,
  shippingCost: 0,
  taxAmount: 0,
  totalAmount: 0,
  isLoading: false,
  isUpdating: false,
  drawerOpen: false,
};

function applyCart(cart: CartSummary) {
  return {
    items: cart.items,
    itemCount: cart.itemCount,
    subtotal: cart.subtotal,
    shippingCost: cart.shippingCost,
    taxAmount: cart.taxAmount,
    totalAmount: cart.totalAmount,
  };
}

export const useCartStore = create<CartState>((set) => ({
  ...initialState,

  openDrawer: () => set({ drawerOpen: true }),
  closeDrawer: () => set({ drawerOpen: false }),

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const cart = await cartService.getCart();
      set({ ...applyCart(cart), isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  addToCart: async (productId, quantity) => {
    set({ isUpdating: true });
    try {
      const cart = await cartService.addToCart(productId, quantity);
      set({ ...applyCart(cart), isUpdating: false, drawerOpen: true });
      toast.success('Added to cart');
    } catch (err) {
      set({ isUpdating: false });
      toast.error(getErrMsg(err));
    }
  },

  updateItem: async (productId, quantity) => {
    set({ isUpdating: true });
    try {
      const cart = await cartService.updateItem(productId, quantity);
      set({ ...applyCart(cart), isUpdating: false });
    } catch (err) {
      set({ isUpdating: false });
      toast.error(getErrMsg(err));
    }
  },

  removeItem: async (productId) => {
    set({ isUpdating: true });
    try {
      const cart = await cartService.removeItem(productId);
      set({ ...applyCart(cart), isUpdating: false });
      toast.success('Item removed');
    } catch (err) {
      set({ isUpdating: false });
      toast.error(getErrMsg(err));
    }
  },

  clearCart: async () => {
    set({ isUpdating: true });
    try {
      await cartService.clearCart();
      set({ ...initialState });
      toast.success('Cart cleared');
    } catch (err) {
      set({ isUpdating: false });
      toast.error(getErrMsg(err));
    }
  },

  reset: () => set({ ...initialState }),
}));
