// src/components/DeviceStatusCard.tsx
import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../store/AppStore';
import Svg, { Circle } from 'react-native-svg';

const footImg = require('../assets/foot-right.png'); // 오른발 실루엣 PNG
const GREEN = '#2F855A';
const AMBER = '#B45309';
const RED   = '#DC2626';
const MUTED = '#A0AEC0';

const batteryColor = (p: number) => (p >= 60 ? GREEN : p >= 30 ? AMBER : RED);

// 숫자 왼쪽에 표시할 링
const BatteryRingLabel = ({
  percent,
  fontSize = 20,
  muted = false,
}: {
  percent: number;
  fontSize?: number;
  muted?: boolean;
}) => {
  const p = Math.max(0, Math.min(100, percent));
  const color = muted ? MUTED : batteryColor(p);

  const size = fontSize + 5;       
  const stroke = Math.max(6, Math.round(size * 0.17)); // 링 두께 조절
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
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <Text style={{ fontSize, fontWeight: '800', color }}>{p}%</Text>
    </View>
  );
};

const FootIcon = ({
  side,              // 'L' | 'R'
  color,             // 배터리 색
  boxW = 80,         // 레이아웃이 차지하는 폭 (글자 안 밀리게 고정)
  boxH = 110,        // 레이아웃이 차지하는 높이
  scale = 1.35,      // 보이는 크기만 키우기
}: {
  side: 'L' | 'R';
  color: string;
  boxW?: number;
  boxH?: number;
  scale?: number;
}) => {
  return (
    <View
      style={{
        width: boxW,
        height: boxH,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'visible', // 커진 이미지가 박스 밖으로 보여도 OK
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
};



export default function DeviceStatusCard() {
  const nav = useNavigation<any>();
  const { isConnected, batteryLeft, batteryRight, recentRuns, ankleState } = useAppStore();
  const stateColor = isConnected ? GREEN : MUTED;

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
          }}
        >
          {isConnected ? 'connected' : 'disconnected'}
        </Text>
        <Pressable onPress={() => nav.navigate('DeviceConnect')} hitSlop={8}>
          <Text style={{ fontSize: 22 }}>⚙️</Text>
        </Pressable>
      </View>

      {/* 본문 */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
        {/* 왼쪽 텍스트 영역 */}
        <View style={{ flex: 1, gap: 8 }}>
          <Text style={{ fontSize: 18, color: '#2F6F37', fontWeight: '700' }}>최근 러닝 {recentRuns}회</Text>
          <Text style={{ fontSize: 18, color: '#2F6F37' }}>
            발목 상태 :{' '}
            <Text style={{ fontWeight: '800', color: ankleState === '안전' ? GREEN : AMBER }}>{ankleState}</Text>
          </Text>

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

        {/* 오른쪽 발 아이콘 + 배터리 숫자/점 */}
        <View style={{ width: 12 }} />

        <View style={{ alignItems: 'center' }}>

            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <FootIcon
                side="L"
                color={isConnected ? batteryColor(batteryLeft) : MUTED}
                boxW={100} boxH={110} scale={1.55}   // 레이아웃은 80x110, 보이는 건 1.35배
            />
            <FootIcon
                side="R"
                color={isConnected ? batteryColor(batteryRight) : MUTED}
                boxW={100} boxH={110} scale={1.55}
            />
            </View>



          {/* 배터리 표기 – 숫자 왼쪽에 동그라미(숫자보다 약간 큼) */}
         <View style={{ flexDirection: 'row', marginTop: 10, alignItems: 'center', gap: 26 }}>
            <BatteryRingLabel percent={batteryLeft}  fontSize={20} muted={!isConnected} />
            <BatteryRingLabel percent={batteryRight} fontSize={20} muted={!isConnected} />
        </View>

          <Text style={{ marginTop: 2, color: '#2F6F37', fontSize: 16 }}>Battery</Text>
        </View>
      </View>
    </View>
  );
}
