// src/screens/AnalysisScreen.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import SensorHeatmapView from '../components/SensorHeatmapView';
import AIAnalysisCard from '../components/AIAnalysisCard';
import RecommendedTapeCard from '../components/RecommendedTapeCard';
import type { RunSession } from '../types/analysis';

export default function AnalysisScreen() {
  const route = useRoute<any>();
  const nav = useNavigation<any>();
  const selected: RunSession | undefined = route.params?.session;

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      {/* 상단 바 */}
      <View style={{ height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 12 }}>
        <Text onPress={() => nav.goBack()} style={{ fontSize: 20 }}>‹</Text>
        <Text style={{ fontSize: 20, fontWeight: '800' }}>분석 결과</Text>
      </View>

      {selected ? (
        <View style={{ padding: 16, gap: 16 }}>
          {/* 센서 히트맵 */}
          <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: 8 }}>센서 히트맵</Text>
            <SensorHeatmapView left={selected.left} right={selected.right} width={150} />
          </View>

          {/* AI 분석 */}
          <AIAnalysisCard session={selected} />

          {/* 테이핑 추천 */}
          <RecommendedTapeCard session={selected} />
        </View>
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>세션 데이터가 없습니다.</Text>
        </View>
      )}
    </View>
  );
}
