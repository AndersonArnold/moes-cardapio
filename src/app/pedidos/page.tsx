'use client';
export const runtime = 'edge';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Conexão com o seu banco de dados (O Cloudflare vai ler as chaves que já salvamos lá)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Função para buscar pedidos do banco
  async function buscarPedidos() {
    const { data, error } = await supabase
      .from('pedidos') // CONFIRME SE O NOME DA TABELA É 'pedidos' NO SUPABASE
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setPedidos(data);
    setLoading(false);
  }

  useEffect(() => {
    buscarPedidos();
  }, []);

  const handlePrint = (pedido: any) => {
    // Aqui ele abre a janela de impressão com os dados do pedido selecionado
    window.print();
  };

  if (loading) return <p style={{ padding: '20px' }}>Carregando pedidos do Moe's...</p>;

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh' }}>
      <h1 style={{ color: '#d32f2f', textAlign: 'center' }}>🍟 Moe's Lancheria - Painel de Pedidos</h1>
      <hr />

      <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {pedidos.length === 0 ? (
          <p>Nenhum pedido encontrado no momento.</p>
        ) : (
          pedidos.map((pedido) => (
            <div key={pedido.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '10px', backgroundColor: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h3 style={{ margin: '0' }}>Pedido #{pedido.id.toString().slice(-4)}</h3>
                <span style={{ backgroundColor: '#fff3e0', padding: '2px 8px', borderRadius: '5px', fontSize: '12px' }}>Pendente</span>
              </div>
              <p><strong>Cliente:</strong> {pedido.cliente_nome || 'Não informado'}</p>
              <p><strong>Itens:</strong> {pedido.itens_resumo || 'Ver detalhes'}</p>
              <p style={{ fontSize: '18px', fontWeight: 'bold' }}>Total: R$ {pedido.valor_total}</p>
              
              <button 
                onClick={() => handlePrint(pedido)}
                style={{ width: '100%', backgroundColor: '#4CAF50', color: 'white', padding: '10px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                🖨️ IMPRIMIR CUPOM
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}