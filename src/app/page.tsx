"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "../store/useCartStore";
import { formatWhatsAppMessage } from "../utils/formatWhatsApp";
import { useMenuStore } from "../store/useMenuStore";
import { useStoreConfig } from "../store/useStoreConfig";
import Image from "next/image";

const WHATSAPP_NUMBER = "5511999999999"; // Fictional number

export default function Home() {
  const { items: cartItems, addItem, removeItem, getCartTotal, getCartItemCount } = useCartStore();
  const { items: menuItems, categories, fetchMenu } = useMenuStore();
  const config = useStoreConfig();

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
    fetchMenu();
    config.fetchConfig();
  }, [fetchMenu, config.fetchConfig]);

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Item Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ name: string, price: number } | null>(null);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemObservation, setItemObservation] = useState("");

  // Checkout State
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [orderType, setOrderType] = useState<'delivery' | 'pickup' | 'dine_in'>('delivery');
  const [tableNumber, setTableNumber] = useState("");
  const [peopleCount, setPeopleCount] = useState(1);
  const [address, setAddress] = useState({
    street: "",
    number: "",
    neighborhood: "",
    reference: ""
  });
  const [paymentMethod, setPaymentMethod] = useState("Dinheiro");

  useEffect(() => {
    if (isCartOpen) {
      const savedData = localStorage.getItem('moes_customer_data');
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          if (parsed.customerName) setCustomerName(parsed.customerName);
          if (parsed.customerPhone) setCustomerPhone(parsed.customerPhone);
          if (parsed.address) setAddress(parsed.address);
        } catch (e) {
          console.error("Error loading customer data", e);
        }
      }
    }
  }, [isCartOpen]);

  const handleOpenModal = (item: { name: string, price: number }) => {
    setSelectedItem(item);
    setItemQuantity(1);
    setItemObservation("");
    setIsModalOpen(true);
  };

  const handleConfirmItem = () => {
    if (selectedItem) {
      addItem({
        name: selectedItem.name,
        price: selectedItem.price,
        quantity: itemQuantity,
        observation: itemObservation
      });
      setIsModalOpen(false);
    }
  };

  const handleCheckout = () => {
    if (!config.actualIsOpen) {
      alert("Desculpe, a loja está fechada no momento.");
      return;
    }

    if (!customerName.trim()) {
      alert("Por favor, informe seu nome para o pedido.");
      return;
    }

    if (!customerPhone.trim()) {
      alert("Por favor, informe seu telefone/WhatsApp para o pedido.");
      return;
    }

    if (orderType === 'delivery' && (!address.street || !address.number || !address.neighborhood || !address.reference)) {
      alert("Por favor, preencha todos os campos do endereço de entrega incluindo ponto de referência.");
      return;
    }

    if (orderType === 'dine_in' && (!tableNumber.trim() || peopleCount < 1)) {
      alert("Por favor, preencha o número da mesa e a quantidade de pessoas.");
      return;
    }

    const finalTotal = getCartTotal() + (orderType === 'delivery' ? config.deliveryFee : 0);

    localStorage.setItem('moes_customer_data', JSON.stringify({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      address: orderType === 'delivery' ? address : undefined
    }));

    const messageData = {
      items: cartItems,
      subtotal: getCartTotal(),
      total: finalTotal,
      deliveryFee: config.deliveryFee,
      orderType,
      storeName: config.storeName,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      address: orderType === 'delivery' ? address : undefined,
      tableNumber: orderType === 'dine_in' ? tableNumber.trim() : undefined,
      peopleCount: orderType === 'dine_in' ? peopleCount : undefined,
      paymentMethod
    };

    const encodedMessage = formatWhatsAppMessage(messageData);
    window.open(`https://wa.me/${config.whatsappNumber}?text=${encodedMessage}`, '_blank');
  };

  const cartTotal = getCartTotal();
  const cartItemCount = getCartItemCount();
  const finalTotalDisplay = cartTotal + (orderType === 'delivery' ? config.deliveryFee : 0);

  return (
    <div className="min-h-screen text-white font-sans selection:bg-orange-600 selection:text-white pb-10">
      {/* Navbar */}
      <nav className="fixed w-full z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 text-2xl font-black tracking-tighter text-orange-600 drop-shadow-sm">
            {config.logoUrl ? (
              <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 shadow-sm border border-gray-100">
                <Image src={config.logoUrl} alt="Logo" fill className="object-contain bg-white" />
              </div>
            ) : (
              <span>🍔</span>
            )}
            {isMounted && (
              <div className="flex items-center gap-3">
                <span className="text-white text-lg sm:text-2xl">{config.storeName}</span>
                <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full ${config.actualIsOpen ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                  {config.actualIsOpen ? 'ABERTO' : 'FECHADO'}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-6 text-sm font-medium">
            <div className="hidden md:flex gap-6 text-zinc-300">
              <a href="#menu" className="hover:text-orange-500 transition-colors">Cardápio</a>
              <a href="#about" className="hover:text-orange-500 transition-colors">Localização</a>
            </div>
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center justify-center bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-orange-500 transition-colors p-3 rounded-full shadow-sm cursor-pointer"
            >
              <span className="sr-only">Carrinho</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-orange-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
              </svg>
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white shadow-md border border-white">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Item Selection Modal */}
      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl relative">
            <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-xl text-zinc-900">{selectedItem.name}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-red-500 text-2xl leading-none">&times;</button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <span className="font-medium text-zinc-700">Quantidade</span>
                <div className="flex items-center gap-4 bg-gray-100 rounded-full px-2 py-1">
                  <button
                    onClick={() => setItemQuantity(Math.max(1, itemQuantity - 1))}
                    className="w-8 h-8 flex items-center justify-center bg-white rounded-full text-zinc-600 hover:text-orange-600 shadow-sm"
                  >-</button>
                  <span className="font-bold text-lg w-4 text-center">{itemQuantity}</span>
                  <button
                    onClick={() => setItemQuantity(itemQuantity + 1)}
                    className="w-8 h-8 flex items-center justify-center bg-white rounded-full text-zinc-600 hover:text-orange-600 shadow-sm"
                  >+</button>
                </div>
              </div>

              <div>
                <label className="block font-medium text-sm text-zinc-700 mb-2">Observações (opcional)</label>
                <textarea
                  value={itemObservation}
                  onChange={(e) => setItemObservation(e.target.value)}
                  placeholder="Ex: Tirar cebola, maionese à parte..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none h-28"
                />
              </div>

              <div className="pt-2 flex justify-between items-center font-bold">
                <span className="text-zinc-500">Subtotal</span>
                <span className="text-2xl text-orange-600">R$ {(selectedItem.price * itemQuantity).toFixed(2).replace('.', ',')}</span>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <button
                onClick={handleConfirmItem}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black py-4 rounded-2xl hover:from-orange-600 hover:to-orange-700 hover:shadow-lg transition-all text-lg"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col animate-fade-in">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h2 className="text-xl font-bold text-zinc-900">Finalizar Pedido</h2>
            <button onClick={() => setIsCartOpen(false)} className="text-zinc-400 hover:text-red-500 text-3xl font-light">&times;</button>
          </div>

          <div className="flex-1 overflow-y-auto w-full">
            {/* Items List */}
            <div className="p-6 space-y-4">
              <h3 className="font-bold text-zinc-800 mb-2">Seus Lanches</h3>
              {cartItems.length === 0 ? (
                <p className="text-zinc-500 text-sm">Seu carrinho está vazio.</p>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-md relative pr-10 hover:shadow-lg transition-all">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="absolute top-4 right-4 text-zinc-300 hover:text-red-500 transition-colors"
                      title="Remover"
                    >
                      &times;
                    </button>
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-sm text-zinc-900 leading-tight pr-4">{item.name}</h4>
                      <span className="font-bold text-orange-600 text-sm whitespace-nowrap">
                        R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                    <p className="text-zinc-500 text-xs">Qtd: <span className="font-medium text-zinc-700">{item.quantity}</span></p>
                    {item.observation && (
                      <p className="text-zinc-500 text-xs mt-2 italic bg-gray-200/50 p-2 rounded-md border border-gray-200">
                        Obs: {item.observation}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="p-6 border-t border-gray-100 bg-white space-y-6">

                {/* Customer Info */}
                <div>
                  <h3 className="font-bold text-zinc-800 mb-2">Seus Dados</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Seu Nome Completo"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    />
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Telefone / WhatsApp"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    />
                  </div>
                </div>

                {/* Order Type */}
                <div>
                  <h3 className="font-bold text-zinc-800 mb-3">Como você prefere?</h3>
                  <div className="flex flex-col sm:flex-row p-1 bg-gray-100 rounded-xl gap-1">
                    <button
                      onClick={() => setOrderType('delivery')}
                      className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${orderType === 'delivery' ? 'bg-white text-orange-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                    >
                      Delivery
                    </button>
                    <button
                      onClick={() => setOrderType('pickup')}
                      className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${orderType === 'pickup' ? 'bg-white text-orange-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                    >
                      Retirar no Local
                    </button>
                    <button
                      onClick={() => setOrderType('dine_in')}
                      className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${orderType === 'dine_in' ? 'bg-white text-orange-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                    >
                      Consumir no Local (Mesa)
                    </button>
                  </div>
                </div>

                {/* Delivery Address */}
                {orderType === 'delivery' && (
                  <div className="space-y-3 animate-fade-in">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-bold text-zinc-800">Endereço de Entrega</h3>
                      <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-md">Taxa: R$ {config.deliveryFee.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      <input
                        type="text" placeholder="Rua / Avenida"
                        value={address.street} onChange={e => setAddress({ ...address, street: e.target.value })}
                        className="col-span-3 bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-zinc-800"
                        required
                      />
                      <input
                        type="text" placeholder="Nº"
                        value={address.number} onChange={e => setAddress({ ...address, number: e.target.value })}
                        className="col-span-1 bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-zinc-800"
                        required
                      />
                    </div>
                    <input
                      type="text" placeholder="Bairro"
                      value={address.neighborhood} onChange={e => setAddress({ ...address, neighborhood: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-zinc-800"
                      required
                    />
                    <input
                      type="text" placeholder="Ponto de Referência"
                      value={address.reference} onChange={e => setAddress({ ...address, reference: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-zinc-800"
                      required
                    />
                  </div>
                )}

                {/* Dine-in Table Info */}
                {orderType === 'dine_in' && (
                  <div className="space-y-3 animate-fade-in">
                    <h3 className="font-bold text-zinc-800 mb-1">Dados da Mesa</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text" placeholder="Número da Mesa"
                        value={tableNumber} onChange={e => setTableNumber(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-zinc-800"
                        required
                      />
                      <input
                        type="number" placeholder="Qtd. Pessoas" min="1"
                        value={peopleCount || 1} onChange={e => setPeopleCount(parseInt(e.target.value) || 1)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-zinc-800"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Payment Method */}
                <div>
                  <h3 className="font-bold text-zinc-800 mb-3">Forma de Pagamento</h3>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-zinc-800 font-medium focus:ring-2 focus:ring-orange-500 outline-none appearance-none"
                  >
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Pix">Pix</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Cartão de Débito">Cartão de Débito</option>
                  </select>
                </div>

              </div>
            )}
          </div>

          {/* Footer Action */}
          {cartItems.length > 0 && (
            <div className="p-6 border-t border-gray-200 bg-gray-50 drop-shadow-[0_-5px_10px_rgba(0,0,0,0.02)]">
              {!config.actualIsOpen && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm leading-relaxed text-center font-bold shadow-sm">
                  Poxa, as portas do Moe's estão fechadas agora! 🛑<br /><br />
                  <span className="font-medium text-red-600">Mas não fique triste! Voltamos a preparar os melhores lanches da cidade de terça a domingo, das 18h30 às 22h30. Já vai escolhendo o seu!</span>
                </div>
              )}
              <div className="flex justify-between items-center mb-4">
                <span className="text-zinc-500 font-medium">Total do Pedido {orderType === 'delivery' && <span className="text-xs font-normal">(+Entrega)</span>}</span>
                <span className="text-2xl font-black text-orange-600">
                  R$ {finalTotalDisplay.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <button
                disabled={!config.actualIsOpen}
                onClick={handleCheckout}
                className={`w-full text-white font-bold py-4 rounded-xl shadow-lg transition-all transform active:scale-[0.98] text-lg flex items-center justify-center gap-2 ${!config.actualIsOpen ? 'bg-red-500 hover:bg-red-600 cursor-not-allowed shadow-red-500/30' : 'bg-green-600 hover:bg-green-700 shadow-green-600/30'}`}
              >
                {!config.actualIsOpen ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" /></svg>
                    Loja Fechada
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                      <path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" clipRule="evenodd" />
                    </svg>
                    Pedir no WhatsApp
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden flex flex-col items-center text-center border-b border-zinc-800 shadow-sm mt-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(234,88,12,0.1)_0%,transparent_70%)] pointer-events-none" />

        {isMounted && !config.actualIsOpen && (
          <div className="w-full max-w-2xl bg-red-50 mb-8 border border-red-200 text-red-600 px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-3 shadow-sm animate-fade-in mx-auto relative z-20">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" /></svg>
            <span>Estamos Fechados no Momento. Voltamos logo!</span>
          </div>
        )}

        <span className="text-sm font-bold tracking-widest uppercase text-orange-600 mb-4 bg-orange-50 px-4 py-1.5 rounded-full border border-orange-100">Bateu a fome?</span>
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 text-white drop-shadow-sm">
          O Melhor <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">Xis</span> da Cidade.
        </h1>
        <p className="text-lg md:text-xl text-zinc-300 max-w-2xl font-medium mb-10">
          Lanches gigantes, porções generosas e aquele sabor caseiro que só a <strong>{config.storeName}</strong> tem. Peça agora e se surpreenda!
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="#menu"
            className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black rounded-full hover:shadow-[0_8px_25px_rgba(234,88,12,0.4)] hover:-translate-y-1 transition-all duration-300 text-lg"
          >
            Ver o Cardápio
          </a>
          <a
            href="#about"
            className="px-8 py-4 bg-zinc-800 text-white font-bold rounded-full hover:bg-zinc-700 transition-all duration-300 text-lg border border-zinc-700 hover:border-zinc-600 shadow-md"
          >
            Nossa Localização
          </a>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="py-20 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">Nosso Cardápio</h2>
          <div className="h-1.5 w-24 bg-gradient-to-r from-orange-500 to-amber-500 mx-auto mt-6 rounded-full"></div>
        </div>

        <div className="space-y-24">
          {isMounted && categories.map((category) => {
            const categoryItems = menuItems.filter(item => item.categoryId === category.id);
            if (categoryItems.length === 0) return null;

            return (
              <div key={category.id}>
                <div className="flex items-center gap-4 mb-8">
                  <h3 className="text-3xl font-black text-white">
                    {category.name}
                  </h3>
                  <div className="flex-1 h-px bg-zinc-800"></div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {categoryItems.map((item) => (
                    <div
                      key={item.id}
                      className="group bg-zinc-900/80 backdrop-blur-md p-6 rounded-[2rem] border border-zinc-800 shadow-lg hover:shadow-2xl hover:border-orange-500/30 hover:-translate-y-2 transition-all duration-300 relative flex flex-col h-full overflow-hidden"
                    >
                      <div className="flex-1 relative z-10 flex flex-col h-full">
                        {item.imageUrl ? (
                          <div className="relative w-full h-48 mb-4 rounded-xl overflow-hidden bg-zinc-800 shrink-0">
                            <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                          </div>
                        ) : (
                          <div className="w-full h-48 mb-4 rounded-xl bg-zinc-800/50 flex flex-col items-center justify-center text-zinc-500 border-2 border-dashed border-zinc-700 shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 mb-2 opacity-30"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>
                            <span className="text-xs font-semibold opacity-40">Em breve</span>
                          </div>
                        )}
                        <div className="flex justify-between items-start mb-3 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <h4 className="text-xl font-bold text-white leading-tight group-hover:text-orange-500 transition-colors">{item.name}</h4>
                          </div>
                          <span className="text-orange-500 font-black text-xl whitespace-nowrap">R$ {item.price.toFixed(2).replace('.', ',')}</span>
                        </div>
                        <p className="text-sm text-zinc-400 mt-2 mb-6 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      <button
                        onClick={() => handleOpenModal({ name: item.name, price: item.price })}
                        className="mt-auto relative z-10 w-full bg-zinc-800 hover:bg-gradient-to-r hover:from-orange-500 hover:to-orange-600 text-white font-bold py-3.5 rounded-2xl border border-zinc-700 hover:border-transparent transition-all duration-300 flex justify-center items-center gap-2 hover:shadow-lg hover:shadow-orange-500/25"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                          <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                        </svg>
                        Adicionar ao Pedido
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="py-16 mt-12 bg-zinc-900 text-zinc-400 border-t-8 border-orange-500">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="text-3xl font-black text-white mb-4">{config.storeName}</div>
            <p className="mb-6 max-w-sm text-zinc-400 leading-relaxed">Matando a fome da galera com os melhores e maiores lanches da região. Ingredientes de qualidade e muito sabor.</p>
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center hover:bg-orange-600 hover:text-white transition-colors cursor-pointer">
                <span className="font-bold">IG</span>
              </div>
              <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center hover:bg-orange-600 hover:text-white transition-colors cursor-pointer">
                <span className="font-bold">FB</span>
              </div>
            </div>
          </div>
          <div className="md:text-right space-y-4">
            <h4 className="text-white font-bold text-lg mb-2">Visite ou Peça</h4>

            <div className="flex items-start md:justify-end gap-3 text-zinc-300">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 shrink-0 text-orange-500 mt-0.5"><path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>
              {config.googleMapsLink ? (
                <a href={config.googleMapsLink} target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-colors underline decoration-orange-500/30 underline-offset-4 text-left md:text-right">
                  {config.address}
                </a>
              ) : (
                <span className="text-left md:text-right">{config.address}</span>
              )}
            </div>

            <div className="flex items-start md:justify-end gap-3 text-zinc-300">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 shrink-0 text-orange-500 mt-0.5"><path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" /></svg>
              <div className="text-left md:text-right">
                <p className="font-bold text-white mb-0.5">Aberto {config.operatingDays}</p>
                <p>das {config.openingTime} às {config.closingTime}</p>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-orange-500 font-bold flex items-center md:justify-end gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" clipRule="evenodd" /></svg>
                WhatsApp: {config.whatsappNumber}
              </p>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 border-t border-zinc-800 mt-12 pt-8 text-sm text-center md:text-left flex flex-col md:flex-row justify-between">
          <p>&copy; {new Date().getFullYear()} {config.storeName}. Todos os direitos reservados.</p>
          <p className="mt-2 md:mt-0">Feito com 🧡</p>
        </div>
      </footer>
    </div>
  );
}
