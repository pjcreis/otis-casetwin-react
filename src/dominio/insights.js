const MINIMO_AMOSTRA_MARCA = 3;

function contar(lista, obterChave) {
  const mapa = new Map();
  lista.forEach((item) => {
    const chave = obterChave(item);
    if (chave) mapa.set(chave, (mapa.get(chave) || 0) + 1);
  });
  return mapa;
}

function media(valores) {
  return valores.length ? valores.reduce((a, b) => a + b, 0) / valores.length : 0;
}

function naoLocalizacaoPorMarca(historico) {
  const grupos = new Map();
  historico.forEach((c) => {
    const marca = (c.fabricante || '').trim().toUpperCase();
    if (!grupos.has(marca)) grupos.set(marca, { total: 0, nl: 0 });
    const g = grupos.get(marca);
    g.total += 1;
    if (c.codigoFechamento === 'NL') g.nl += 1;
  });

  return [...grupos.entries()]
    .filter(([, g]) => g.total >= MINIMO_AMOSTRA_MARCA)
    .map(([marca, g]) => ({
      rotulo: marca,
      valor: Math.round((g.nl / g.total) * 100),
      filtro: { marca, fechamento: 'NL' },
    }))
    .sort((a, b) => b.valor - a.valor);
}

function volumePorComponente(historico) {
  return [...contar(historico, (c) => c.componente).entries()]
    .map(([comp, total]) => ({
      rotulo: comp,
      valor: total,
      filtro: { componente: comp },
    }))
    .sort((a, b) => b.valor - a.valor);
}

function chamadosPorContrato(historico, limite = 8) {
  return [...contar(historico, (c) => c.contrato).entries()]
    .map(([ctr, total]) => ({ rotulo: ctr, valor: total, filtro: { contrato: ctr } }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, limite);
}

function tempoPorComponente(historico) {
  const tempos = new Map();
  historico.forEach((c) => {
    if (c.tb == null || !c.componente) return;
    if (!tempos.has(c.componente)) tempos.set(c.componente, []);
    tempos.get(c.componente).push(c.tb);
  });

  return [...tempos.entries()]
    .map(([comp, valores]) => ({
      rotulo: comp,
      valor: Math.round(media(valores)),
      sufixo: ' min',
      filtro: { componente: comp },
    }))
    .sort((a, b) => b.valor - a.valor);
}

function chamadosPorOrigem(historico) {
  return [...contar(historico, (c) => c.origem).entries()]
    .map(([org, total]) => ({ rotulo: org, valor: total, filtro: { origem: org } }))
    .sort((a, b) => b.valor - a.valor);
}

function chamadosPorCategoria(historico) {
  const contagem = contar(historico, (c) => c.categoria);
  return ['A', 'B', 'C', 'D'].map((cat) => ({
    rotulo: `Categoria ${cat}`,
    valor: contagem.get(cat) || 0,
    filtro: { categoria: cat },
  }));
}

export function montarInsights(historico) {
  return [
    {
      id: 'nao-localizacao-marca',
      titulo: 'Taxa de não localização por marca',
      formato: 'percentual',
      nota:
        'Considera apenas marcas com 3 ou mais chamados no histórico, para não ' +
        'distorcer o percentual com amostra pequena.',
      itens: naoLocalizacaoPorMarca(historico),
    },
    {
      id: 'volume-componente',
      titulo: 'Volume de chamados por componente',
      formato: 'numero',
      itens: volumePorComponente(historico),
    },
    {
      id: 'contrato',
      titulo: 'Chamados por contrato',
      formato: 'numero',
      nota:
        'Nesta base, cada contrato cobre uma única unidade, então este recorte ' +
        'hoje reflete a mesma recorrência por unidade.',
      itens: chamadosPorContrato(historico),
    },
    {
      id: 'tempo-componente',
      titulo: 'Tempo médio de resolução por componente',
      formato: 'numero',
      itens: tempoPorComponente(historico),
    },
    {
      id: 'origem',
      titulo: 'Chamados por canal de origem',
      formato: 'numero',
      itens: chamadosPorOrigem(historico),
    },
    {
      id: 'categoria',
      titulo: 'Chamados por categoria',
      formato: 'numero',
      itens: chamadosPorCategoria(historico),
    },
  ];
}
