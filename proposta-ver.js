(() => {
  const conteudo = document.getElementById("conteudo");

  const formatoMoeda = (valor) =>
    valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  function decodificarBase64Url(str) {
    let s = str.replace(/-/g, "+").replace(/_/g, "/");
    while (s.length % 4) s += "=";
    const binario = atob(s);
    const bytes = new Uint8Array(binario.length);
    for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i);
    return JSON.parse(new TextDecoder().decode(bytes));
  }

  function mostrarErro(msg) {
    conteudo.innerHTML = `<div class="erro">${msg}</div>`;
  }

  async function iniciar() {
    const hash = location.hash.slice(1);
    if (!hash) {
      mostrarErro("Link de proposta inválido.");
      return;
    }

    let payload;
    try {
      payload = decodificarBase64Url(hash);
    } catch {
      mostrarErro("Não foi possível abrir esta proposta.");
      return;
    }

    if (!payload.i || payload.i.length === 0) {
      mostrarErro("Esta proposta não tem itens.");
      return;
    }

    const [respCatalogo, respFotos] = await Promise.all([
      fetch("catalogo-propostas.json"),
      fetch("fotos-produtos.json"),
    ]);
    const catalogo = await respCatalogo.json();
    const fotos = await respFotos.json();
    const porCodigo = new Map(catalogo.map((p) => [p.codigo, p]));

    let totalBruto = 0;
    const linhasHtml = payload.i
      .map(([codigo, qtd]) => {
        const produto = porCodigo.get(String(codigo));
        if (!produto) return "";
        const subtotal = produto.preco * qtd;
        totalBruto += subtotal;
        const foto = fotos[produto.codigo];
        const fotoHtml = foto
          ? `<img class="item-foto" src="${foto}" alt="" />`
          : `<span class="item-foto">🧴</span>`;
        return `
        <div class="item">
          ${fotoHtml}
          <div class="item-info">
            <div class="item-marca">${produto.marca}</div>
            <div class="item-nome">${produto.nome}</div>
            <div class="item-qtd">${qtd} × ${formatoMoeda(produto.preco)}</div>
          </div>
          <div class="item-subtotal">${formatoMoeda(subtotal)}</div>
        </div>`;
      })
      .join("");

    const descontoPct = Math.min(100, Math.max(0, Number(payload.d) || 0));
    const totalFinal = totalBruto * (1 - descontoPct / 100);
    const data = payload.t
      ? new Date(payload.t).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
      : "";

    conteudo.innerHTML = `
      <div class="cabecalho">
        ${payload.v ? `<div class="vendedor">${payload.v}</div>` : ""}
        ${data ? `<div class="data">Proposta de ${data}</div>` : ""}
      </div>
      ${payload.c ? `<div class="saudacao">Proposta preparada especialmente para <strong>${payload.c}</strong>.</div>` : ""}
      <div class="itens">${linhasHtml}</div>
      <div class="resumo">
        <div class="linha"><span>Subtotal</span><span>${formatoMoeda(totalBruto)}</span></div>
        ${descontoPct > 0 ? `<div class="linha"><span>Desconto</span><span>-${descontoPct}%</span></div>` : ""}
        <div class="linha total"><span>Total</span><span>${formatoMoeda(totalFinal)}</span></div>
      </div>
      <div class="aviso-cambio">Valores calculados com base no câmbio do dia — podem sofrer alterações conforme a variação da moeda.</div>
      <div class="rodape">Proposta gerada digitalmente.</div>
    `;
  }

  iniciar();
})();
