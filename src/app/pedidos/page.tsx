'use client';
export const runtime = 'edge';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// ⚠️ COLE SUAS CHAVES AQUI (Pegue no Supabase > Settings > API)
const SUPABASE_URL = 'SUA_URL_AQUI'; 
const SUPABASE_KEY = 'SUA_CHAVE_ANON_AQUI';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<any[]>([]);

  // Função que dispara a impressão para o App RawBT no celular
  const imprimirNoCelular = (pedido: any) => {
    // Usamos a coluna 'conteudo' que vimos no seu print do banco
    const textoParaImprimir = pedido.conteudo || "Pedido sem conteúdo registrado.";
    
    // Adiciona espaços no final para a BT-583 não cortar o texto
    const cupomFinal = `${textoParaImprimir}\n\n\n\n`;

    try {
      // Converte para Base64 e chama o protocolo do RawBT
      const base64Cupom = btoa(unescape(encodeURIComponent(cupomFinal)));
      window.location.href = `rawbt:base64,${base64Cupom}`;
    } catch (e) {
      console.error("Erro ao processar impressão:", e);
    }
  };

  useEffect(() => {
    // 1. Carrega os pedidos que já estão na tabela 'pedidos_impressao'
    const carregarIniciais = async () => {
      const { data, error } = await supabase
        .from('pedidos_impressao')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (data) setPedidos(data);
      if (error) console.error("Erro ao buscar dados:", error.message);
    };
    carregarIniciais();

    // 2. ESCUTA EM TEMPO REAL (O pedido pula na tela e imprime sozinho)
    const canal = supabase
      .channel('moes-realtime-final')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'pedidos_impressao' },
        (payload) => {
          const novoPedido = payload.new;
          setPedidos((prev) => [novoPedido, ...prev]);
          
          // DISPARA A IMPRESSORA AUTOMATICAMENTE
          imprimirNoCelular(novoPedido);
        }
      )
      .subscribe((status) => {
        console.log("Status da conexão Moe's:", status);
      });

    return () => { supabase.removeChannel(canal); };
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <header style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: '#d32f2f', margin: '0' }}>🔥 Painel de Pedidos Moe's 🔥</h1>
        <p style={{ fontSize: '14px', color: '#666' }}>Mondaí, SC - Impressão Automática BT-583</p>
      </header>

      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        {pedidos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#fff', borderRadius: '10px' }}>
            <p>Aguardando pedidos no banco... 🍟</p>
            <small style={{ color: '#999' }}>Verifique se a tabela 'pedidos_impressao' tem dados.</small>
          </div>
        ) : (
          pedidos.map((p) => (
            <div key={p.id} style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '10px', marginBottom: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', borderLeft: '5px solid #4CAF50' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontWeight: 'bold' }}>Cliente: {p.cliente || 'Anderson'}</span>
                <span style={{ fontSize: '12px', color: '#999' }}>{new Date(p.created_at).toLocaleTimeString()}</span>
              </div>
              
              <div style={{ backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '5px', fontSize: '13px', whiteSpace: 'pre-wrap', marginBottom: '15px' }}>
                {p.conteudo}
              </div>

              <button 
                onClick={() => imprimirNoCelular(p)}
                style={{ width: '100%', backgroundColor: '#4CAF50', color: 'white', border: 'none', padding: '12px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}
              >
                🖨️ Re-imprimir Cupom
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}