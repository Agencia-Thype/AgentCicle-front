import type { EstadoKegel, EtapaKegel, ExercicioKegel } from "./kegel.types";

/**
 * Achata um exercício do protocolo numa linha do tempo linear de etapas.
 *
 * A tela e o motor não precisam saber que existem séries dentro de blocos
 * dentro de repetições: percorrem uma lista. Cada etapa carrega os contadores
 * (série X de Y, repetição A de B) só para exibição.
 *
 * Nenhuma duração é inventada aqui. Todas vêm do protocolo, exceto a
 * preparação inicial — que é tempo de interface para a usuária se posicionar,
 * não tempo terapêutico.
 */

/** Contagem regressiva antes de começar. Interface, não protocolo. */
export const PREPARACAO_MS = 3000;

function estadoDaFase(tipo: string): EstadoKegel {
  if (tipo === "contracao_forte") return "boost";
  if (tipo === "manter") return "hold";
  if (tipo.includes("contracao")) return "contract";
  if (tipo === "soltar") return "release";
  if (tipo === "relaxamento") return "release";
  return "prepare";
}

export function montarLinhaDoTempo(exercicio: ExercicioKegel): EtapaKegel[] {
  const etapas: EtapaKegel[] = [];

  const totalSeries = Math.max(1, exercicio.series || 1);
  const blocos = exercicio.instrucoes ?? [];
  const totalBlocos = blocos.length;

  const contadoresIniciais = {
    serie: 1,
    totalSeries,
    bloco: 1,
    totalBlocos,
    repeticao: 1,
    totalRepeticoes: blocos[0]?.repeticoes ?? 1,
  };

  etapas.push({
    estado: "prepare",
    duracaoMs: PREPARACAO_MS,
    rotulo: "Prepare-se",
    ...contadoresIniciais,
  });

  for (let serie = 1; serie <= totalSeries; serie++) {
    blocos.forEach((blocoAtual, indiceBloco) => {
      const totalRepeticoes = Math.max(1, blocoAtual.repeticoes || 1);

      for (let repeticao = 1; repeticao <= totalRepeticoes; repeticao++) {
        blocoAtual.fases.forEach((fase) => {
          etapas.push({
            estado: estadoDaFase(fase.tipo),
            duracaoMs: Math.round((fase.duracao_segundos || 0) * 1000),
            rotulo: fase.instrucao,
            serie,
            totalSeries,
            bloco: indiceBloco + 1,
            totalBlocos,
            repeticao,
            totalRepeticoes,
          });
        });
      }
    });

    // Descanso entre séries, também definido pelo protocolo. Não há descanso
    // depois da última série: ali o exercício acabou.
    const ehUltimaSerie = serie === totalSeries;
    if (!ehUltimaSerie && exercicio.descanso_segundos > 0) {
      etapas.push({
        estado: "rest",
        duracaoMs: exercicio.descanso_segundos * 1000,
        rotulo: "Descanse",
        serie,
        totalSeries,
        bloco: totalBlocos,
        totalBlocos,
        repeticao: blocos[totalBlocos - 1]?.repeticoes ?? 1,
        totalRepeticoes: blocos[totalBlocos - 1]?.repeticoes ?? 1,
      });
    }
  }

  return etapas;
}

/** Soma total do exercício, útil para mostrar quanto falta no geral. */
export function duracaoTotalMs(etapas: EtapaKegel[]): number {
  return etapas.reduce((total, etapa) => total + etapa.duracaoMs, 0);
}
