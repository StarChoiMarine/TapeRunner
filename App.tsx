// App.tsx
import * as React from 'react';
import { BleProvider } from './src/store/ble/BleProvider';


import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import HomeScreen from './src/screens/HomeScreen';
import RunningScreen from './src/screens/RunningScreen';
import DeviceConnectScreen from './src/screens/DeviceConnectScreen';
import AnalysisScreen from './src/screens/AnalysisScreen';
import VideoPlayerScreen from './src/screens/VideoPlayerScreen';
import ActivityScreen from './src/screens/ActivityScreen';
import AnalysisDetailScreen from './src/screens/AnalysisDetailScreen';
import VideoScreen from './src/screens/VideoScreen';

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Home: { userName: string };
  Running: undefined;
  DeviceConnect: undefined;
  // 러닝 종료 후 분석 상세용: 세션을 직접 전달
  Analysis: { session: import('./src/types/analysis').RunSession };
  // 활동(히스토리) 목록
  Activity: undefined;
  // DB에 저장된 분석 상세 보기
  AnalysisDetail: { id: number };
  VideoPlayer: { url: string; title: string };
  Video: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (


    <BleProvider>
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Running" component={RunningScreen} />
          <Stack.Screen name="DeviceConnect" component={DeviceConnectScreen} />
          <Stack.Screen name="Analysis" component={AnalysisScreen} />
          <Stack.Screen name="Activity" component={ActivityScreen} />
          <Stack.Screen name="AnalysisDetail" component={AnalysisDetailScreen} />
          <Stack.Screen name="VideoPlayer" component={VideoPlayerScreen} />
          <Stack.Screen name="Video" component={VideoScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
    </BleProvider>
  );
}
