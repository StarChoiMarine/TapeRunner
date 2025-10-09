// src/components/DeviceStatusCard.tsx
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../store/appStore';

export default function DeviceStatusCard() {
  const nav = useNavigation<any>();
  const { isConnected, batteryLeft, batteryRight, recentRuns, ankleState } = useAppStore();

  const chipColor = ankleState === '안전' ? '#3B8A3E' : '#B45309';

  return (
    <View style={{
      backgroundColor: '#fff', borderRadius: 16, padding: 16,
      shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, elevation: 4
    }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: isConnected ? '#2F855A' : '#A0AEC0' }}>
          {isConnected ? 'connected' : 'disconnected'}
        </Text>
        <Pressable onPress={() => nav.navigate('DeviceConnect')}>
          <Text style={{ fontSize: 18 }}>⚙️</Text>
        </Pressable>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 12 }}>
        <View style={{ width: 64, height: 64, borderRadius: 12, backgroundColor: '#E6F3E6', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 32 }}>👣</Text>
        </View>
        <View style={{ flex: 1, gap: 6 }}>
          <Text>최근 러닝 {recentRuns}회</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text>발목 상태:</Text>
            <Text style={{ color: chipColor, fontWeight: '700' }}>{ankleState}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Text>좌 {batteryLeft}%</Text>
            <Text>우 {batteryRight}%</Text>
            <Text>Battery</Text>
          </View>
        </View>
      </View>

      <Pressable
        onPress={() => nav.navigate('Analysis')}
        style={{ marginTop: 12, alignSelf: 'flex-start', backgroundColor: '#E8F0FF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 }}
      >
        <Text style={{ color: '#1A73E8', fontWeight: '600' }}>상세 분석결과</Text>
      </Pressable>
    </View>
  );
}
