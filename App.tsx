import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import LoginScreen from './src/screens/LoginScreen';   // ← 확장자 빼는 걸 권장
import SignupScreen from './src/screens/SignupScreen';
import HomeScreen from './src/screens/HomeScreen';

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Home: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{ headerTitleAlign: 'center' }}
        >
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: '로그인' }} />
          <Stack.Screen name="Signup" component={SignupScreen} options={{ title: '회원가입' }} />
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Tape Runner' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

