"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

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
  const [orderType, setOrderType] = useState('local');
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
      const message = `🍟 *Novo Pedido - Moe's*%0A👤 Cliente: ${customerData.name}${orderType === 'local' ? `%0A🏠 Mesa: ${customerData.table}` : ''}%0A🍔 Itens: ${cart.map(i => i.name).join(', ')}%0A💰 Total: R$ ${total.toFixed(2)}`;
      window.open(`https://wa.me/${config.whatsappNumber}?text=${message}`);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4">
      <header className="max-w-4xl mx-auto flex justify-between items-center mb-10 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-orange-500">{config.storeName}</h1>
          <p className="text-zinc-400 mt-1">{config.operatingDays} • {config.openingTime} às {config.closingTime}</p>
        </div>
        <div className="bg-zinc-900 p-3 rounded-2xl border border-zinc-800 text-orange-500 font-bold">
          🛒 {cart.length}
        </div>
      </header>

      <main className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-semibold mb-4 text-orange-500">Cardápio Digital</h2>
          {menuItems.map((item) => (
            <div key={item.id} className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">{item.name}</h3>
                <p className="text-zinc-400 text-sm">{item.description}</p>
                <p className="text-orange-500 font-bold mt-2">R$ {item.price.toFixed(2)}</p>
              </div>
              <button onClick={() => addToCart(item)} className="bg-orange-600 p-3 rounded-xl font-bold">+</button>
            </div>
          ))}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl h-fit">
          <h2 className="text-xl font-bold mb-6">🛒 Seu Pedido</h2>
          {cart.length === 0 ? <p className="text-zinc-500 italic">Vazio...</p> : (
            <div className="space-y-6">
              {cart.map((item, index) => (
                <div key={index} className="flex justify-between text-sm border-b border-zinc-800 pb-2">
                  <span>{item.name}</span>
                  <span className="text-orange-400">R$ {item.price.toFixed(2)}</span>
                </div>
              ))}
              <div className="text-xl font-bold pt-4 flex justify-between">
                <span>Total</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
              <div className="space-y-4 pt-4 border-t border-zinc-800">
                <div className="flex gap-2">
                  <button onClick={() => setOrderType('local')} className={`flex-1 p-3 rounded-xl text-sm font-bold ${orderType === 'local' ? 'bg-orange-600' : 'bg-zinc-800'}`}>Mesa</button>
                  <button onClick={() => setOrderType('delivery')} className={`flex-1 p-3 rounded-xl text-sm font-bold ${orderType === 'delivery' ? 'bg-orange-600' : 'bg-zinc-800'}`}>Retirada</button>
                </div>
                <input type="text" placeholder="Seu Nome" className="w-full bg-zinc-800 p-3 rounded-xl" onChange={(e) => setCustomerData({...customerData, name: e.target.value})} />
                {orderType === 'local' ? (
                  <input type="text" placeholder="Número da Mesa" className="w-full bg-zinc-800 p-3 rounded-xl" onChange={(e) => setCustomerData({...customerData, table: e.target.value})} />
                ) : (
                  <select className="w-full bg-zinc-800 p-3 rounded-xl" onChange={(e) => setCustomerData({...customerData, payment: e.target.value})}>
                    <option value="Pix">Pix</option>
                    <option value="Cartão">Cartão</option>
                    <option value="Dinheiro">Dinheiro</option>
                  </select>
                )}
                <button onClick={finishOrder} className="w-full bg-orange-600 p-4 rounded-2xl font-bold shadow-xl">Finalizar Pedido</button>
              </div>
            </div>
          )}
        </div>
      </main>

      {isOrderFinished && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 p-8 rounded-3xl border border-orange-500 text-center max-w-sm">
            <h2 className="text-2xl font-bold mb-2">Pedido Enviado!</h2>
            <p className="text-zinc-400 mb-6">Sucesso em Mondaí!</p>
            <button onClick={() => { setIsOrderFinished(false); setCart([]); }} className="bg-zinc-800 px-6 py-2 rounded-xl">Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}