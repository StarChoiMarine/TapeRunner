import React from 'react';
import { Pressable, Text, View } from 'react-native';
import type { RunSession } from '../types/analysis';
import { deriveRecommendation } from '../services/recommendation';
import { useNavigation } from '@react-navigation/native';

export default function RecommendedTapeCard({ session }: { session: RunSession }) {
  const nav = useNavigation<any>();
  const reco = deriveRecommendation(session);

  return (
    <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16 }}>
      <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: 8 }}>테이핑 추천</Text>
      <Text style={{ color: '#374151', marginBottom: 8 }}>카테고리: {reco.label}</Text>
      {reco.reasons.length > 0 ? (
        <Text style={{ color: '#6B7280', marginBottom: 8 }}>사유: {reco.reasons.join(', ')}</Text>
      ) : null}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        {reco.videos.map((v, idx) => (
          <Pressable
            key={idx}
            onPress={() => nav.navigate('VideoPlayer', { url: v.url, title: v.title })}
            style={{ width: 180, backgroundColor: '#F3F4F6', borderRadius: 10, padding: 10 }}
          >
            <Text numberOfLines={2} style={{ fontWeight: '600' }}>{v.title}</Text>
            <Text style={{ color: '#2563EB', marginTop: 6 }}>바로 보기 ▶︎</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}


