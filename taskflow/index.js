import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';
import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// Register the Android widget task handler
if (Platform.OS === 'android' && !isExpoGo) {
  try {
    const { registerWidgetTaskHandler } = require('react-native-android-widget');
    const { widgetTaskHandler } = require('./widgets/android/widget-task-handler');
    registerWidgetTaskHandler(widgetTaskHandler);
  } catch (e) {
    console.warn('Failed to register Android widget handler:', e);
  }
}

// Register iOS widgets
if (Platform.OS === 'ios' && !isExpoGo) {
  try {
    require('./widgets/ios/index');
  } catch (e) {
    console.warn('Failed to register iOS widgets:', e);
  }
}

// The following is the standard Expo Router entry point logic
// Usually handled by 'expo-router/entry'
export function App() {
  const ctx = require.context('./app');
  return <ExpoRoot context={ctx} />;
}

registerRootComponent(App);
