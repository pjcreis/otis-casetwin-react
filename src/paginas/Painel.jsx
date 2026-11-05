import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { Layout } from '../componentes/Layout';
import { ModalAnalise } from '../componentes/ModalAnalise';
import {
  BotaoSecundario,
  Chip,
  PainelCabecalho,
  PainelCard,
  PainelCorpo,
  Rotulo,
  TextoSuave,
  Vazio,
  varianteRisco,
} from '../componentes/ui';
import { calcularIndicadores, consultarChamados, opcoesFiltro } from '../dominio/consultas';
import { montarInsights } from '../dominio/insights';
import { useBase } from '../estado/BaseContext';

const Faixa = styled.div`
  background: linear-gradient(
    155deg,
    ${({ theme }) => theme.cores.navy},
    ${({ theme }) => theme.cores.navy2}
  );
  border-radius: ${({ theme }) => theme.raio};
  padding: 28px 8px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);

  @media (max-width: ${({ theme }) => theme.quebra.mobile}) {
    grid-template-columns: repeat(2, 1fr);
    gap: 18px;
  }
`;

const Indicador = styled.button`
  text-align: center;
  padding: 0 12px;
  border: none;
  border-left: 1px solid rgba(255, 255, 255, 0.15);
  background: transparent;
  border-radius: 4px;
  transition: background 0.15s ease;

  &:first-child {
    border-left: none;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.06);
  }

  .numero {
    font-family: ${({ theme }) => theme.fontes.titulo};
    font-size: 2.1rem;
    font-weight: 700;
    color: ${({ $destaque, theme }) => ($destaque ? theme.cores.rosa : '#fff')};
    line-height: 1;
    margin-bottom: 8px;
  }

  .regua {
    width: 32px;
    height: 2px;
    background: ${({ theme }) => theme.cores.rosa};
    margin: 0 auto 8px;
  }

  .rotulo {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.65);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
`;

const Dica = styled.p`
  text-align: center;
  font-size: 11.5px;
  color: ${({ theme }) => theme.cores.textoSuave};
  margin: 8px 0 20px;
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

const GradeInsights = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(290px, 1fr));
  gap: 26px;
`;

const Barra = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  margin-bottom: 12px;
  background: transparent;
  border: none;
  padding: 2px 4px;
  border-radius: 4px;
  text-align: left;

  &:hover {
    background: ${({ theme }) => theme.cores.rosaSuave};

    .rotulo {
      color: ${({ theme }) => theme.cores.rosa};
    }
  }

  .rotulo {
    width: 128px;
    flex-shrink: 0;
    font-size: 12.5px;
    font-weight: 600;
    color: ${({ theme }) => theme.cores.textoSuave};
  }

  .trilho {
    flex: 1;
    height: 10px;
    background: ${({ theme }) => theme.cores.superficie2};
    border-radius: 6px;
    overflow: hidden;
  }

  .preenchimento {
    /* display block e necessario: como span, o elemento seria inline
       e o height nao teria efeito, deixando a barra vazia. */
    display: block;
    height: 100%;
    border-radius: 6px;
    background: ${({ $alerta, theme }) =>
      $alerta ? theme.cores.riscoAlto : theme.cores.navy2};
    width: ${({ $largura }) => $largura}%;
  }

  .valor {
    width: 52px;
    flex-shrink: 0;
    text-align: right;
    font-size: 12.5px;
    font-weight: 700;
    color: ${({ theme }) => theme.cores.navy};
  }
`;

const Espaco = styled.div`
  height: 20px;
`;

const SeletorPais = styled.select`
  padding: 6px 10px;
  border: 1px solid ${({ theme }) => theme.cores.borda};
  border-radius: 4px;
  font-size: 13px;
  background: #fff;
`;

function formatarTempo(minutos) {
  if (minutos == null) return '–';
  if (minutos < 60) return `${minutos} min`;
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return resto === 0 ? `${horas}h` : `${horas}h${resto}min`;
}

function BlocoInsight({ bloco, aoClicar }) {
  const maior = Math.max(...bloco.itens.map((i) => i.valor), 1);

  return (
    <div>
      <Rotulo>{bloco.titulo}</Rotulo>
      {bloco.itens.length === 0 && (
        <TextoSuave $pequeno>Sem dados nesse recorte.</TextoSuave>
      )}
      {bloco.itens.map((item) => {
        const largura =
          bloco.formato === 'percentual'
            ? item.valor
            : Math.round((item.valor / maior) * 100);
        return (
          <Barra
            key={item.rotulo}
            $largura={largura}
            $alerta={bloco.formato === 'percentual' && item.valor >= 20}
            onClick={() => aoClicar(item.filtro)}
            title="Ver os chamados por trás deste número"
          >
            <span className="rotulo">{item.rotulo}</span>
            <span className="trilho">
              <span className="preenchimento" />
            </span>
            <span className="valor">
              {item.valor}
              {bloco.formato === 'percentual' ? '%' : item.sufixo || ''}
            </span>
          </Barra>
        );
      })}
      {bloco.nota && <TextoSuave $pequeno>{bloco.nota}</TextoSuave>}
    </div>
  );
}

export function Painel() {
  const navegar = useNavigate();
  const { fila, historico, tecnicos, todos } = useBase();
  const [pais, setPais] = useState('');
  const [numeroAberto, setNumeroAberto] = useState(null);

  const opcoes = useMemo(() => opcoesFiltro(todos), [todos]);

  const filaRecorte = useMemo(
    () => (pais ? fila.filter((c) => c.pais === pais) : fila),
    [fila, pais]
  );
  const historicoRecorte = useMemo(
    () => (pais ? historico.filter((c) => c.pais === pais) : historico),
    [historico, pais]
  );

  const i = useMemo(
    () => calcularIndicadores(filaRecorte, historicoRecorte),
    [filaRecorte, historicoRecorte]
  );
  const blocos = useMemo(() => montarInsights(historicoRecorte), [historicoRecorte]);

  // O motor roda no navegador, então memorizar evita refazer a busca
  // no histórico a cada redesenho da página.
  const urgentes = useMemo(
    () =>
      consultarChamados({
        fila: filaRecorte,
        historico: historicoRecorte.length ? historicoRecorte : historico,
        tecnicos,
        filtros: { escopo: 'aberto' },
        tamanho: 6,
      }),
    [filaRecorte, historicoRecorte, historico, tecnicos]
  );

  function irParaChamados(filtroExtra = {}) {
    const parametros = new URLSearchParams({ escopo: 'todos', ...filtroExtra });
    if (pais) parametros.set('pais', pais);
    navegar(`/chamados?${parametros.toString()}`);
  }

  const seletor = (
    <SeletorPais value={pais} onChange={(e) => setPais(e.target.value)}>
      <option value="">Todos os países</option>
      {opcoes.paises.map((p) => (
        <option key={p} value={p}>
          {p}
        </option>
      ))}
    </SeletorPais>
  );

  return (
    <Layout titulo="Painel" acaoTopo={seletor}>
      {i && (
        <>
          <Faixa>
            <Indicador onClick={() => irParaChamados({ escopo: 'aberto' })}>
              <div className="numero">{i.abertos}</div>
              <div className="regua" />
              <div className="rotulo">Chamados abertos</div>
            </Indicador>
            <Indicador
              onClick={() => irParaChamados({ escopo: 'aberto', situacao: 'Aguardando' })}
            >
              <div className="numero">{i.aguardando}</div>
              <div className="regua" />
              <div className="rotulo">Aguardando atendimento</div>
            </Indicador>
            <Indicador
              onClick={() =>
                irParaChamados({ escopo: 'aberto', situacao: 'Em atendimento' })
              }
            >
              <div className="numero">{i.emAtendimento}</div>
              <div className="regua" />
              <div className="rotulo">Em atendimento</div>
            </Indicador>
            <Indicador
              $destaque
              onClick={() => irParaChamados({ escopo: 'aberto', preso: 'sim' })}
            >
              <div className="numero">{i.passageiroPreso}</div>
              <div className="regua" />
              <div className="rotulo">Passageiro preso agora</div>
            </Indicador>
          </Faixa>
          <Dica>Clique em um indicador para ver a lista filtrada em Chamados.</Dica>
        </>
      )}

      <PainelCard>
        <PainelCabecalho>
          <h3>🚨 Chamados mais urgentes</h3>
          <Chip variante="rosa" as="button" onClick={() => irParaChamados()}>
            Ver todos
          </Chip>
        </PainelCabecalho>
        <PainelCorpo $semPadding>
          {urgentes.itens.length === 0 && (
            <Vazio texto="Nenhum chamado aberto nesse recorte." />
          )}
          {urgentes.itens.length > 0 && (
            <Tabela>
              <thead>
                <tr>
                  <th>Chamado</th>
                  <th>Cliente / Unidade</th>
                  <th>Problema</th>
                  <th>Marca</th>
                  <th>Situação</th>
                  <th>Risco</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {urgentes.itens.map(({ chamado: c, analise }) => (
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
                      {c.passageiroPreso && <Chip variante="alto">Passageiro preso</Chip>}
                    </td>
                    <td>{c.fabricante}</td>
                    <td>
                      <Chip variante="rosa">{c.subStatus || 'Aberto'}</Chip>{' '}
                      {formatarTempo(c.minutosAberto)}
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
        </PainelCorpo>
      </PainelCard>

      <Espaco />

      <PainelCard>
        <PainelCabecalho>
          <h3>📊 Insights do histórico</h3>
          {i && <Chip>{i.totalHistorico} chamados resolvidos</Chip>}
        </PainelCabecalho>
        <PainelCorpo>
          {i && (
            <div style={{ display: 'flex', gap: 32, marginBottom: 22, flexWrap: 'wrap' }}>
              <div>
                <Rotulo>Tempo médio de chegada</Rotulo>
                <strong style={{ fontSize: '1.3rem' }}>
                  {i.taMedio != null ? `${i.taMedio} min` : '–'}
                </strong>
              </div>
              <div>
                <Rotulo>Taxa de não localização</Rotulo>
                <strong style={{ fontSize: '1.3rem' }}>
                  {i.taxaNaoLocalizacao != null ? `${i.taxaNaoLocalizacao}%` : '–'}
                </strong>
              </div>
            </div>
          )}

          <GradeInsights>
            {blocos.map((bloco) => (
              <BlocoInsight key={bloco.id} bloco={bloco} aoClicar={irParaChamados} />
            ))}
          </GradeInsights>
        </PainelCorpo>
      </PainelCard>

      {numeroAberto && (
        <ModalAnalise
          numero={numeroAberto}
          aoFechar={() => setNumeroAberto(null)}
        />
      )}
    </Layout>
  );
}
