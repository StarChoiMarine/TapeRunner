import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getAllFinalAnalyses } from '../services/db';
import SensorHeatmapView from '../components/SensorHeatmapView';
import { formatKSTDate, formatKSTTime } from '../utils/kst';

export default function AnalysisDetailScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const id: number = route.params?.id;
  const [row, setRow] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    getAllFinalAnalyses().then((rows) => {
      if (!mounted) return;
      const found = rows.find((r) => r.id === id) || null;
      setRow(found);
    });
    return () => {
      mounted = false;
    };
  }, [id]);

  if (!row) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>로딩 중...</Text>
      </View>
    );
  }

  const startedDate = formatKSTDate(row.startedAt);
  const startedTime = formatKSTTime(row.startedAt);

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      {/* 상단 바 */}
      <View style={{ height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 12 }}>
        <Pressable onPress={() => nav.goBack()} hitSlop={10}>
          <Text style={{ fontSize: 20 }}>‹</Text>
        </Pressable>
        <Text style={{ fontSize: 20, fontWeight: '800' }}>분석 상세</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: 6 }}>세션</Text>
          <Text style={{ color: '#374151' }}>{startedDate} {startedTime}</Text>
          <Text style={{ color: '#6B7280' }}>길이: {Math.round((row.durationSec || 0) / 60)}분</Text>
        </View>

        <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: 6 }}>센서 히트맵</Text>
          <SensorHeatmapView left={row.left} right={row.right} width={150} />
        </View>

        <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: 6 }}>AI 분석</Text>
          <Text style={{ color: '#111827', lineHeight: 20 }}>{row.aiText}</Text>
        </View>

        {row.tapeVideoUrl ? (
          <Pressable
            onPress={() => nav.navigate('VideoPlayer', { url: row.tapeVideoUrl, title: '추천 테이핑' })}
            style={{ backgroundColor: '#2563EB', paddingVertical: 12, borderRadius: 12, alignItems: 'center' }}
          >
            <Text style={{ color: 'white', fontWeight: '700' }}>추천 테이핑 영상 보기</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </View>
  );
}


