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
    select: (obj) => (obj.web !== undefined ? obj.web : obj.default),
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
    get: (dim) => ({
      width: 375,
      height: 667,
      scale: 1,
    }),
  },

  // PixelRatio
  PixelRatio: {
    getPixelSizeForLayoutSize: (size) => size,
    get: () => 1,
    roundToNearestPixel: (size) => size,
  },

  // Animated
  Animated: {
    Value: class Value {
      constructor(value) { this._value = value; }
      setValue(value) { this._value = value; }
      getValue() { return this._value; }
    },
    timing: () => ({ start: (cb) => cb && cb({ finished: true }) }),
    spring: () => ({ start: (cb) => cb && cb({ finished: true }) }),
    decay: () => ({ start: (cb) => cb && cb({ finished: true }) }),
    sequence: () => ({ start: (cb) => cb && cb({ finished: true }) }),
    parallel: () => ({ start: (cb) => cb && cb({ finished: true }) }),
    delay: () => ({ start: (cb) => cb && cb({ finished: true }) }),
  },

  // Easing
  Easing: {
    linear: (t) => t,
    ease: (t) => t,
    quad: (t) => t,
    cubic: (t) => t,
  },

  // InteractionManager
  InteractionManager: {
    runAfterInteractions: (cb) => setTimeout(() => cb(), 0),
  },

  // Keyboard
  Keyboard: {
    dismiss: () => Promise.resolve(),
   addListener: () => ({ remove: () => {} }),
  },

  // Linking
  Linking: {
    openURL: (url) => Promise.resolve(),
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
