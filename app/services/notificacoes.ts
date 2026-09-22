import { Alert, Platform } from "react-native";
import { isRunningInExpoGo } from "expo";
import type * as ExpoNotifications from "expo-notifications";

import {
  PREFIXO_LEMBRETE,
  planejarLembretes,
  type Lembrete,
} from "../screens/Rotina/rotinaLembretes";
import { dataLocalISO } from "../screens/Rotina/rotinaFormato";
import { rotinaService } from "./rotinaService";

/**
 * Lembretes locais da rotina (remédios, suplementos e água). Nada passa por
 * servidor de push: o próprio aparelho agenda as notificações.
 */

type Notifications = typeof ExpoNotifications;

const CANAL_ANDROID = "rotina";

export type ResultadoSincronizacao = "ok" | "sem_permissao" | "indisponivel" | "erro";

let modulo: Notifications | null | undefined;
let handlerConfigurado = false;
let sincronizadoNaSessao = false;
let avisouIndisponivel = false;

/**
 * O expo-notifications só é carregado quando vai ser usado. No Expo Go do
 * Android, importar o pacote já lança erro (o registro de push roda na
 * importação e o Expo Go não tem mais push desde o SDK 53) e derrubava o app
 * na abertura. Lá os lembretes ficam desligados; num development build ou na
 * versão de loja funcionam normalmente.
 */
function notificacoes(): Notifications | null {
  if (modulo !== undefined) return modulo;
  if (Platform.OS === "web" || (Platform.OS === "android" && isRunningInExpoGo())) {
    modulo = null;
    return modulo;
  }
  try {
    modulo = require("expo-notifications") as Notifications;
  } catch (error) {
    console.warn("expo-notifications indisponível:", error);
    modulo = null;
  }
  return modulo;
}

/** Mostra o lembrete mesmo com o app aberto. Chamado uma vez, na raiz do app. */
export function configurarNotificacoes(): void {
  const Notifications = notificacoes();
  if (handlerConfigurado || !Notifications) return;
  handlerConfigurado = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

async function garantirPermissao(Notifications: Notifications, pedir: boolean): Promise<boolean> {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(CANAL_ANDROID, {
      name: "Lembretes da rotina",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 150, 250],
    });
  }

  const atual = await Notifications.getPermissionsAsync();
  if (atual.granted) return true;
  if (!pedir || !atual.canAskAgain) return false;
  return (await Notifications.requestPermissionsAsync()).granted;
}

function gatilho(
  Notifications: Notifications,
  lembrete: Lembrete
): ExpoNotifications.NotificationTriggerInput {
  const { gatilho: g } = lembrete;
  if (g.tipo === "semanal") {
    return {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      // No expo-notifications 1 é domingo; na rotina, 0.
      weekday: g.diaSemana + 1,
      hour: g.hora,
      minute: g.minuto,
      channelId: CANAL_ANDROID,
    };
  }
  return {
    type: Notifications.SchedulableTriggerInputTypes.DAILY,
    hour: g.hora,
    minute: g.minuto,
    channelId: CANAL_ANDROID,
  };
}

/**
 * Refaz os lembretes a partir do que está salvo no servidor: cancela só os
 * agendamentos da rotina e agenda o plano de novo.
 *
 * @param pedirPermissao pede a permissão se ainda não foi dada. Só vale quando
 * a usuária acabou de ligar um lembrete - pedir do nada, ao abrir o app, soa
 * invasivo e costuma ser negado.
 */
export async function sincronizarLembretesRotina({
  pedirPermissao = false,
}: { pedirPermissao?: boolean } = {}): Promise<ResultadoSincronizacao> {
  const Notifications = notificacoes();
  if (!Notifications) return "indisponivel";

  try {
    const [itens, agua] = await Promise.all([rotinaService.itens(), rotinaService.agua()]);
    const plano = planejarLembretes(itens, agua, dataLocalISO());
    const permitido = plano.length > 0 && (await garantirPermissao(Notifications, pedirPermissao));

    const agendados = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(
      agendados
        .filter((notificacao) => notificacao.identifier.startsWith(PREFIXO_LEMBRETE))
        .map((notificacao) => Notifications.cancelScheduledNotificationAsync(notificacao.identifier))
    );

    if (plano.length === 0) return "ok";
    if (!permitido) return "sem_permissao";

    for (const lembrete of plano) {
      await Notifications.scheduleNotificationAsync({
        identifier: lembrete.id,
        content: { title: lembrete.titulo, body: lembrete.corpo, data: { origem: "rotina" } },
        trigger: gatilho(Notifications, lembrete),
      });
    }
    return "ok";
  } catch (error) {
    console.warn("Não foi possível agendar os lembretes da rotina:", error);
    return "erro";
  }
}

/** Sincroniza e, se a usuária pediu lembrete mas ele não pode ser agendado, avisa. */
export async function sincronizarLembretesComAviso(pedirPermissao: boolean): Promise<void> {
  const resultado = await sincronizarLembretesRotina({ pedirPermissao });
  if (!pedirPermissao) return;

  if (resultado === "sem_permissao") {
    Alert.alert(
      "Notificações desligadas",
      "Para receber os lembretes, permita as notificações do Cíclica nas configurações do celular."
    );
  } else if (resultado === "indisponivel" && Platform.OS !== "web" && !avisouIndisponivel) {
    // Só acontece no Expo Go do Android, ou seja, em desenvolvimento.
    avisouIndisponivel = true;
    Alert.alert(
      "Lembretes indisponíveis no Expo Go",
      "O item foi salvo, mas as notificações só funcionam num development build ou na versão instalada da loja."
    );
  }
}

/**
 * Uma vez por abertura do app: início e fim dos itens só entram no agendamento
 * quando o plano é recalculado.
 */
export async function sincronizarLembretesNaAbertura(): Promise<void> {
  if (sincronizadoNaSessao) return;
  sincronizadoNaSessao = true;
  await sincronizarLembretesRotina();
}
