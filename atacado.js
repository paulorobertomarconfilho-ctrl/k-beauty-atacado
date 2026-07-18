(() => {
  const grade = document.getElementById("gradeProdutos");
  const numTotal = document.getElementById("numTotalProdutos");

  const LOGO_MARCA = {
    Medicube: `<img src="logos/medicube.svg" alt="Medicube" class="logo-medicube" />`,
    Numbuzin: `<img src="logos/numbuzin.png" alt="Numbuzin" class="logo-numbuzin" />`,
    Celimax: `<img src="logos/celimax.png" alt="Celimax" class="logo-celimax" />`,
  };

  // Selecionados manualmente pelo cliente — fotos com fundo removido em
  // produtos-transparente/, mapeadas pelo código do produto no catálogo.
  const DESTAQUES = [
    "PDRN PINK COLLAGEN CAPSULE",
    "ZERO PORE ONE DAY",
    "NAD+ RETIN VOLUMET EYE CREAM 10",
    "NO9 NAD+ BIO LIFTING",
    "VITA-A RETINAL SHOT TIGHTENING",
    "VITA-A 7DAYS",
  ];

  const FOTOS_TRANSPARENTES = {
    1628425: "produtos-transparente/1628425.png",
    1518702: "produtos-transparente/1518702.png",
    1584653: "produtos-transparente/1584653.png",
    1526806: "produtos-transparente/1526806.png",
    1553376: "produtos-transparente/1553376.png",
    1608427: "produtos-transparente/1608427.png",
  };

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
          const foto = FOTOS_TRANSPARENTES[p.codigo] || fotos[p.codigo];
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
