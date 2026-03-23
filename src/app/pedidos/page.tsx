'use client';
export const runtime = 'edge';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Conexão com o seu projeto Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<any[]>([]);

  // Função que monta o cupom e manda para a impressora Bluetooth
  const imprimirNoCelular = (pedido: any) => {
    const dataHora = new Date().toLocaleString('pt-BR');
    
    // Formatação do Cupom (Ajustado para 58mm)
    const cupom = `
      MOE'S LANCHERIA 🍔🍟
      --------------------------------
      PEDIDO: #${pedido.id.toString().slice(-4)}
      DATA: ${dataHora}
      --------------------------------
      CLIENTE: ${pedido.cliente || 'anderson'}
      WHATS: ${pedido.whatsapp || '49991518392'}
      --------------------------------
      ITENS:
      ${pedido.itens_pedido || '1x Porção de Fritas'}
      
      --------------------------------
      TOTAL: R$ ${pedido.total_compra || '50,00'}
      PAGAMENTO: ${pedido.forma_pagamento || 'Dinheiro'}
      --------------------------------
      TIPO: ${pedido.tipo_pedido || 'Retirada'}
      
      OBRIGADO PELA PREFERENCIA!
      COMA NO MOE'S! 🍩
      
      
    `;

    try {
      // Converte para Base64 e chama o RawBT no Android
      const base64Cupom = btoa(unescape(encodeURIComponent(cupom)));
      window.location.href = `rawbt:base64,${base64Cupom}`;
    } catch (e) {
      console.error("Erro ao processar impressão:", e);
    }
  };

  useEffect(() => {
    // 1. Busca os pedidos que já estão no banco
    const carregarPedidosIniciais = async () => {
      const { data, error } = await supabase
        .from('pedidos_impressao')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(15);
      
      if (data) setPedidos(data);
      if (error) console.error("Erro Supabase:", error.message);
    };
    carregarPedidosIniciais();

    // 2. ESCUTA EM TEMPO REAL (O segredo do Auto-Print)
    const canal = supabase
      .channel('moes-realtime-v1')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'pedidos_impressao' },
        (payload) => {
          const novoPedido = payload.new;
          // Adiciona o novo pedido no topo da lista
          setPedidos((prev) => [novoPedido, ...prev]);
          
          // DISPARA A IMPRESSORA AUTOMATICAMENTE
          imprimirNoCelular(novoPedido);
        }
      )
      .subscribe((status) => {
        console.log("Conexão Realtime:", status);
      });

    return () => { supabase.removeChannel(canal); };
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <header style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: '#d32f2f', margin: '0' }}>🔥 Painel de Pedidos Moe's 🔥</h1>
        <p style={{ fontSize: '14px', color: '#666' }}>Mondaí, SC - Conectado à BT-583</p>
      </header>

      <div style={{ maxWidth: '600px', margin: '0 auto', display: 'grid', gap: '15px' }}>
        {pedidos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#fff', borderRadius: '10px' }}>
            <p>Aguardando o primeiro pedido de hoje... 🍟</p>
          </div>
        ) : (
          pedidos.map((p) => (
            <div key={p.id} style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', borderLeft: '5px solid #4CAF50' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: '0', fontSize: '18px' }}>Pedido #{p.id.toString().slice(-4)}</h2>
                <button 
                  onClick={() => imprimirNoCelular(p)}
                  style={{ backgroundColor: '#4CAF50', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  🖨️ Re-imprimir
                </button>
              </div>
              <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '10px 0' }} />
              <p><strong>Cliente:</strong> {p.cliente || 'Anderson'}</p>
              <p><strong>Itens:</strong> {p.itens_pedido || 'Ver no WhatsApp'}</p>
              <p style={{ fontSize: '18px', color: '#d32f2f' }}><strong>Total: R$ {p.total_compra || '0,00'}</strong></p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}