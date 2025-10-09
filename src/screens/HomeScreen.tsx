import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  return (
    <View style={{ flex:1, alignItems:'center', justifyContent:'center', gap:16 }}>
      <Text style={{ fontSize:22, fontWeight:'800' }}>지금도 연결됐나? (데모)</Text>
      <Text style={{ color:'#666' }}>여기서 러닝 모니터/장치연결/가이드로 확장</Text>
      <TouchableOpacity
        onPress={() => navigation.replace('Login')}
        style={{ backgroundColor:'#efefef', padding:12, borderRadius:10 }}>
        <Text>로그아웃</Text>
      </TouchableOpacity>
    </View>
  );
}
