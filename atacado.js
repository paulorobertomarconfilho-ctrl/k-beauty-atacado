(() => {
  const grade = document.getElementById("gradeProdutos");
  const numTotal = document.getElementById("numTotalProdutos");

  const LOGO_MARCA = {
    Medicube: `<img src="logos/medicube.svg" alt="Medicube" class="logo-medicube" />`,
    Numbuzin: `<img src="logos/numbuzin.png" alt="Numbuzin" class="logo-numbuzin" />`,
    Celimax: `<img src="logos/celimax.png" alt="Celimax" class="logo-celimax" />`,
  };

  const DESTAQUES = [
    "AGE-R BOOSTER PRO 6EM1",
    "ZERO PORE",
    "NUMBUZIN NO9 NAD+ BIO LIFTING",
    "NUMBUZIN NO1 PANTOTHENIC",
    "CELIMAX DUAL BARRIER BOOSTING",
    "CELIMAX THE REAL NONI",
  ];

  function escolherDestaques(catalogo) {
    const escolhidos = [];
    for (const termo of DESTAQUES) {
      const achado = catalogo.find(
        (p) => p.nome.toUpperCase().includes(termo) && !escolhidos.includes(p)
      );
      if (achado) escolhidos.push(achado);
    }
    if (escolhidos.length < 6) {
      for (const marca of ["Medicube", "Numbuzin", "Celimax"]) {
        const extra = catalogo
          .filter((p) => p.marca === marca && !escolhidos.includes(p))
          .sort((a, b) => b.preco - a.preco)[0];
        if (extra && escolhidos.length < 6) escolhidos.push(extra);
      }
    }
    return escolhidos.slice(0, 6);
  }

  async function carregar() {
    try {
      const [respCatalogo, respFotos] = await Promise.all([
        fetch("catalogo-propostas.json"),
        fetch("fotos-produtos.json"),
      ]);
      const catalogo = await respCatalogo.json();
      const fotos = await respFotos.json();

      if (numTotal) numTotal.textContent = `${catalogo.length}+`;

      const destaques = escolherDestaques(catalogo);
      grade.innerHTML = destaques
        .map((p) => {
          const foto = fotos[p.codigo];
          const classeMarca = `glow-${p.marca.toLowerCase()}`;
          const fotoHtml = foto
            ? `<img class="produto-foto" src="${foto}" alt="${p.nome}" loading="lazy" />`
            : `<div class="produto-foto produto-foto-vazia">🧴</div>`;
          return `
        <div class="produto-card">
          <div class="produto-foto-wrap ${classeMarca}">${fotoHtml}</div>
          <div class="produto-card-info">
            <div class="marca">${LOGO_MARCA[p.marca] || p.marca}</div>
            <div class="nome">${p.nome}</div>
          </div>
        </div>`;
        })
        .join("");
    } catch {
      grade.innerHTML = '<p style="text-align:center;color:var(--texto-suave)">Não foi possível carregar o catálogo agora.</p>';
    }
  }

  carregar();
})();
