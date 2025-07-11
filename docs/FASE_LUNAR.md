# Documentação do Sistema de Gerenciamento da Fase Lunar

## Visão Geral

Este sistema implementa um gerenciamento completo do ciclo menstrual e suas fases lunares no aplicativo AgentCicle. Ele permite sincronização com o servidor, armazenamento em cache para uso offline, e notificação entre componentes quando a fase é alterada.

## Componentes Principais

### 1. Serviço de Perfil (perfilService.ts)

Este serviço gerencia o perfil do usuário e as fases do ciclo menstrual:

- `updatePerfil()`: Atualiza os dados do perfil e verifica mudanças na fase
- `atualizarCacheFase()`: Armazena as informações da fase no AsyncStorage
- `notificarMudancaFase()`: Notifica outros componentes sobre mudanças na fase
- `sincronizarFase()`: Sincroniza a fase com o servidor ou usa o cache quando offline
- `verificarMudancaFase()`: Verifica se houve alteração na fase para atualização da UI

### 2. Hook useFaseLunar (useFaseLunar.ts)

Hook personalizado para facilitar o uso da fase lunar em componentes:

- Gerencia o estado da fase lunar no React
- Sincroniza automaticamente com o servidor 
- Verifica periodicamente por notificações de mudança
- Reage à mudança de estado do aplicativo (background/foreground)
- Expõe métodos para interagir com o sistema de fase lunar

## Como Usar

### Nos Componentes React

```tsx
import { useFaseLunar } from '../hooks/useFaseLunar';

function MeuComponente() {
  // Desestruturar valores e funções do hook
  const { fase, mensagem, carregando, recarregar } = useFaseLunar();
  
  // Usar valores na UI
  return (
    <View>
      {carregando ? (
        <ActivityIndicator />
      ) : (
        <>
          <Text>Fase atual: {fase}</Text>
          <Text>Mensagem: {mensagem}</Text>
          <Button title="Atualizar" onPress={recarregar} />
        </>
      )}
    </View>
  );
}
```

### Como Integrar em Novos Componentes

1. Importe o hook `useFaseLunar` no componente
2. Desestruture os valores necessários (`fase`, `mensagem`, etc.)
3. Use os valores nos seus componentes de UI
4. Chame `recarregar()` quando precisar atualizar manualmente

## Fluxo de Dados

1. Quando o perfil é atualizado, o backend pode informar uma mudança de fase
2. O serviço `perfilService` atualiza o cache local via AsyncStorage
3. O serviço envia uma notificação para outros componentes
4. O hook `useFaseLunar` detecta a mudança e atualiza o estado
5. Os componentes que usam o hook são renderizados com os novos dados

## Cache e Funcionamento Offline

O sistema implementa uma estratégia de cache para funcionar offline:

- Os dados são armazenados no AsyncStorage
- Por padrão, o cache é usado se a última sincronização foi há menos de 4 horas
- Em caso de erro de rede, o sistema tenta usar o cache disponível
- Há indicação visual de quando os dados estão vindo do cache

## Expandindo o Sistema

Para adicionar novas funcionalidades ao sistema de fase lunar:

1. Amplie o serviço `perfilService.ts` com novos métodos
2. Atualize o hook `useFaseLunar.ts` para expor novas funcionalidades
3. Implemente ouvintes adicionais para novos eventos relacionados ao ciclo
