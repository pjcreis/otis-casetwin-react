import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';

import { BaseProvider } from './estado/BaseContext';
import { GlobalStyle } from './estilos/GlobalStyle';
import { tema } from './estilos/tema';
import { Chamados } from './paginas/Chamados';
import { Painel } from './paginas/Painel';

export default function App() {
  return (
    <ThemeProvider theme={tema}>
      <GlobalStyle />
      <BaseProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Painel />} />
            <Route path="/chamados" element={<Chamados />} />
          </Routes>
        </BrowserRouter>
      </BaseProvider>
    </ThemeProvider>
  );
}
