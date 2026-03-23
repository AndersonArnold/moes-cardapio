'use client';
export const runtime = 'edge';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Mantenha suas chaves aqui (como você já fez no print anterior)
const SUPABASE_URL = 'https://edzcezjkshefeotgtxnt.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkemNlemprc2hlZmVvdGd0eG50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0ODU0ODcsImV4cCI6MjA4ODA2MTQ4N30.jyX3e_JKaSkS3bEEn0IEjnGWIIa_1bdlH2UWFajBGlI'; // Coloque sua chave anon aqui

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [status, setStatus] = useState('Iniciando...');
  const [erro, setErro] = useState<string | null>(null);

  const buscarDados = async () => {
    setStatus('Buscando dados...');
    setErro(null);
    try {
      const { data, error } = await supabase
        .from('pedidos_impressao')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        setErro(`Erro do Supabase: ${error.message}`);
        setStatus('Erro na busca');
      } else if (data) {
        setPedidos(data);
        setStatus(data.length > 0 ? 'Conectado e com dados!' : 'Conectado, mas tabela vazia');
      }
    } catch (e: any) {
      setErro(`Erro de Conexão: ${e.message}`);
    }
  };

  useEffect(() => {
    buscarDados();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1 style={{ color: '#d32f2f' }}>Moe's - Diagnóstico 🔎</h1>
      
      <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '10px', border: '1px solid #ddd', marginBottom: '20px' }}>
        <p><strong>Status:</strong> {status}</p>
        {erro && <p style={{ color: 'red', fontWeight: 'bold' }}>❌ {erro}</p>}
        <button onClick={buscarDados} style={{ padding: '10px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '5px' }}>
          🔄 Tentar Novamente
        </button>
      </div>

      <div style={{ textAlign: 'left' }}>
        {pedidos.map((p) => (
          <div key={p.id} style={{ borderBottom: '1px solid #ccc', padding: '10px' }}>
            <p><strong>Pedido de:</strong> {p.cliente}</p>
            <pre style={{ fontSize: '10px' }}>{p.conteudo}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}