# Resposta ao App Review — Guideline 2.1 (Information Needed)

Esta solicitação da Apple não indica um bug específico no binário. A análise foi pausada para validação adicional porque a conta de desenvolvedor possui pouco histórico no App Review.

Antes de responder, substitua todos os campos entre colchetes e anexe um vídeo gravado em um dispositivo físico com a versão mais recente do iOS.

## Texto para responder à Apple (em inglês)

Hello App Review Team,

Thank you for your message. The submitted build is complete and ready for review. We tested it on supported physical devices running the latest available iOS version.

1. **Physical-device screen recording**

Screen recording: [ATTACH THE VIDEO TO THIS MESSAGE OR INSERT AN ACCESSIBLE LINK]

The recording starts with a fresh launch and demonstrates:

- account registration and email verification;
- Sign in with Apple and regular sign-in;
- initial profile setup;
- menstrual-cycle tracking and calendar;
- symptom logging;
- daily workout and exercise timer;
- pelvic-floor (Kegel) exercises;
- routine, hydration, and reminder features;
- the Lunia AI assistant;
- account deletion through Profile > Delete my account.

The submitted build does not contain user-generated content that is published to or shared with other users. Conversations with the AI assistant are private and are not visible to a community or to other users. The submitted build does not offer paid content or paid features; monetization and subscription purchase interfaces are disabled in this version.

2. **Purpose and target audience**

Cíclica is a wellness and menstrual-cycle tracking app intended primarily for adult users who want to organize information about their cycle and daily self-care. It allows users to record cycle dates and symptoms, organize routines and reminders, follow general workout and pelvic-floor exercise content, view progress, and interact with the Lunia informational AI assistant.

The app helps users keep these records and routines in one place and better understand recurring patterns. Cíclica is not a medical device, does not diagnose conditions, and does not prescribe treatment or replace advice from a qualified healthcare professional.

3. **Access and setup instructions**

Review account:

- Email: [REVIEW ACCOUNT EMAIL]
- Password: [REVIEW ACCOUNT PASSWORD]

Steps:

1. Launch the app and sign in using the review account above. Sign in with Apple and email registration are also available, but are not required when using the review account.
2. If the initial profile screen is displayed, enter the requested sample cycle information and save it.
3. The Home screen provides access to the cycle overview, symptoms, daily workout, Kegel exercises, routine/hydration tracking, reports, and the Lunia assistant.
4. To delete the account, open Profile, tap “Excluir minha conta” (Delete my account), and confirm the two deletion prompts. This permanently deletes the account and associated app data.

No external hardware or sample files are required. The backend will remain active and accessible throughout the review.

4. **External services, tools, and platforms**

- Firebase Authentication: email/password, Google, and Apple authentication session management;
- Sign in with Apple: Apple account authentication;
- Google Sign-In: optional Google account authentication;
- Cíclica/ZURVE backend API (`https://api.ciclicaapp.com.br`): user profiles, cycle records, symptoms, routines, workout progress, and other core app data;
- OpenAI language model, accessed only through the Cíclica backend: powers the Lunia informational assistant;
- Apple local notification services: user-configured reminders on the device.

Apple In-App Purchase code exists for a future version but is disabled and inaccessible in the submitted build. There is no paid content in this submission.

5. **Regional differences**

The app functions consistently in every region where this version is available. There are no region-specific features, content catalogs, prices, or access restrictions in the submitted build. The current user interface and content are in Brazilian Portuguese.

6. **Regulated industry and third-party material**

Cíclica is a general wellness and organizational app, not a medical device or healthcare provider. It does not diagnose, treat, or prescribe. Users are advised to seek qualified healthcare guidance for medical decisions. The app does not provide regulated clinical services.

[ONLY KEEP THE FOLLOWING SENTENCE IF IT IS TRUE:] All text, illustrations, exercise images, videos, audio, branding, and other material included in the app are owned by us or used with appropriate authorization. Supporting rights documentation can be provided upon request.

Please let us know if any additional information is required.

Best regards,

[NAME]
ZURVE TECNOLOGIA LTDA
[CONTACT EMAIL]

## Roteiro obrigatório do vídeo

Grave continuamente, sem cortes que ocultem etapas importantes, em um iPhone físico atualizado:

1. Mostre rapidamente Ajustes > Geral > Sobre para comprovar o aparelho e a versão do iOS (não exiba dados sensíveis).
2. Feche o app e inicie a gravação antes de tocar no ícone do Cíclica.
3. Abra o app desde o ícone e mostre login/cadastro.
4. Entre com a conta de demonstração já preenchida.
5. Passe por Início, Ciclo/Calendário, Sintomas, Treino, temporizador, Kegel, Rotina/Água, Relatório e Lunia.
6. Mostre Perfil > Excluir minha conta e os dois avisos de confirmação. Para não perder a conta principal de análise, faça essa parte com uma segunda conta descartável e conclua a exclusão.
7. Se `supportsTablet` continuar habilitado, teste também a mesma build em iPad físico e, por segurança, forneça uma gravação curta demonstrando o layout no iPad.

Não mostre senhas, e-mails pessoais, tokens, dados reais de saúde ou notificações privadas. Use somente dados fictícios.

## Checklist antes de reenviar

- [ ] A conta de demonstração está ativa, com dados fictícios preenchidos, e não exige código recebido por e-mail/SMS durante a análise.
- [ ] O backend de produção e a IA respondem fora da rede da empresa.
- [ ] Login por e-mail, Google e Apple foram testados no build exato enviado.
- [ ] A exclusão remove tanto o usuário do backend quanto a autenticação e funciona também para contas Apple.
- [ ] Nenhuma tela de preço, trial, Premium ou assinatura aparece, pois `EXPO_PUBLIC_COBRANCA_ATIVA=false` no perfil de produção atual.
- [ ] Os screenshots da ficha mostram telas reais após o login, e não somente splash ou login.
- [ ] Nome, ícone e textos da ficha são consistentes com a marca “Cíclica”. O binário atualmente usa `AgentCicle` como nome Expo; alinhar isso na próxima build se o nome exibido no aparelho estiver diferente da ficha.
- [ ] A classificação etária e as respostas de App Privacy incluem os dados de saúde/ciclo, identificadores, conteúdo da usuária e dados enviados à IA, conforme o uso real.
- [ ] A política de privacidade e a página de exclusão estão públicas e acessíveis.
- [ ] O aviso de que o app não substitui orientação médica está visível dentro do app, especialmente próximo à Lunia e aos exercícios, e não somente no site.
- [ ] Se o app não foi validado em iPad, considerar desabilitar `ios.supportsTablet` antes de gerar uma nova build.
- [ ] Todos os campos entre colchetes desta resposta foram preenchidos e a frase condicional sobre direitos autorais foi confirmada ou removida.

## Onde inserir

1. Responda à mensagem no Resolution Center anexando o vídeo e colando o texto acima.
2. Em App Store Connect, abra a versão do app > App Review Information > Notes e cole a mesma resposta (ou uma versão reduzida que preserve os seis itens).
3. Preencha o usuário e a senha de demonstração nos campos próprios de Sign-in Information, além de repeti-los nas Notes.

