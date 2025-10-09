// src/components/TapeCarousel.tsx
import React from 'react';
import { FlatList, Image, Pressable, Text, View } from 'react-native';

type Tape = { id: string; title: string; thumb: string };

const DATA: Tape[] = [
  { id: '1', title: '외측 발목 염좌', thumb: 'https://i.imgur.com/uWnG6OU.png' },
  { id: '2', title: '내측 발목 안정', thumb: 'https://i.imgur.com/1pI7k1c.png' },
  { id: '3', title: '아킬레스 안정', thumb: 'https://i.imgur.com/S5vFQJx.png' },
];

export default function TapeCarousel() {
  return (
    <View>
      <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: 8 }}>러닝 전 테이핑 추천</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={DATA}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ gap: 12 }}
        renderItem={({ item }) => (
          <Pressable style={{
            width: 180, backgroundColor: '#fff', borderRadius: 14, padding: 12,
            shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2
          }}>
            <View style={{ height: 100, borderRadius: 10, backgroundColor: '#f3f4f6', overflow: 'hidden', marginBottom: 8 }}>
              <Image source={{ uri: item.thumb }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
            </View>
            <Text style={{ fontWeight: '600' }}>{item.title}</Text>
            <Text style={{ color: '#9CA3AF', fontSize: 12, marginTop: 4 }}>영상 보기</Text>
          </Pressable>
        )}
      />
    </View>
  );
}
