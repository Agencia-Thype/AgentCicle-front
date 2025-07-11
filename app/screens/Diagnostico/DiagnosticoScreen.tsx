import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { api } from "../../services/api";
import {
  verificarServidorOnline,
  verificarConexaoInternet,
} from "../../services/healthCheck";
import ConexaoHelper from "../../utils/conexaoHelper";
import { useNavigation } from "@react-navigation/native";
import { globalStyles, themeColors } from "../../theme/global";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../../contexts/AuthContext";

// Função para decodificar base64 em React Native
const base64ToUtf8 = (base64: string): string => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  let str = "";
  let i = 0;
  let bs = 0;
  let bc = 0;
  let b0, b1, b2, b3;
  let c0, c1, c2, c3;

  while (i < base64.length) {
    c0 = chars.indexOf(base64.charAt(i++));
    c1 = chars.indexOf(base64.charAt(i++));
    c2 = chars.indexOf(base64.charAt(i++));
    c3 = chars.indexOf(base64.charAt(i++));

    b0 = ((c0 & 0x3f) << 2) | ((c1 & 0x30) >> 4);
    b1 = ((c1 & 0x0f) << 4) | ((c2 & 0x3c) >> 2);
    b2 = ((c2 & 0x03) << 6) | (c3 & 0x3f);

    if (c2 === 64) {
      str += String.fromCharCode(b0);
    } else if (c3 === 64) {
      str += String.fromCharCode(b0, b1);
    } else {
      str += String.fromCharCode(b0, b1, b2);
    }
  }

  return str;
};

export default function DiagnosticoScreen() {
  const navigation = useNavigation();
  const { checkAuthState } = useAuth();
  const [testando, setTestando] = useState(false);
  const [resultados, setResultados] = useState<
    { teste: string; resultado: string; detalhes?: string }[]
  >([]);

  const adicionarResultado = (
    teste: string,
    resultado: string,
    detalhes?: string
  ) => {
    setResultados((r) => [...r, { teste, resultado, detalhes }]);
  };

  const limparResultados = () => {
    setResultados([]);
  };

  const testarConexaoInternet = async () => {
    try {
      adicionarResultado("Internet", "Testando...", "");
      const online = await verificarConexaoInternet();
      adicionarResultado(
        "Internet",
        online ? "Conectado ✅" : "Desconectado ❌",
        online ? "Google.com respondeu" : "Não foi possível acessar Google.com"
      );
      return online;
    } catch (erro) {
      adicionarResultado("Internet", "Erro no teste ❌", JSON.stringify(erro));
      return false;
    }
  };

  const testarServidorAPI = async () => {
    try {
      adicionarResultado("Servidor API", "Testando...", "");
      const online = await verificarServidorOnline();
      adicionarResultado(
        "Servidor API",
        online ? "Online ✅" : "Offline ❌",
        `URL: ${api.defaults.baseURL}`
      );
      return online;
    } catch (erro) {
      adicionarResultado(
        "Servidor API",
        "Erro no teste ❌",
        JSON.stringify(erro)
      );
      return false;
    }
  };

  const testarEndpoints = async () => {
    if (!(await testarServidorAPI())) return;

    const endpoints = ["/login", "/register", "/"];

    for (const endpoint of endpoints) {
      try {
        adicionarResultado(`Endpoint ${endpoint}`, "Testando...", "");

        const response = await fetch(`${api.defaults.baseURL}${endpoint}`, {
          method: "OPTIONS",
          headers: { Accept: "application/json" },
        });

        adicionarResultado(
          `Endpoint ${endpoint}`,
          `Resposta ${response.status} ✅`,
          `Status: ${response.status} ${response.statusText}`
        );
      } catch (erro) {
        adicionarResultado(
          `Endpoint ${endpoint}`,
          "Erro no teste ❌",
          erro instanceof Error ? erro.message : "Erro desconhecido"
        );
      }
    }
  };

  const testarEndpointsIA = async () => {
    if (!(await testarServidorAPI())) return;

    const endpoints = [
      "/ia/mensagem-entrada?tipo=balao",
      "/ia/mensagem-entrada?tipo=boas_vindas",
      "/ia/conversa",
    ];

    adicionarResultado("Endpoints IA", "Testando...", "");

    let sucessos = 0;
    let falhas = 0;
    let detalhes = "";
    let streamErrors = 0;
    let timeoutErrors = 0;
    let networkErrors = 0;

    for (const endpoint of endpoints) {
      try {
        // Configurar timeout mais longo para endpoints de IA (podem ser mais lentos)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000); // Aumentado para 20 segundos

        detalhes += `Testando ${endpoint}... `;

        // Para o endpoint /ia/conversa, precisamos fazer POST com dados
        const method = endpoint === "/ia/conversa" ? "POST" : "GET";
        const body =
          endpoint === "/ia/conversa"
            ? JSON.stringify({ mensagem: "Olá, teste de diagnóstico" })
            : undefined;

        // Definir headers com tipo adequado para evitar erro de TypeScript
        const headers: Record<string, string> = {
          Accept: "application/json",
          Authorization: `Bearer ${await AsyncStorage.getItem("auth_token")}`,
        };

        // Adicionar Content-Type apenas para POST
        if (method === "POST") {
          headers["Content-Type"] = "application/json";
        }

        // Fazer 3 tentativas com delay entre elas
        let tentativa = 0;
        let sucesso = false;

        while (tentativa < 3 && !sucesso) {
          tentativa++;

          try {
            // Cada tentativa tem seu próprio controller
            const tentativaController = new AbortController();
            const tentativaTimeoutId = setTimeout(
              () => tentativaController.abort(),
              8000
            ); // 8s por tentativa

            detalhes += tentativa > 1 ? `(tentativa ${tentativa}) ` : "";

            const response = await fetch(`${api.defaults.baseURL}${endpoint}`, {
              method,
              headers,
              body,
              signal: tentativaController.signal,
            });

            clearTimeout(tentativaTimeoutId);

            if (response.ok) {
              // Se for bem sucedido, marcar sucesso e sair do loop
              detalhes += `✅ OK (${response.status})\n`;
              sucessos++;
              sucesso = true;
            } else {
              if (tentativa === 3) {
                detalhes += `❌ Falha (${response.status})\n`;
                falhas++;
              } else {
                // Esperar antes da próxima tentativa
                await new Promise((resolve) => setTimeout(resolve, 1000));
              }
            }
          } catch (tentativaErro) {
            if (tentativaErro instanceof Error) {
              const mensagemErro = tentativaErro.message;

              // No último erro, registrar os detalhes
              if (tentativa === 3) {
                if (mensagemErro.includes("abort")) {
                  detalhes += `⏱️ Timeout (>8s)\n`;
                  timeoutErrors++;
                } else if (mensagemErro.includes("unexpected end")) {
                  detalhes += `🔄 Conexão interrompida (stream) - Comum em endpoints IA\n`;
                  streamErrors++;
                } else if (mensagemErro.includes("Network request failed")) {
                  detalhes += `📶 Falha de rede\n`;
                  networkErrors++;
                } else {
                  detalhes += `❌ ${mensagemErro}\n`;
                }
                falhas++;
              } else {
                // Esperar antes da próxima tentativa
                await new Promise((resolve) => setTimeout(resolve, 1000));
              }
            }
          }
        }

        clearTimeout(timeoutId);
      } catch (erro) {
        // Este catch é apenas para erros fora do loop de tentativas
        detalhes += `❗ Erro não tratado: ${erro instanceof Error ? erro.message : "Desconhecido"}\n`;
        falhas++;
      }
    }

    // Análise de resultados específica para endpoints de IA
    let statusMensagem = "";
    if (falhas === 0) {
      statusMensagem = "Todos funcionando ✅";
    } else if (streamErrors > 0) {
      statusMensagem = `${sucessos}/${endpoints.length} OK - Erros de Stream ⚠️`;
      detalhes +=
        "\n⚠️ Erros 'unexpected end of stream' são comuns em endpoints de IA " +
        "e geralmente indicam que o servidor cortou a conexão durante o processamento. " +
        "Esse comportamento é tratado no iaService.ts com retentativas e timeout.";
    } else if (timeoutErrors > 0) {
      statusMensagem = `${sucessos}/${endpoints.length} OK - Timeouts ⚠️`;
    } else {
      statusMensagem = `${sucessos}/${endpoints.length} OK ⚠️`;
    }

    // Resultado final do teste
    adicionarResultado("Endpoints IA", statusMensagem, detalhes);
  };

  const testarToken = async () => {
    try {
      adicionarResultado("Token Auth", "Testando...", "");
      const token = await AsyncStorage.getItem("auth_token");

      if (token) {
        // Verificar se o token é válido analisando o JWT
        try {
          // Obter a parte do payload do JWT (segunda parte)
          const base64Url = token.split(".")[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

          // Em React Native, atob não está disponível, usando alternativa
          const decodedPayload = base64ToUtf8(base64);
          const payload = JSON.parse(decodedPayload);

          // Verificar se o token possui uma data de expiração
          if (!payload.exp) {
            adicionarResultado(
              "Token Auth",
              "Token existe mas sem data de expiração ⚠️",
              `Token: ${token.substring(0, 15)}...`
            );
            return;
          }

          // Verificar se o token está expirado (exp é em segundos)
          const expiry = payload.exp * 1000; // converter para milissegundos
          const isExpired = Date.now() >= expiry;

          if (isExpired) {
            adicionarResultado(
              "Token Auth",
              "Token expirado ⚠️",
              `Token expirou em: ${new Date(expiry).toLocaleString()}`
            );
          } else {
            const timeRemaining = Math.floor(
              (expiry - Date.now()) / (1000 * 60 * 60)
            );
            adicionarResultado(
              "Token Auth",
              "Token válido ✅",
              `Token: ${token.substring(0, 15)}... (válido por mais ${timeRemaining} horas)`
            );
          }
        } catch (jwtError) {
          adicionarResultado(
            "Token Auth",
            "Token existe mas formato inválido ⚠️",
            `Token: ${token.substring(0, 15)}...`
          );
        }
      } else {
        adicionarResultado(
          "Token Auth",
          "Token não existe ❌",
          "Faça login para gerar um token"
        );
      }
    } catch (erro) {
      adicionarResultado(
        "Token Auth",
        "Erro no teste ❌",
        erro instanceof Error ? erro.message : "Erro desconhecido"
      );
    }
  };

  const testarURLsAlternativas = async () => {
    try {
      adicionarResultado("URLs Alternativas", "Procurando...", "");

      // Procurar por uma URL alternativa que funcione
      const urlValida = await ConexaoHelper.encontrarURLValida();

      if (urlValida) {
        adicionarResultado(
          "URLs Alternativas",
          "URL funcional encontrada ✅",
          `Tente usar esta URL no api.ts: ${urlValida}`
        );
      } else {
        adicionarResultado(
          "URLs Alternativas",
          "Nenhuma URL funcional ❌",
          "Nenhuma URL respondeu corretamente"
        );
      }
    } catch (erro) {
      adicionarResultado(
        "URLs Alternativas",
        "Erro no teste ❌",
        erro instanceof Error ? erro.message : "Erro desconhecido"
      );
    }
  };

  const testarErrosRecentes = async () => {
    try {
      adicionarResultado("Erros Recentes", "Verificando...", "");

      // Buscar erros 500 recentes
      const erros500 = await AsyncStorage.getItem("@AppErrors:500");

      if (erros500) {
        const listaErros = JSON.parse(erros500) as Array<{
          url: string;
          method: string;
          timestamp: string;
          errorDetail: any;
        }>;

        if (listaErros.length > 0) {
          // Analisar os endpoints com erro
          const endpointsComErro = listaErros.map((e) => e.url);
          const endpointsMaisComuns = [...new Set(endpointsComErro)]
            .map((endpoint: string) => {
              const count = endpointsComErro.filter(
                (e) => e === endpoint
              ).length;
              return { endpoint, count };
            })
            .sort((a, b) => b.count - a.count);

          // Mostrar resumo dos erros
          const ultimoErroData = new Date(
            listaErros[listaErros.length - 1].timestamp
          ).toLocaleString();

          adicionarResultado(
            "Erros Recentes",
            `Encontrados ${listaErros.length} erros 500 ⚠️`,
            `Último erro: ${ultimoErroData}\n` +
              `Endpoints mais problemáticos:\n` +
              endpointsMaisComuns
                .map((e) => `- ${e.endpoint}: ${e.count} erros`)
                .join("\n")
          );
        } else {
          adicionarResultado(
            "Erros Recentes",
            "Nenhum erro 500 registrado ✅",
            "O aplicativo não registrou erros de servidor recentemente."
          );
        }
      } else {
        adicionarResultado(
          "Erros Recentes",
          "Nenhum erro 500 registrado ✅",
          "O aplicativo não registrou erros de servidor recentemente."
        );
      }
    } catch (erro) {
      adicionarResultado(
        "Erros Recentes",
        "Erro ao verificar ❌",
        erro instanceof Error ? erro.message : "Erro desconhecido"
      );
    }
  };

  const verificarCacheDados = async () => {
    try {
      adicionarResultado("Cache de Dados", "Verificando...", "");

      // Verificar cache do perfil
      const perfilCache = await AsyncStorage.getItem(
        "@AgentCicle:perfil_cache"
      );
      const faseCache = await AsyncStorage.getItem(
        "@AgentCicle:fase_ciclo_cache"
      );
      const faseDetalhesCache = await AsyncStorage.getItem(
        "@AgentCicle:fase_detalhes_cache"
      );

      let detalhes = "";
      let status = "Não há cache de dados ⚠️";

      if (perfilCache) {
        const cache = JSON.parse(perfilCache);
        const cacheAge =
          new Date().getTime() - new Date(cache.timestamp).getTime();
        const cacheAgeHours = Math.floor(cacheAge / (1000 * 60 * 60));
        detalhes += `✓ Perfil em cache (${cacheAgeHours}h atrás)\n`;
        status = "Dados em cache disponíveis ✅";
      } else {
        detalhes += `✗ Perfil não está em cache\n`;
      }

      if (faseCache) {
        const cache = JSON.parse(faseCache);
        const cacheAge =
          new Date().getTime() - new Date(cache.timestamp).getTime();
        const cacheAgeHours = Math.floor(cacheAge / (1000 * 60 * 60));
        detalhes += `✓ Fase do ciclo em cache (${cacheAgeHours}h atrás)\n`;
      } else {
        detalhes += `✗ Fase do ciclo não está em cache\n`;
      }

      if (faseDetalhesCache) {
        const cache = JSON.parse(faseDetalhesCache);
        const cacheAge =
          new Date().getTime() - new Date(cache.timestamp).getTime();
        const cacheAgeHours = Math.floor(cacheAge / (1000 * 60 * 60));
        detalhes += `✓ Detalhes da fase em cache (${cacheAgeHours}h atrás)`;
      } else {
        detalhes += `✗ Detalhes da fase não estão em cache`;
      }

      adicionarResultado("Cache de Dados", status, detalhes);
    } catch (erro) {
      adicionarResultado(
        "Cache de Dados",
        "Erro ao verificar ❌",
        erro instanceof Error ? erro.message : "Erro desconhecido"
      );
    }
  };

  const verificarCacheIA = async () => {
    try {
      adicionarResultado("Cache de IA", "Verificando...", "");

      // Verificar cache das mensagens da IA
      const cacheMensagemBalao = await AsyncStorage.getItem(
        "@AgentCicle:ia_mensagem_balao"
      );
      const cacheMensagemBoasVindas = await AsyncStorage.getItem(
        "@AgentCicle:ia_mensagem_boas_vindas"
      );

      let detalhes = "";
      let status = "Não há cache de mensagens de IA ⚠️";

      if (cacheMensagemBalao) {
        const cache = JSON.parse(cacheMensagemBalao);
        const cacheAge =
          new Date().getTime() - new Date(cache.timestamp).getTime();
        const cacheAgeHours = Math.floor(cacheAge / (1000 * 60 * 60));
        detalhes += `✓ Mensagem de balão em cache (${cacheAgeHours}h atrás)\n`;
        status = "Dados em cache disponíveis ✅";
      } else {
        detalhes += `✗ Mensagem de balão não está em cache\n`;
      }

      if (cacheMensagemBoasVindas) {
        const cache = JSON.parse(cacheMensagemBoasVindas);
        const cacheAge =
          new Date().getTime() - new Date(cache.timestamp).getTime();
        const cacheAgeHours = Math.floor(cacheAge / (1000 * 60 * 60));
        detalhes += `✓ Mensagem de boas-vindas em cache (${cacheAgeHours}h atrás)`;
        status = "Dados em cache disponíveis ✅";
      } else {
        detalhes += `✗ Mensagem de boas-vindas não está em cache`;
      }

      adicionarResultado("Cache de IA", status, detalhes);
    } catch (erro) {
      adicionarResultado(
        "Cache de IA",
        "Erro ao verificar ❌",
        erro instanceof Error ? erro.message : "Erro desconhecido"
      );
    }
  };

  const limparCache = async () => {
    setTestando(true);
    adicionarResultado("Limpeza de Cache", "Iniciando limpeza...", "");

    try {
      // Lista de chaves para limpar
      const cachesParaLimpar = [
        "@AgentCicle:perfil_cache",
        "@AgentCicle:fase_ciclo_cache",
        "@AgentCicle:fase_detalhes_cache",
        "@AgentCicle:fase_atual",
        "@AgentCicle:mensagem_fase",
        "@AgentCicle:ultima_sincronizacao",
        "@AgentCicle:notificacao_fase",
        "@AppErrors:500",
        "@AgentCicle:ia_mensagem_balao",
        "@AgentCicle:ia_mensagem_boas_vindas",
      ];

      // Remover cada item de cache
      for (const key of cachesParaLimpar) {
        await AsyncStorage.removeItem(key);
      }

      adicionarResultado(
        "Limpeza de Cache",
        "Cache limpo com sucesso ✅",
        "Todos os dados de cache foram removidos. Considere reiniciar o aplicativo."
      );
    } catch (erro) {
      adicionarResultado(
        "Limpeza de Cache",
        "Erro ao limpar cache ❌",
        erro instanceof Error ? erro.message : "Erro desconhecido"
      );
    } finally {
      setTestando(false);
    }
  };

  const limparCacheIA = async () => {
    setTestando(true);
    adicionarResultado("Limpeza de Cache IA", "Iniciando limpeza...", "");

    try {
      // Lista de chaves para limpar (apenas IA)
      const cachesParaLimpar = [
        "@AgentCicle:ia_mensagem_balao",
        "@AgentCicle:ia_mensagem_boas_vindas",
      ];

      // Remover cada item de cache
      for (const key of cachesParaLimpar) {
        await AsyncStorage.removeItem(key);
      }

      adicionarResultado(
        "Limpeza de Cache IA",
        "Cache de IA limpo com sucesso ✅",
        "Todas as mensagens armazenadas em cache da IA foram removidas."
      );
    } catch (erro) {
      adicionarResultado(
        "Limpeza de Cache IA",
        "Erro ao limpar cache ❌",
        erro instanceof Error ? erro.message : "Erro desconhecido"
      );
    } finally {
      setTestando(false);
    }
  };

  const executarDiagnostico = async () => {
    setTestando(true);
    limparResultados();

    // Primeiro verificar o estado de autenticação para garantir um token válido
    await checkAuthState();

    await testarConexaoInternet();
    await testarServidorAPI();
    await testarEndpoints();
    await testarEndpointsIA();
    await testarToken();
    await testarURLsAlternativas();
    await testarErrosRecentes();
    await verificarCacheDados();
    await verificarCacheIA();

    setTestando(false);
  };

  useEffect(() => {
    executarDiagnostico();
  }, []);

  return (
    <LinearGradient
      colors={themeColors.gradient}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={globalStyles.backgroundGradient}
    >
      <View style={styles.container}>
        <Text style={styles.titulo}>Diagnóstico de Conexão</Text>

        <ScrollView style={styles.resultados}>
          {resultados.map((item, index) => (
            <View key={index} style={styles.resultadoItem}>
              <View style={styles.resultadoHeader}>
                <Text style={styles.testeName}>{item.teste}</Text>
                <Text
                  style={[
                    styles.resultado,
                    item.resultado.includes("✅")
                      ? styles.sucesso
                      : item.resultado.includes("❌")
                        ? styles.erro
                        : styles.pendente,
                  ]}
                >
                  {item.resultado}
                </Text>
              </View>
              {item.detalhes && (
                <Text style={styles.detalhes}>{item.detalhes}</Text>
              )}
            </View>
          ))}

          {testando && (
            <View style={styles.carregando}>
              <ActivityIndicator size="large" color="#7EAA92" />
              <Text style={styles.carregandoTexto}>
                Executando diagnóstico...
              </Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.botoesContainer}>
          <TouchableOpacity
            style={styles.botao}
            onPress={executarDiagnostico}
            disabled={testando}
          >
            <Text style={styles.botaoTexto}>
              {testando ? "Testando..." : "Refazer Diagnóstico"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.botao, { backgroundColor: "#E57373" }]}
            onPress={limparCache}
            disabled={testando}
          >
            <Text style={styles.botaoTexto}>Limpar Cache de Dados</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.botao, { backgroundColor: "#FFB74D" }]}
            onPress={limparCacheIA}
            disabled={testando}
          >
            <Text style={[styles.botaoTexto, { color: "#5C3B3B" }]}>
              Limpar Cache da IA
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botaoVoltar}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.botaoTextoVoltar}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 40,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#5C3B3B",
    textAlign: "center",
    marginBottom: 20,
  },
  resultados: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  resultadoItem: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  resultadoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  testeName: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
  },
  resultado: {
    fontWeight: "500",
    fontSize: 14,
  },
  sucesso: {
    color: "#7EAA92",
  },
  erro: {
    color: "#E57373",
  },
  pendente: {
    color: "#FFB74D",
  },
  detalhes: {
    marginTop: 6,
    color: "#666",
    fontSize: 12,
  },
  carregando: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  carregandoTexto: {
    marginTop: 10,
    color: "#5C3B3B",
  },
  botoesContainer: {
    marginTop: 16,
  },
  botao: {
    backgroundColor: "#7EAA92",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  botaoTexto: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  botaoVoltar: {
    backgroundColor: "transparent",
    borderColor: "#5C3B3B",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  botaoTextoVoltar: {
    color: "#5C3B3B",
    fontWeight: "bold",
    fontSize: 16,
  },
});
