import { useEffect, useMemo } from 'react';
import styled from 'styled-components';

import { useBase } from '../estado/BaseContext';
import { analisarChamado } from '../dominio/motor';
import { MapaProximidade } from './MapaProximidade';
import {
  BotaoPrimario,
  BotaoSecundario,
  Chip,
  PainelCabecalho,
  PainelCard,
  PainelCorpo,
  Rotulo,
  TextoSuave,
  varianteRisco,
} from './ui';

const CODIGO_LABEL = {
  RP: 'RP · Reparado',
  AM: 'AM · Pendência',
  NL: 'NL · Não localizado',
  PR: 'PR · Pendente de reparo',
  SB: 'SB · Substituição de peça',
  AJ: 'AJ · Ajuste / regulagem',
  AO: 'AO · Pendente para reparação',
};

export const rotuloCodigo = (codigo) => (codigo ? CODIGO_LABEL[codigo] || codigo : '–');

const Fundo = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(10, 20, 35, 0.55);
  z-index: 1100;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 40px 16px;
  overflow-y: auto;
`;

const Caixa = styled.div`
  background: ${({ theme }) => theme.cores.superficie};
  border-radius: ${({ theme }) => theme.raio};
  width: min(820px, 100%);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
`;

const Cabecalho = styled.header`
  padding: 18px 22px;
  border-bottom: 1px solid ${({ theme }) => theme.cores.borda};
  display: flex;
  justify-content: space-between;
  gap: 16px;

  h2 {
    font-size: 1.15rem;
    color: ${({ theme }) => theme.cores.navy};
  }
`;

const Fechar = styled.button`
  background: transparent;
  border: none;
  font-size: 1.4rem;
  line-height: 1;
  color: ${({ theme }) => theme.cores.textoSuave};

  &:hover {
    color: ${({ theme }) => theme.cores.rosa};
  }
`;

const Corpo = styled.div`
  padding: 22px;
`;

const Rodape = styled.footer`
  padding: 16px 22px;
  border-top: 1px solid ${({ theme }) => theme.cores.borda};
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const FichaGrade = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px 20px;
  margin-bottom: 22px;
`;

const FichaValor = styled.div`
  font-size: 14px;
  font-weight: 600;
`;

const Tabela = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  margin-bottom: 22px;

  th {
    text-align: left;
    padding: 8px 12px;
    background: ${({ theme }) => theme.cores.superficie2};
    font-size: 10.5px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: ${({ theme }) => theme.cores.textoSuave};
    font-weight: 600;
  }

  td {
    padding: 10px 12px;
    border-bottom: 1px solid ${({ theme }) => theme.cores.borda};
  }

  tbody tr:last-child td {
    border-bottom: none;
  }
`;

const ItemRecomendacao = styled.div`
  padding: 14px 0;
  border-bottom: 1px solid ${({ theme }) => theme.cores.borda};

  &:last-child {
    border-bottom: none;
  }
`;

const ValorRecomendacao = styled.div`
  font-size: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

function Ficha({ rotulo, valor }) {
  return (
    <div>
      <Rotulo>{rotulo}</Rotulo>
      <FichaValor>{valor ?? '–'}</FichaValor>
    </div>
  );
}

export function ModalAnalise({ numero, aoFechar }) {
  const { encontrar, historico, tecnicos, reatribuirTecnico, marcarParaRevisao } = useBase();

  const chamado = encontrar(numero);

  const analise = useMemo(
    () => (chamado ? analisarChamado(chamado, historico, tecnicos) : null),
    [chamado, historico, tecnicos]
  );

  useEffect(() => {
    const aoTeclar = (evento) => {
      if (evento.key === 'Escape') aoFechar();
    };
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [aoFechar]);

  const encerrado = chamado && chamado.status !== 'Ativo';
  const maisProximo = analise?.tecnicosPerto?.[0];

  return (
    <Fundo onClick={aoFechar}>
      <Caixa onClick={(e) => e.stopPropagation()}>
        <Cabecalho>
          <div>
            <h2>Chamado #{numero}</h2>
            {chamado && (
              <TextoSuave>
                {chamado.cliente} · {chamado.unidade} · {chamado.problema}
              </TextoSuave>
            )}
          </div>
          <Fechar onClick={aoFechar} aria-label="Fechar">
            ×
          </Fechar>
        </Cabecalho>

        <Corpo>
          {analise && (
            <>
              <Rotulo>Dados do chamado</Rotulo>
              <FichaGrade>
                <Ficha rotulo="País" valor={chamado.pais} />
                <Ficha rotulo="Marca" valor={chamado.fabricante} />
                <Ficha rotulo="Contrato" valor={chamado.contrato} />
                <Ficha rotulo="Categoria" valor={`Categoria ${chamado.categoria}`} />
                <Ficha rotulo="Origem" valor={chamado.origem} />
                <Ficha
                  rotulo="Passageiro preso"
                  valor={chamado.passageiroPreso ? 'Sim' : 'Não'}
                />
              </FichaGrade>

              {encerrado && (
                <>
                  <Rotulo>Desfecho real (chamado encerrado)</Rotulo>
                  <FichaGrade>
                    <Ficha
                      rotulo="Fechamento"
                      valor={rotuloCodigo(chamado.codigoFechamento)}
                    />
                    <Ficha rotulo="Técnico que atendeu" valor={chamado.tecnico} />
                    <Ficha
                      rotulo="Defeito confirmado"
                      valor={
                        chamado.componente && chamado.defeito
                          ? `${chamado.componente} · ${chamado.defeito}`
                          : null
                      }
                    />
                    <Ficha
                      rotulo="Tempo de chegada"
                      valor={chamado.ta != null ? `${chamado.ta} min` : null}
                    />
                    <Ficha
                      rotulo="Tempo de resolução"
                      valor={chamado.tb != null ? `${chamado.tb} min` : null}
                    />
                  </FichaGrade>
                </>
              )}

              <Rotulo>Casos gêmeos no histórico</Rotulo>
              <Tabela>
                <thead>
                  <tr>
                    <th>Chamado</th>
                    <th>Unidade</th>
                    <th>Defeito</th>
                    <th>Técnico</th>
                    <th>Resultado</th>
                    <th>Similaridade</th>
                  </tr>
                </thead>
                <tbody>
                  {analise.casosGemeos.map((g) => (
                    <tr key={g.numero}>
                      <td>#{g.numero}</td>
                      <td>{g.unidade}</td>
                      <td>
                        {g.componente} · {g.defeito}
                      </td>
                      <td>{g.tecnico || '–'}</td>
                      <td>
                        <Chip variante={g.codigoFechamento === 'NL' ? 'alto' : 'baixo'}>
                          {rotuloCodigo(g.codigoFechamento)}
                        </Chip>
                      </td>
                      <td>{g._similaridade}%</td>
                    </tr>
                  ))}
                </tbody>
              </Tabela>

              <PainelCard>
                <PainelCabecalho>
                  <h3>
                    {encerrado
                      ? 'O que o CaseTwin teria recomendado'
                      : 'Recomendação do CaseTwin'}
                  </h3>
                </PainelCabecalho>
                <PainelCorpo>
                  {encerrado && (
                    <ItemRecomendacao>
                      <Rotulo>Como ler</Rotulo>
                      <ValorRecomendacao>
                        Este chamado já foi encerrado. Compare a recomendação abaixo com
                        o desfecho real mostrado acima.
                      </ValorRecomendacao>
                    </ItemRecomendacao>
                  )}

                  <ItemRecomendacao>
                    <Rotulo>Técnico designado pelo despacho automático</Rotulo>
                    <ValorRecomendacao>
                      {chamado.tecnico
                        ? `${chamado.tecnico} (despachado automaticamente pelo sistema)`
                        : 'Sem técnico designado ainda'}
                    </ValorRecomendacao>
                  </ItemRecomendacao>

                  <ItemRecomendacao>
                    <Rotulo>Causa mais provável</Rotulo>
                    <ValorRecomendacao>
                      {analise.causaProvavel
                        ? `${analise.causaProvavel.causa} (${analise.causaProvavel.concordancia} de ${analise.causaProvavel.total} casos parecidos)`
                        : 'Sem histórico suficiente para sugerir'}
                    </ValorRecomendacao>
                  </ItemRecomendacao>

                  <ItemRecomendacao>
                    <Rotulo>Técnico mais próximo</Rotulo>
                    <ValorRecomendacao>
                      {maisProximo
                        ? `${maisProximo.nome} · ${maisProximo.distanciaKm} km (${maisProximo.status.toLowerCase()})`
                        : 'Nenhum técnico livre ou em deslocamento nas proximidades agora'}
                    </ValorRecomendacao>
                  </ItemRecomendacao>

                  <ItemRecomendacao>
                    <Rotulo>Mapa de proximidade (simulado)</Rotulo>
                    <MapaProximidade
                      unidade={chamado.unidade}
                      tecnicos={analise.tecnicosPerto}
                    />
                    <TextoSuave $pequeno>
                      Posição aproximada pela cidade da filial. Não é GPS real do técnico.
                    </TextoSuave>
                  </ItemRecomendacao>

                  <ItemRecomendacao>
                    <Rotulo>Técnico com melhor histórico</Rotulo>
                    <ValorRecomendacao>
                      {analise.tecnicoSugerido
                        ? `${analise.tecnicoSugerido.tecnico} (tempo médio de ${analise.tecnicoSugerido.tempoMedio} min em casos parecidos)`
                        : 'Sem histórico suficiente para sugerir'}
                    </ValorRecomendacao>
                  </ItemRecomendacao>

                  <ItemRecomendacao>
                    <Rotulo>Taxa de não localização</Rotulo>
                    <ValorRecomendacao>
                      <Chip variante={varianteRisco(analise.risco.nivel)}>
                        {analise.risco.nivel}
                      </Chip>
                      {analise.risco.percentual}% dos casos gêmeos fecharam como "não
                      localizado"
                    </ValorRecomendacao>
                  </ItemRecomendacao>

                  <ItemRecomendacao>
                    <Rotulo>Recidiva da unidade</Rotulo>
                    <ValorRecomendacao>
                      {analise.recidiva > 1
                        ? `Essa unidade já registrou ${analise.recidiva} chamados no histórico.`
                        : 'Sem histórico relevante de recidiva para essa unidade.'}
                    </ValorRecomendacao>
                  </ItemRecomendacao>
                </PainelCorpo>
              </PainelCard>
            </>
          )}
        </Corpo>

        {analise && !encerrado && (
          <Rodape>
            <BotaoSecundario onClick={() => marcarParaRevisao(numero)}>
              Marcar para revisão
            </BotaoSecundario>
            <BotaoPrimario onClick={() => reatribuirTecnico(numero)}>
              Reatribuir técnico
            </BotaoPrimario>
          </Rodape>
        )}
      </Caixa>
    </Fundo>
  );
}
