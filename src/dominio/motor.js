export const PESOS = {
  marca: 40,
  tipoProblema: 30,
  subDefeito: 15,
  unidade: 10,
  passageiroPreso: 5,
};

export function normalizarMarca(fabricante) {
  if (!fabricante) return '';
  return fabricante.trim().toUpperCase();
}

export function pontuarSimilaridade(novo, candidato) {
  let pontos = 0;

  if (normalizarMarca(novo.fabricante) === normalizarMarca(candidato.fabricante)) {
    pontos += PESOS.marca;
  }
  if (novo.tipoProblema === candidato.tipoProblema) {
    pontos += PESOS.tipoProblema;
  }
  if (novo.componente === candidato.componente && novo.defeito === candidato.defeito) {
    pontos += PESOS.subDefeito;
  } else if (novo.componente === candidato.componente) {
    pontos += PESOS.subDefeito / 2;
  }
  if (novo.unidade === candidato.unidade) {
    pontos += PESOS.unidade;
  }
  if (novo.passageiroPreso === candidato.passageiroPreso) {
    pontos += PESOS.passageiroPreso;
  }

  return Math.round(pontos * 10) / 10;
}

export function buscarCasosGemeos(chamadoNovo, historico, topN = 3) {
  const pontuados = historico
    .filter((c) => c.numero !== chamadoNovo.numero)
    .map((c) => ({
      ...c,
      _similaridade: pontuarSimilaridade(chamadoNovo, c),
    }));
  pontuados.sort((a, b) => b._similaridade - a._similaridade);
  return pontuados.slice(0, topN);
}

export function sugerirCausaProvavel(casosGemeos) {
  const contagem = {};
  casosGemeos.forEach((c) => {
    if (!c.componente || !c.defeito) return;
    const chave = `${c.componente} · ${c.defeito}`;
    contagem[chave] = (contagem[chave] || 0) + 1;
  });
  const causas = Object.keys(contagem);
  if (causas.length === 0) return null;
  causas.sort((a, b) => contagem[b] - contagem[a]);
  const causaTop = causas[0];
  return { causa: causaTop, concordancia: contagem[causaTop], total: casosGemeos.length };
}

export function sugerirTecnico(casosGemeos) {
  const porTecnico = {};
  casosGemeos.forEach((c) => {
    if (!c.tecnico || c.tb == null) return;
    if (!porTecnico[c.tecnico]) porTecnico[c.tecnico] = [];
    porTecnico[c.tecnico].push(c.tb);
  });
  let melhor = null;
  let menorMedia = Infinity;
  Object.keys(porTecnico).forEach((tec) => {
    const valores = porTecnico[tec];
    const media = valores.reduce((a, b) => a + b, 0) / valores.length;
    if (media < menorMedia) {
      menorMedia = media;
      melhor = tec;
    }
  });
  return melhor ? { tecnico: melhor, tempoMedio: Math.round(menorMedia) } : null;
}

export function calcularRiscoNaoLocalizacao(casosGemeos) {
  if (casosGemeos.length === 0) return { nivel: 'Baixo', percentual: 0 };
  const totalNL = casosGemeos.filter((c) => c.codigoFechamento === 'NL').length;
  const percentual = Math.round((totalNL / casosGemeos.length) * 100);
  let nivel = 'Baixo';
  if (percentual >= 50) nivel = 'Alto';
  else if (percentual >= 25) nivel = 'Médio';
  return { nivel, percentual };
}

export function contarRecidivaUnidade(unidade, historico) {
  return historico.filter((c) => c.unidade === unidade).length;
}

export function distanciaKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const paraRad = (graus) => (graus * Math.PI) / 180;
  const dLat = paraRad(lat2 - lat1);
  const dLon = paraRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(paraRad(lat1)) * Math.cos(paraRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function tecnicosProximos(chamado, tecnicos, limite = 3) {
  if (chamado.lat == null || chamado.lon == null || typeof tecnicos === 'undefined') return [];
  return tecnicos
    .filter((t) => t.status === 'Livre' || t.status === 'Em deslocamento')
    .map((t) => ({ ...t, distanciaKm: Math.round(distanciaKm(chamado.lat, chamado.lon, t.lat, t.lon) * 10) / 10 }))
    .sort((a, b) => a.distanciaKm - b.distanciaKm)
    .slice(0, limite);
}

export function analisarChamado(chamadoNovo, historico, tecnicos = []) {
  const casosGemeos = buscarCasosGemeos(chamadoNovo, historico, 3);
  const causaProvavel = sugerirCausaProvavel(casosGemeos);
  const tecnicoSugerido = sugerirTecnico(casosGemeos);
  const risco = calcularRiscoNaoLocalizacao(casosGemeos);
  const recidiva = contarRecidivaUnidade(chamadoNovo.unidade, historico);
  const tecnicosPerto = tecnicosProximos(chamadoNovo, tecnicos, 3);

  return {
    casosGemeos,
    causaProvavel,
    tecnicoSugerido,
    risco,
    recidiva,
    tecnicosPerto,
  };
}

export function calcularPrioridade(chamado, analise) {
  let pontos = 0;
  if (chamado.passageiroPreso) pontos += 100;
  if (chamado.categoria === 'A') pontos += 50;
  else if (chamado.categoria === 'B') pontos += 30;
  else if (chamado.categoria === 'C') pontos += 10;
  pontos += Math.min(chamado.minutosAberto, 300) / 5;
  if (analise.risco.nivel === 'Alto') pontos += 40;
  else if (analise.risco.nivel === 'Médio') pontos += 20;
  if (analise.recidiva >= 5) pontos += 15;
  return pontos;
}
