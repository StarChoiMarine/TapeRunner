// src/components/DeviceStatusCard.tsx
import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Circle } from 'react-native-svg';
import { useAppStore } from '../store/AppStore';
import { useBle } from '../store/ble/BleProvider';
import { color, font, fontRole, radius, shadow } from '../theme';

const footImg = require('../assets/foot-right.png'); // 오른발 실루엣 PNG

const batteryColor = (p: number) =>
  p >= 60 ? color.lime : p >= 30 ? color.amber : color.coral;

// 배터리 링 + 숫자
function BatteryRing({
  percent,
  active,
}: {
  percent: number;
  active: boolean;
}) {
  const p = Math.max(0, Math.min(100, percent));
  const c = active ? batteryColor(p) : color.ivoryFaint;

  const size = 28;
  const stroke = 5;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (circ * p) / 100;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={color.lineOnDark} strokeWidth={stroke} fill="none"
        />
        <Circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={c} strokeWidth={stroke} fill="none"
          strokeDasharray={`${circ} ${circ}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <Text style={{ fontFamily: fontRole.dataBold, fontSize: 16, color: active ? color.ivory : color.ivoryFaint }}>
        {p}
        <Text style={{ fontFamily: fontRole.dataMedium, fontSize: 12, color: color.ivoryFaint }}>%</Text>
      </Text>
    </View>
  );
}

// 한쪽 발: 실루엣 + 연결 라벨 + 배터리
function FootStatus({
  side,
  connected,
  battery,
}: {
  side: 'L' | 'R';
  connected: boolean;
  battery: number;
}) {
  return (
    <View style={{ alignItems: 'center', gap: 6 }}>
      <Image
        source={footImg}
        resizeMode="contain"
        style={{
          width: 68,
          height: 96,
          tintColor: connected ? color.leafBright : 'rgba(246,243,233,0.4)',
          transform: [{ scale: 1.45 }, { scaleX: side === 'L' ? -1 : 1 }],
        }}
      />
      <Text
        style={{
          fontFamily: font.semibold,
          fontSize: 12,
          letterSpacing: 1,
          color: connected ? color.leafBright : color.ivoryFaint,
        }}
      >
        {side === 'L' ? 'LEFT' : 'RIGHT'}
      </Text>
      <BatteryRing percent={battery} active={connected} />
    </View>
  );
}

export default function DeviceStatusCard() {
  const nav = useNavigation<any>();

  const {
    isLeftConnected, isRightConnected,
    battL, battR, vbatL, vbatR, modeL, modeR,
  } = useBle();
  const { batteryLeft, batteryRight, recentRuns, ankleState } = useAppStore();

  const isConnectedAny = !!(isLeftConnected || isRightConnected);

  // 배터리 %: BLE 우선 → AppStore → 0
  const battLeftPct = Number.isFinite(battL) ? (battL as number)
    : Number.isFinite(batteryLeft) ? batteryLeft : 0;
  const battRightPct = Number.isFinite(battR) ? (battR as number)
    : Number.isFinite(batteryRight) ? batteryRight : 0;

  const ankleSafe = ankleState === '안전';

  return (
    <View
      style={{
        backgroundColor: color.surfaceDeep,
        borderRadius: radius.xl,
        padding: 20,
        ...shadow.card,
      }}
    >
      {/* 상단: 연결 상태 칩 + 기기 관리 */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 7,
            borderWidth: 1,
            borderColor: color.lineOnDark,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: radius.pill,
          }}
        >
          <View
            style={{
              width: 7, height: 7, borderRadius: 4,
              backgroundColor: isConnectedAny ? color.lime : color.ivoryFaint,
            }}
          />
          <Text style={{ fontFamily: font.semibold, fontSize: 13, color: isConnectedAny ? color.ivory : color.ivorySoft }}>
            {isConnectedAny ? '인솔 연결됨' : '인솔 연결 대기'}
          </Text>
        </View>

        <Pressable onPress={() => nav.navigate('DeviceConnect')} hitSlop={10}>
          <Text style={{ fontFamily: font.medium, fontSize: 13, color: color.ivorySoft }}>
            기기 관리 ›
          </Text>
        </Pressable>
      </View>

      {/* 본문: 지표 + 발 상태 */}
      <View style={{ flexDirection: 'row', marginTop: 22 }}>
        {/* 왼쪽: 핵심 지표 */}
        <View style={{ flex: 1, justifyContent: 'center', gap: 18 }}>
          <View>
            <Text style={{ fontFamily: font.medium, fontSize: 13, color: color.ivoryFaint, letterSpacing: 0.3 }}>
              최근 러닝
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 3, marginTop: 2 }}>
              <Text style={{ fontFamily: fontRole.dataBold, fontSize: 40, lineHeight: 46, color: color.ivory }}>
                {recentRuns}
              </Text>
              <Text style={{ fontFamily: font.medium, fontSize: 16, color: color.ivorySoft, marginBottom: 6 }}>
                회
              </Text>
            </View>
          </View>

          <View>
            <Text style={{ fontFamily: font.medium, fontSize: 13, color: color.ivoryFaint, letterSpacing: 0.3 }}>
              발목 상태
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <Text
                style={{
                  fontFamily: font.extrabold,
                  fontSize: 24,
                  color: ankleSafe ? color.leafBright : color.amber,
                }}
              >
                {ankleState}
              </Text>
              <Text style={{ fontSize: 13, color: ankleSafe ? color.leafBright : color.amber }}>
                {ankleSafe ? '●' : '▲'}
              </Text>
            </View>
          </View>
        </View>

        {/* 오른쪽: 발 실루엣 + 배터리 */}
        <View
          style={{
            flexDirection: 'row',
            gap: 18,
            backgroundColor: color.surfaceDeeper,
            borderRadius: radius.lg,
            paddingHorizontal: 18,
            paddingVertical: 14,
          }}
        >
          <FootStatus side="L" connected={isLeftConnected} battery={battLeftPct} />
          <FootStatus side="R" connected={isRightConnected} battery={battRightPct} />
        </View>
      </View>

      {/* 연결 시에만: 펌웨어/전압 미니 라벨 */}
      {isConnectedAny && (
        <Text style={{ marginTop: 12, fontFamily: font.regular, fontSize: 11, color: color.ivoryFaint }}>
          L {modeL ?? '-'} · {vbatL ?? '-'}V   R {modeR ?? '-'} · {vbatR ?? '-'}V
        </Text>
      )}

      {/* 하단 CTA */}
      <Pressable
        onPress={() => nav.navigate('Activity')}
        style={({ pressed }) => ({
          marginTop: 20,
          backgroundColor: pressed ? color.limeDeep : color.lime,
          borderRadius: radius.pill,
          paddingVertical: 14,
          alignItems: 'center',
        })}
      >
        <Text style={{ fontFamily: font.bold, fontSize: 15, color: color.surfaceDeeper }}>
          상세 분석 결과 보기
        </Text>
      </Pressable>
    </View>
  );
}
