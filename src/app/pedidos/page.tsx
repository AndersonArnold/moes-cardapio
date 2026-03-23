'use client';
export const runtime = 'edge';

export default function PedidosPage() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#d32f2f' }}>Moe's Lancheria - Painel de Pedidos</h1>
      <hr />
      
      <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', maxWidth: '400px' }}>
        <h3>Pedido #001 - Teste</h3>
        <p><strong>Cliente:</strong> Anderson</p>
        <ul>
          <li>1x X-Salada Especial</li>
          <li>1x Coca-Cola 350ml</li>
        </ul>
        <p><strong>Total:</strong> R$ 35,00</p>
        
        <button 
          onClick={handlePrint}
          style={{ 
            backgroundColor: '#4CAF50', 
            color: 'white', 
            padding: '10px 20px', 
            border: 'none', 
            borderRadius: '5px', 
            cursor: 'pointer' 
          }}
        >
          🖨️ Imprimir Pedido
        </button>
      </div>
    </div>
  );
}