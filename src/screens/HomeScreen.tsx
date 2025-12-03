// src/screens/HomeScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SideMenu from '../components/SideMenu';
import DeviceStatusCard from '../components/DeviceStatusCard';
import TapeCarousel from '../components/TapeCarousel';

export default function HomeScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const [open, setOpen] = useState(false);
  const [predictedInjuries, setPredictedInjuries] = useState<string[]>([]);

  const userName = route.params?.userName ?? '사용자';

  useEffect(() => {
      const initTestData = async () => {
          // ✅ 테스트용 더미 부상 데이터, 실제 데이터 삽입 시 삭제
          const dummyPredictions = ['PFPS', 'Achilles Tendinopathy', 'Inversion Sprain'];
          await AsyncStorage.setItem('predictedInjuries', JSON.stringify(dummyPredictions));
          console.log('✅ 테스트용 부상 데이터 저장 완료:', dummyPredictions);
        };

    const loadPredictedInjuries = async () => {
      try {
        const stored = await AsyncStorage.getItem('predictedInjuries');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) setPredictedInjuries(parsed);
        }
      } catch (e) {
        console.error('부상 데이터 불러오기 오류:', e);
      }
    };
    loadPredictedInjuries();

    // 실제 데이터 삽입 시 삭제
    initTestData().then(loadPredictedInjuries);
  }, []);

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

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <DeviceStatusCard />
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#1B5E20' }}>
                {userName}님을 위한 부상별 테이핑 영상
            </Text>
        {/* ✅ 여러 부상에 대한 추천 영상 표시 */}
        <TapeCarousel predictedInjuries={predictedInjuries} />
      </ScrollView>

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

      <SideMenu open={open} onClose={() => setOpen(false)} userName={userName} />
    </View>
  );
}
