import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: ${({ theme }) => theme.fontes.corpo};
    background: ${({ theme }) => theme.cores.fundo};
    color: ${({ theme }) => theme.cores.texto};
    -webkit-font-smoothing: antialiased;
  }

  h1, h2, h3 { font-family: ${({ theme }) => theme.fontes.titulo}; }

  button { font-family: inherit; cursor: pointer; }
  input, select { font-family: inherit; }
  a { color: inherit; }
`;
