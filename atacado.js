(() => {
  const grade = document.getElementById("gradeProdutos");
  const numTotal = document.getElementById("numTotalProdutos");

  const LOGO_MARCA = {
    Medicube: `<img src="logos/medicube.svg" alt="Medicube" class="logo-medicube" />`,
    Numbuzin: `<img src="logos/numbuzin.png" alt="Numbuzin" class="logo-numbuzin" />`,
    Celimax: `<img src="logos/celimax.png" alt="Celimax" class="logo-celimax" />`,
    Elizavecca: `<img src="logos/elizavecca-logo.png" alt="Elizavecca" class="logo-elizavecca" />`,
    Kerasys: `<img src="logos/kerasys-logo.png" alt="Kerasys" class="logo-kerasys" />`,
    MiseEnScene: `<img src="logos/miseenscene-logo.png" alt="Mise en Scène" class="logo-miseenscene" />`,
  };

  // Selecionados manualmente pelo cliente — fotos com fundo removido em
  // produtos-transparente/, mapeadas pelo código do produto no catálogo.
  const DESTAQUES = [
    "PDRN PINK COLLAGEN CAPSULE",
    "ZERO PORE ONE DAY",
    "NAD+ RETIN VOLUMET EYE CREAM 10",
    "NO9 NAD+ BIO LIFTING",
  ];

  const FOTOS_TRANSPARENTES = {
    1628425: "produtos-transparente/1628425.png",
    1518702: "produtos-transparente/1518702.png",
    1584653: "produtos-transparente/1584653.png",
    1526806: "produtos-transparente/1526806.png",
    1553376: "produtos-transparente/1553376.png",
    1608427: "produtos-transparente/1608427.png",
  };

  // Linha de haircare coreano — não vem do catálogo de skincare importado,
  // adicionada manualmente com fotos oficiais de cada produto.
  const PRODUTOS_CABELO = [
    {
      codigo: "elizavecca-cer100-spray",
      marca: "Elizavecca",
      nome: "CER-100 COLLAGEN COATING HAIR A+ MUSCLE SPRAY",
      foto: "produtos-transparente/elizavecca-cer100-spray.png",
    },
    {
      codigo: "elizavecca-cer100-essence",
      marca: "Elizavecca",
      nome: "CER-100 COLLAGEN COATING HAIR A+ MUSCLE ESSENCE",
      foto: "produtos-transparente/elizavecca-cer100-essence.png",
    },
    {
      codigo: "elizavecca-cer100-treatment",
      marca: "Elizavecca",
      nome: "CER-100 COLLAGEN CERAMIDE COATING PROTEIN TREATMENT",
      foto: "produtos-transparente/elizavecca-cer100-treatment.png",
    },
    {
      codigo: "kerasys-propolis-shampoo",
      marca: "Kerasys",
      nome: "PROPOLIS ENERGY+ SHAMPOO",
      foto: "produtos-transparente/kerasys-propolis-shampoo.png",
    },
    {
      codigo: "kerasys-propolis-treatment",
      marca: "Kerasys",
      nome: "PROPOLIS SHINE TREATMENT",
      foto: "produtos-transparente/kerasys-propolis-treatment.png",
    },
    {
      codigo: "miseenscene-hyaluronic-shampoo",
      marca: "MiseEnScene",
      nome: "5+ HYALURONIC BIOTIN 1000 SHOT SHAMPOO",
      foto: "produtos-transparente/miseenscene-hyaluronic-shampoo.png",
    },
    {
      codigo: "miseenscene-hyaluronic-treatment",
      marca: "MiseEnScene",
      nome: "5+ HYALURONIC ACID 1500 SHOT TREATMENT",
      foto: "produtos-transparente/miseenscene-hyaluronic-treatment.png",
    },
    {
      codigo: "miseenscene-perfectserum-shampoo",
      marca: "MiseEnScene",
      nome: "PERFECT SERUM ORIGINAL SHAMPOO",
      foto: "produtos-transparente/miseenscene-perfectserum-shampoo.png",
    },
    {
      codigo: "miseenscene-perfectserum-conditioner",
      marca: "MiseEnScene",
      nome: "PERFECT SERUM ORIGINAL CONDITIONER",
      foto: "produtos-transparente/miseenscene-perfectserum-conditioner.png",
    },
    {
      codigo: "miseenscene-perfectserum-serum",
      marca: "MiseEnScene",
      nome: "PERFECT SERUM ORIGINAL",
      foto: "produtos-transparente/miseenscene-perfectserum-serum.png",
    },
  ];

  function escolherDestaques(catalogo) {
    const escolhidos = [];
    for (const termo of DESTAQUES) {
      const achado = catalogo.find(
        (p) => p.nome.toUpperCase().includes(termo) && !escolhidos.includes(p)
      );
      if (achado) escolhidos.push(achado);
    }
    if (escolhidos.length < 4) {
      for (const marca of ["Medicube", "Numbuzin", "Celimax"]) {
        const extra = catalogo
          .filter((p) => p.marca === marca && !escolhidos.includes(p))
          .sort((a, b) => b.preco - a.preco)[0];
        if (extra && escolhidos.length < 4) escolhidos.push(extra);
      }
    }
    return [...escolhidos.slice(0, 4), ...PRODUTOS_CABELO];
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
          const foto = p.foto || FOTOS_TRANSPARENTES[p.codigo] || fotos[p.codigo];
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
