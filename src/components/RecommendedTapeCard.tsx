import React from 'react';
import { Image, Text, View } from 'react-native';
import type { RunSession, TapeRecommendation } from '../types/analysis';
import { deriveTapeRecommendation } from '../data/mockSessions';

export default function RecommendedTapeCard({ session }: { session: RunSession }) {
  const reco: TapeRecommendation = deriveTapeRecommendation(session);

  return (
    <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16 }}>
      <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: 8 }}>테이핑 추천</Text>
      <Text style={{ color: '#374151', marginBottom: 8 }}>
        카테고리: {reco.category}
      </Text>
      {reco.reasons.length > 0 && (
        <Text style={{ color: '#6B7280', marginBottom: 8 }}>
          사유: {reco.reasons.join(', ')}
        </Text>
      )}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        {reco.videos.map((v) => (
          <View key={v.id} style={{ width: 160 }}>
            <View style={{ height: 90, borderRadius: 10, backgroundColor: '#f3f4f6', overflow: 'hidden', marginBottom: 6 }}>
              <Image source={{ uri: v.thumbUrl }} style={{ width: '100%', height: '100%' }} />
            </View>
            <Text numberOfLines={2} style={{ fontWeight: '600' }}>{v.title}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}


