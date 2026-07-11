// src/screens/DeviceConnectScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, Pressable, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Circle } from 'react-native-svg';
import FootDots from '../components/FootDots';
import { useBle } from '../store/ble/BleProvider';
import { color, font, radius, shadow } from '../theme';

type Side = 'L' | 'R';

const batteryColor = (p: number) =>
  p >= 60 ? color.leaf : p >= 30 ? color.amber : color.coral;

// 작은 배터리 링
function MiniBattery({ percent, active }: { percent: number | null; active: boolean }) {
  const p = Math.max(0, Math.min(100, percent ?? 0));
  const size = 30;
  const stroke = 5;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={color.line} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={active ? batteryColor(p) : color.inkFaint}
          strokeWidth={stroke} fill="none"
          strokeDasharray={`${circ} ${circ}`}
          strokeDashoffset={circ - (circ * p) / 100}
          strokeLinecap="round"
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <Text style={{ fontFamily: font.bold, fontSize: 15, color: active ? color.ink : color.inkFaint }}>
        {active && percent != null ? `${p}%` : '—'}
      </Text>
    </View>
  );
}

// 좌/우 인솔 카드
function InsoleCard({
  side, connected, connecting, battery, ver, mode, onConnect, onDisconnect,
}: {
  side: Side;
  connected: boolean;
  connecting: boolean;
  battery: number | null;
  ver: string | null;
  mode: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: color.surface,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: color.line,
        padding: 16,
        gap: 12,
        ...shadow.card,
        shadowOpacity: 0.05,
      }}
    >
      {/* 상단: 방향 + 상태 점 */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontFamily: font.semibold, fontSize: 12, letterSpacing: 1.5, color: color.inkFaint }}>
          {side === 'L' ? 'LEFT' : 'RIGHT'}
        </Text>
        <View
          style={{
            width: 8, height: 8, borderRadius: 4,
            backgroundColor: connected ? color.leaf : connecting ? color.amber : color.line,
          }}
        />
      </View>

      <Text style={{ fontFamily: font.bold, fontSize: 17, color: color.ink }}>
        {side === 'L' ? '왼쪽 인솔' : '오른쪽 인솔'}
      </Text>

      {/* 배터리 + 상태 */}
      <MiniBattery percent={battery} active={connected} />

      <View style={{ gap: 2 }}>
        <Text style={{ fontFamily: font.regular, fontSize: 11, color: color.inkFaint }}>
          펌웨어 {connected && ver ? `v${ver}` : '—'}
        </Text>
        <Text style={{ fontFamily: font.regular, fontSize: 11, color: color.inkFaint }}>
          모드 {connected && mode ? mode : '—'}
        </Text>
      </View>

      {/* 버튼 */}
      {connected ? (
        <Pressable
          onPress={onDisconnect}
          style={({ pressed }) => ({
            borderWidth: 1.5,
            borderColor: color.line,
            borderRadius: radius.pill,
            paddingVertical: 10,
            alignItems: 'center',
            backgroundColor: pressed ? color.bg : 'transparent',
          })}
        >
          <Text style={{ fontFamily: font.semibold, fontSize: 13, color: color.inkSoft }}>연결 해제</Text>
        </Pressable>
      ) : (
        <Pressable
          onPress={onConnect}
          disabled={connecting}
          style={({ pressed }) => ({
            backgroundColor: connecting ? color.inkFaint : pressed ? color.surfaceDeeper : color.pine,
            borderRadius: radius.pill,
            paddingVertical: 10,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 8,
          })}
        >
          {connecting && <ActivityIndicator size="small" color={color.ivory} />}
          <Text style={{ fontFamily: font.semibold, fontSize: 13, color: color.ivory }}>
            {connecting ? '연결 중…' : '연결하기'}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

export default function DeviceConnectScreen() {
  const nav = useNavigation<any>();
  const {
    isLeftConnected, isRightConnected,
    leftVals, rightVals, rawL, rawR,
    battL, battR, modeL, modeR, verL, verR,
    connectInsole, disconnectInsole,
  } = useBle();

  const [connectingL, setConnectingL] = useState(false);
  const [connectingR, setConnectingR] = useState(false);
  const [showConsole, setShowConsole] = useState(false);

  const handleConnect = async (side: Side) => {
    const setBusy = side === 'L' ? setConnectingL : setConnectingR;
    setBusy(true);
    try {
      await connectInsole(side);
    } catch (e: any) {
      Alert.alert(
        '연결 실패',
        e?.message === 'BLE scan timeout'
          ? '인솔을 찾지 못했어요. 인솔 전원과 거리를 확인한 뒤 다시 시도해 주세요.'
          : `연결 중 문제가 발생했어요.\n${e?.message ?? ''}`,
      );
    } finally {
      setBusy(false);
    }
  };

  const anyConnected = isLeftConnected || isRightConnected;

  return (
    <View style={{ flex: 1, backgroundColor: color.bg }}>
      {/* 헤더 */}
      <View style={{ height: 60, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 12 }}>
        <Pressable onPress={() => nav.goBack()} hitSlop={12}>
          <Text style={{ fontSize: 26, color: color.ink, marginTop: -2 }}>‹</Text>
        </Pressable>
        <Text style={{ fontFamily: font.extrabold, fontSize: 19, color: color.ink }}>스마트 인솔</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 8, paddingBottom: 40, gap: 20 }}>
        <Text style={{ fontFamily: font.regular, fontSize: 14, lineHeight: 21, color: color.inkSoft }}>
          인솔 전원을 켜고 휴대폰 가까이에 두면{'\n'}자동으로 찾아서 연결해 드려요.
        </Text>

        {/* 좌/우 연결 카드 */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <InsoleCard
            side="L"
            connected={isLeftConnected}
            connecting={connectingL}
            battery={battL}
            ver={verL}
            mode={modeL}
            onConnect={() => handleConnect('L')}
            onDisconnect={() => disconnectInsole('L')}
          />
          <InsoleCard
            side="R"
            connected={isRightConnected}
            connecting={connectingR}
            battery={battR}
            ver={verR}
            mode={modeR}
            onConnect={() => handleConnect('R')}
            onDisconnect={() => disconnectInsole('R')}
          />
        </View>

        {/* 실시간 센서 미리보기 (다크 인셋) */}
        <View
          style={{
            backgroundColor: color.surfaceDeep,
            borderRadius: radius.xl,
            padding: 18,
            gap: 6,
            ...shadow.card,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontFamily: font.semibold, fontSize: 12, letterSpacing: 1.8, color: color.ivoryFaint }}>
              LIVE PREVIEW
            </Text>
            <View
              style={{
                width: 7, height: 7, borderRadius: 4,
                backgroundColor: anyConnected ? color.lime : color.ivoryFaint,
              }}
            />
          </View>
          <Text style={{ fontFamily: font.bold, fontSize: 16, color: color.ivory }}>실시간 센서 미리보기</Text>

          <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', marginTop: 8 }}>
            <FootDots sensorValues={leftVals} mirror dark width={150} height={215} radius={15} />
            <FootDots sensorValues={rightVals} dark width={150} height={215} radius={15} />
          </View>

          {!anyConnected && (
            <Text style={{ fontFamily: font.regular, fontSize: 12, color: color.ivoryFaint, textAlign: 'center', marginTop: 6 }}>
              인솔을 연결하면 발바닥 압력이 실시간으로 표시돼요
            </Text>
          )}
        </View>

        {/* 문제 해결 */}
        <View
          style={{
            backgroundColor: color.surface,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: color.line,
            padding: 16,
            gap: 10,
          }}
        >
          <Text style={{ fontFamily: font.bold, fontSize: 15, color: color.ink }}>연결이 안 되나요?</Text>
          {[
            '인솔의 전원 버튼을 3초간 눌러 켜 주세요',
            '휴대폰 블루투스가 켜져 있는지 확인해 주세요',
            '배터리가 부족하면 충전 후 다시 시도해 주세요',
          ].map((tip, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: 8 }}>
              <Text style={{ fontFamily: font.bold, fontSize: 13, color: color.leaf }}>{i + 1}</Text>
              <Text style={{ fontFamily: font.regular, fontSize: 13, lineHeight: 19, color: color.inkSoft, flex: 1 }}>
                {tip}
              </Text>
            </View>
          ))}
        </View>

        {/* 개발자 로그 (접이식) */}
        <View>
          <Pressable onPress={() => setShowConsole((v) => !v)} hitSlop={8}>
            <Text style={{ fontFamily: font.medium, fontSize: 12, color: color.inkFaint }}>
              {showConsole ? '▾ 수신 데이터 로그 숨기기' : '▸ 수신 데이터 로그 보기'}
            </Text>
          </Pressable>
          {showConsole && (
            <View
              style={{
                marginTop: 10,
                backgroundColor: color.surfaceDeeper,
                borderRadius: radius.md,
                padding: 12,
                gap: 6,
              }}
            >
              <Text numberOfLines={2} style={{ fontFamily: font.regular, fontSize: 11, color: color.leafBright }}>
                L {rawL || '(no data)'}
              </Text>
              <Text numberOfLines={2} style={{ fontFamily: font.regular, fontSize: 11, color: color.ivorySoft }}>
                R {rawR || '(no data)'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
