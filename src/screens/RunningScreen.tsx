// src/screens/RunningScreen.tsx
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Switch, Pressable, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FootDots from '../components/FootDots';
import { useBle } from '../store/ble/BleProvider';
import { sensorDataCollector } from '../services/sensorDataCollector';
import type { RunSession } from '../types/analysis';

type SensorMap = Record<number, number>;

export default function RunningScreen() {
  const nav = useNavigation<any>();
  const { leftVals, rightVals, isLeftConnected, isRightConnected } = useBle();

  // 데이터 수집 상태
  const [collectionStats, setCollectionStats] = useState<{
    isCollecting: boolean;
    dataPoints: number;
    durationSec: number;
  }>({ isCollecting: false, dataPoints: 0, durationSec: 0 });

  // ── UI 스위치 상태
  const [showRealtime, setShowRealtime] = useState(true); // 실시간 압력 표시
  const [isTaping, setIsTaping] = useState(false);        // 테이핑 여부
  const [isPaused, setIsPaused] = useState(false);        // 기록 일시정지

  // ── 누적(합계 / 카운트) 버퍼 (발별)
  const sumL = useRef<Record<number, number>>({});
  const sumR = useRef<Record<number, number>>({});
  const cntL = useRef<Record<number, number>>({});
  const cntR = useRef<Record<number, number>>({});
  const runStartRef = useRef<number | null>(null);

  // 센서 데이터 변경 시 처리 (일시정지 중이면 무시)
  useEffect(() => {
    if (isPaused) return;

    // 왼발 또는 오른발 데이터가 있어야 처리
    if (!leftVals && !rightVals) return;

    // 왼발 데이터 누적
    if (leftVals) {
      for (const [sidStr, v] of Object.entries(leftVals as SensorMap)) {
        const sid = Number(sidStr);
        sumL.current[sid] = (sumL.current[sid] ?? 0) + (Number(v) || 0);
        cntL.current[sid] = (cntL.current[sid] ?? 0) + 1;
      }
    }

    // 오른발 데이터 누적
    if (rightVals) {
      for (const [sidStr, v] of Object.entries(rightVals as SensorMap)) {
        const sid = Number(sidStr);
        sumR.current[sid] = (sumR.current[sid] ?? 0) + (Number(v) || 0);
        cntR.current[sid] = (cntR.current[sid] ?? 0) + 1;
      }
    }

    // 러닝 시작 시 데이터 수집 시작
    if (!runStartRef.current) {
      runStartRef.current = Date.now();
      sensorDataCollector.startSession(`run_${Date.now()}`);
      console.log('🏃‍♂️ 러닝 및 데이터 수집 시작');
    }

    // 데이터 수집 중이면 현재 데이터 포인트 추가 (sensorDataCollector 내부에서 시간 필터링)
    const currentSession = sensorDataCollector.getCurrentSession();
    if (currentSession?.isCollecting) {
      sensorDataCollector.addDataPoint(leftVals || {}, rightVals || {});
    }
  }, [leftVals, rightVals, isPaused]);

  // 데이터 수집 상태 업데이트 (1초마다)
  useEffect(() => {
    const interval = setInterval(() => {
      const session = sensorDataCollector.getCurrentSession();
      if (session) {
        const stats = sensorDataCollector.getSessionStats(session);
        setCollectionStats({
          isCollecting: session.isCollecting,
          dataPoints: stats?.totalPoints || 0,
          durationSec: Math.round((Date.now() - session.startTime) / 1000),
        });
      } else {
        setCollectionStats({ isCollecting: false, dataPoints: 0, durationSec: 0 });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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
  const togglePause = () => {
    const newPaused = !isPaused;
    setIsPaused(newPaused);

    // 데이터 수집도 함께 제어
    const currentSession = sensorDataCollector.getCurrentSession();
    if (currentSession) {
      // 실제로는 세션의 isCollecting을 토글하지만,
      // 현재 구현에서는 일시정지 시 데이터 수집을 건너뛰도록 useEffect에서 처리
      console.log(`${newPaused ? '일시정지' : '재개'}: 데이터 수집 ${newPaused ? '중지' : '시작'}`);
    }
  };

  // STOP: 평균 만들고 세션 구성하여 분석 화면으로 이동 + 센서 데이터 저장
  const onStop = async () => {
    try {
      // 1. 데이터 수집 중지
      const dataSession = sensorDataCollector.stopSession();

      // 2. 평균 계산 및 기존 세션 생성
      const avgLeft = toAverage(sumL.current, cntL.current);
      const avgRight = toAverage(sumR.current, cntR.current);

      const now = Date.now();
      const startedMs = runStartRef.current ?? now;
      const durationSec = Math.max(1, Math.round((now - startedMs) / 1000));
      const session: RunSession = {
        id: `run-${now}`,
        startedAt: new Date(startedMs).toISOString(),
        durationSec,
        left: avgLeft,
        right: avgRight,
      };

      // 3. 센서 데이터를 CSV로 저장
      if (dataSession && dataSession.dataPoints.length > 0) {
        const filePath = await sensorDataCollector.saveToCSV(dataSession);
        const stats = sensorDataCollector.getSessionStats(dataSession);

        console.log(`센서 데이터가 저장되었습니다: ${filePath}`);
        console.log(`수집된 데이터 포인트: ${stats?.totalPoints || 0}개`);
        console.log(`평균 데이터 속도: ${stats?.avgDataRate.toFixed(2) || 0} Hz`);

        // 사용자에게 저장 완료 알림
        Alert.alert(
          '데이터 저장 완료',
          `센서 데이터가 저장되었습니다.\n파일: ${filePath.split('/').pop()}\n데이터 포인트: ${stats?.totalPoints || 0}개`,
          [{ text: '확인' }]
        );
      } else {
        Alert.alert('알림', '수집된 센서 데이터가 없습니다.', [{ text: '확인' }]);
      }

      // 4. 분석 화면으로 이동
      nav.navigate('Analysis', { session });

      // 5. 다음 러닝을 위해 리셋
      sumL.current = {}; sumR.current = {}; cntL.current = {}; cntR.current = {};
      runStartRef.current = null;
      sensorDataCollector.resetSession();
      setIsPaused(false);

    } catch (error) {
      console.error('데이터 저장 중 오류 발생:', error);
      Alert.alert(
        '저장 오류',
        '센서 데이터 저장 중 오류가 발생했습니다. 분석은 계속 진행됩니다.',
        [{ text: '확인' }]
      );

      // 오류가 발생해도 분석 화면으로는 이동
      const avgLeft = toAverage(sumL.current, cntL.current);
      const avgRight = toAverage(sumR.current, cntR.current);
      const now = Date.now();
      const startedMs = runStartRef.current ?? now;
      const durationSec = Math.max(1, Math.round((now - startedMs) / 1000));
      const session: RunSession = {
        id: `run-${now}`,
        startedAt: new Date(startedMs).toISOString(),
        durationSec,
        left: avgLeft,
        right: avgRight,
      };
      nav.navigate('Analysis', { session });

      // 리셋
      sumL.current = {}; sumR.current = {}; cntL.current = {}; cntR.current = {};
      runStartRef.current = null;
      sensorDataCollector.resetSession();
      setIsPaused(false);
    }
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

      {/* 데이터 수집 상태 표시 */}
      {collectionStats.isCollecting && (
        <View style={{
          backgroundColor: '#E0F2FE',
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 8,
          marginTop: 8,
          alignSelf: 'flex-start',
        }}>
          <Text style={{ fontSize: 14, color: '#0277BD', fontWeight: '600' }}>
            📊 데이터 수집 중: {collectionStats.dataPoints} 포인트 ({collectionStats.durationSec}초)
          </Text>
        </View>
      )}

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
