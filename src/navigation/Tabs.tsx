import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ScannerScreen } from '../screens/ScannerScreen';
import { DeviceScreen } from '../screens/DeviceScreen';

export type TabParamList = {
  Scanner: undefined;
  Device: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

export function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Scanner" component={ScannerScreen} />
      <Tab.Screen name="Device" component={DeviceScreen} />
    </Tab.Navigator>
  );
}
