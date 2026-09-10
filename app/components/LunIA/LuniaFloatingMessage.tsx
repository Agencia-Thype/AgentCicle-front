import React, { useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
  Image,
  PanResponder,
  useWindowDimensions,
} from "react-native";
import { getMensagemIA } from "../../services/iaService";
import { palette } from "../../theme/colors";

// Constantes para o componente
const MENSAGEM_DISPLAY_TIME = 6000; // 6 segundos
const INTERVALO_ENTRE_MENSAGENS = 180000; // 3 minutos
const MAX_TENTATIVAS = 3;
const AVATAR_SIZE = 68;
const SCREEN_MARGIN = 8;
const POSICAO_LUNIA_KEY = "@AgentCicle:lunia_position";
const MENSAGEM_PADRAO = "Como posso ajudar você hoje?";

interface Props {
  userName: string;
  onAbrirAssistente: () => void;
  mostrarAssistente?: boolean;
  bottomOffset?: number;
}

export default function FloatingLuniaCoach({
  userName,
  onAbrirAssistente,
  mostrarAssistente,
  bottomOffset = 78,
}: Props) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [mensagem, setMensagem] = useState("");
  const [visivel, setVisivel] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const tentativasRef = useRef(0);
  const ultimaMensagemRef = useRef(MENSAGEM_PADRAO);
  const ultimaTentativaRef = useRef(0);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const posicao = useRef(new Animated.ValueXY()).current;
  const posicaoAtualRef = useRef({ x: 0, y: 0 });
  const inicioArrasteRef = useRef({ x: 0, y: 0 });
  const arrastouRef = useRef(false);
  const limitesRef = useRef({ maxX: 0, maxY: 0 });

  const limitarPosicao = (x: number, y: number) => ({
    x: Math.max(SCREEN_MARGIN, Math.min(x, limitesRef.current.maxX)),
    y: Math.max(SCREEN_MARGIN, Math.min(y, limitesRef.current.maxY)),
  });

  const aplicarPosicao = (x: number, y: number) => {
    const limitada = limitarPosicao(x, y);
    posicaoAtualRef.current = limitada;
    posicao.setValue(limitada);
    return limitada;
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dx) > 4 || Math.abs(gesture.dy) > 4,
      onPanResponderGrant: () => {
        inicioArrasteRef.current = posicaoAtualRef.current;
        arrastouRef.current = false;
      },
      onPanResponderMove: (_, gesture) => {
        arrastouRef.current = true;
        aplicarPosicao(
          inicioArrasteRef.current.x + gesture.dx,
          inicioArrasteRef.current.y + gesture.dy
        );
      },
      onPanResponderRelease: async () => {
        const final = aplicarPosicao(posicaoAtualRef.current.x, posicaoAtualRef.current.y);
        await AsyncStorage.setItem(POSICAO_LUNIA_KEY, JSON.stringify(final));
      },
      onPanResponderTerminate: () => {
        aplicarPosicao(posicaoAtualRef.current.x, posicaoAtualRef.current.y);
      },
    })
  ).current;

  const nomeFormatado = userName?.toLowerCase() || "miga";

  useEffect(() => {
    limitesRef.current = {
      maxX: Math.max(SCREEN_MARGIN, screenWidth - AVATAR_SIZE - SCREEN_MARGIN),
      // Durante o arraste, toda a área visível fica disponível. O bottomOffset
      // influencia somente a posição inicial segura, acima do menu inferior.
      maxY: Math.max(SCREEN_MARGIN, screenHeight - AVATAR_SIZE - SCREEN_MARGIN),
    };

    const restaurarPosicao = async () => {
      const salva = await AsyncStorage.getItem(POSICAO_LUNIA_KEY);
      if (salva) {
        try {
          const { x, y } = JSON.parse(salva);
          if (Number.isFinite(x) && Number.isFinite(y)) {
            aplicarPosicao(x, y);
            return;
          }
        } catch {
          // Posição inválida: usa o ponto inicial seguro.
        }
      }
      aplicarPosicao(screenWidth - AVATAR_SIZE - 16, screenHeight - bottomOffset - AVATAR_SIZE);
    };

    restaurarPosicao();
  }, [bottomOffset, screenHeight, screenWidth]);

  // Função que obtém a mensagem da IA usando o serviço iaService
  const buscarMensagemIA = async () => {
    try {
      console.log("[LuniaFloatingMessage] Buscando mensagem de balão da IA");

      // Verificar intervalo mínimo entre tentativas (10 segundos)
      const agora = Date.now();
      if (agora - ultimaTentativaRef.current < 10000) {
        console.log(
          "[LuniaFloatingMessage] Ignorando requisição muito frequente"
        );
        // Retorna true para permitir exibição mesmo sem nova consulta
        return true;
      }

      ultimaTentativaRef.current = agora;

      // Usar o serviço iaService para obter a mensagem
      // O serviço já implementa cache e fallback para mensagens padrão
      const mensagemIA = await getMensagemIA("balao");

      // Formatar a mensagem substituindo placeholders
      let msgFormatada = mensagemIA.replace(/{nome}/gi, nomeFormatado);

      // Limitar tamanho da mensagem
      if (msgFormatada.length > 120) {
        msgFormatada = msgFormatada.substring(0, 117) + "...";
      }

      // Armazenar mensagem para reutilização em caso de falhas futuras
      ultimaMensagemRef.current = msgFormatada;

      setMensagem(msgFormatada);
      tentativasRef.current = 0; // Reset das tentativas em caso de sucesso

      return true;
    } catch (err) {
      console.error("[LuniaFloatingMessage] Erro ao buscar balão da IA", err);
      tentativasRef.current++;

      // Mesmo em caso de erro, exibimos a última mensagem bem-sucedida
      // ou a mensagem padrão se não tivermos nenhuma
      setMensagem(ultimaMensagemRef.current);

      if (tentativasRef.current >= MAX_TENTATIVAS) {
        console.log(
          "[LuniaFloatingMessage] Máximo de tentativas atingido, usando mensagem em cache"
        );
      }

      // Retornamos true para exibir a mensagem de fallback
      return true;
    }
  };

  // Função para exibir o balão com a mensagem
  const exibirMensagem = async () => {
    // Se o assistente já está visível ou já estamos mostrando uma mensagem, não faz nada
    if (mostrarAssistente || visivel) {
      return;
    }

    const mensagemObtida = await buscarMensagemIA();

    if (mensagemObtida) {
      setVisivel(true);

      // Animar entrada
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }).start();

      // Configurar saída automática após tempo definido
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start(() => setVisivel(false));
      }, MENSAGEM_DISPLAY_TIME);
    }
  };

  // Efeito para configurar o intervalo de exibição de mensagens
  useEffect(() => {
    // Limpar qualquer intervalo existente
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
    }

    // Preparar mensagem padrão formatada para uso imediato caso necessário
    ultimaMensagemRef.current = MENSAGEM_PADRAO.replace(
      /{nome}/gi,
      nomeFormatado
    );

    // Pré-carregar a mensagem no estado
    setMensagem(ultimaMensagemRef.current);

    // Mostrar primeira mensagem após um pequeno delay
    const initialDelayId = setTimeout(() => {
      if (!mostrarAssistente) {
        exibirMensagem();
      }
    }, 5000);

    // Configurar intervalo regular
    intervalIdRef.current = setInterval(() => {
      if (!mostrarAssistente) {
        exibirMensagem();
      }
    }, INTERVALO_ENTRE_MENSAGENS);

    return () => {
      clearTimeout(initialDelayId);
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, [mostrarAssistente, nomeFormatado]);

  if (mostrarAssistente) return null;

  return (
    <Animated.View
      style={[styles.wrapper, { transform: posicao.getTranslateTransform() }]}
      {...panResponder.panHandlers}
    >
      {visivel && (
        <Animated.View style={[styles.balaoWrapper, { opacity: fadeAnim }]}>
          <View style={styles.balao}>
            <Text style={styles.texto}>
              {mensagem || ultimaMensagemRef.current || MENSAGEM_PADRAO}
            </Text>
            <View style={styles.triangulo} />
          </View>
        </Animated.View>
      )}

      <TouchableOpacity
        onPress={() => {
          if (!arrastouRef.current) onAbrirAssistente();
          arrastouRef.current = false;
        }}
        style={styles.botao}
      >
        <Image source={require("../../assets/logo.png")} style={styles.logo} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    top: 0,
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    alignItems: "flex-end",
    zIndex: 999,
    elevation: 20,
  },
  balaoWrapper: {
    position: "absolute",
    bottom: AVATAR_SIZE,
    right: 0,
    width: 220,
  },
  balao: {
    backgroundColor: palette.bgSoft,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: 220,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    position: "relative",
  },
  texto: {
    fontSize: 14,
    color: palette.textPrimary,
    fontStyle: "italic",
    textAlign: "left",
    lineHeight: 20,
  },
  triangulo: {
    position: "absolute",
    bottom: -6,
    right: 20,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: palette.bgSoft,
  },
  botao: {
    backgroundColor: "transparent",
    borderRadius: 100,
    padding: 4,
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 60,
    height: 60,
    resizeMode: "contain",
  },
});
