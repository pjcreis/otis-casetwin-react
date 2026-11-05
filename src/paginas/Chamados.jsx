import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

import { Layout } from '../componentes/Layout';
import { ModalAnalise, rotuloCodigo } from '../componentes/ModalAnalise';
import {
  BotaoSecundario,
  Chip,
  PainelCabecalho,
  PainelCard,
  PainelCorpo,
  TextoSuave,
  Vazio,
  varianteRisco,
} from '../componentes/ui';
import { consultarChamados, opcoesFiltro } from '../dominio/consultas';
import { useBase } from '../estado/BaseContext';

const GradeFiltros = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 14px;
`;

const CampoFiltro = styled.label`
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.cores.textoSuave};

  select {
    display: block;
    width: 100%;
    margin-top: 4px;
    padding: 6px 8px;
    border: 1px solid ${({ theme }) => theme.cores.borda};
    border-radius: 4px;
    font-size: 13px;
    background: #fff;
    color: ${({ theme }) => theme.cores.texto};
  }
`;

const Tabela = styled.table`
  width: 100%;
  border-collapse: collapse;

  th {
    text-align: left;
    padding: 12px 20px;
    background: ${({ theme }) => theme.cores.navy};
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: rgba(255, 255, 255, 0.8);
    font-weight: 600;
  }

  td {
    padding: 14px 20px;
    border-bottom: 1px solid ${({ theme }) => theme.cores.borda};
    font-size: 13.5px;
    vertical-align: middle;
  }

  tbody tr:last-child td {
    border-bottom: none;
  }

  tbody tr:hover {
    background: ${({ theme }) => theme.cores.rosaSuave};
  }

  .cliente {
    font-weight: 600;
  }

  .unidade {
    font-size: 12px;
    color: ${({ theme }) => theme.cores.textoSuave};
  }
`;

const Paginacao = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  padding: 14px 20px;
  border-top: 1px solid ${({ theme }) => theme.cores.borda};

  .controles {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
  }
`;

const Espaco = styled.div`
  height: 16px;
`;

const CAMPOS = [
  'escopo',
  'situacao',
  'preso',
  'pais',
  'marca',
  'categoria',
  'risco',
  'fechamento',
  'componente',
  'contrato',
  'origem',
];

function formatarTempo(minutos) {
  if (minutos == null) return '–';
  if (minutos < 60) return `${minutos} min`;
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return resto === 0 ? `${horas}h` : `${horas}h${resto}min`;
}

export function Chamados() {
  const { fila, historico, tecnicos, todos } = useBase();
  const [parametros, definirParametros] = useSearchParams();
  const [numeroAberto, setNumeroAberto] = useState(null);

  const valores = Object.fromEntries(CAMPOS.map((c) => [c, parametros.get(c) || '']));
  const escopo = valores.escopo || 'aberto';
  const pagina = Number(parametros.get('pagina') || 1);

  const opcoes = useMemo(() => opcoesFiltro(todos), [todos]);

  const dados = useMemo(
    () =>
      consultarChamados({
        fila,
        historico,
        tecnicos,
        filtros: { ...valores, escopo },
        pagina,
      }),
    [fila, historico, tecnicos, parametros.toString()]
  );

  function alterar(campo, valor) {
    const novos = new URLSearchParams(parametros);
    if (valor) novos.set(campo, valor);
    else novos.delete(campo);
    novos.delete('pagina'); 
    definirParametros(novos);
  }

  function irParaPagina(numero) {
    const novos = new URLSearchParams(parametros);
    novos.set('pagina', String(numero));
    definirParametros(novos);
  }

  function limpar() {
    definirParametros(new URLSearchParams({ escopo: 'aberto' }));
  }

  return (
    <Layout titulo="Chamados">
      <PainelCard>
        <PainelCabecalho>
          <h3>Filtros</h3>
          <BotaoSecundario $pequeno onClick={limpar}>
            Limpar filtros
          </BotaoSecundario>
        </PainelCabecalho>
        <PainelCorpo>
          <GradeFiltros>
            <CampoFiltro>
              Mostrar
              <select value={escopo} onChange={(e) => alterar('escopo', e.target.value)}>
                <option value="aberto">Somente abertos</option>
                <option value="todos">Todos da base</option>
              </select>
            </CampoFiltro>

            <CampoFiltro>
              Situação
              <select
                value={valores.situacao}
                onChange={(e) => alterar('situacao', e.target.value)}
              >
                <option value="">Todas</option>
                <option value="Aguardando">Aguardando</option>
                <option value="Em atendimento">Em atendimento</option>
              </select>
            </CampoFiltro>

            <CampoFiltro>
              Passageiro preso
              <select
                value={valores.preso}
                onChange={(e) => alterar('preso', e.target.value)}
              >
                <option value="">Todos</option>
                <option value="sim">Sim</option>
                <option value="nao">Não</option>
              </select>
            </CampoFiltro>

            <CampoFiltro>
              País
              <select value={valores.pais} onChange={(e) => alterar('pais', e.target.value)}>
                <option value="">Todos</option>
                {opcoes.paises.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </CampoFiltro>

            <CampoFiltro>
              Marca
              <select
                value={valores.marca}
                onChange={(e) => alterar('marca', e.target.value)}
              >
                <option value="">Todas</option>
                {opcoes.marcas.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </CampoFiltro>

            <CampoFiltro>
              Categoria
              <select
                value={valores.categoria}
                onChange={(e) => alterar('categoria', e.target.value)}
              >
                <option value="">Todas</option>
                {['A', 'B', 'C', 'D'].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </CampoFiltro>

            <CampoFiltro>
              Risco
              <select
                value={valores.risco}
                onChange={(e) => alterar('risco', e.target.value)}
              >
                <option value="">Todos</option>
                <option value="Alto">Alto</option>
                <option value="Médio">Médio</option>
                <option value="Baixo">Baixo</option>
              </select>
            </CampoFiltro>

            <CampoFiltro>
              Código de fechamento
              <select
                value={valores.fechamento}
                onChange={(e) => alterar('fechamento', e.target.value)}
              >
                <option value="">Todos</option>
                {opcoes.fechamentos.map((v) => (
                  <option key={v} value={v}>
                    {rotuloCodigo(v)}
                  </option>
                ))}
              </select>
            </CampoFiltro>

            <CampoFiltro>
              Componente
              <select
                value={valores.componente}
                onChange={(e) => alterar('componente', e.target.value)}
              >
                <option value="">Todos</option>
                {opcoes.componentes.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </CampoFiltro>

            <CampoFiltro>
              Contrato
              <select
                value={valores.contrato}
                onChange={(e) => alterar('contrato', e.target.value)}
              >
                <option value="">Todos</option>
                {opcoes.contratos.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </CampoFiltro>

            <CampoFiltro>
              Origem
              <select
                value={valores.origem}
                onChange={(e) => alterar('origem', e.target.value)}
              >
                <option value="">Todas</option>
                {opcoes.origens.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </CampoFiltro>
          </GradeFiltros>
        </PainelCorpo>
      </PainelCard>

      <Espaco />

      <PainelCard>
        <PainelCabecalho>
          <h3>{escopo === 'aberto' ? '🚨 Fila de chamados' : '📚 Todos os chamados'}</h3>
          <Chip>{dados.total} chamado(s)</Chip>
        </PainelCabecalho>
        <PainelCorpo $semPadding>
          {dados.itens.length === 0 && (
            <Vazio texto="Nenhum chamado encontrado com esses filtros." />
          )}

          {dados.itens.length > 0 && (
            <Tabela>
              <thead>
                <tr>
                  <th>Chamado</th>
                  <th>Cliente / Unidade</th>
                  <th>Problema</th>
                  <th>Categoria</th>
                  <th>Situação</th>
                  <th>Risco</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {dados.itens.map(({ chamado: c, analise }) => (
                  <tr key={c.numero}>
                    <td>#{c.numero}</td>
                    <td>
                      <div className="cliente">{c.cliente}</div>
                      <div className="unidade">
                        {c.unidade} · {c.pais}
                      </div>
                    </td>
                    <td>
                      {c.problema}{' '}
                      {c.passageiroPreso && <Chip variante="alto">Passageiro preso</Chip>}{' '}
                      {c.emRevisao && <Chip variante="medio">Em revisão</Chip>}
                    </td>
                    <td>
                      <Chip>Categoria {c.categoria}</Chip>
                    </td>
                    <td>
                      {c.status === 'Ativo' ? (
                        <>
                          <Chip variante="rosa">{c.subStatus || 'Aberto'}</Chip>{' '}
                          {formatarTempo(c.minutosAberto)}
                        </>
                      ) : (
                        <>
                          <Chip>Resolvido</Chip> {rotuloCodigo(c.codigoFechamento)}
                        </>
                      )}
                    </td>
                    <td>
                      <Chip variante={varianteRisco(analise.risco.nivel)}>
                        {analise.risco.nivel}
                      </Chip>
                    </td>
                    <td>
                      <BotaoSecundario $pequeno onClick={() => setNumeroAberto(c.numero)}>
                        Analisar
                      </BotaoSecundario>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Tabela>
          )}

          {dados.total > 0 && (
            <Paginacao>
              <TextoSuave>
                Mostrando {(dados.pagina - 1) * dados.tamanho + 1}–
                {Math.min(dados.pagina * dados.tamanho, dados.total)} de {dados.total}
              </TextoSuave>
              <div className="controles">
                <BotaoSecundario
                  $pequeno
                  disabled={dados.pagina <= 1}
                  onClick={() => irParaPagina(dados.pagina - 1)}
                >
                  Anterior
                </BotaoSecundario>
                <span>
                  Página {dados.pagina} de {dados.paginas}
                </span>
                <BotaoSecundario
                  $pequeno
                  disabled={dados.pagina >= dados.paginas}
                  onClick={() => irParaPagina(dados.pagina + 1)}
                >
                  Próxima
                </BotaoSecundario>
              </div>
            </Paginacao>
          )}
        </PainelCorpo>
      </PainelCard>

      <Espaco />
      <TextoSuave $pequeno>
        Base sintética com 97 ocorrências, estruturada com as mesmas 46 colunas
        compartilhadas pela OTIS. O motor de similaridade roda no navegador.
      </TextoSuave>

      {numeroAberto && (
        <ModalAnalise
          numero={numeroAberto}
          aoFechar={() => setNumeroAberto(null)}
        />
      )}
    </Layout>
  );
}
