"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ShoppingCart, Clock, MapPin, ChevronRight, CheckCircle2, MessageCircle, UtensilsCrossed } from 'lucide-react';

// Configuração do Supabase
const supabase = createClient(
  'https://edczezjkshefeotgtxnt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwY2MiOiJzdXBhYmFmZSIzInJlZiI6ImVkemVqayIsImVvdiI6MvVvdG00eG50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0ODU2MzIzIiwibm9uY2UiOiI1ODU0ODU0ODcsImV4cCI6MjA1ODA0MDAyM30.jyX3e_JKaSks3bEEn0IEjnGWIIa_1bdlH2UWfajBG1I'
);

const config = {
  storeName: "Moe's Lancheria",
  whatsappNumber: "5549991345620",
  address: "Mondaí - SC",
  openingTime: "18:30",
  closingTime: "23:30",
  operatingDays: "Terça a Domingo"
};

const menuItems = [
  { id: 1, name: "X-Bacon Especial", description: "Hambúrguer artesanal, bacon crocante, queijo, alface e tomate.", price: 28.90, category: "Burgers" },
  { id: 2, name: "Batata Frita G", description: "Porção generosa de batatas crocantes com cheddar e bacon.", price: 22.00, category: "Porções" },
  { id: 3, name: "Coca-Cola 2L", description: "Refrigerante gelado.", price: 14.00, category: "Bebidas" },
];

export default function Home() {
  const [cart, setCart] = useState([]);
  const [isOrderFinished, setIsOrderFinished] = useState(false);
  const [orderType, setOrderType] = useState('local'); // 'local' ou 'delivery'
  const [customerData, setCustomerData] = useState({ name: '', table: '', payment: 'Caixa' });

  const addToCart = (item) => {
    setCart([...cart, item]);
  };

  const total = cart.reduce((acc, item) => acc + item.price, 0);

  const finishOrder = async () => {
    const orderData = {
      customer_name: customerData.name,
      items: cart,
      total_price: total,
      type: orderType,
      table_number: customerData.table,
      payment_method: orderType === 'local' ? 'No Caixa' : customerData.payment,
      status: 'Pendente',
      printed: false
    };

    const { error } = await supabase.from('orders').insert([orderData]);
    
    if (!error) {
      setIsOrderFinished(true);
      // Aqui enviamos para o WhatsApp também
      const message = `🍟 *Novo Pedido - Moe's*%0A------------------%0A👤 Cliente: ${customerData.name}${orderType === 'local' ? `%0A🏠 Mesa: ${customerData.table}` : ''}%0A🍔 Itens: ${cart.map(i => i.name).join(', ')}%0A💰 Total: R$ ${total.toFixed(2)}`;
      window.open(`https://wa.me/${config.whatsappNumber}?text=${message}`);
    }
  };
return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans p-4 md:p-8">
      <header className="max-w-4xl mx-auto flex justify-between items-center mb-10 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-orange-500 tracking-tight">{config.storeName}</h1>
          <p className="text-zinc-400 flex items-center gap-2 mt-1">
            <Clock size={16} /> {config.operatingDays} • {config.openingTime} às {config.closingTime}
          </p>
        </div>
        <div className="relative bg-zinc-900 p-3 rounded-2xl border border-zinc-800">
          <ShoppingCart className="text-orange-500" />
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs font-bold px-2 py-1 rounded-full animate-bounce">
              {cart.length}
            </span>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 pb-24">
        {/* Lista de Produtos */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <UtensilsCrossed size={20} className="text-orange-500" /> Cardápio Digital
          </h2>
          {menuItems.map((item) => (
            <div key={item.id} className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl hover:border-orange-500/50 transition-all flex justify-between items-center group">
              <div>
                <h3 className="font-bold text-lg group-hover:text-orange-400 transition-colors">{item.name}</h3>
                <p className="text-zinc-400 text-sm mt-1">{item.description}</p>
                <p className="text-orange-500 font-bold mt-2">R$ {item.price.toFixed(2)}</p>
              </div>
              <button 
                onClick={() => addToCart(item)}
                className="bg-orange-600 hover:bg-orange-500 p-3 rounded-xl transition-colors active:scale-95 shadow-lg shadow-orange-900/20"
              >
                +
              </button>
            </div>
          ))}
        </div>

        {/* Resumo do Pedido */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl h-fit sticky top-8">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">🛒 Seu Pedido</h2>
          
          {cart.length === 0 ? (
            <p className="text-zinc-500 text-center py-10 italic">O carrinho está vazio em Mondaí...</p>
          ) : (
            <div className="space-y-6">
              <div className="space-y-3">
                {cart.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm border-b border-zinc-800 pb-2">
                    <span className="text-zinc-300">{item.name}</span>
                    <span className="font-semibold text-orange-400">R$ {item.price.toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-xl font-bold pt-4 text-white">
                  <span>Total</span>
                  <span>R$ {total.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-zinc-800">
                <div className="flex gap-2">
                  <button 
                    onClick={() => setOrderType('local')}
                    className={`flex-1 p-3 rounded-xl text-sm font-bold transition-all ${orderType === 'local' ? 'bg-orange-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}
                  >
                    Comer Aqui
                  </button>
                  <button 
                    onClick={() => setOrderType('delivery')}
                    className={`flex-1 p-3 rounded-xl text-sm font-bold transition-all ${orderType === 'delivery' ? 'bg-orange-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}
                  >
                    Retirada
                  </button>
                </div>

                <input 
                  type="text" 
                  placeholder="Seu Nome"
                  className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-xl focus:outline-none focus:border-orange-500"
                  onChange={(e) => setCustomerData({...customerData, name: e.target.value})}
                />

                {orderType === 'local' ? (
                  <input 
                    type="text" 
                    placeholder="Número da Mesa"
                    className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-xl focus:outline-none focus:border-orange-500"
                    onChange={(e) => setCustomerData({...customerData, table: e.target.value})}
                  />
                ) : (
                  <select 
                    className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-xl focus:outline-none focus:border-orange-500"
                    onChange={(e) => setCustomerData({...customerData, payment: e.target.value})}
                  >
                    <option value="Pix">Pagamento via Pix</option>
                    <option value="Cartão">Cartão no Balcão</option>
                    <option value="Dinheiro">Dinheiro</option>
                  </select>
                )}

                <button 
                  onClick={finishOrder}
                  className="w-full bg-orange-600 hover:bg-orange-500 p-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-orange-900/40"
                >
                  Finalizar Pedido <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {isOrderFinished && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-zinc-900 p-8 rounded-3xl border border-orange-500 text-center max-w-sm">
            <CheckCircle2 className="text-orange-500 mx-auto mb-4" size={60} />
            <h2 className="text-2xl font-bold mb-2 text-white">Pedido Enviado!</h2>
            <p className="text-zinc-400 mb-6">Seu pedido já caiu no painel do Moe's. Bom apetite!</p>
            <button 
              onClick={() => { setIsOrderFinished(false); setCart([]); }}
              className="bg-zinc-800 hover:bg-zinc-700 px-6 py-2 rounded-xl text-sm"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      <footer className="max-w-4xl mx-auto p-8 border-t border-zinc-900 text-center text-zinc-600 text-xs">
        <p>&copy; {new Date().getFullYear()} {config.storeName}. {config.address}</p>
        <p className="mt-2 flex items-center justify-center gap-1 opacity-50">Feito com <span className="text-red-900">❤️</span> em Mondaí</p>
      </footer>
    </div>
  );
}