import React, { useContext } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { AuthContext } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import ReportIssueScreen from '../screens/ReportIssueScreen';
import MyReportsScreen from '../screens/MyReportsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => {
          let icon = '🏙️';
          if (route.name === 'HomeTab') icon = '🏠';
          else if (route.name === 'ReportTab') icon = '➕';
          else if (route.name === 'MyReportsTab') icon = '📋';
          else if (route.name === 'ProfileTab') icon = '👤';

          return (
            <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.6 }}>
              {icon}
            </Text>
          );
        },
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          paddingBottom: 6,
          paddingTop: 6,
          height: 60,
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ tabBarLabel: 'Feed' }}
      />
      <Tab.Screen
        name="ReportTab"
        component={ReportIssueScreen}
        options={{ tabBarLabel: 'Report' }}
      />
      <Tab.Screen
        name="MyReportsTab"
        component={MyReportsScreen}
        options={{ tabBarLabel: 'My Reports' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main" component={MainTabNavigator} />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
