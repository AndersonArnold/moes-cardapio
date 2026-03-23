const imprimirNoCelular = (pedido: any) => {
    const dataHora = new Date().toLocaleString('pt-BR');
    
    // Montagem do Cupom EXATA para o seu pedido do Moe's
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
      TOTAL: R$ ${pedido.total_compra || pedido.valor_total || '50,00'}
      PAGAMENTO: ${pedido.forma_pagamento || 'Dinheiro'}
      --------------------------------
      
      OBRIGADO PELA PREFERENCIA!
      COMA NO MOE'S! 🍩
      
      
    `;

    // Converte para Base64 e chama o RawBT no celular
    const base64Cupom = btoa(unescape(encodeURIComponent(cupom)));
    window.location.href = `rawbt:base64,${base64Cupom}`;
  };