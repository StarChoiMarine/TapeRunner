import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import type { AIAnalysisResult, RunSession } from '../types/analysis';
import { requestAnalysis } from '../services/ai';
import { hasFinalAnalysis, saveFinalAnalysis } from '../services/db';
import { deriveRecommendation } from '../services/recommendation';

export default function AIAnalysisCard({ session }: { session: RunSession }) {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<AIAnalysisResult | null>(null);
  const savedRef = useRef(false);

  useEffect(() => {
    let mounted = true;
    savedRef.current = false;
    setLoading(true);
    requestAnalysis(session)
      .then(async (r) => {
        if (!mounted) return;
        setResult(r);
        // 저장: 최초 1회만 수행
        if (!savedRef.current) {
          savedRef.current = true;
          try {
            // 중복 저장 방지
            const exists = await hasFinalAnalysis(session.id);
            if (exists) return;
            const reco = deriveRecommendation(session);
            const tapeUrl = reco.videos[0]?.url ?? null;
            await saveFinalAnalysis({
              sessionId: session.id,
              startedAt: session.startedAt,
              durationSec: session.durationSec,
              left: session.left,
              right: session.right,
              aiText: r.text,
              aiCreatedAt: r.createdAt,
              tapeVideoUrl: tapeUrl,
            });
          } catch (e) {
            // 저장 실패는 UI에 영향을 주지 않음
          }
        }
      })
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


