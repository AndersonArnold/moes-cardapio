"use client";

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://edczezjkshefeotgtxnt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwY2MiOiJzdXBhYmFmZSIzInJlZiI6ImVkemVqayIsImVvdiI6MvVvdG00eG50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0ODU2MzIzIiwibm9uY2UiOiI1ODU0ODU0ODcsImV4cCI6MjA1ODA0MDAyM30.jyX3e_JKaSks3bEEn0IEjnGWIIa_1bdlH2UWfajBG1I'
);

const menuItems = [
  { id: 1, name: "X-Bacon Especial", description: "Hambúrguer artesanal, bacon crocante, queijo, alface e tomate.", price: 28.90 },
  { id: 2, name: "Batata Frita G", description: "Porção generosa de batatas crocantes com cheddar e bacon.", price: 22.00 },
  { id: 3, name: "Coca-Cola 2L", description: "Refrigerante gelado.", price: 14.00 },
];

export default function Home() {
  const [cart, setCart] = useState<any[]>([]);
  const [orderType, setOrderType] = useState('local');
  const [isOrderFinished, setIsOrderFinished] = useState(false);
  const [customerData, setCustomerData] = useState({ name: '', table: '', payment: 'Pix' });

  const total = cart.reduce((acc: any, item: any) => acc + item.price, 0);

  const finishOrder = async () => {
    if (!customerData.name) return alert("Por favor, coloque seu nome!");
    const { error } = await supabase.from('orders').insert([{
      customer_name: customerData.name,
      items: cart,
      total_price: total,
      type: orderType,
      table_number: customerData.table,
      status: 'Pendente'
    }]);
    if (!error) { setIsOrderFinished(true); setCart([]); }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 font-sans">
      <header className="max-w-4xl mx-auto flex justify-between items-center mb-10 py-6 border-b border-zinc-800">
        <div>
          <h1 className="text-3xl font-bold text-orange-500">Moe's Lancheria</h1>
          <p className="text-zinc-400 flex items-center gap-2 text-sm">🕒 Terça a Domingo • 18:30 às 23:30</p>
        </div>
        <div className="relative bg-zinc-900 p-3 rounded-2xl border border-zinc-800 text-2xl">
          🛒
          {cart.length > 0 && <span className="absolute -top-2 -right-2 bg-orange-600 px-2 py-0.5 rounded-full text-xs font-bold animate-bounce">{cart.length}</span>}
        </div>
      </header>

      <main className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4 text-orange-500">🍴 Cardápio Digital</h2>
          {menuItems.map((item) => (
            <div key={item.id} className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl flex justify-between items-center hover:border-orange-500/50 transition-all shadow-lg">
              <div>
                <h3 className="font-bold text-lg">{item.name}</h3>
                <p className="text-zinc-400 text-sm mt-1">{item.description}</p>
                <p className="text-orange-500 font-bold mt-2 font-mono text-lg">R$ {item.price.toFixed(2)}</p>
              </div>
              <button onClick={() => setCart([...cart, item])} className="bg-orange-600 hover:bg-orange-500 p-4 rounded-xl font-bold shadow-lg shadow-orange-900/20 active:scale-90 transition-all">➕</button>
            </div>
          ))}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl h-fit sticky top-4">
          <h2 className="text-xl font-bold mb-6">📝 Seu Pedido</h2>
          {cart.length === 0 ? <p className="text-zinc-500 italic text-center py-4">Carrinho vazio...</p> : (
            <div className="space-y-6">
              <div className="space-y-3">
                {cart.map((i, idx) => (
                  <div key={idx} className="flex justify-between text-sm border-b border-zinc-800 pb-2">
                    <span className="text-zinc-300">{i.name}</span>
                    <span className="text-orange-400 font-medium">R$ {i.price.toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-xl font-bold pt-4 text-white">
                  <span>Total</span>
                  <span className="text-orange-500 font-black italic">R$ {total.toFixed(2)}</span>
                </div>
              </div>
              <div className="space-y-4 pt-4 border-t border-zinc-800">
                <div className="flex gap-2">
                  <button onClick={() => setOrderType('local')} className={`flex-1 p-3 rounded-xl text-sm font-bold transition-all ${orderType === 'local' ? 'bg-orange-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}>Mesa</button>
                  <button onClick={() => setOrderType('delivery')} className={`flex-1 p-3 rounded-xl text-sm font-bold transition-all ${orderType === 'delivery' ? 'bg-orange-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}>Retirada</button>
                </div>
                <input type="text" placeholder="Seu Nome" className="w-full bg-zinc-800 p-3 rounded-xl border border-zinc-700 outline-none focus:border-orange-500 transition-all" onChange={(e) => setCustomerData({...customerData, name: e.target.value})} />
                {orderType === 'local' ? (
                  <input type="text" placeholder="Número da Mesa" className="w-full bg-zinc-800 p-3 rounded-xl border border-zinc-700 outline-none focus:border-orange-500 transition-all" onChange={(e) => setCustomerData({...customerData, table: e.target.value})} />
                ) : (
                  <select className="w-full bg-zinc-800 p-3 rounded-xl border border-zinc-700 outline-none focus:border-orange-500" onChange={(e) => setCustomerData({...customerData, payment: e.target.value})}>
                    <option value="Pix">Pix</option>
                    <option value="Cartão">Cartão</option>
                    <option value="Dinheiro">Dinheiro</option>
                  </select>
                )}
                <button onClick={finishOrder} className="w-full bg-orange-600 hover:bg-orange-500 p-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-orange-900/40 active:scale-95 transition-all uppercase tracking-wider">Finalizar Pedido ✨</button>
              </div>
            </div>
          )}
        </div>
      </main>

      {isOrderFinished && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-zinc-900 p-8 rounded-3xl border border-orange-500 text-center max-w-sm shadow-2xl">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-bold mb-2">Pedido Enviado!</h2>
            <p className="text-zinc-400 mb-6">Sucesso em Mondaí! Agora é só aguardar.</p>
            <button onClick={() => { setIsOrderFinished(false); setCart([]); }} className="bg-orange-600 px-8 py-2 rounded-xl font-bold hover:bg-orange-500 transition-all">Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}