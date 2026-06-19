module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['./jest.setup.js'],
  // Ignore Claude Code worktrees (parallel sessions) so their duplicate copies
  // don't pollute the haste map or get collected as tests.
  modulePathIgnorePatterns: ['<rootDir>/.claude/'],
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/.claude/'],
  transformIgnorePatterns: [
    'node_modules/(?!(@react-native|react-native|@react-navigation|react-native-svg|react-native-gesture-handler|@react-native-async-storage)/)',
  ],
};
