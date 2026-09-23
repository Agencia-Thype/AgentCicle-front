import React, { useEffect, useState } from "react";
import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { Asset } from "expo-asset";

import type { EstadoKegel } from "../screens/Kegel/kegel.types";

/**
 * Lunia sincronizada com o motor do exercício.
 *
 * O quadro não vem de um timer próprio: vem do progresso da fase, calculado
 * pelo mesmo relógio que controla o cronômetro. Enquanto houver uma única
 * fonte de tempo, é impossível a mascote dessincronizar do exercício.
 *
 * A primeira versão trocava de quadro em degraus e parecia slideshow: numa
 * contração de 4 segundos com 3 quadros, cada um ficava mais de um segundo
 * parado. Aqui os quadros são interpolados — dois vizinhos ficam sobrepostos e
 * a opacidade do de cima é a fração do progresso entre eles. O resultado é
 * movimento contínuo, e funciona igual numa fase de 1,5s ou de 9s.
 */

const FRAMES = {
  neutra: [
    require("../assets/01 Neutra/Lunia Neutra_01.png"),
    require("../assets/01 Neutra/Lunia Neutra_02.png"),
    require("../assets/01 Neutra/Lunia Neutra_03.png"),
    require("../assets/01 Neutra/Lunia Neutra_04.png"),
  ],
  esforco: [
    require("../assets/02 Esforco/Lunia Esforco_01.png"),
    require("../assets/02 Esforco/Lunia Esforco_02.png"),
    require("../assets/02 Esforco/Lunia Esforco_03.png"),
  ],
  forte: [
    require("../assets/03 Forte/Lunia Forte_02.png"),
    require("../assets/03 Forte/Lunia Forte_Pico.png"),
  ],
  relaxando: [
    require("../assets/04 Relaxando/Lunia Relaxando_01.png"),
    require("../assets/04 Relaxando/Lunia Relaxando_02.png"),
    require("../assets/04 Relaxando/Lunia Relaxando_03.png"),
    require("../assets/04 Relaxando/Lunia Relaxando_04.png"),
  ],
  beijo: [
    require("../assets/05 Beijo/Lunia Beijo_01.png"),
    require("../assets/05 Beijo/Lunia Beijo_02.png"),
    require("../assets/05 Beijo/Lunia Beijo_03.png"),
  ],
} as const;

/** Cada estado do motor tem sua sequência. */
const SEQUENCIA_POR_ESTADO: Record<EstadoKegel, keyof typeof FRAMES> = {
  prepare: "neutra",
  contract: "esforco",
  hold: "esforco",
  boost: "forte",
  release: "relaxando",
  rest: "neutra",
  complete: "beijo",
};

/**
 * Estados em que o quadro acompanha o progresso da fase. Descanso e preparação
 * não são esforço: ali ela apenas respira, num laço suave.
 */
const GUIADOS_POR_PROGRESSO = new Set<EstadoKegel>(["contract", "boost", "release"]);

/** Proporção real dos quadros: 534 x 399. */
const PROPORCAO = 534 / 399;

/** Ritmo do laço de respiração (preparação, descanso e beijo). */
const INTERVALO_LOOP_MS = 220;

let preloadDisparado = false;

/** Carrega os 18 quadros de uma vez para não piscar na primeira troca. */
export function precarregarLunia(): void {
  if (preloadDisparado) return;
  preloadDisparado = true;

  Asset.loadAsync(Object.values(FRAMES).flat()).catch(() => {
    preloadDisparado = false;
  });
}

interface LuniaAnimadaProps {
  estado: EstadoKegel;
  /** Andamento da fase, de 0 a 1, vindo do motor. */
  progresso: number;
  pausado?: boolean;
  /** Largura em pixels; a altura sai da proporção dos quadros. */
  largura?: number;
  style?: StyleProp<ViewStyle>;
}

export default function LuniaAnimada({
  estado,
  progresso,
  pausado = false,
  largura = 132,
  style,
}: LuniaAnimadaProps) {
  const quadros = FRAMES[SEQUENCIA_POR_ESTADO[estado]];
  const guiado = GUIADOS_POR_PROGRESSO.has(estado);
  const [passoDoLoop, setPassoDoLoop] = useState(0);

  useEffect(() => {
    precarregarLunia();
  }, []);

  useEffect(() => {
    setPassoDoLoop(0);
  }, [estado]);

  useEffect(() => {
    if (guiado || pausado || quadros.length < 2) return;

    const id = setInterval(() => {
      setPassoDoLoop((atual) => {
        // O beijo é comemoração: avança uma vez e segura o último quadro.
        if (estado === "complete") return Math.min(atual + 1, quadros.length - 1);
        return atual + 1;
      });
    }, INTERVALO_LOOP_MS);

    return () => clearInterval(id);
  }, [estado, guiado, pausado, quadros.length]);

  // Posição contínua dentro da sequência.
  let posicao: number;
  if (estado === "contract") {
    // A contração percorre os três graus de esforço durante todo o tempo da
    // fase. A parte decimal é usada abaixo numa fusão curta entre os quadros.
    const andamento = Math.min(1, Math.max(0, progresso));
    posicao = andamento * (quadros.length - 1);
  } else if (estado === "hold" || estado === "boost") {
    // Sustentação e pico devem parecer posições mantidas: imagem firme e
    // nítida, sem ficar pulsando enquanto a usuária segura a musculatura.
    posicao = quadros.length - 1;
  } else if (estado === "release") {
    // Relaxar é uma sequência legível de quatro expressões. Cada quadro ocupa
    // uma parte proporcional da duração vinda do backend e é exibido inteiro,
    // sem crossfade, para não criar o efeito de imagem dupla.
    const andamento = Math.min(1, Math.max(0, progresso));
    posicao = andamento * (quadros.length - 1);
  } else if (guiado) {
    // Apenas duas poses por fase. O crossfade contínuo cria um movimento sutil
    // mesmo em contrações muito curtas, sem parecer um slideshow acelerado.
    const andamentoSuave = Math.min(1, Math.max(0, progresso));
    posicao = andamentoSuave * (quadros.length - 1);
  } else if (estado === "complete") {
    posicao = Math.min(passoDoLoop, quadros.length - 1);
  } else {
    // Vai-e-volta: com 3 ou 4 quadros, voltar do último ao primeiro salta.
    const ciclo = (quadros.length - 1) * 2;
    const fase = passoDoLoop % ciclo;
    posicao = fase < quadros.length ? fase : ciclo - fase;
  }

  const base = Math.min(quadros.length - 1, Math.floor(posicao));
  const proximo = Math.min(quadros.length - 1, base + 1);
  const misturaCrua = posicao - base;
  // A contração conserva cada grau nítido e faz uma troca curta. No relaxamento
  // a fusão ocupa todo o intervalo entre os quatro quadros, recuperando o
  // movimento longo e delicado de desaceleração.
  const progressoDaFusao = estado === "contract"
    ? Math.min(1, Math.max(0, (misturaCrua - 0.72) / 0.28))
    : misturaCrua;
  const mistura = progressoDaFusao * progressoDaFusao * (3 - 2 * progressoDaFusao);

  const altura = Math.round(largura / PROPORCAO);
  const dimensoes = { width: largura, height: altura };
  const andamento = Math.min(1, Math.max(0, progresso));
  const escalaMovimento =
    estado === "contract"
      ? 0.94 + andamento * 0.06
      : estado === "release"
        ? 1 - andamento * 0.06
        : 1;
  const movimentoGuiado = estado === "contract" || estado === "release";

  return (
    <View
      style={[
        dimensoes,
        movimentoGuiado && { transform: [{ scale: escalaMovimento }] },
        style,
      ]}
    >
      <Image source={quadros[base]} resizeMode="contain" style={[styles.quadro, dimensoes]} />
      {proximo !== base && (
        <Image
          source={quadros[proximo]}
          resizeMode="contain"
          style={[styles.quadro, styles.sobreposto, dimensoes, { opacity: mistura }]}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  quadro: {
    maxWidth: "100%",
  },
  sobreposto: {
    position: "absolute",
    top: 0,
    left: 0,
  },
});
