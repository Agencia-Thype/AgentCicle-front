import React, { ComponentType, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { useAssinatura } from "../contexts/AssinaturaContext";
import { usePremiumModal } from "../utils/premiumModalController";

// HOC para proteger rotas que requerem assinatura premium
export const withPremiumCheck = <P extends object>(
  Component: ComponentType<P>
) => {
  return (props: P) => {
    const { status, temPermissaoPremium } = useAssinatura();
    const { showModal } = usePremiumModal();
    const navigation = useNavigation();

    useEffect(() => {
      // Se o status já foi carregado e o usuário não tem permissão premium
      if (status && !temPermissaoPremium) {
        showModal("Você precisa ser assinante para acessar este recurso.");

        // Voltar para a tela anterior
        setTimeout(() => {
          navigation.goBack();
        }, 100);
      }
    }, [status, temPermissaoPremium]);

    // Se ainda está carregando ou tem permissão, renderiza o componente
    // Caso contrário, vai ser redirecionado pelo useEffect acima
    return <Component {...props} />;
  };
};

// Lista de recursos premium que precisam de proteção
export const PREMIUM_RESOURCES = {
  RELATORIO_MENSAL: "RelatorioMensal",
  CHAT_LUNIA: "FaseCompletaScreen",
};
