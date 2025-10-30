import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import SideMenu from '../components/SideMenu';
import { injuryVideos } from '../data/injuryVideos';

export default function VideoScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const [open, setOpen] = useState(false);

  // 로그인 시 전달된 사용자 이름 (없으면 '사용자')
  const userName = route.params?.userName ?? '사용자';

  return (
    <View style={{ flex: 1, backgroundColor: '#E8F2DF' }}>
      {/* 상단 바 */}
      <View
        style={{
          height: 56,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          gap: 12,
        }}
      >
        <Pressable onPress={() => setOpen(true)} hitSlop={10}>
          <Text style={{ fontSize: 24 }}>☰</Text>
        </Pressable>
        <Text style={{ fontSize: 22, fontWeight: '800' }}>테이핑 영상 목록</Text>
      </View>

      {/* 콘텐츠 */}
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        {injuryVideos.map((injury) => (
          <View
            key={injury.id}
            style={{
              backgroundColor: '#fff',
              borderRadius: 12,
              padding: 16,
              shadowColor: '#000',
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#2E7D32' }}>
              {injury.name}
            </Text>

            {injury.videos.map((v) => (
              <TouchableOpacity
                key={v.id}
                onPress={() => nav.navigate('VideoPlayer', { url: v.url, title: v.title })}
                style={{
                  marginTop: 12,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderWidth: 1,
                  borderColor: '#C8E6C9',
                  borderRadius: 8,
                  backgroundColor: '#F1F8E9',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                {v.thumbNo === v.id ? (
                  <Image source={v.thumbnail as any} style={{ width: 56, height: 56, borderRadius: 8 }} />
                ) : null}
                <Text style={{ color: '#1B5E20', fontWeight: '600', flexShrink: 1 }}>
                  {v.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>

      {/* 사이드 메뉴 */}
      <SideMenu open={open} onClose={() => setOpen(false)} userName={userName} />
    </View>
  );
}
