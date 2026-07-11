// src/screens/AnalysisScreen.tsx
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import AnalysisReport from '../components/AnalysisReport';
import { requestAnalysis } from '../services/ai';
import { hasFinalAnalysis, saveFinalAnalysis } from '../services/db';
import { deriveRecommendation } from '../services/recommendation';
import type { AIAnalysisResult, RunSession } from '../types/analysis';
import { color, font } from '../theme';

export default function AnalysisScreen() {
  const route = useRoute<any>();
  const nav = useNavigation<any>();
  const selected: RunSession | undefined = route.params?.session;

  const [aiLoading, setAiLoading] = useState(true);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const savedRef = useRef(false);

  // AI 분석 요청 + 최초 1회 로컬 저장 (기존 AIAnalysisCard 동작 유지)
  useEffect(() => {
    if (!selected) return;
    let mounted = true;
    savedRef.current = false;
    setAiLoading(true);
    requestAnalysis(selected)
      .then(async (r) => {
        if (!mounted) return;
        setAiResult(r);
        if (!savedRef.current) {
          savedRef.current = true;
          try {
            const exists = await hasFinalAnalysis(selected.id);
            if (exists) return;
            const reco = deriveRecommendation(selected);
            await saveFinalAnalysis({
              sessionId: selected.id,
              startedAt: selected.startedAt,
              durationSec: selected.durationSec,
              left: selected.left,
              right: selected.right,
              aiText: r.text,
              aiCreatedAt: r.createdAt,
              tapeVideoUrl: reco.videos[0]?.url ?? null,
            });
          } catch {
            // 저장 실패는 UI에 영향을 주지 않음
          }
        }
      })
      .finally(() => mounted && setAiLoading(false));
    return () => {
      mounted = false;
    };
  }, [selected]);

  return (
    <View style={{ flex: 1, backgroundColor: color.bg }}>
      {/* 상단 바 */}
      <View style={{ height: 60, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 12 }}>
        <Pressable onPress={() => nav.goBack()} hitSlop={12}>
          <Text style={{ fontSize: 26, color: color.ink, marginTop: -2 }}>‹</Text>
        </Pressable>
        <Text style={{ fontFamily: font.extrabold, fontSize: 19, color: color.ink }}>분석 리포트</Text>
      </View>

      {selected ? (
        <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 6, paddingBottom: 40 }}>
          <AnalysisReport session={selected} aiText={aiResult?.text} aiLoading={aiLoading} />
        </ScrollView>
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 6 }}>
          <Text style={{ fontFamily: font.semibold, fontSize: 15, color: color.ink }}>세션 데이터가 없어요</Text>
          <Text style={{ fontFamily: font.regular, fontSize: 13, color: color.inkSoft }}>
            러닝을 마치면 분석 리포트가 만들어져요
          </Text>
        </View>
      )}
    </View>
  );
}
