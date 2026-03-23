'use client';
export const runtime = 'edge';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<any[]>([]);

  const imprimirNoCelular = (pedido: any) => {
    const dataHora = new Date().toLocaleString('pt-BR');
    
    // Cupom formatado para a BT-583 do Moe's
    const cupom = `
      MOE'S LANCHERIA 🍔🍟
      --------------------------------
      PEDIDO: #${pedido.id.toString().slice(-4)}
      DATA: ${dataHora}
      --------------------------------
      CLIENTE: ${pedido.cliente_name || 'Consumidor'}
      
      RESUMO:
      ${pedido.itens_resumo || 'Itens no sistema'}
      
      --------------------------------
      TOTAL: R$ ${pedido.total_price || pedido.valor_total || '0,00'}
      --------------------------------
      OBRIGADO! COMA NO MOE'S! 🍩
      
      
    `;

    const base64Cupom = btoa(unescape(encodeURIComponent(cupom)));
    window.location.href = `rawbt:base64,${base64Cupom}`;
  };

  useEffect(() => {
    // Busca inicial na tabela CORRETA: pedidos_impressao
    const buscarPedidos = async () => {
      const { data } = await supabase
        .from('pedidos_impressao')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      if (data) setPedidos(data);
    };
    buscarPedidos();

    // Escuta em tempo real na tabela CORRETA
    const channel = supabase
      .channel('custom-insert-channel')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'pedidos_impressao' // Nome ajustado aqui também!
      }, (payload) => {
        const novoPedido = payload.new;
        setPedidos((prev) => [novoPedido, ...prev]);
        imprimirNoCelular(novoPedido);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <h1 style={{ color: '#d32f2f', textAlign: 'center' }}>🔥 Painel Moe's (Realtime) 🔥</h1>
      <hr />
      <div style={{ display: 'grid', gap: '15px' }}>
        {pedidos.length === 0 ? (
          <p style={{ textAlign: 'center' }}>Nenhum pedido na tabela 'pedidos_impressao'...</p>
        ) : (
          pedidos.map((p) => (
            <div key={p.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '10px', backgroundColor: '#fff' }}>
              <h3>Pedido #{p.id.toString().slice(-4)}</h3>
              <p><strong>Cliente:</strong> {p.cliente_name}</p>
              <button onClick={() => imprimirNoCelular(p)} style={{ backgroundColor: '#4CAF50', color: 'white', padding: '10px', borderRadius: '5px', border: 'none' }}>
                🖨️ Imprimir agora
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}