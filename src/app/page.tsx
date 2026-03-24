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
  const [isOrderFinished, setIsOrderFinished] = useState(false);
  const [customerData, setCustomerData] = useState({ name: '' });

  const total = cart.reduce((acc: any, item: any) => acc + item.price, 0);

  const finishOrder = async () => {
    if (!customerData.name) return alert("Por favor, coloque seu nome!");
    const { error } = await supabase.from('orders').insert([{
      customer_name: customerData.name,
      items: cart,
      total_price: total,
      status: 'Pendente'
    }]);
    if (!error) { 
        setIsOrderFinished(true); 
        setCart([]);
        const message = `🍟 *Novo Pedido - Moe's*%0A👤 Cliente: ${customerData.name}%0A💰 Total: R$ ${total.toFixed(2)}`;
        window.open(`https://wa.me/5549991345620?text=${message}`);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 font-sans text-center">
      <header className="max-w-md mx-auto py-10">
        <h1 className="text-4xl font-black text-orange-500 italic uppercase tracking-tighter">Moe's Lancheria</h1>
        <p className="text-zinc-500 text-sm mt-2 font-medium tracking-widest">MONDAÍ • SC</p>
      </header>

      <main className="max-w-md mx-auto space-y-4 pb-32 text-left">
        {menuItems.map((item) => (
          <div key={item.id} className="bg-zinc-900 border border-zinc-800 p-5 rounded-3xl flex justify-between items-center shadow-xl">
            <div className="flex-1 pr-4">
              <h3 className="font-bold text-lg text-zinc-100">{item.name}</h3>
              <p className="text-zinc-500 text-xs mt-1 leading-relaxed">{item.description}</p>
              <p className="text-orange-500 font-black mt-3 text-lg italic">R$ {item.price.toFixed(2)}</p>
            </div>
            <button 
                onClick={() => setCart([...cart, item])} 
                className="bg-orange-600 hover:bg-orange-500 w-12 h-12 rounded-2xl font-bold text-2xl shadow-lg active:scale-90 transition-all text-white"
            >
                +
            </button>
          </div>
        ))}
      </main>

      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur-md border-t border-zinc-800 p-6 z-40">
          <div className="max-w-md mx-auto">
            <div className="flex justify-between items-end mb-4 px-1">
                <span className="text-zinc-400 font-bold uppercase text-xs tracking-widest italic">🛒 {cart.length} itens</span>
                <span className="text-3xl font-black text-orange-500 italic">R$ {total.toFixed(2)}</span>
            </div>
            <input 
                type="text" 
                placeholder="Seu Nome" 
                className="w-full bg-zinc-800 p-4 rounded-2xl mb-4 border border-zinc-700 outline-none focus:ring-2 ring-orange-500 text-white"
                onChange={(e) => setCustomerData({...customerData, name: e.target.value})}
            />
            <button 
                onClick={finishOrder}
                className="w-full bg-orange-600 p-5 rounded-2xl font-black text-xl shadow-xl active:scale-95 transition-all uppercase italic text-white"
            >
                Enviar Pedido 🚀
            </button>
          </div>
        </div>
      )}

      {isOrderFinished && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center p-6 z-50">
          <div className="bg-zinc-900 p-10 rounded-[40px] border border-orange-500 text-center shadow-2xl">
            <div className="text-6xl mb-6">✅</div>
            <h2 className="text-3xl font-black mb-2 uppercase italic text-orange-500">Sucesso!</h2>
            <p className="text-zinc-400 mb-8 font-medium">Seu pedido foi enviado para o Moe's!</p>
            <button onClick={() => setIsOrderFinished(false)} className="bg-zinc-800 px-10 py-3 rounded-2xl font-bold uppercase tracking-widest text-sm text-white border border-zinc-700">Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}