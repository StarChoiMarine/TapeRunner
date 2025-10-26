import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import type { AIAnalysisResult, RunSession } from '../types/analysis';
import { requestAnalysis } from '../services/ai';

export default function AIAnalysisCard({ session }: { session: RunSession }) {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<AIAnalysisResult | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    requestAnalysis(session)
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


