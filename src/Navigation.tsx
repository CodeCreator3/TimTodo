import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './screens/HomeScreen';
import ArchiveScreen from './screens/ArchiveScreen';

const Tab = createBottomTabNavigator();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ tabBarIcon: () => null, headerShown: false }}>
        <Tab.Screen
          name="Tasks"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Tab.Screen
          name="Archive"
          component={ArchiveScreen}
          options={{ headerShown: false }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}