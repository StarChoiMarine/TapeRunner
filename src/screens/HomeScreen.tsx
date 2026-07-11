// src/screens/HomeScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, ScrollView, Animated, Easing } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SideMenu from '../components/SideMenu';
import DeviceStatusCard from '../components/DeviceStatusCard';
import TapeCarousel from '../components/TapeCarousel';
import ConditionDashboard from '../components/ConditionDashboard';
import { color, font, radius, shadow } from '../theme';

// 진입 시 아래→위 페이드 (스태거)
function Reveal({ delay, children }: { delay: number; children: React.ReactNode }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, {
      toValue: 1,
      duration: 520,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [v, delay]);

  return (
    <Animated.View
      style={{
        opacity: v,
        transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [22, 0] }) }],
      }}
    >
      {children}
    </Animated.View>
  );
}

// 햄버거 아이콘 (이모지 대신 직접 그림)
function MenuIcon() {
  return (
    <View style={{ width: 22, gap: 5 }}>
      <View style={{ height: 2.5, borderRadius: 2, backgroundColor: color.ink }} />
      <View style={{ height: 2.5, borderRadius: 2, backgroundColor: color.ink, width: 15 }} />
      <View style={{ height: 2.5, borderRadius: 2, backgroundColor: color.ink }} />
    </View>
  );
}

export default function HomeScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const [open, setOpen] = useState(false);
  const [predictedInjuries, setPredictedInjuries] = useState<string[]>([]);

  const userName = route.params?.userName ?? '사용자';

  // RUN 버튼 주변 은은한 펄스 링
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1600, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    ).start();
  }, [pulse]);

  useEffect(() => {
    const initTestData = async () => {
      // ✅ 테스트용 더미 부상 데이터, 실제 데이터 삽입 시 삭제
      const dummyPredictions = ['PFPS', 'Achilles Tendinopathy', 'Inversion Sprain'];
      await AsyncStorage.setItem('predictedInjuries', JSON.stringify(dummyPredictions));
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
    <View style={{ flex: 1, backgroundColor: color.bg }}>
      {/* 상단 바 */}
      <View
        style={{
          height: 64,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20,
          gap: 14,
        }}
      >
        <Pressable onPress={() => setOpen(true)} hitSlop={12}>
          <MenuIcon />
        </Pressable>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
          <Text style={{ fontFamily: font.extrabold, fontSize: 19, letterSpacing: 2.5, color: color.pine }}>
            TAPE
          </Text>
          <Text style={{ fontFamily: font.regular, fontSize: 19, letterSpacing: 2.5, color: color.inkFaint }}>
            RUNNER
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 4, paddingBottom: 150, gap: 28 }}>
        {/* 인사말 */}
        <Reveal delay={0}>
          <Text style={{ fontFamily: font.extrabold, fontSize: 26, lineHeight: 34, color: color.ink }}>
            {userName}님,{'\n'}오늘도 가볍게 달려볼까요
          </Text>
        </Reveal>

        {/* 기기/상태 히어로 카드 */}
        <Reveal delay={120}>
          <DeviceStatusCard />
        </Reveal>

        {/* 컨디션 대시보드 */}
        <Reveal delay={240}>
          <ConditionDashboard predictedInjuries={predictedInjuries} />
        </Reveal>

        {/* 러닝 전 케어 체크 */}
        <Reveal delay={340}>
          <View style={{ gap: 12 }}>
            <View style={{ gap: 4 }}>
              <Text style={{ fontFamily: font.semibold, fontSize: 11, letterSpacing: 2.4, color: color.inkFaint }}>
                PRE-RUN CARE
              </Text>
              <Text style={{ fontFamily: font.extrabold, fontSize: 21, color: color.ink }}>
                러닝 전 케어 체크
              </Text>
            </View>
            <TapeCarousel predictedInjuries={predictedInjuries} />
          </View>
        </Reveal>
      </ScrollView>

      {/* RUN 버튼 */}
      <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, bottom: 28, alignItems: 'center' }}>
        {/* 펄스 링 */}
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            bottom: -4,
            width: 100,
            height: 100,
            borderRadius: 50,
            borderWidth: 2,
            borderColor: color.lime,
            opacity: pulse.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 0.65, 0] }),
            transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1.45] }) }],
          }}
        />
        <Pressable onPress={() => nav.navigate('Running')}>
          {({ pressed }) => (
            <View
              style={{
                width: 92,
                height: 92,
                borderRadius: 46,
                backgroundColor: pressed ? color.limeDeep : color.lime,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 4,
                borderColor: color.surfaceDeep,
                ...shadow.float,
              }}
            >
              <Text style={{ fontFamily: font.extrabold, fontSize: 17, letterSpacing: 2, color: color.surfaceDeeper }}>
                RUN
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      <SideMenu open={open} onClose={() => setOpen(false)} userName={userName} />
    </View>
  );
}
