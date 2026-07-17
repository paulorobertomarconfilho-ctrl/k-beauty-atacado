(() => {
  const els = {
    busca: document.getElementById("busca"),
    filtrosMarca: document.getElementById("filtrosMarca"),
    listaProdutos: document.getElementById("listaProdutos"),
    resumoItens: document.getElementById("resumoItens"),
    resumoTotal: document.getElementById("resumoTotal"),
    btnGerar: document.getElementById("btnGerar"),
    nomeCliente: document.getElementById("nomeCliente"),
    desconto: document.getElementById("desconto"),
    nomeVendedor: document.getElementById("nomeVendedor"),
    modalFundo: document.getElementById("modalFundo"),
    linkGerado: document.getElementById("linkGerado"),
    btnCopiar: document.getElementById("btnCopiar"),
    btnFechar: document.getElementById("btnFechar"),
    btnWhatsapp: document.getElementById("btnWhatsapp"),
    avisoCopiado: document.getElementById("avisoCopiado"),
  };

  let catalogo = [];
  let fotos = {};
  let marcaAtiva = "Todas";
  let termoBusca = "";
  const selecionados = new Map(); // codigo -> quantidade

  const formatoMoeda = (valor) =>
    valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  function codificarBase64Url(obj) {
    const json = JSON.stringify(obj);
    const bytes = new TextEncoder().encode(json);
    let binario = "";
    bytes.forEach((b) => (binario += String.fromCharCode(b)));
    return btoa(binario).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  async function carregar() {
    const [respCatalogo, respFotos] = await Promise.all([
      fetch("catalogo-propostas.json"),
      fetch("fotos-produtos.json"),
    ]);
    catalogo = await respCatalogo.json();
    fotos = await respFotos.json();

    const marcaUrl = new URLSearchParams(window.location.search).get("marca");
    if (marcaUrl && catalogo.some((p) => p.marca === marcaUrl)) {
      marcaAtiva = marcaUrl;
    }

    const marcas = ["Todas", ...new Set(catalogo.map((p) => p.marca))];
    els.filtrosMarca.innerHTML = marcas
      .map(
        (m) =>
          `<button type="button" class="chip${m === marcaAtiva ? " ativo" : ""}" data-marca="${m}">${m}</button>`
      )
      .join("");

    els.nomeVendedor.value = localStorage.getItem("proposta_nomeVendedor") || "";

    renderizarLista();
  }

  function renderizarLista() {
    const termo = termoBusca.trim().toLowerCase();
    const filtrados = catalogo.filter((p) => {
      const passaMarca = marcaAtiva === "Todas" || p.marca === marcaAtiva;
      const passaBusca = !termo || p.nome.toLowerCase().includes(termo) || p.codigo.includes(termo);
      return passaMarca && passaBusca;
    });

    if (filtrados.length === 0) {
      els.listaProdutos.innerHTML = '<div class="vazio">Nenhum produto encontrado.</div>';
      return;
    }

    els.listaProdutos.innerHTML = filtrados
      .map((p) => {
        const qtd = selecionados.get(p.codigo) || 0;
        const foto = fotos[p.codigo];
        const fotoHtml = foto
          ? `<img class="produto-foto" src="${foto}" alt="" />`
          : `<span class="produto-foto">🧴</span>`;
        return `
        <div class="produto${qtd > 0 ? " selecionado" : ""}" data-codigo="${p.codigo}">
          ${fotoHtml}
          <div class="produto-info">
            <div class="produto-marca">${p.marca}</div>
            <div class="produto-nome">${p.nome}</div>
            <div class="produto-preco">${formatoMoeda(p.preco)}</div>
          </div>
          <div class="qtd-controle">
            <button type="button" class="qtd-btn" data-acao="menos" data-codigo="${p.codigo}">−</button>
            <span class="qtd-valor">${qtd}</span>
            <button type="button" class="qtd-btn" data-acao="mais" data-codigo="${p.codigo}">+</button>
          </div>
        </div>`;
      })
      .join("");
  }

  function alterarQuantidade(codigo, delta) {
    const atual = selecionados.get(codigo) || 0;
    const novo = Math.max(0, atual + delta);
    if (novo === 0) {
      selecionados.delete(codigo);
    } else {
      selecionados.set(codigo, novo);
    }
    renderizarLista();
    atualizarResumo();
  }

  function atualizarResumo() {
    let totalItens = 0;
    let totalBruto = 0;
    for (const [codigo, qtd] of selecionados) {
      const produto = catalogo.find((p) => p.codigo === codigo);
      if (!produto) continue;
      totalItens += qtd;
      totalBruto += produto.preco * qtd;
    }
    const descontoPct = Math.min(100, Math.max(0, Number(els.desconto.value) || 0));
    const totalFinal = totalBruto * (1 - descontoPct / 100);

    els.resumoItens.textContent = `${totalItens} ${totalItens === 1 ? "item" : "itens"}`;
    els.resumoTotal.textContent = formatoMoeda(totalFinal);
    els.btnGerar.disabled = totalItens === 0;
  }

  function gerarLink() {
    const itens = [...selecionados.entries()].map(([codigo, qtd]) => [codigo, qtd]);
    const payload = {
      c: els.nomeCliente.value.trim(),
      v: els.nomeVendedor.value.trim(),
      d: Math.min(100, Math.max(0, Number(els.desconto.value) || 0)),
      i: itens,
      t: Date.now(),
    };
    const hash = codificarBase64Url(payload);
    const url = `${location.origin}/proposta-ver.html#${hash}`;

    els.linkGerado.value = url;
    els.btnWhatsapp.href = `https://wa.me/?text=${encodeURIComponent(
      (payload.c ? `Olá ${payload.c}! ` : "Olá! ") + "Segue a proposta:\n" + url
    )}`;
    els.avisoCopiado.textContent = "";
    els.modalFundo.classList.add("aberto");
  }

  els.filtrosMarca.addEventListener("click", (ev) => {
    const btn = ev.target.closest("[data-marca]");
    if (!btn) return;
    marcaAtiva = btn.dataset.marca;
    [...els.filtrosMarca.children].forEach((c) =>
      c.classList.toggle("ativo", c.dataset.marca === marcaAtiva)
    );
    renderizarLista();
  });

  els.busca.addEventListener("input", (ev) => {
    termoBusca = ev.target.value;
    renderizarLista();
  });

  els.listaProdutos.addEventListener("click", (ev) => {
    const btn = ev.target.closest("[data-acao]");
    if (!btn) return;
    const delta = btn.dataset.acao === "mais" ? 1 : -1;
    alterarQuantidade(btn.dataset.codigo, delta);
  });

  els.desconto.addEventListener("input", atualizarResumo);

  els.nomeVendedor.addEventListener("input", () => {
    localStorage.setItem("proposta_nomeVendedor", els.nomeVendedor.value);
  });

  els.btnGerar.addEventListener("click", gerarLink);

  els.btnFechar.addEventListener("click", () => {
    els.modalFundo.classList.remove("aberto");
  });

  els.btnCopiar.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(els.linkGerado.value);
      els.avisoCopiado.textContent = "Link copiado!";
    } catch {
      els.linkGerado.select();
      document.execCommand("copy");
      els.avisoCopiado.textContent = "Link copiado!";
    }
  });

  carregar();
})();
