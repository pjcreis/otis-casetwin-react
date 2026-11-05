import styled, { useTheme } from 'styled-components';

import { TextoSuave } from './ui';

const Svg = styled.svg`
  width: 100%;
  max-width: 300px;
  display: block;
  margin: 8px auto 0;
`;

const CENTRO_X = 130;
const CENTRO_Y = 100;
const RAIO_MAX = 74;

export function MapaProximidade({ unidade, tecnicos }) {
  const tema = useTheme();

  if (!tecnicos || tecnicos.length === 0) {
    return (
      <TextoSuave $pequeno>
        Sem técnico livre ou em deslocamento nas proximidades agora.
      </TextoSuave>
    );
  }

  const maiorDistancia = Math.max(...tecnicos.map((t) => t.distanciaKm), 1);
  const passo = 360 / Math.max(tecnicos.length, 3);

  const pontos = tecnicos.map((t, i) => {
    const angulo = ((-90 + i * passo) * Math.PI) / 180;
    const raio = (t.distanciaKm / maiorDistancia) * RAIO_MAX + 20;
    return {
      ...t,
      x: CENTRO_X + raio * Math.cos(angulo),
      y: CENTRO_Y + raio * Math.sin(angulo),
      primeiroNome: t.nome.split(' ')[0].split(',')[0],
      cor: t.status === 'Livre' ? tema.cores.statusLivre : tema.cores.statusDeslocamento,
    };
  });

  return (
    <Svg viewBox="0 0 260 190" role="img" aria-label="Mapa de proximidade dos técnicos">
      <circle
        cx={CENTRO_X}
        cy={CENTRO_Y}
        r={RAIO_MAX + 20}
        fill="none"
        stroke={tema.cores.borda}
      />

      {pontos.map((p) => (
        <g key={p.nome}>
          <line
            x1={CENTRO_X}
            y1={CENTRO_Y}
            x2={p.x}
            y2={p.y}
            stroke={tema.cores.borda}
            strokeDasharray="3,3"
          />
          <circle cx={p.x} cy={p.y} r={7} fill={p.cor} stroke="#fff" strokeWidth={1.5} />
          <text
            x={p.x}
            y={p.y - 12}
            textAnchor="middle"
            fontSize={10}
            fontWeight={600}
            fill={tema.cores.texto}
          >
            {p.primeiroNome}
          </text>
          <text
            x={p.x}
            y={p.y + 20}
            textAnchor="middle"
            fontSize={9.5}
            fill={tema.cores.textoSuave}
          >
            {p.distanciaKm} km
          </text>
        </g>
      ))}

      <circle
        cx={CENTRO_X}
        cy={CENTRO_Y}
        r={8}
        fill={tema.cores.rosa}
        stroke="#fff"
        strokeWidth={2}
      />
      <text
        x={CENTRO_X}
        y={CENTRO_Y + 24}
        textAnchor="middle"
        fontSize={10}
        fontWeight={700}
        fill={tema.cores.navy}
      >
        {unidade}
      </text>
    </Svg>
  );
}
