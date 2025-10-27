import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import SideMenu from '../components/SideMenu';
import DeviceStatusCard from '../components/DeviceStatusCard';
import { injuryVideos } from '../data/injuryVideos';

export default function HomeScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const [open, setOpen] = useState(false);

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
        <Text style={{ fontSize: 22, fontWeight: '800' }}>TAPE</Text>
      </View>

      {/* 콘텐츠 */}
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        {/* 디바이스 상태 카드 */}
        <DeviceStatusCard />

        {/* 테이핑 영상 리스트 */}
        <View style={{ gap: 20 }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: '#1B5E20' }}>
            부상별 테이핑 영상
          </Text>

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
                  <Image
                    source={{
                      uri: 'https://cdn-icons-png.flaticon.com/512/727/727245.png',
                    }}
                    style={{ width: 24, height: 24 }}
                  />
                  <Text style={{ color: '#1B5E20', fontWeight: '600', flexShrink: 1 }}>
                    {v.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* RUN 버튼 */}
      <Pressable
        onPress={() => nav.navigate('Running')}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 24,
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: 90,
            height: 90,
            borderRadius: 45,
            backgroundColor: '#2E7D32',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOpacity: 0.2,
            shadowRadius: 12,
            elevation: 6,
          }}
        >
          <Text style={{ color: 'white', fontWeight: '800' }}>RUN</Text>
        </View>
      </Pressable>

      {/* 사이드 메뉴 */}
      <SideMenu open={open} onClose={() => setOpen(false)} userName={userName} />
    </View>
  );
}
