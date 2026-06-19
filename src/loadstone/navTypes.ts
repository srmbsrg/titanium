/**
 * Loadstone — navigation param lists.
 *
 * Bottom tabs for the five primary areas; the Home tab is itself a native
 * stack so the dashboard can push a full hydration History screen.
 */

export type HomeStackParamList = {
  Dashboard: undefined;
  History: undefined;
};

export type RootTabParamList = {
  HomeTab: undefined;
  LogTab: undefined;
  ProtocolTab: undefined;
  ScienceTab: undefined;
  SettingsTab: undefined;
};
