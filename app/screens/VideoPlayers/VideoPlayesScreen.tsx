import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import {
  RouteProp,
  useRoute,
  useNavigation,
} from '@react-navigation/native';
import { RootStackParamList } from '../../navigation';
import { globalStyles } from '../../theme/global';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

type VideoPlayerRouteProp = RouteProp<RootStackParamList, 'VideoPlayer'>;

export default function VideoPlayerScreen() {
  const route = useRoute<VideoPlayerRouteProp>();
  const { url } = route.params;
  const navigation = useNavigation();

  // Caso o vídeo ainda não esteja disponível
  if (!url) {
    return (
      <LinearGradient
        colors={['#F3ECE3', '#C8A19C', '#91766E', '#5B4A44']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={globalStyles.backgroundGradient}
      >
        <View style={styles.backButton}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.container}>
          <Text style={styles.messageText}>
            Vídeo ainda não disponível para este exercício. 🌙{"\n"}
            Tente novamente mais tarde.
          </Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#F3ECE3', '#C8A19C', '#91766E', '#5B4A44']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={globalStyles.backgroundGradient}
    >
      <View style={styles.backButton}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

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
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 30,
  },
  video: {
    width: Dimensions.get('window').width * 0.95,
    height: Dimensions.get('window').width * 0.6,
    borderRadius: 12,
    backgroundColor: '#000',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
  },
  messageText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#5C3B3B',
    paddingHorizontal: 24,
    lineHeight: 26,
  },
});
