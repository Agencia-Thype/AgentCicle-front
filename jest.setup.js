// Mock do AsyncStorage
global.AsyncStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
};

// Mock do react-native
global.ReactNative = {
  Platform: {
    OS: 'web',
  },
};

// Mock Dimensions
global.Dimensions = {
  get: jest.fn(() => ({ width: 375, height: 667 })),
  set: jest.fn(),
};

// Mock PixelRatio
global.PixelRatio = {
  getPixelSizeForLayoutSize: jest.fn((size) => size),
  get: jest.fn(() => 1),
};

// Mock Animated API
global.Animated = {
  Value: class Value {
    constructor(value) { this._value = value; }
    setValue(value) { this._value = value; }
    getValue() { return this._value; }
  },
  timing: jest.fn(() => ({ start: (cb) => cb && cb({ finished: true }) })),
  spring: jest.fn(() => ({ start: (cb) => cb && cb({ finished: true }) })),
};

// Mock InteractionManager
global.InteractionManager = {
  runAfterInteractions: jest.fn((cb) => setTimeout(() => cb(), 0)),
};

// Mock Keyboard
global.Keyboard = {
  dismiss: jest.fn(() => Promise.resolve()),
  addListener: jest.fn(() => ({ remove: () => {} })),
};

// Mock Linking
global.Linking = {
  openURL: jest.fn(() => Promise.resolve()),
  addEventListener: jest.fn(() => ({ remove: () => {} })),
  removeEventListener: jest.fn(),
};

// Mock AppState
global.AppState = {
  currentState: 'active',
  addEventListener: jest.fn(() => ({ remove: () => {} })),
  removeEventListener: jest.fn(),
};

// Mock DeviceInfo
global.DeviceInfo = {
  getSystemName: jest.fn(() => 'iOS'),
  getSystemVersion: jest.fn(() => '15.0'),
};
