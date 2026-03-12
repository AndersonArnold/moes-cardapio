import { CartItem } from "../store/useCartStore";

interface OrderData {
    items: CartItem[];
    subtotal: number;
    total: number;
    deliveryFee: number;
    orderType: 'delivery' | 'pickup';
    storeName: string;
    customerName: string;
    customerPhone: string;
    address?: {
        street: string;
        number: string;
        neighborhood: string;
        reference: string;
    };
    paymentMethod: string;
}

export const formatWhatsAppMessage = (data: OrderData): string => {
    let message = `🍔 *NOVO PEDIDO - ${data.storeName.toUpperCase()}*\n\n`;

    if (data.customerName) {
        message += `*Cliente:* ${data.customerName}\n`;
        message += `*WhatsApp:* ${data.customerPhone}\n\n`;
    } else {
        message += `\n`;
    }

    message += `*Itens do Pedido:*\n`;

    data.items.forEach((item) => {
        message += `▪ ${item.quantity}x ${item.name} - R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}\n`;
        if (item.observation) {
            message += `   _Obs: ${item.observation}_\n`;
        }
    });

    message += `\n*Subtotal:* R$ ${data.subtotal.toFixed(2).replace('.', ',')}\n`;

    if (data.orderType === 'delivery') {
        message += `*Taxa de Entrega:* R$ ${data.deliveryFee.toFixed(2).replace('.', ',')}\n`;
    }

    message += `*TOTAL DA COMPRA:* *R$ ${data.total.toFixed(2).replace('.', ',')}*\n\n`;

    message += `*Tipo de Pedido:* ${data.orderType === 'delivery' ? 'Entrega' : 'Retirada no Local'}\n`;

    if (data.orderType === 'delivery' && data.address) {
        message += `\n*Endereço de Entrega:*\n`;
        message += `${data.address.street}, ${data.address.number}\n`;
        message += `Bairro: ${data.address.neighborhood}\n`;
        if (data.address.reference) {
            message += `Ref: ${data.address.reference}\n`;
        }
    }

    message += `\n*Forma de Pagamento:* ${data.paymentMethod}\n`;

    message += `\n_Aguardamos a confirmação do pedido!_`;

    // Encode text for URL
    return encodeURIComponent(message);
};
