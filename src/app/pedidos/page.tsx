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
    // Como o seu sistema já manda o texto pronto no "conteudo",
    // vamos usar ele direto para a impressora!
    const textoParaImprimir = pedido.conteudo || "Pedido sem conteúdo";
    
    // Adiciona uns pulos de linha no final para a BT-583 não cortar o papel
    const cupomFinal = `${textoParaImprimir}\n\n\n\n`;

    try {
      const base64Cupom = btoa(unescape(encodeURIComponent(cupomFinal)));
      window.location.href = `rawbt:base64,${base64Cupom}`;
    } catch (e) {
      console.error("Erro na impressão:", e);
    }
  };

  useEffect(() => {
    const carregarIniciais = async () => {
      const { data } = await supabase
        .from('pedidos_impressao')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      if (data) setPedidos(data);
    };
    carregarIniciais();

    const canal = supabase
      .channel('moes-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pedidos_impressao' }, 
      (payload) => {
        setPedidos((prev) => [payload.new, ...prev]);
        imprimirNoCelular(payload.new);
      })
      .subscribe();

    return () => { supabase.removeChannel(canal); };
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <h1 style={{ color: '#d32f2f', textAlign: 'center' }}>🔥 Painel de Pedidos Moe's 🔥</h1>
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        {pedidos.map((p) => (
          <div key={p.id} style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '10px', marginBottom: '10px', borderLeft: '5px solid #4CAF50' }}>
            <p><strong>Cliente:</strong> {p.cliente || 'Anderson'}</p>
            <p style={{ whiteSpace: 'pre-wrap', fontSize: '12px', backgroundColor: '#f9f9f9', padding: '10px' }}>
              {p.conteudo}
            </p>
            <button 
              onClick={() => imprimirNoCelular(p)}
              style={{ width: '100%', padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}
            >
              🖨️ Imprimir Cupom
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}