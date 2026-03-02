import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface MenuItem {
    id: string;
    categoryId: string;
    name: string;
    description: string;
    price: number;
    imageUrl?: string;
    isPopular?: boolean;
}

export interface Category {
    id: string;
    name: string;
}

interface MenuStore {
    categories: Category[];
    items: MenuItem[];
    isLoading: boolean;
    fetchMenu: () => Promise<void>;
    updateItemImage: (id: string, imageUrl: string) => Promise<void>;
    addItem: (item: Omit<MenuItem, 'id'>) => Promise<void>;
    updateItem: (id: string, item: Partial<MenuItem>) => Promise<void>;
    deleteItem: (id: string) => Promise<void>;
    addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
    updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;
    seedCategories: () => Promise<void>;
    seedProducts: () => Promise<void>;
}

export const useMenuStore = create<MenuStore>((set, get) => ({
    categories: [],
    items: [],
    isLoading: false,

    fetchMenu: async () => {
        set({ isLoading: true });

        const [categoriesRes, productsRes] = await Promise.all([
            supabase.from('categories').select('*').order('created_at', { ascending: true }),
            supabase.from('products').select('*').order('created_at', { ascending: true })
        ]);

        if (categoriesRes.data && productsRes.data) {
            const mappedProducts = productsRes.data.map((p: any) => ({
                id: p.id,
                categoryId: p.category_id,
                name: p.name,
                description: p.description,
                price: p.price,
                imageUrl: p.image_url,
                isPopular: p.is_popular
            }));

            set({ categories: categoriesRes.data, items: mappedProducts });
        } else {
            console.error("Error fetching menu data", categoriesRes.error, productsRes.error);
        }
        set({ isLoading: false });
    },

    updateItemImage: async (id, imageUrl) => {
        const { error } = await supabase.from('products').update({ image_url: imageUrl }).eq('id', id);
        if (!error) {
            set((state) => ({
                items: state.items.map((item) =>
                    item.id === id ? { ...item, imageUrl } : item
                ),
            }));
        } else {
            console.error("Error updating image", error);
        }
    },

    addItem: async (itemData) => {
        const { data, error } = await supabase.from('products').insert([
            {
                category_id: itemData.categoryId,
                name: itemData.name,
                description: itemData.description,
                price: itemData.price,
                image_url: itemData.imageUrl,
                is_popular: itemData.isPopular
            }
        ]).select().single();

        if (data && !error) {
            const newItem: MenuItem = {
                id: data.id,
                categoryId: data.category_id,
                name: data.name,
                description: data.description,
                price: data.price,
                imageUrl: data.image_url,
                isPopular: data.is_popular
            };
            set((state) => ({ items: [...state.items, newItem] }));
        } else {
            console.error("Error adding item", error);
        }
    },

    updateItem: async (id, updates) => {
        const updatePayload: any = {};
        if (updates.categoryId) updatePayload.category_id = updates.categoryId;
        if (updates.name) updatePayload.name = updates.name;
        if (updates.description !== undefined) updatePayload.description = updates.description;
        if (updates.price !== undefined) updatePayload.price = updates.price;
        if (updates.imageUrl !== undefined) updatePayload.image_url = updates.imageUrl;
        if (updates.isPopular !== undefined) updatePayload.is_popular = updates.isPopular;

        const { error } = await supabase.from('products').update(updatePayload).eq('id', id);
        if (!error) {
            set((state) => ({
                items: state.items.map((i) => i.id === id ? { ...i, ...updates } : i)
            }));
        } else {
            console.error("Error updating item", error);
        }
    },

    deleteItem: async (id) => {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (!error) {
            set((state) => ({
                items: state.items.filter((i) => i.id !== id)
            }));
        } else {
            console.error("Error deleting item", error);
        }
    },

    addCategory: async (catData) => {
        const { data, error } = await supabase.from('categories').insert([{ name: catData.name }]).select().single();
        if (data && !error) {
            set((state) => ({
                categories: [...state.categories, data]
            }));
        } else {
            console.error("Error adding category", error);
        }
    },

    updateCategory: async (id, updates) => {
        const { error } = await supabase.from('categories').update({ name: updates.name }).eq('id', id);
        if (!error) {
            set((state) => ({
                categories: state.categories.map((c) => c.id === id ? { ...c, ...updates } : c)
            }));
        } else {
            console.error("Error updating category", error);
        }
    },

    deleteCategory: async (id) => {
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (!error) {
            set((state) => ({
                categories: state.categories.filter((c) => c.id !== id)
            }));
            set((state) => ({
                items: state.items.filter((i) => i.categoryId !== id)
            }));
        } else {
            console.error("Error deleting category", error);
        }
    },

    seedCategories: async () => {
        set({ isLoading: true });
        const defaultCategories = [
            { name: "Lanches" },
            { name: "Porções" },
            { name: "Pastéis" },
            { name: "Refrigerantes" },
            { name: "Cervejas e Energéticos" },
            { name: "Extras" }
        ];

        const { data, error } = await supabase.from('categories').insert(defaultCategories).select();

        if (data && !error) {
            set((state) => ({
                categories: [...state.categories, ...data]
            }));
        } else {
            console.error("Error seeding categories", error);
        }
        set({ isLoading: false });
    },

    seedProducts: async () => {
        set({ isLoading: true });

        const stateCategories = get().categories;
        if (stateCategories.length === 0) {
            console.error("No categories found to link products.");
            set({ isLoading: false });
            return;
        }

        const categoryMap: Record<string, string> = {
            'lanches': 'Lanches',
            'porcoes': 'Porções',
            'pasteis': 'Pastéis',
            'bebidas': 'Refrigerantes',
            'cervejas': 'Cervejas e Energéticos',
            'extras': 'Extras'
        };

        const { menuItems } = await import('../data/mockData');

        const productsToInsert = menuItems.map(item => {
            const targetName = categoryMap[item.categoryId];
            const dbCategory = stateCategories.find(c => c.name === targetName);

            return {
                category_id: dbCategory?.id,
                name: item.name,
                description: item.description,
                price: item.price,
                image_url: null,
                is_popular: false
            };
        }).filter(p => p.category_id);

        if (productsToInsert.length > 0) {
            const { data, error } = await supabase.from('products').insert(productsToInsert).select();

            if (data && !error) {
                const mappedProducts = data.map((p: any) => ({
                    id: p.id,
                    categoryId: p.category_id,
                    name: p.name,
                    description: p.description,
                    price: p.price,
                    imageUrl: p.image_url,
                    isPopular: p.is_popular
                }));
                set((state) => ({ items: [...state.items, ...mappedProducts] }));
            } else {
                console.error("Error seeding products", error);
            }
        }
        set({ isLoading: false });
    }
}));
