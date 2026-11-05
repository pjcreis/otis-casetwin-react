# OTIS CaseTwin, versão React

Motor de similaridade sobre o histórico de ocorrências em elevadores.
Quando um chamado entra, o sistema encontra os casos gêmeos já
resolvidos e recomenda causa provável, técnico adequado e risco de
segunda visita.

| Camada | Tecnologias |
|---|---|
| Interface | React, Vite, styled-components, React Router |
| Lógica | JavaScript puro (motor de similaridade e agregações) |
| Dados | Embutidos no próprio código (`src/dados/base.js`) |

---

## Como rodar

```bash
npm install
npm run dev
```

Acesse <http://localhost:5173>.

Para gerar a versão de produção:

```bash
npm run build
```

A pasta `dist/` fica pronta para publicar.

---

## Estrutura

```
src/
  paginas/
    Painel.jsx        indicadores, urgentes e os seis insights
    Chamados.jsx      lista com filtros e paginação
  componentes/
    Layout.jsx        sidebar recolhível e topo
    ModalAnalise.jsx  janela de análise do chamado
    MapaProximidade.jsx  mapa SVG dos técnicos próximos
    ui.jsx            chips, cards, botões
  dominio/
    motor.js          motor de similaridade
    insights.js       agregações dos gráficos
    consultas.js      filtros, ordenação e paginação
  dados/
    base.js           histórico, fila e técnicos
  estado/
    BaseContext.jsx   estado compartilhado e ações do supervisor
  estilos/
    tema.js           paleta e tipografia
    GlobalStyle.js    estilos globais
```

## Sobre os dados

A OTIS compartilhou uma base de exemplo com poucos registros. Para o
motor ter o que comparar, ela foi expandida para 97 ocorrências
sintéticas, respeitando a mesma estrutura de 46 colunas da planilha
original. Os critérios de similaridade (marca do elevador e tipo de
problema como os de maior peso) foram validados na mentoria com a
OTIS. Os pesos exatos ainda precisam de calibração com o volume real
de dados da empresa.

As coordenadas do mapa de proximidade são aproximadas a partir da
cidade da filial. 