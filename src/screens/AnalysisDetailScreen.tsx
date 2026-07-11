// src/screens/AnalysisDetailScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getAllFinalAnalyses } from '../services/db';
import AnalysisReport from '../components/AnalysisReport';
import { color, font } from '../theme';

export default function AnalysisDetailScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const id: number = route.params?.id;
  const [row, setRow] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getAllFinalAnalyses()
      .then((rows) => {
        if (!mounted) return;
        setRow(rows.find((r) => r.id === id) || null);
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [id]);

  return (
    <View style={{ flex: 1, backgroundColor: color.bg }}>
      {/* 상단 바 */}
      <View style={{ height: 60, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 12 }}>
        <Pressable onPress={() => nav.goBack()} hitSlop={12}>
          <Text style={{ fontSize: 26, color: color.ink, marginTop: -2 }}>‹</Text>
        </Pressable>
        <Text style={{ fontFamily: font.extrabold, fontSize: 19, color: color.ink }}>분석 리포트</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={color.pine} />
        </View>
      ) : row ? (
        <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 6, paddingBottom: 40 }}>
          <AnalysisReport
            session={{
              startedAt: row.startedAt,
              durationSec: row.durationSec,
              left: row.left,
              right: row.right,
            }}
            aiText={row.aiText}
          />
        </ScrollView>
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontFamily: font.semibold, fontSize: 15, color: color.ink }}>
            리포트를 찾을 수 없어요
          </Text>
        </View>
      )}
    </View>
  );
}
