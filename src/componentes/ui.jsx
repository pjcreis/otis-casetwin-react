import styled, { css } from 'styled-components';

export const Chip = styled.span`
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  line-height: 1.4;
  white-space: nowrap;

  ${({ variante = 'neutro', theme }) => {
    const mapa = {
      neutro: css`
        background: ${theme.cores.superficie2};
        color: ${theme.cores.textoSuave};
      `,
      rosa: css`
        background: ${theme.cores.rosaSuave};
        color: ${theme.cores.rosa};
      `,
      alto: css`
        background: #fbe4e1;
        color: ${theme.cores.riscoAlto};
      `,
      medio: css`
        background: #f8ecd2;
        color: #8a6410;
      `,
      baixo: css`
        background: #e0f2e7;
        color: ${theme.cores.riscoBaixo};
      `,
    };
    return mapa[variante] || mapa.neutro;
  }}
`;

export function varianteRisco(nivel) {
  if (nivel === 'Alto') return 'alto';
  if (nivel === 'Médio') return 'medio';
  return 'baixo';
}

export const PainelCard = styled.section`
  background: ${({ theme }) => theme.cores.superficie};
  border: 1px solid ${({ theme }) => theme.cores.borda};
  border-radius: ${({ theme }) => theme.raio};
  overflow: hidden;
`;

export const PainelCabecalho = styled.header`
  padding: 14px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.cores.borda};
  border-left: 4px solid ${({ theme }) => theme.cores.rosa};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;

  h3 {
    font-family: ${({ theme }) => theme.fontes.corpo};
    font-size: 13px;
    font-weight: 700;
    color: ${({ theme }) => theme.cores.navy};
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }
`;

export const PainelCorpo = styled.div`
  padding: ${({ $semPadding }) => ($semPadding ? '0' : '16px 20px')};
`;

const botaoBase = css`
  font-weight: 700;
  border-radius: 4px;
  padding: ${({ $pequeno }) => ($pequeno ? '5px 12px' : '9px 18px')};
  font-size: ${({ $pequeno }) => ($pequeno ? '12.5px' : '14px')};
  transition: background 0.15s ease, color 0.15s ease;

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

export const BotaoPrimario = styled.button`
  ${botaoBase};
  background: ${({ theme }) => theme.cores.rosa};
  color: #fff;
  border: none;

  &:hover:not(:disabled) {
    background: #c01046;
  }
`;

export const BotaoSecundario = styled.button`
  ${botaoBase};
  background: transparent;
  color: ${({ theme }) => theme.cores.navy};
  border: 1px solid ${({ theme }) => theme.cores.navy};

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.cores.navy};
    color: #fff;
  }
`;

export const TextoSuave = styled.p`
  color: ${({ theme }) => theme.cores.textoSuave};
  font-size: ${({ $pequeno }) => ($pequeno ? '11.5px' : '13.5px')};
`;

export const Rotulo = styled.span`
  display: block;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${({ theme }) => theme.cores.textoSuave};
  font-weight: 600;
  margin-bottom: 4px;
`;

const CaixaEstado = styled.div`
  padding: 40px 20px;
  text-align: center;
  color: ${({ theme }) => theme.cores.textoSuave};
  font-size: 13.5px;
`;

export function Carregando({ texto = 'Carregando...' }) {
  return <CaixaEstado>{texto}</CaixaEstado>;
}

export function Vazio({ texto }) {
  return <CaixaEstado>{texto}</CaixaEstado>;
}

const CaixaErro = styled(CaixaEstado)`
  color: ${({ theme }) => theme.cores.riscoAlto};

  code {
    display: block;
    margin-top: 8px;
    font-size: 11.5px;
    opacity: 0.8;
  }
`;

export function Erro({ mensagem }) {
  return (
    <CaixaErro>
      Não foi possível carregar os dados. Verifique se a API está no ar.
      <code>{mensagem}</code>
    </CaixaErro>
  );
}
