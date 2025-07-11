import { Platform, NativeModules } from "react-native";

/**
 * Utilidade para ajudar a diagnosticar e resolver problemas de conexão
 * entre o aplicativo em emuladores/dispositivos e o servidor backend
 */
class ConexaoHelper {
  /**
   * Lista de possíveis URLs de servidor com base em diferentes ambientes
   */
  static urlsCandidatas = [
    // Android Emulator -> host machine
    "http://10.0.2.2:8000",
    // iOS Simulator -> host machine
    "http://localhost:8000",
    // Genymotion
    "http://10.0.3.2:8000",
    // Comum para dispositivos físicos na mesma rede
    "http://192.168.0.1:8000",
    "http://192.168.1.1:8000",
    "http://192.168.1.2:8000",
  ];

  /**
   * Tenta obter o IP do dispositivo (útil para debug)
   */
  static async obterIPDoDispositivo() {
    try {
      if (Platform.OS === "android") {
        return new Promise((resolve) => {
          NativeModules.RNDeviceInfo.getIpAddress()
            .then((ip: string) => {
              resolve(ip);
            })
            .catch(() => {
              resolve("Desconhecido");
            });
        });
      }
      return "Não disponível para esta plataforma";
    } catch (error) {
      console.error("Erro ao obter IP:", error);
      return "Erro ao obter IP";
    }
  }

  /**
   * Testa uma série de URLs para encontrar aquela que responde corretamente
   */
  static async encontrarURLValida(
    urls = this.urlsCandidatas
  ): Promise<string | null> {
    console.log("Testando URLs candidatas...");

    for (const url of urls) {
      try {
        console.log(`Testando ${url}...`);
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2000); // 2 segundos de timeout

        const resposta = await fetch(`${url}/login`, {
          method: "OPTIONS",
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (resposta.status < 500) {
          // Aceitamos qualquer resposta que não seja erro 5xx
          console.log(
            `URL válida encontrada: ${url} (status: ${resposta.status})`
          );
          return url;
        }
      } catch (error) {
        console.log(`Falha ao testar ${url}: ${error}`);
      }
    }

    console.log("Nenhuma URL válida encontrada");
    return null;
  }
}

export default ConexaoHelper;
