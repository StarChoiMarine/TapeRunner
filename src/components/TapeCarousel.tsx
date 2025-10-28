// src/components/TapeCarousel.tsx
import React from 'react';
import { FlatList, Image, Pressable, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { injuryVideos } from '../data/injuryVideos';

interface Props {
  predictedInjuries: string[]; // 여러 개의 부상명 (예: ["PFPS", "ITBS"])
}

export default function TapeCarousel({ predictedInjuries }: Props) {
  const nav = useNavigation<any>();

  // 예측된 부상명과 일치하는 injuryVideo 객체들 필터링
  const matchedInjuries = injuryVideos.filter((injury) =>
    predictedInjuries.some((name) => injury.name.includes(name))
  );

  if (matchedInjuries.length === 0) {
    return (
      <View>
        <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: 8 }}>
          추천할 테이핑 영상이 없습니다.
        </Text>
        <Text style={{ color: '#6B7280' }}>
          예측된 부상 결과가 없습니다.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ gap: 28 }}>
      {matchedInjuries.map((injury) => (
        <View key={injury.id}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '700',
              marginBottom: 8,
              color: '#1B5E20',
            }}
          >
            {injury.name} 관련 테이핑 추천
          </Text>

          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={injury.videos}
            keyExtractor={(i) => i.id.toString()}
            contentContainerStyle={{ gap: 12 }}
            renderItem={({ item }) => (
              <Pressable
                onPress={() =>
                  nav.navigate('VideoPlayer', {
                    url: item.url,
                    title: item.title,
                  })
                }
                style={{
                  width: 180,
                  backgroundColor: '#fff',
                  borderRadius: 14,
                  padding: 12,
                  shadowColor: '#000',
                  shadowOpacity: 0.06,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <View
                  style={{
                    height: 100,
                    borderRadius: 10,
                    backgroundColor: '#f3f4f6',
                    overflow: 'hidden',
                    marginBottom: 8,
                  }}
                >
                  <Image
                    source={{
                      uri: `https://your-bucket-name.s3.ap-northeast-2.amazonaws.com/thumb${item.id}.png`,
                    }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                </View>
                <Text style={{ fontWeight: '600' }}>{item.title}</Text>
                <Text
                  style={{ color: '#9CA3AF', fontSize: 12, marginTop: 4 }}
                >
                  영상 보기
                </Text>
              </Pressable>
            )}
          />
        </View>
      ))}
    </View>
  );
}
