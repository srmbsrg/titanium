/**
 * Jest setup — mock native modules that have no JS implementation under test.
 */

// Gesture Handler ships an official jest setup that mocks its native module.
import 'react-native-gesture-handler/jestSetup';

// Simple in-memory AsyncStorage mock so persistence code runs under test.
jest.mock('@react-native-async-storage/async-storage', () => {
  let store = {};
  return {
    __esModule: true,
    default: {
      getItem: jest.fn((key) => Promise.resolve(key in store ? store[key] : null)),
      setItem: jest.fn((key, value) => {
        store[key] = value;
        return Promise.resolve();
      }),
      removeItem: jest.fn((key) => {
        delete store[key];
        return Promise.resolve();
      }),
      clear: jest.fn(() => {
        store = {};
        return Promise.resolve();
      }),
    },
  };
});
