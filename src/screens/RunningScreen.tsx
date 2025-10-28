// src/screens/RunningScreen.tsx
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Switch, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FootDots from '../components/FootDots';
import { useBle } from '../store/ble/BleProvider';

type SensorMap = Record<number, number>;

export default function RunningScreen() {
  const nav = useNavigation<any>();
  const { leftVals, rightVals, isLeftConnected, isRightConnected } = useBle();

  // ── UI 스위치 상태
  const [showRealtime, setShowRealtime] = useState(true); // 실시간 압력 표시
  const [isTaping, setIsTaping] = useState(false);        // 테이핑 여부
  const [isPaused, setIsPaused] = useState(false);        // 기록 일시정지

  // ── 누적(합계 / 카운트) 버퍼 (발별)
  const sumL = useRef<Record<number, number>>({});
  const sumR = useRef<Record<number, number>>({});
  const cntL = useRef<Record<number, number>>({});
  const cntR = useRef<Record<number, number>>({});

  // 발별로 새 프레임 들어올 때마다 누적 (일시정지 중이면 무시)
  useEffect(() => {
    if (isPaused) return;
    if (!leftVals) return;

    for (const [sidStr, v] of Object.entries(leftVals as SensorMap)) {
      const sid = Number(sidStr);
      sumL.current[sid] = (sumL.current[sid] ?? 0) + (Number(v) || 0);
      cntL.current[sid] = (cntL.current[sid] ?? 0) + 1;
    }
  }, [leftVals, isPaused]);

  useEffect(() => {
    if (isPaused) return;
    if (!rightVals) return;

    for (const [sidStr, v] of Object.entries(rightVals as SensorMap)) {
      const sid = Number(sidStr);
      sumR.current[sid] = (sumR.current[sid] ?? 0) + (Number(v) || 0);
      cntR.current[sid] = (cntR.current[sid] ?? 0) + 1;
    }
  }, [rightVals, isPaused]);

  // 평균 계산 유틸
  const toAverage = (sum: Record<number, number>, cnt: Record<number, number>) => {
    const out: Record<number, number> = {};
    const keys = new Set<number>([
      ...Object.keys(sum).map(Number),
      ...Object.keys(cnt).map(Number),
    ]);
    keys.forEach((k) => {
      const c = cnt[k] ?? 0;
      out[k] = c > 0 ? (sum[k] ?? 0) / c : 0;
    });
    return out;
  };

  // 일시정지/재개
  const togglePause = () => setIsPaused((p) => !p);

  // STOP: 평균 만들고 분석 화면으로 이동
  const onStop = () => {
    const avgLeft = toAverage(sumL.current, cntL.current);
    const avgRight = toAverage(sumR.current, cntR.current);

    // 필요하면 여기서 전역스토어에 저장하는 로직을 넣어도 됨.
    // 예: useAppStore.getState().saveRun({ avgLeft, avgRight, isTaping })

    // 분석 화면으로 네비게이션 (파라미터 전달)
    nav.navigate('Analysis', {
      avgLeft,
      avgRight,
      isTaping,
      frames: {
        left: Object.values(cntL.current).reduce((a, b) => a + b, 0),
        right: Object.values(cntR.current).reduce((a, b) => a + b, 0),
      },
    });

    // 다음 러닝을 위해 리셋하고 싶다면 주석 해제
    // sumL.current = {}; sumR.current = {}; cntL.current = {}; cntR.current = {};
    // setIsPaused(false);
  };

  // 실시간 표시 토글이 꺼져 있으면 빈 맵을 넘겨서 파편만 흐리게 보이게
  const liveLeft: SensorMap = showRealtime ? leftVals : {};
  const liveRight: SensorMap = showRealtime ? rightVals : {};

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: '#EEF5E8' }}>
      {/* 헤더 */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ fontSize: 26, fontWeight: '800' }}>Running</Text>
        <Text style={{ marginLeft: 10, color: '#64748b' }}>
          {isLeftConnected || isRightConnected ? '연결됨' : '연결 대기'}
        </Text>
      </View>

      {/* 발 모양(왼/오) */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', marginTop: 24 }}>
        <FootDots sensorValues={liveLeft} mirror width={170} height={240} radius={16} showFaintWhenZero />
        <FootDots sensorValues={liveRight} width={170} height={240} radius={16} showFaintWhenZero />
      </View>

      <Text style={{ textAlign: 'center', marginTop: 12, color: '#334155' }}>
        {showRealtime ? '실시간 발바닥 압력' : '실시간 표시 꺼짐'}
      </Text>

      {/* 스위치 패널 */}
      <View
        style={{
          marginTop: 18,
          backgroundColor: '#fff',
          borderRadius: 16,
          paddingVertical: 12,
          paddingHorizontal: 14,
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 2,
          alignSelf: 'center',
          width: 260,
        }}
      >
        {/* 실시간 압력 표시 */}
        <Row>
          <Text style={{ fontSize: 16, fontWeight: '700' }}>실시간 압력 표시</Text>
          <Switch value={showRealtime} onValueChange={setShowRealtime} />
        </Row>

        {/* 테이핑 여부 */}
        <Row style={{ marginTop: 10 }}>
          <Text style={{ fontSize: 16, fontWeight: '700' }}>테이핑 여부</Text>
          <Switch value={isTaping} onValueChange={setIsTaping} />
        </Row>

        {/* 기록 일시정지/재개 */}
        <Pressable
          onPress={togglePause}
          style={{
            marginTop: 12,
            alignSelf: 'stretch',
            backgroundColor: isPaused ? '#16a34a' : '#f59e0b',
            paddingVertical: 10,
            borderRadius: 10,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '800' }}>
            {isPaused ? '재개' : '압력 기록 일시정지'}
          </Text>
        </Pressable>
      </View>

      {/* STOP 버튼 */}
      <Pressable
        onPress={onStop}
        style={{
          marginTop: 22,
          alignSelf: 'center',
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: '#EF4444',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOpacity: 0.12,
          shadowRadius: 10,
          elevation: 3,
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '900', fontSize: 22 }}>STOP</Text>
      </Pressable>
    </View>
  );
}

/** 작은 정렬 유틸 */
function Row({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: object;
}) {
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
