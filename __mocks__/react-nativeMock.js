// Mock completo do React Native para testes
module.exports = {
  // Core components
  View: 'View',
  Text: 'Text',
  Image: 'Image',
  ScrollView: 'ScrollView',
  FlatList: 'FlatList',
  SectionList: 'SectionList',
  StyleSheet: {
    create: () => ({}),
    flatten: () => ({}),
    hairlineWidth: 1,
  },
  Platform: {
    OS: 'web',
    select: (obj: any) => obj.web,
  },

  // API Components
  ActivityIndicator: 'ActivityIndicator',
  Button: 'Button',
  TextInput: 'TextInput',
  TouchableHighlight: 'TouchableHighlight',
  TouchableOpacity: 'TouchableOpacity',
  TouchableWithoutFeedback: 'TouchableWithoutFeedback',
  TouchableNativeFeedback: 'TouchableNativeFeedback',
  SafeAreaView: 'SafeAreaView',

  // Modal
  Modal: {
    component: 'Modal',
  },

  // Dimensions
  Dimensions: {
    get: (dim: string) => ({
      width: 375,
      height: 667,
      scale: 1,
    }),
  },

  // PixelRatio
  PixelRatio: {
    getPixelSizeForLayoutSize: (size: number) => size,
    get: () => 1,
    roundToNearestPixel: (size: number) => size,
  },

  // Animated
  Animated: {
    Value: class Value {
      constructor(value: number) { this._value = value; }
      setValue(value: number) { this._value = value; }
      getValue() { return this._value; }
    },
    timing: () => ({ start: (cb: any) => cb && cb({ finished: true }) }),
    spring: () => ({ start: (cb: any) => cb && cb({ finished: true }) }),
    decay: () => ({ start: (cb: any) => cb && cb({ finished: true }) }),
    sequence: () => ({ start: (cb: any) => cb && cb({ finished: true }) }),
    parallel: () => ({ start: (cb: any) => cb && cb({ finished: true }) }),
    delay: () => ({ start: (cb: any) => cb && cb({ finished: true }) }),
  },

  // Easing
  Easing: {
    linear: (t: number) => t,
    ease: (t: number) => t,
    quad: (t: number) => t,
    cubic: (t: number) => t,
  },

  // InteractionManager
  InteractionManager: {
    runAfterInteractions: (cb: any) => setTimeout(() => cb(), 0),
  },

  // Keyboard
  Keyboard: {
    dismiss: () => Promise.resolve(),
   addListener: () => ({ remove: () => {} }),
  },

  // Linking
  Linking: {
    openURL: (url: string) => Promise.resolve(),
    addEventListener: () => ({ remove: () => {} }),
    removeEventListener: () => {},
  },

  // AppState
  AppState: {
    currentState: 'active',
  },

  // AccessibilityInfo
  AccessibilityInfo: {
    isScreenReaderEnabled: () => Promise.resolve(false),
    addEventListener: () => ({ remove: () => {} }),
  },

  // NativeModules
  NativeModules: {},
  NativeEventEmitter: class NativeEventEmitter {
    addListener() { return { remove: () => {} }; }
    emit() {}
  },

  // DeviceInfo
  DeviceInfo: {
    getSystemName: () => 'iOS',
    getSystemVersion: () => '15.0',
  },
};
