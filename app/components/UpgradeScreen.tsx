import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { palette, themeColors } from "../theme/colors";
import {
  PRODUTOS,
  planosDisponiveis,
  restaurarCompras,
  type PlanoAssinatura,
} from "../services/compras";

interface UpgradeScreenProps {
  /** Recebe o plano escolhido: é a loja que cobra, não o app. */
  onUpgrade: (plano: PlanoAssinatura) => void;
  mensagem?: string;
  isLoading?: boolean;
  status?: {
    trialAtivo?: boolean;
    diasRestantesTrial?: number;
    assinaturaAtiva?: boolean;
    podeUsarRecursosBasicos?: boolean;
  };
}

/** Preço e período sempre como a loja informa; nunca escritos no app. */
type PlanoNaTela = {
  sku: PlanoAssinatura;
  rotulo: string;
  periodo: string;
  preco: string | null;
};

const PLANOS_BASE: PlanoNaTela[] = [
  { sku: PRODUTOS.mensal, rotulo: "Mensal", periodo: "por mês", preco: null },
  { sku: PRODUTOS.anual, rotulo: "Anual", periodo: "por ano", preco: null },
];

const UpgradeScreen = ({
  onUpgrade,
  mensagem,
  isLoading,
  status,
}: UpgradeScreenProps) => {
  const [planos, setPlanos] = useState<PlanoNaTela[]>(PLANOS_BASE);
  const [planoEscolhido, setPlanoEscolhido] = useState<PlanoAssinatura>(PRODUTOS.mensal);
  const [carregandoPlanos, setCarregandoPlanos] = useState(true);
  const [restaurando, setRestaurando] = useState(false);

  useEffect(() => {
    let ativo = true;

    planosDisponiveis()
      .then((daLoja) => {
        if (!ativo) return;
        const itens = daLoja ?? [];
        setPlanos(
          PLANOS_BASE.map((plano) => {
            const encontrado = itens.find((item: any) => item.id === plano.sku);
            return encontrado ? { ...plano, preco: encontrado.displayPrice } : plano;
          })
        );
      })
      .catch((erro) => console.warn("Não foi possível carregar os planos:", erro))
      .finally(() => ativo && setCarregandoPlanos(false));

    return () => {
      ativo = false;
    };
  }, []);

  const aoRestaurar = async () => {
    setRestaurando(true);
    try {
      await restaurarCompras();
    } catch (erro) {
      console.warn("Não foi possível restaurar as compras:", erro);
    } finally {
      setRestaurando(false);
    }
  };
  // Determina o título e mensagem baseados no status real do usuário
  const renderStatusInfo = () => {
    // Se recebemos informações específicas de status
    if (status) {
      console.log(
        "UpgradeScreen: Renderizando com status:",
        JSON.stringify(status)
      );

      // Caso 1: Assinatura ativa - máxima prioridade
      if (status.assinaturaAtiva) {
        return {
          title: "Assinatura Premium Ativa",
          message:
            "Você já possui uma assinatura premium ativa. Aproveite todos os recursos.",
        };
      }

      // Caso 2: Trial ativo - Mostrar dias restantes
      if (
        status.trialAtivo &&
        status.diasRestantesTrial &&
        status.diasRestantesTrial > 0
      ) {
        return {
          title: "Período de teste ativo",
          message: `Você está no período de teste gratuito. Restam ${status.diasRestantesTrial} dias.`,
        };
      }

      // Caso 3: Trial expirado - Sem acesso
      if (!status.trialAtivo && !status.assinaturaAtiva) {
        return {
          title: "Seu período de teste terminou",
          message:
            "Para continuar utilizando o aplicativo Cíclica, faça a assinatura e tenha acesso a todos os recursos.",
        };
      }
    }

    // Default - Usar mensagem fornecida ou uma mensagem padrão
    return {
      title: "Assine o Premium",
      message:
        mensagem ||
        "Assine o plano premium para acessar todos os recursos do aplicativo Cíclica.",
    };
  };

  const statusInfo = renderStatusInfo();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require("../assets/medalha_ouro.png")}
          style={styles.icon}
        />

        <Text style={styles.title}>{statusInfo.title}</Text>

        <Text style={styles.message}>{statusInfo.message}</Text>

        <View style={styles.planCard}>
          <Text style={styles.planTitle}>Plano Premium</Text>

          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Text style={styles.featureText}>✓ Treinos personalizados</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureText}>✓ Relatórios mensais</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureText}>✓ Chat com a Lunia IA</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureText}>✓ Acompanhamento do ciclo</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureText}>✓ Diário de sintomas</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureText}>✓ Gráficos de progresso</Text>
            </View>
          </View>

          {carregandoPlanos ? (
            <ActivityIndicator color={palette.purpleDark} style={styles.pricingContainer} />
          ) : (
            <View style={styles.planosLinha}>
              {planos.map((plano) => {
                const ativo = plano.sku === planoEscolhido;
                return (
                  <TouchableOpacity
                    key={plano.sku}
                    style={[styles.planoOpcao, ativo && styles.planoOpcaoAtiva]}
                    onPress={() => setPlanoEscolhido(plano.sku)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: ativo }}
                  >
                    <Text style={[styles.planoRotulo, ativo && styles.planoRotuloAtivo]}>
                      {plano.rotulo}
                    </Text>
                    {/* Sem preço, a loja não respondeu: o valor real aparece na
                        hora da compra, e inventar um número aqui seria mentira. */}
                    <Text style={[styles.price, ativo && styles.planoRotuloAtivo]}>
                      {plano.preco ?? "—"}
                    </Text>
                    <Text style={styles.period}>{plano.periodo}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.upgradeButton, isLoading && styles.disabledButton]}
          onPress={() => onUpgrade(planoEscolhido)}
          disabled={isLoading}
        >
          <Text style={styles.upgradeButtonText}>
            {isLoading ? "Processando..." : "Assinar Agora"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={aoRestaurar} disabled={restaurando}>
          <Text style={styles.restaurarTexto}>
            {restaurando ? "Restaurando..." : "Já assinei, restaurar compra"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.guaranteeText}>
          Você pode cancelar a qualquer momento
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  content: {
    padding: 24,
    alignItems: "center",
  },
  icon: {
    width: 100,
    height: 100,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: themeColors.text,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
    color: themeColors.text,
    opacity: 0.8,
    lineHeight: 22,
  },
  planCard: {
    width: "100%",
    backgroundColor: palette.glass,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: themeColors.text,
  },
  featureList: {
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: "row",
    marginBottom: 10,
    alignItems: "center",
  },
  featureText: {
    fontSize: 15,
    color: themeColors.text,
  },
  pricingContainer: {
    alignItems: "center",
    marginTop: 8,
  },
  planosLinha: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  planoOpcao: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E6DCE8",
  },
  planoOpcaoAtiva: {
    borderColor: palette.purpleDark,
    backgroundColor: "rgba(124,58,157,0.06)",
  },
  planoRotulo: {
    fontSize: 15,
    fontWeight: "600",
    color: themeColors.text,
    marginBottom: 2,
  },
  planoRotuloAtivo: {
    color: palette.purpleDark,
  },
  restaurarTexto: {
    fontSize: 14,
    color: palette.purpleDark,
    textDecorationLine: "underline",
    marginTop: 14,
  },
  price: {
    fontSize: 28,
    fontWeight: "bold",
    color: themeColors.button,
  },
  period: {
    fontSize: 14,
    color: themeColors.text,
    opacity: 0.6,
  },
  upgradeButton: {
    backgroundColor: themeColors.button,
    paddingVertical: 15,
    paddingHorizontal: 32,
    borderRadius: 30,
    width: "100%",
    alignItems: "center",
    marginBottom: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
  upgradeButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  guaranteeText: {
    fontSize: 14,
    color: themeColors.text,
    opacity: 0.7,
  },
});

export default UpgradeScreen;
