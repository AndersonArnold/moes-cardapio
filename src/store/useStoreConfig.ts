import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { calculateIsOpen } from '../utils/timeUtils';

export type StoreStatusOverride = 'AUTOMATIC' | 'FORCE_OPEN' | 'FORCE_CLOSED';

export interface StoreConfig {
    id?: string;
    storeName: string;
    logoUrl: string;
    whatsappNumber: string;
    address: string;
    isOpen: boolean;
    statusOverride: StoreStatusOverride;
    actualIsOpen: boolean;
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

const defaultConfig: Omit<StoreConfig, 'actualIsOpen'> = {
    storeName: "Moe's Lancheria",
    logoUrl: "",
    whatsappNumber: "5500000000000",
    address: "Rua Exemplo, 123 - Centro, Cidade",
    isOpen: true,
    statusOverride: 'AUTOMATIC',
    deliveryFee: 5.00,
    operatingDays: "Terça a Domingo",
    openingTime: "18:30",
    closingTime: "23:30",
    googleMapsLink: "",
};

export const useStoreConfig = create<StoreConfigState>((set, get) => ({
    ...defaultConfig,
    actualIsOpen: true, // Will be replaced immediately on load
    isLoading: false,

    fetchConfig: async () => {
        set({ isLoading: true });
        const { data, error } = await supabase.from('store_config').select('*').limit(1).single();

        if (data && !error) {
            const statusOverride = data.status_override || 'AUTOMATIC';
            const operatingDays = data.operating_days || defaultConfig.operatingDays;
            const openingTime = data.opening_time || defaultConfig.openingTime;
            const closingTime = data.closing_time || defaultConfig.closingTime;

            let actualIsOpen = true;
            if (statusOverride === 'FORCE_OPEN') actualIsOpen = true;
            else if (statusOverride === 'FORCE_CLOSED') actualIsOpen = false;
            else actualIsOpen = calculateIsOpen(operatingDays, openingTime, closingTime);

            set({
                id: data.id,
                storeName: data.store_name,
                logoUrl: data.logo_url || "",
                whatsappNumber: data.whatsapp_number,
                address: data.address || "",
                isOpen: data.is_open,
                statusOverride: statusOverride as StoreStatusOverride,
                actualIsOpen,
                deliveryFee: data.delivery_fee,
                operatingDays,
                openingTime,
                closingTime,
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
        if (updates.statusOverride !== undefined) updatePayload.status_override = updates.statusOverride;
        if (updates.deliveryFee !== undefined) updatePayload.delivery_fee = updates.deliveryFee;
        if (updates.operatingDays !== undefined) updatePayload.operating_days = updates.operatingDays;
        if (updates.openingTime !== undefined) updatePayload.opening_time = updates.openingTime;
        if (updates.closingTime !== undefined) updatePayload.closing_time = updates.closingTime;
        if (updates.googleMapsLink !== undefined) updatePayload.google_maps_link = updates.googleMapsLink;

        const { error } = await supabase.from('store_config').update(updatePayload).eq('id', currentId);

        if (!error) {
            const nextState = { ...get(), ...updates };
            let actualIsOpen = true;
            if (nextState.statusOverride === 'FORCE_OPEN') actualIsOpen = true;
            else if (nextState.statusOverride === 'FORCE_CLOSED') actualIsOpen = false;
            else actualIsOpen = calculateIsOpen(nextState.operatingDays, nextState.openingTime, nextState.closingTime);

            set({ ...nextState, actualIsOpen });
        } else {
            console.error("Error updating config", error);
        }
    }
}));
