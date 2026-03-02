import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface StoreConfig {
    id?: string;
    storeName: string;
    logoUrl: string;
    whatsappNumber: string;
    address: string;
    isOpen: boolean;
    deliveryFee: number;
    operatingDays: string;
    openingTime: string;
    closingTime: string;
    googleMapsLink: string;
}

interface StoreConfigState extends StoreConfig {
    isLoading: boolean;
    fetchConfig: () => Promise<void>;
    updateConfig: (updates: Partial<StoreConfig>) => Promise<void>;
}

const defaultConfig: StoreConfig = {
    storeName: "Moe's Lancheria",
    logoUrl: "",
    whatsappNumber: "5500000000000",
    address: "Rua Exemplo, 123 - Centro, Cidade",
    isOpen: true,
    deliveryFee: 5.00,
    operatingDays: "Terça a Domingo",
    openingTime: "18:30",
    closingTime: "23:30",
    googleMapsLink: "",
};

export const useStoreConfig = create<StoreConfigState>((set, get) => ({
    ...defaultConfig,
    isLoading: false,

    fetchConfig: async () => {
        set({ isLoading: true });
        const { data, error } = await supabase.from('store_config').select('*').limit(1).single();

        if (data && !error) {
            set({
                id: data.id,
                storeName: data.store_name,
                logoUrl: data.logo_url || "",
                whatsappNumber: data.whatsapp_number,
                address: data.address || "",
                isOpen: data.is_open,
                deliveryFee: data.delivery_fee,
                operatingDays: data.operating_days || "",
                openingTime: data.opening_time || "",
                closingTime: data.closing_time || "",
                googleMapsLink: data.google_maps_link || ""
            });
        } else if (error) {
            console.error("Error fetching config", error);
        }
        set({ isLoading: false });
    },

    updateConfig: async (updates) => {
        const currentId = get().id;
        if (!currentId) {
            console.error("Cannot update config without an active ID.");
            return;
        }

        const updatePayload: any = {};
        if (updates.storeName !== undefined) updatePayload.store_name = updates.storeName;
        if (updates.logoUrl !== undefined) updatePayload.logo_url = updates.logoUrl;
        if (updates.whatsappNumber !== undefined) updatePayload.whatsapp_number = updates.whatsappNumber;
        if (updates.address !== undefined) updatePayload.address = updates.address;
        if (updates.isOpen !== undefined) updatePayload.is_open = updates.isOpen;
        if (updates.deliveryFee !== undefined) updatePayload.delivery_fee = updates.deliveryFee;
        if (updates.operatingDays !== undefined) updatePayload.operating_days = updates.operatingDays;
        if (updates.openingTime !== undefined) updatePayload.opening_time = updates.openingTime;
        if (updates.closingTime !== undefined) updatePayload.closing_time = updates.closingTime;
        if (updates.googleMapsLink !== undefined) updatePayload.google_maps_link = updates.googleMapsLink;

        const { error } = await supabase.from('store_config').update(updatePayload).eq('id', currentId);

        if (!error) {
            set((state) => ({ ...state, ...updates }));
        } else {
            console.error("Error updating config", error);
        }
    }
}));
