// src/screens/AnalysisScreen.tsx
import React, { useMemo, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import SensorHeatmapView from '../components/SensorHeatmapView';
import AIAnalysisCard from '../components/AIAnalysisCard';
import RecommendedTapeCard from '../components/RecommendedTapeCard';
import { mockSessions } from '../data/mockSessions';
import type { RunSession } from '../types/analysis';

export default function AnalysisScreen() {
  const [selectedId, setSelectedId] = useState<string | null>(mockSessions[0]?.id ?? null);
  const selected: RunSession | undefined = useMemo(
    () => mockSessions.find((s) => s.id === selectedId),
    [selectedId]
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      {/* 상단: 히스토리 수평 리스트 */}
      <View style={{ paddingTop: 16, paddingHorizontal: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: '800', marginBottom: 8 }}>개별 러닝 히스토리</Text>
        <FlatList
          horizontal
          data={mockSessions}
          keyExtractor={(i) => i.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 12 }}
          renderItem={({ item }) => {
            const isSel = item.id === selectedId;
            const started = new Date(item.startedAt);
            const label = `${started.toLocaleDateString()} ${started.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            const mins = Math.round(item.durationSec / 60);
            return (
              <View
                style={{
                  padding: 12,
                  borderRadius: 12,
                  backgroundColor: isSel ? '#2563EB' : '#fff',
                  shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
                }}
                onTouchEnd={() => setSelectedId(item.id)}
              >
                <Text style={{ color: isSel ? '#fff' : '#111827', fontWeight: '700' }}>{label}</Text>
                <Text style={{ color: isSel ? '#E0E7FF' : '#6B7280' }}>{mins}분</Text>
              </View>
            );
          }}
        />
      </View>

      {/* 본문: 히트맵 + 분석/추천 */}
      <FlatList
        data={selected ? [selected] : []}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 16, gap: 16 }}
        renderItem={({ item }) => (
          <View style={{ gap: 16 }}>
            {/* 센서 히트맵 */}
            <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: 8 }}>센서 히트맵</Text>
              <SensorHeatmapView left={item.left} right={item.right} width={150} />
            </View>

            {/* AI 분석 */}
            <AIAnalysisCard session={item} />

            {/* 테이핑 추천 */}
            <RecommendedTapeCard session={item} />
          </View>
        )}
      />
    </View>
  );
}