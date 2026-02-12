import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BleProvider } from './src/ble/BleProvider';
import { Tabs } from './src/navigation/Tabs';

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle={'dark-content'} />
      <NavigationContainer>
        <BleProvider>
          <Tabs />
        </BleProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
