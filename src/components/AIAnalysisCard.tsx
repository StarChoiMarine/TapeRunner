import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import type { AIAnalysisResult, RunSession } from '../types/analysis';

// 실제 연동 전까지는 모킹
async function fetchAIAnalysis(session: RunSession): Promise<AIAnalysisResult> {
  // 생성형 AI 호출 자리 (서버 API 연동 예정)
  await new Promise((r) => setTimeout(r, 400));
  const mins = Math.round(session.durationSec / 60);
  return {
    text:
      `러닝 시간 ${mins}분. 전족부와 후족부 하중 분포를 기준으로 보행 안정성을 평가했습니다. ` +
      `편측 하중이 감지되는 구간에서는 착지시 발목 외반/내반 제어에 신경 써주세요.`,
    createdAt: new Date().toISOString(),
  };
}

export default function AIAnalysisCard({ session }: { session: RunSession }) {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<AIAnalysisResult | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchAIAnalysis(session)
      .then((r) => mounted && setResult(r))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [session]);

  return (
    <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, gap: 8 }}>
      <Text style={{ fontSize: 16, fontWeight: '700' }}>AI 분석</Text>
      {loading ? (
        <View style={{ paddingVertical: 12 }}>
          <ActivityIndicator />
        </View>
      ) : (
        <Text style={{ color: '#111827', lineHeight: 20 }}>
          {result?.text || '분석 결과를 불러오지 못했습니다.'}
        </Text>
      )}
    </View>
  );
}


