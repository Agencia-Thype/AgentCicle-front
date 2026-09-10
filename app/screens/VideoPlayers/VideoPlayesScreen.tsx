import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../navigation";
import { globalStyles, themeColors } from "../../theme/global";
import AppBackground from "../../components/AppBackground";
import { Ionicons } from "@expo/vector-icons";
import { AnimatedLogo } from "../../components/AnimatedLogo";
import { palette } from "../../theme/colors";

type VideoPlayerRouteProp = RouteProp<RootStackParamList, "VideoPlayer">;

export default function VideoPlayerScreen() {
  const route = useRoute<VideoPlayerRouteProp>();
  const { url } = route.params;
  const navigation = useNavigation();

  // useVideoPlayer é um hook: precisa ser chamado incondicionalmente, antes do
  // early return de "vídeo indisponível". Fonte null é aceita e não carrega nada.
  const player = useVideoPlayer(url ?? null, (player) => {
    player.loop = false;
    if (url) {
      player.play();
    }
  });

  if (!url) {
    return (
      <AppBackground>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              padding: 24,
              paddingBottom: 80,
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <AnimatedLogo />

            <View style={styles.container}>
              <Text style={styles.messageText}>
                Vídeo ainda não disponível para este exercício. 🌙{"\n"}
                Tente novamente mais tarde.
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </AppBackground>
    );
  }

  return (
    <AppBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingTop: 24,
            paddingBottom: 80,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <AnimatedLogo />

          <Text style={styles.title}>
            Treine com orientação 💫 Assista ao vídeo
          </Text>

          <View style={styles.container}>
            <VideoView
              player={player}
              nativeControls
              contentFit="contain"
              style={styles.video}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 30,
  },
  video: {
    width: Dimensions.get("window").width * 0.95,
    height: Dimensions.get("window").width * 0.6,
    borderRadius: 12,
    backgroundColor: "#000",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    color: palette.textPrimary,
    marginBottom: 20,
  },
  messageText: {
    textAlign: "center",
    fontSize: 18,
    color: palette.textPrimary,
    paddingHorizontal: 24,
    lineHeight: 26,
  },
});
