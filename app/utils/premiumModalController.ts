import { useState } from "react";

// Instância única de gerenciamento
let premiumModalController = {
  isVisible: false,
  setVisible: (value: boolean) => {},
  message: "",
  setMessage: (message: string) => {},
  showUpgradeModal: (message?: string) => {},
};

// Hook para acessar e controlar o modal de premium
export function usePremiumModal() {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState("");

  // Configuramos o controller global apenas uma vez (primeira montagem do componente principal)
  if (!premiumModalController.setVisible) {
    premiumModalController = {
      isVisible,
      setVisible: setIsVisible,
      message,
      setMessage,
      showUpgradeModal: (customMessage?: string) => {
        setMessage(customMessage || "Este recurso requer assinatura premium.");
        setIsVisible(true);
      },
    };
  }

  return {
    isVisible,
    setIsVisible,
    message,
    setMessage,
    showModal: (customMessage?: string) => {
      setMessage(customMessage || "Este recurso requer assinatura premium.");
      setIsVisible(true);
    },
  };
}

// Exportar o controller para uso em interceptors e outros lugares
export const PremiumModalController = {
  showUpgradeModal: (message?: string) => {
    premiumModalController.showUpgradeModal(message);
  },
};
