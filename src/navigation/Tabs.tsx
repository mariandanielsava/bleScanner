import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from '@react-native-vector-icons/fontawesome6';
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
      <Tab.Screen
        name="Scanner"
        component={ScannerScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon
              iconStyle="solid"
              name="satellite-dish"
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Device"
        component={DeviceScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon
              iconStyle="solid"
              name="microchip"
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
