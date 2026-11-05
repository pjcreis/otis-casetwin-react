import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

const Shell = styled.div`
  display: flex;
  min-height: 100vh;
`;

const Lateral = styled.aside`
  width: ${({ $recolhida }) => ($recolhida ? '68px' : '230px')};
  flex-shrink: 0;
  background: ${({ theme }) => theme.cores.navy};
  display: flex;
  flex-direction: column;
  transition: width 0.2s ease;

  @media (max-width: ${({ theme }) => theme.quebra.tablet}) {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    z-index: 1050;
    width: 230px;
    transform: translateX(${({ $abertaMobile }) => ($abertaMobile ? '0' : '-100%')});
    transition: transform 0.2s ease;
  }
`;

const Marca = styled.div`
  padding: 18px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  color: #fff;
  font-family: ${({ theme }) => theme.fontes.titulo};
  font-weight: 700;
  font-size: 1.05rem;
  white-space: nowrap;
  overflow: hidden;

  span {
    color: ${({ theme }) => theme.cores.rosa};
  }
`;

const Menu = styled.nav`
  padding: 12px 0;
  flex: 1;

  a {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 12px 20px;
    color: rgba(255, 255, 255, 0.72);
    text-decoration: none;
    font-weight: 600;
    font-size: 14px;
    border-left: 3px solid transparent;
    white-space: nowrap;
    overflow: hidden;

    &:hover {
      background: rgba(255, 255, 255, 0.06);
      color: #fff;
    }

    &.active {
      background: rgba(255, 255, 255, 0.08);
      color: #fff;
      border-left-color: ${({ theme }) => theme.cores.rosa};
    }
  }

  .icone {
    width: 20px;
    text-align: center;
    flex-shrink: 0;
    font-size: 15px;
  }
`;

const Conteudo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
`;

const Topo = styled.header`
  background: ${({ theme }) => theme.cores.superficie};
  border-bottom: 3px solid ${({ theme }) => theme.cores.rosa};
  padding: 14px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: ${({ theme }) => theme.sombra};

  h1 {
    font-size: 1.3rem;
    font-weight: 700;
    color: ${({ theme }) => theme.cores.navy};
  }
`;

const AreaAcao = styled.div`
  margin-left: auto;
`;

const BotaoMenu = styled.button`
  background: transparent;
  border: none;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.cores.navy};
  line-height: 1;
  padding: 4px 8px;

  &:hover {
    color: ${({ theme }) => theme.cores.rosa};
  }
`;

const Corpo = styled.main`
  padding: 24px;
  flex: 1;
`;

const Fundo = styled.div`
  display: ${({ $visivel }) => ($visivel ? 'block' : 'none')};
  position: fixed;
  inset: 0;
  background: rgba(10, 20, 35, 0.5);
  z-index: 1040;
`;

const CHAVE_RECOLHIDA = 'casetwin-sidebar-recolhida';

function estadoInicialRecolhida() {
  try {
    return localStorage.getItem(CHAVE_RECOLHIDA) === '1' && window.innerWidth > 860;
  } catch {
    return false;
  }
}

export function Layout({ titulo, acaoTopo, children }) {
  const [recolhida, setRecolhida] = useState(estadoInicialRecolhida);
  const [abertaMobile, setAbertaMobile] = useState(false);

  function alternar() {
    if (window.innerWidth <= 860) {
      setAbertaMobile((v) => !v);
      return;
    }
    setRecolhida((v) => {
      const novo = !v;
      try {
        localStorage.setItem(CHAVE_RECOLHIDA, novo ? '1' : '0');
      } catch {
      }
      return novo;
    });
  }

  return (
    <>
      <Fundo $visivel={abertaMobile} onClick={() => setAbertaMobile(false)} />
      <Shell>
        <Lateral $recolhida={recolhida} $abertaMobile={abertaMobile}>
          <Marca>
            {recolhida ? (
              'CT'
            ) : (
              <>
                OTIS <span>CaseTwin</span>
              </>
            )}
          </Marca>
          <Menu onClick={() => setAbertaMobile(false)}>
            <NavLink to="/" end>
              <span className="icone">📊</span>
              {!recolhida && <span>Painel</span>}
            </NavLink>
            <NavLink to="/chamados">
              <span className="icone">🚨</span>
              {!recolhida && <span>Chamados</span>}
            </NavLink>
          </Menu>
        </Lateral>

        <Conteudo>
          <Topo>
            <BotaoMenu onClick={alternar} aria-label="Abrir ou recolher menu">
              ☰
            </BotaoMenu>
            <h1>{titulo}</h1>
            {acaoTopo && <AreaAcao>{acaoTopo}</AreaAcao>}
          </Topo>
          <Corpo>{children}</Corpo>
        </Conteudo>
      </Shell>
    </>
  );
}
