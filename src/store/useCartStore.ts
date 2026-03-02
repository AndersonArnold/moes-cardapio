import { create } from 'zustand';

export interface CartItem {
    id: string; // Unique ID per item added (allows same name, different notes)
    name: string;
    price: number;
    quantity: number;
    observation: string;
}

interface CartStore {
    items: CartItem[];
    addItem: (item: Omit<CartItem, 'id'>) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, newQuantity: number) => void;
    clearCart: () => void;
    getCartTotal: () => number;
    getCartItemCount: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
    items: [],
    addItem: (item) => {
        set((state) => {
            // Create a unique ID for this specific addition (so differences in observations aren't merged incorrectly)
            const newItem = {
                ...item,
                id: crypto.randomUUID(),
            };
            return { items: [...state.items, newItem] };
        });
    },
    removeItem: (id) => {
        set((state) => ({
            items: state.items.filter((item) => item.id !== id),
        }));
    },
    updateQuantity: (id, newQuantity) => {
        set((state) => ({
            items: state.items.map((item) =>
                item.id === id ? { ...item, quantity: newQuantity } : item
            ),
        }));
    },
    clearCart: () => set({ items: [] }),
    getCartTotal: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
    },
    getCartItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
    },
}));
