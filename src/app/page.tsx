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
    if (!error) { alert("Pedido enviado com sucesso!"); setCart([]); }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 font-sans">
      <div className="max-w-md mx-auto">
        <header className="text-center py-8">
          <h1 className="text-4xl font-black text-orange-500 italic">MOE'S</h1>
          <p className="text-zinc-500 text-sm tracking-widest">LANCHERIA • MONDAÍ</p>
        </header>

        <div className="space-y-4">
          {menuItems.map((item) => (
            <div key={item.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex justify-between items-center shadow-lg">
              <div className="flex-1">
                <h3 className="font-bold text-lg leading-tight">{item.name}</h3>
                <p className="text-zinc-500 text-xs mt-1">{item.description}</p>
                <p className="text-orange-500 font-bold mt-2">R$ {item.price.toFixed(2)}</p>
              </div>
              <button 
                onClick={() => setCart([...cart, item])}
                className="ml-4 bg-orange-600 w-12 h-12 rounded-xl text-2xl font-bold active:scale-90 transition-all shadow-lg shadow-orange-900/20"
              >
                +
              </button>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div className="mt-8 bg-zinc-900 border-2 border-orange-500 p-6 rounded-3xl shadow-2xl">
            <h2 className="text-xl font-bold mb-4 flex justify-between">
              <span>Seu Carrinho</span>
              <span className="text-orange-500">{cart.length}</span>
            </h2>
            
            <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
              {cart.map((i, idx) => (
                <div key={idx} className="flex justify-between text-sm text-zinc-400">
                  <span>{i.name}</span>
                  <span>R$ {i.price.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-zinc-800 pt-4 mb-6">
              <div className="flex justify-between text-2xl font-black">
                <span>TOTAL</span>
                <span className="text-orange-500">R$ {total.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setOrderType('local')} className={`p-3 rounded-xl font-bold ${orderType === 'local' ? 'bg-orange-600' : 'bg-zinc-800 text-zinc-500'}`}>MESA</button>
                <button onClick={() => setOrderType('delivery')} className={`p-3 rounded-xl font-bold ${orderType === 'delivery' ? 'bg-orange-600' : 'bg-zinc-800 text-zinc-500'}`}>RETIRADA</button>
              </div>

              <input 
                type="text" 
                placeholder="Seu Nome" 
                className="w-full bg-zinc-800 p-4 rounded-xl outline-none focus:ring-2 ring-orange-500"
                onChange={(e) => setCustomerData({...customerData, name: e.target.value})}
              />

              {orderType === 'local' ? (
                <input 
                  type="text" 
                  placeholder="Número da Mesa" 
                  className="w-full bg-zinc-800 p-4 rounded-xl outline-none focus:ring-2 ring-orange-500"
                  onChange={(e) => setCustomerData({...customerData, table: e.target.value})}
                />
              ) : (
                <select className="w-full bg-zinc-800 p-4 rounded-xl outline-none" onChange={(e) => setCustomerData({...customerData, payment: e.target.value})}>
                  <option>Pix</option>
                  <option>Cartão</option>
                  <option>Dinheiro</option>
                </select>
              )}

              <button 
                onClick={finishOrder}
                className="w-full bg-orange-600 p-5 rounded-2xl font-black text-xl shadow-xl active:scale-95 transition-all"
              >
                FINALIZAR PEDIDO
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}