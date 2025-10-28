// src/components/DeviceStatusCard.tsx
import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../store/appStore';
import Svg, { Circle } from 'react-native-svg';

// ✅ 전역 BLE 훅(평면 키로 값 제공: battL/battR, isLeftConnected/isRightConnected 등)
import { useBle } from '../store/ble/BleProvider';

// 기존 임시/파생 상태는 AppStore에서 계속 가져오되,
// 연결/배터리는 BLE 값이 있으면 우선 사용
import { useAppStore } from '../store/AppStore';



const footImg = require('../assets/foot-right.png'); // 오른발 실루엣 PNG
const GREEN = '#2F855A';
const AMBER = '#B45309';
const RED   = '#DC2626';
const MUTED = '#A0AEC0';

const batteryColor = (p: number) => (p >= 60 ? GREEN : p >= 30 ? AMBER : RED);

// 숫자 왼쪽에 표시할 링
function BatteryRingLabel({
  percent,
  fontSize = 20,
  muted = false,
}: {
  percent: number;
  fontSize?: number;
  muted?: boolean;
}) {
  const p = Math.max(0, Math.min(100, percent));
  const color = muted ? MUTED : batteryColor(p);

  const size = fontSize + 5;
  const stroke = Math.max(6, Math.round(size * 0.17)); // 링 두께
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (c * p) / 100;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="#E5E7EB" strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <Text style={{ fontSize, fontWeight: '800', color }}>{p}%</Text>
    </View>
  );
}

function FootIcon({
  side,              // 'L' | 'R'
  color,             // 배터리/상태 색
  boxW = 80,
  boxH = 110,
  scale = 1.35,
}: {
  side: 'L' | 'R';
  color: string;
  boxW?: number;
  boxH?: number;
  scale?: number;
}) {
  return (
    <View
      style={{
        width: boxW,
        height: boxH,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'visible',
      }}
    >
      <Image
        source={footImg}
        resizeMode="contain"
        style={{
          width: boxW,
          height: boxH,
          tintColor: color,
          transform: [{ scale }, { scaleX: side === 'L' ? -1 : 1 }],
        }}
      />
    </View>
  );
}

export default function DeviceStatusCard() {
  const nav = useNavigation<any>();

  // ✅ 전역 BLE 상태(평면 키)
  const {
    isLeftConnected, isRightConnected,
    battL, battR, vbatL, vbatR, modeL, modeR, verL, verR,
  } = useBle();

  // ✅ 기존 앱 상태(최근 러닝/발목상태 등)
  const { batteryLeft, batteryRight, recentRuns, ankleState } = useAppStore();

  // 연결 여부
  const isConnectedAny = !!(isLeftConnected || isRightConnected);

  // 배터리 %: BLE 우선 → AppStore → 0
  const battLeftPct  = Number.isFinite(battL) ? (battL as number)
                     : Number.isFinite(batteryLeft) ? (batteryLeft as number)
                     : 0;

  const battRightPct = Number.isFinite(battR) ? (battR as number)
                     : Number.isFinite(batteryRight) ? (batteryRight as number)
                     : 0;

  const stateColor = isConnectedAny ? GREEN : MUTED;

  return (
    <View
      style={{
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 16,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
      }}
    >
      {/* 상단 상태 라벨 + 설정 */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text
          style={{
            color: stateColor,
            borderColor: '#89c5bd',
            borderWidth: 2,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 6,
            fontSize: 20,
            fontWeight: '700',
            textTransform: 'lowercase',
          }}
        >
          {isConnectedAny ? 'connected' : 'disconnected'}
        </Text>
        <Pressable onPress={() => nav.navigate('DeviceConnect')} hitSlop={8}>
          <Text style={{ fontSize: 22 }}>⚙️</Text>
        </Pressable>
      </View>

      {/* 본문 */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
        {/* 왼쪽 텍스트 영역 */}
        <View style={{ flex: 1, gap: 8 }}>
          <Text style={{ fontSize: 18, color: '#2F6F37', fontWeight: '700' }}>
            최근 러닝 {recentRuns}회
          </Text>
          <Text style={{ fontSize: 18, color: '#2F6F37' }}>
            발목 상태 :{' '}
            <Text style={{ fontWeight: '800', color: ankleState === '안전' ? GREEN : AMBER }}>
              {ankleState}
            </Text>
          </Text>

          {/* (선택) STAT 상세 미니 라벨 */}
          <View style={{ marginTop: 8, gap: 4 }}>
            <Text style={{ fontSize: 14, color: '#4B5563' }}>
              L: {isLeftConnected ? `${modeL ?? '-'} • ${vbatL ?? '-'}V • ${verL ?? '-'}` : '-'}
            </Text>
            <Text style={{ fontSize: 14, color: '#4B5563' }}>
              R: {isRightConnected ? `${modeR ?? '-'} • ${vbatR ?? '-'}V • ${verR ?? '-'}` : '-'}
            </Text>
          </View>

          <Pressable
            onPress={() => nav.navigate('Analysis')}
            style={{
              marginTop: 10,
              alignSelf: 'flex-start',
              backgroundColor: GREEN,
              paddingHorizontal: 18,
              paddingVertical: 10,
              borderRadius: 24,
              shadowColor: '#000',
              shadowOpacity: 0.12,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <Text style={{ color: 'white', fontWeight: '800' }}>상세 분석결과</Text>
          </Pressable>
        </View>

        {/* 오른쪽: 발 아이콘 + 개별 연결 표시 + 배터리 */}
        <View style={{ width: 12 }} />

        <View style={{ alignItems: 'center' }}>
          {/* 발 아이콘 (좌/우) */}
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <View style={{ alignItems: 'center' }}>
              <FootIcon
                side="L"
                color={isLeftConnected ? batteryColor(battLeftPct) : MUTED}
                boxW={100}
                boxH={110}
                scale={1.55}
              />
              <Text style={{ marginTop: 4, color: isLeftConnected ? GREEN : MUTED, fontWeight: '700' }}>
                {isLeftConnected ? 'L connected' : 'L off'}
              </Text>
            </View>

            <View style={{ alignItems: 'center' }}>
              <FootIcon
                side="R"
                color={isRightConnected ? batteryColor(battRightPct) : MUTED}
                boxW={100}
                boxH={110}
                scale={1.55}
              />
              <Text style={{ marginTop: 4, color: isRightConnected ? GREEN : MUTED, fontWeight: '700' }}>
                {isRightConnected ? 'R connected' : 'R off'}
              </Text>
            </View>
          </View>

          {/* 배터리 표기 */}
          <View style={{ flexDirection: 'row', marginTop: 10, alignItems: 'center', gap: 26 }}>
            <BatteryRingLabel percent={battLeftPct} fontSize={20} muted={!isLeftConnected} />
            <BatteryRingLabel percent={battRightPct} fontSize={20} muted={!isRightConnected} />
          </View>

          <Text style={{ marginTop: 2, color: '#2F6F37', fontSize: 16 }}>Battery</Text>
        </View>
      </View>
    </View>
  );
}
