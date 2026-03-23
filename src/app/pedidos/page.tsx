'use client';
export const runtime = 'edge';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Conexão com o seu banco de dados Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<any[]>([]);

  // Função que envia o comando para o App RawBT no celular
  const imprimirNoCelular = (pedido: any) => {
    const dataHora = new Date().toLocaleString('pt-BR');
    
    // Montagem do Cupom do Moe's (Formatado para 58mm)
    const cupom = `
      MOE'S LANCHERIA 🍔🍟
      --------------------------------
      PEDIDO: #${pedido.id.toString().slice(-4)}
      DATA: ${dataHora}
      --------------------------------
      CLIENTE: ${pedido.cliente_nome || 'Consumidor'}
      
      ITENS:
      ${pedido.itens_resumo || 'Nenhum item informado'}
      
      --------------------------------
      TOTAL: R$ ${pedido.valor_total}
      --------------------------------
      
      OBRIGADO PELA PREFERENCIA!
      COMA NO MOE'S! 🍩
      
      
    `;

    // Converte o texto para Base64 para o RawBT entender
    const base64Cupom = btoa(unescape(encodeURIComponent(cupom)));
    
    // Dispara o comando para o app de impressão no Android
    window.location.href = `rawbt:base64,${base64Cupom}`;
  };

  useEffect(() => {
    // 1. Busca inicial de pedidos
    const buscarPedidos = async () => {
      const { data } = await supabase
        .from('pedidos')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      if (data) setPedidos(data);
    };
    buscarPedidos();

    // 2. ESCUTA EM TEMPO REAL (Ouvindo o Supabase)
    const channel = supabase
      .channel('pedidos-reais')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pedidos' }, (payload) => {
        const novoPedido = payload.new;
        setPedidos((prev) => [novoPedido, ...prev]);
        
        // AUTO-PRINT: Chama a função de impressão assim que o pedido entra
        imprimirNoCelular(novoPedido);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <h1 style={{ color: '#d32f2f', textAlign: 'center' }}>🔥 Painel de Pedidos Moe's 🔥</h1>
      <p style={{ textAlign: 'center', fontSize: '12px' }}>Modo de Impressão: Celular (RawBT)</p>
      <hr />

      <div style={{ display: 'grid', gap: '15px' }}>
        {pedidos.length === 0 ? (
          <p style={{ textAlign: 'center' }}>Aguardando novos pedidos...</p>
        ) : (
          pedidos.map((p) => (
            <div key={p.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '10px', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h3 style={{ margin: '0' }}>#{p.id.toString().slice(-4)}</h3>
                <button 
                  onClick={() => imprimirNoCelular(p)}
                  style={{ backgroundColor: '#4CAF50', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}
                >
                  🖨️ Re-imprimir
                </button>
              </div>
              <p><strong>Cliente:</strong> {p.cliente_nome}</p>
              <p><strong>Total:</strong> R$ {p.valor_total}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}