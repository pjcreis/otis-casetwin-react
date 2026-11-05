import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { FILA, HISTORICO, TECNICOS } from '../dados/base';
import { analisarChamado } from '../dominio/motor';

const BaseContext = createContext(null);

export function BaseProvider({ children }) {
  const [fila, setFila] = useState(FILA);

  const encontrar = useCallback(
    (numero) => fila.find((c) => c.numero === numero) || HISTORICO.find((c) => c.numero === numero),
    [fila]
  );

  const atualizar = useCallback((numero, mudancas) => {
    setFila((atual) =>
      atual.map((c) => (c.numero === numero ? { ...c, ...mudancas } : c))
    );
  }, []);

  const reatribuirTecnico = useCallback(
    (numero) => {
      const chamado = fila.find((c) => c.numero === numero);
      if (!chamado) return;

      const analise = analisarChamado(chamado, HISTORICO, TECNICOS);
      const maisProximo = analise.tecnicosPerto[0];
      const novoTecnico = maisProximo
        ? maisProximo.nome
        : analise.tecnicoSugerido?.tecnico;

      if (!novoTecnico) return;
      atualizar(numero, { tecnico: novoTecnico, emRevisao: false });
    },
    [fila, atualizar]
  );

  const marcarParaRevisao = useCallback(
    (numero) => atualizar(numero, { emRevisao: true }),
    [atualizar]
  );

  const valor = useMemo(
    () => ({
      fila,
      historico: HISTORICO,
      tecnicos: TECNICOS,
      todos: [...fila, ...HISTORICO],
      encontrar,
      reatribuirTecnico,
      marcarParaRevisao,
    }),
    [fila, encontrar, reatribuirTecnico, marcarParaRevisao]
  );

  return <BaseContext.Provider value={valor}>{children}</BaseContext.Provider>;
}

export function useBase() {
  const contexto = useContext(BaseContext);
  if (!contexto) {
    throw new Error('useBase precisa estar dentro de <BaseProvider>');
  }
  return contexto;
}
