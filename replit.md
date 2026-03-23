# AgentCicle - Women's Health & Cycle Tracking App

## Overview

AgentCicle is a React Native / Expo mobile application focused on women's health. It tracks menstrual cycles, synchronizes with lunar phases, provides Kegel exercises, and includes an AI assistant (LunIA) for cycle-related guidance.

## Tech Stack

- **Framework**: React Native with Expo SDK 52
- **Language**: TypeScript
- **Navigation**: React Navigation (Native Stack)
- **State Management**: React Context API
- **Storage**: AsyncStorage for local data
- **Networking**: Axios for API calls
- **UI**: AppBackground (ImageBackground com bg-roxo.png), react-native-animatable, react-native-svg
- **Fonts**: Lobster Two (LobsterTwo_400Regular e LobsterTwo_700Bold) via @expo-google-fonts/lobster-two

## Project Structure

```
app/
  assets/       - Images, icons, sounds
  components/   - Reusable UI components (AnimatedLogo, PremiumModal, LunIA)
  contexts/     - Global state (AuthContext, AssinaturaContext)
  hooks/        - Custom hooks (useFaseLunar, useLuniaBalao)
  navigation/   - Route definitions
  screens/      - Feature screens (Home, Calendario, Kegel, IA, Relatorio)
  services/     - API layer (api.ts, authService.ts, iaService.ts)
  theme/        - Global styles and colors
  utils/        - Utility functions
assets/         - Expo app icons and splash screens
```

## Key Features

- Menstrual cycle tracking with phase monitoring
- Lunar cycle synchronization
- Kegel exercises with tiered levels and timers
- LunIA - AI assistant for cycle health guidance
- Premium subscription model with trial periods

## Development

The app runs in web mode via Expo Metro bundler:
- **Dev server**: `RCT_METRO_PORT=5000 npx expo start --web --localhost --port 5000`
- **Port**: 5000 (web preview)

## Deployment

Configured as static site deployment:
- **Build**: `npx expo export -p web`
- **Public dir**: `dist`

## Dependencies

Web-specific packages added during setup:
- `react-dom@18.3.1`
- `react-native-web@~0.19.13`
- `@expo/metro-runtime@~4.0.1`
