// src/screens/AnalyzeScreen.tsx
import React, { useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import FootDots from '../components/FootDots';

type SensorMap = Record<number, number>;

type AnalysisParams = {
  Analysis: {
    avgLeft: SensorMap;   // 센서ID -> 평균(0~1)
    avgRight: SensorMap;  // 센서ID -> 평균(0~1)
    isTaping?: boolean;
    frames?: { left?: number; right?: number };
  };
};

export default function AnalyzeScreen() {
  const route = useRoute<RouteProp<AnalysisParams, 'Analysis'>>();
  const { avgLeft = {}, avgRight = {}, isTaping = false, frames } = route.params ?? {};

  // 발별 전체 평균(0~1)을 간단히 계산해서 상단에 표시
  const { meanL, meanR } = useMemo(() => {
    const mean = (m: SensorMap) => {
      const vals = Object.values(m);
      if (!vals.length) return 0;
      const sum = vals.reduce((a, b) => a + (Number(b) || 0), 0);
      return sum / vals.length; // 0~1
    };
    return { meanL: mean(avgLeft), meanR: mean(avgRight) };
  }, [avgLeft, avgRight]);

  const pct = (x: number) => `${Math.round(Math.max(0, Math.min(1, x)) * 100)}%`;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#EEF5E8' }} contentContainerStyle={{ padding: 16 }}>
      {/* 상단 요약 */}
      <View
        style={{
          backgroundColor: '#fff',
          borderRadius: 16,
          padding: 14,
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        <Text style={{ fontSize: 22, fontWeight: '900', color: '#215a3f' }}>평균 압력 요약</Text>

        <View style={{ flexDirection: 'row', marginTop: 10, gap: 14 }}>
          <View style={{ flex: 1, backgroundColor: '#F1F5F9', borderRadius: 12, padding: 12 }}>
            <Text style={{ color: '#64748b', fontWeight: '700' }}>왼발 평균</Text>
            <Text style={{ fontSize: 28, fontWeight: '900', color: '#0f766e' }}>{pct(meanL)}</Text>
            {typeof frames?.left === 'number' && (
              <Text style={{ marginTop: 4, color: '#475569' }}>프레임: {frames.left}</Text>
            )}
          </View>

          <View style={{ flex: 1, backgroundColor: '#F1F5F9', borderRadius: 12, padding: 12 }}>
            <Text style={{ color: '#64748b', fontWeight: '700' }}>오른발 평균</Text>
            <Text style={{ fontSize: 28, fontWeight: '900', color: '#0f766e' }}>{pct(meanR)}</Text>
            {typeof frames?.right === 'number' && (
              <Text style={{ marginTop: 4, color: '#475569' }}>프레임: {frames.right}</Text>
            )}
          </View>
        </View>

        <Text style={{ marginTop: 10, color: '#334155' }}>
          테이핑 여부: <Text style={{ fontWeight: '800' }}>{isTaping ? '예' : '아니오'}</Text>
        </Text>
      </View>

      {/* 평균 분포 시각화 */}
      <View
        style={{
          marginTop: 16,
          backgroundColor: '#fff',
          borderRadius: 16,
          paddingVertical: 16,
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        <Text style={{ fontWeight: '800', marginLeft: 12, marginBottom: 8 }}>평균 분포 (센서별)</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
          <FootDots sensorValues={avgLeft} mirror width={170} height={240} radius={16} />
          <FootDots sensorValues={avgRight} width={170} height={240} radius={16} />
        </View>
      </View>
    </ScrollView>
  );
}
