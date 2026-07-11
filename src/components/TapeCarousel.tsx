// src/components/TapeCarousel.tsx
// 러닝 전 케어 체크리스트 — 예측 부상별 추천 테이핑 영상을 번호 매긴 리스트로 표시
import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { injuryVideos } from '../data/injuryVideos';
import { color, font, radius, shadow } from '../theme';

interface Props {
  predictedInjuries: string[]; // 여러 개의 부상명 (예: ["PFPS", "ITBS"])
}

// "Plantar Fasciitis (족저근막염)" → 한글명만
function koName(name: string): string {
  const m = name.match(/\((.*?)\)/);
  return m ? m[1].trim() : name;
}

type CheckItem = {
  key: string;
  injuryKo: string;
  title: string;
  url: string;
  thumbnail: any | null;
};

export default function TapeCarousel({ predictedInjuries }: Props) {
  const nav = useNavigation<any>();

  // 예측 부상별 대표 영상 1개씩 → 체크리스트 항목
  const items: CheckItem[] = [];
  for (const injury of injuryVideos) {
    if (!predictedInjuries.some((name) => injury.name.includes(name))) continue;
    const v = injury.videos[0];
    if (!v) continue;
    items.push({
      key: `${injury.id}-${v.id}`,
      injuryKo: koName(injury.name),
      title: v.title,
      url: v.url,
      thumbnail: (v as any).thumbNo === v.id ? (v as any).thumbnail : null,
    });
  }

  if (items.length === 0) {
    return (
      <View
        style={{
          backgroundColor: color.surface,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: color.line,
          padding: 24,
          alignItems: 'center',
          gap: 4,
        }}
      >
        <Text style={{ fontFamily: font.semibold, fontSize: 15, color: color.ink }}>
          아직 추천할 케어 루틴이 없어요
        </Text>
        <Text style={{ fontFamily: font.regular, fontSize: 13, color: color.inkSoft }}>
          러닝을 마치면 분석 결과에 맞는 루틴을 만들어 드려요
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        backgroundColor: color.surface,
        borderRadius: radius.xl,
        borderWidth: 1,
        borderColor: color.line,
        overflow: 'hidden',
        ...shadow.card,
        shadowOpacity: 0.05,
      }}
    >
      {items.map((item, i) => (
        <View key={item.key}>
          {i > 0 && <View style={{ height: 1, backgroundColor: color.line, marginLeft: 66 }} />}
          <Pressable
            onPress={() => nav.navigate('VideoPlayer', { url: item.url, title: item.title })}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
              padding: 14,
              backgroundColor: pressed ? color.bg : 'transparent',
            })}
          >
            {/* 순번 */}
            <View
              style={{
                width: 26, height: 26, borderRadius: 13,
                backgroundColor: i === 0 ? color.lime : color.bg,
                borderWidth: i === 0 ? 0 : 1,
                borderColor: color.line,
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Text style={{ fontFamily: font.extrabold, fontSize: 12, color: i === 0 ? color.surfaceDeeper : color.inkFaint }}>
                {i + 1}
              </Text>
            </View>

            {/* 썸네일 */}
            <View
              style={{
                width: 86, height: 58,
                borderRadius: radius.sm,
                backgroundColor: color.surfaceDeeper,
                overflow: 'hidden',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {item.thumbnail ? (
                <Image source={item.thumbnail} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              ) : (
                <Text style={{ fontSize: 14, color: color.ivoryFaint }}>▶</Text>
              )}
            </View>

            {/* 텍스트 */}
            <View style={{ flex: 1, gap: 4 }}>
              <View style={{ flexDirection: 'row' }}>
                <View
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 2.5,
                    borderRadius: radius.pill,
                    backgroundColor: 'rgba(79,168,117,0.12)',
                  }}
                >
                  <Text style={{ fontFamily: font.bold, fontSize: 10.5, color: color.leaf }}>
                    {item.injuryKo}
                  </Text>
                </View>
              </View>
              <Text numberOfLines={2} style={{ fontFamily: font.semibold, fontSize: 13.5, lineHeight: 18, color: color.ink }}>
                {item.title}
              </Text>
            </View>

            <Text style={{ fontFamily: font.regular, fontSize: 18, color: color.inkFaint }}>›</Text>
          </Pressable>
        </View>
      ))}

      {/* 푸터 */}
      <View style={{ paddingHorizontal: 14, paddingVertical: 10, backgroundColor: color.bg }}>
        <Text style={{ fontFamily: font.regular, fontSize: 11, color: color.inkSoft }}>
          러닝 전 5분, 위험 부위를 테이핑하면 부상 예방에 도움이 돼요
        </Text>
      </View>
    </View>
  );
}
