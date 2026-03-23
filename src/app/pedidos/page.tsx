'use client';
export const runtime = 'edge';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Suas chaves que já funcionaram
const SUPABASE_URL = 'https://edzcezjkshefeotgtxnt.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkemNlemprc2hlZmVvdGd0eG50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0ODU0ODcsImV4cCI6MjA4ODA2MTQ4N30.jyX3e_JKaSkS3bEEn0IEjnGWIIa_1bdlH2UWFajBGlI'; // Coloque sua chave anon aqui

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<any[]>([]);

  const imprimirNoCelular = (pedido: any) => {
    // Decodifica o texto (limpa os %F0%9F...) e tira os códigos de URL
    let textoLimpo = decodeURIComponent(pedido.conteudo || "");
    textoLimpo = textoLimpo.replace(/\+/g, ' '); // Troca + por espaço se houver

    const cupomFinal = `${textoLimpo}\n\n\n\n`;

    try {
      const base64Cupom = btoa(unescape(encodeURIComponent(cupomFinal)));
      window.location.href = `rawbt:base64,${base64Cupom}`;
    } catch (e) {
      console.error("Erro na impressão:", e);
    }
  };

  useEffect(() => {
    const buscarDados = async () => {
      const { data } = await supabase
        .from('pedidos_impressao')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      if (data) setPedidos(data);
    };
    buscarDados();

    // ESCUTA EM TEMPO REAL
    const canal = supabase
      .channel('moes-final')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pedidos_impressao' }, 
      (payload) => {
        setPedidos((prev) => [payload.new, ...prev]);
        imprimirNoCelular(payload.new); // Imprime na hora!
      })
      .subscribe();

    return () => { supabase.removeChannel(canal); };
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <h1 style={{ color: '#d32f2f', textAlign: 'center' }}>🔥 Painel de Pedidos Moe's 🔥</h1>
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        {pedidos.map((p) => (
          <div key={p.id} style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '10px', marginBottom: '15px', borderLeft: '5px solid #4CAF50', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
            <p><strong>Cliente:</strong> {p.cliente || 'Anderson'}</p>
            <div style={{ whiteSpace: 'pre-wrap', fontSize: '13px', backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '5px', marginBottom: '10px' }}>
              {decodeURIComponent(p.conteudo || "")}
            </div>
            <button 
              onClick={() => imprimirNoCelular(p)}
              style={{ width: '100%', padding: '12px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', fontSize: '16px' }}
            >
              🖨️ Imprimir agora
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}