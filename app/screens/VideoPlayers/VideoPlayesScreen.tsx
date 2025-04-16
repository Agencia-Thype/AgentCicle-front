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
import { Video, ResizeMode } from "expo-av";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../navigation";
import { globalStyles, themeColors } from "../../theme/global";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { AnimatedLogo } from "../../components/AnimatedLogo";

type VideoPlayerRouteProp = RouteProp<RootStackParamList, "VideoPlayer">;

export default function VideoPlayerScreen() {
  const route = useRoute<VideoPlayerRouteProp>();
  const { url } = route.params;
  const navigation = useNavigation();

  if (!url) {
    return (
      <LinearGradient
        colors={themeColors.gradient}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={globalStyles.backgroundGradient}
      >
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
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#5C3B3B" />
            </TouchableOpacity>

            <AnimatedLogo />

            <View style={styles.container}>
              <Text style={styles.messageText}>
                Vídeo ainda não disponível para este exercício. 🌙{"\n"}
                Tente novamente mais tarde.
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={themeColors.gradient}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={globalStyles.backgroundGradient}
    >
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
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ marginBottom: 12 }}
          >
            <Ionicons name="arrow-back" size={24} color="#5C3B3B" />
          </TouchableOpacity>

          <AnimatedLogo />

          <Text style={styles.title}>
            Treine com orientação 💫 Assista ao vídeo
          </Text>

          <View style={styles.container}>
            <Video
              source={{ uri: url }}
              rate={1.0}
              volume={1.0}
              isMuted={false}
              resizeMode={ResizeMode.CONTAIN}
              useNativeControls
              shouldPlay
              style={styles.video}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
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
    color: "#5C3B3B",
    marginBottom: 20,
  },
  messageText: {
    textAlign: "center",
    fontSize: 18,
    color: "#5C3B3B",
    paddingHorizontal: 24,
    lineHeight: 26,
  },
});
