import { analisarChamado, calcularPrioridade, normalizarMarca } from './motor';

export const TAMANHO_PAGINA = 10;

export function consultarChamados({
  fila,
  historico,
  tecnicos,
  filtros = {},
  pagina = 1,
  tamanho = TAMANHO_PAGINA,
}) {
  const escopo = filtros.escopo || 'aberto';
  let lista = escopo === 'aberto' ? [...fila] : [...fila, ...historico];

  if (filtros.preso === 'sim') lista = lista.filter((c) => c.passageiroPreso);
  if (filtros.preso === 'nao') lista = lista.filter((c) => !c.passageiroPreso);
  if (filtros.pais) lista = lista.filter((c) => c.pais === filtros.pais);
  if (filtros.categoria) lista = lista.filter((c) => c.categoria === filtros.categoria);
  if (filtros.componente) lista = lista.filter((c) => c.componente === filtros.componente);
  if (filtros.contrato) lista = lista.filter((c) => c.contrato === filtros.contrato);
  if (filtros.origem) lista = lista.filter((c) => c.origem === filtros.origem);
  if (filtros.fechamento) {
    lista = lista.filter((c) => c.codigoFechamento === filtros.fechamento);
  }
  if (filtros.situacao) lista = lista.filter((c) => c.subStatus === filtros.situacao);

  if (filtros.marca) {
    const alvo = normalizarMarca(filtros.marca);
    lista = lista.filter((c) => normalizarMarca(c.fabricante) === alvo);
  }

  let comAnalise = lista.map((chamado) => ({
    chamado,
    analise: analisarChamado(chamado, historico, tecnicos),
  }));

  if (filtros.risco) {
    comAnalise = comAnalise.filter((x) => x.analise.risco.nivel === filtros.risco);
  }

  if (escopo === 'aberto') {
    comAnalise.sort(
      (a, b) =>
        calcularPrioridade(b.chamado, b.analise) - calcularPrioridade(a.chamado, a.analise)
    );
  } else {
    comAnalise.sort((a, b) => {
      if (a.chamado.status !== b.chamado.status) {
        return a.chamado.status === 'Ativo' ? -1 : 1;
      }
      return Number(b.chamado.numero) - Number(a.chamado.numero);
    });
  }

  const total = comAnalise.length;
  const paginas = Math.max(1, Math.ceil(total / tamanho));
  const atual = Math.min(pagina, paginas);
  const inicio = (atual - 1) * tamanho;

  return {
    itens: comAnalise.slice(inicio, inicio + tamanho),
    total,
    pagina: atual,
    paginas,
    tamanho,
  };
}

export function opcoesFiltro(todos) {
  const distintos = (campo, normalizar = false) => {
    const valores = new Set();
    todos.forEach((c) => {
      const valor = c[campo];
      if (valor) valores.add(normalizar ? normalizarMarca(valor) : valor);
    });
    return [...valores].sort();
  };

  return {
    paises: distintos('pais'),
    marcas: distintos('fabricante', true),
    componentes: distintos('componente'),
    contratos: distintos('contrato'),
    origens: distintos('origem'),
    fechamentos: distintos('codigoFechamento'),
  };
}

export function calcularIndicadores(fila, historico) {
  const comTA = historico.filter((c) => c.ta != null);
  const totalNL = historico.filter((c) => c.codigoFechamento === 'NL').length;

  return {
    abertos: fila.length,
    aguardando: fila.filter((c) => c.subStatus === 'Aguardando').length,
    emAtendimento: fila.filter((c) => c.subStatus === 'Em atendimento').length,
    passageiroPreso: fila.filter((c) => c.passageiroPreso).length,
    totalHistorico: historico.length,
    taMedio: comTA.length
      ? Math.round(comTA.reduce((s, c) => s + c.ta, 0) / comTA.length)
      : null,
    taxaNaoLocalizacao: historico.length
      ? Math.round((totalNL / historico.length) * 100)
      : null,
  };
}
