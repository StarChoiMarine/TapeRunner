import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Platform,
  PermissionsAndroid,
  ScrollView,
} from 'react-native';
import { BleManager, Device, Characteristic } from 'react-native-ble-plx';
import { Buffer } from 'buffer';
import FootDots from '../components/FootDots';
import { CHANNEL_TO_SENSOR } from '../config/insoles';

// ====== 고정값(임베팀과 합의해 맞추세요) ======
const DEVICE_NAME_PREFIX = 'TapeInsole_'; // 예: TapeInsole_01
export const SERVICE_UUID = '12345678-1234-1234-1234-1234567890ab';
export const NOTIFY_UUID  = 'abcd1234-1234-1234-1234-1234567890ab';

// ====== 헬퍼 ======
const NORM_MAX = 1023; // 하드웨어 ADC 최대치
const norm01 = (v: number) => Math.max(0, Math.min(1, v / NORM_MAX));

type BleParsed = {
  foot: 'L' | 'R';
  values: Record<number, number>; // 센서ID -> 정규화값(0~1)
  raw?: any;
};

function parseJsonBase64(b64: string): BleParsed | null {
  try {
    const txt = Buffer.from(b64, 'base64').toString('utf8');
    const j = JSON.parse(txt);

    // values 키가 "0","1"... 채널이면 CHANNEL_TO_SENSOR로 센서ID 변환
    const mapped: Record<number, number> = {};
    if (j?.values && typeof j.values === 'object') {
      for (const [k, v] of Object.entries(j.values)) {
        const ch = parseInt(String(k).replace(/\D/g, ''), 10);
        const sid = CHANNEL_TO_SENSOR[ch] ?? ch;
        mapped[sid] = norm01(Number(v));
      }
    }
    const foot: 'L' | 'R' = j.foot === 'R' ? 'R' : 'L';
    return { foot, values: mapped, raw: j };
  } catch (e) {
    return null;
  }
}

async function ensureBlePermissions() {
  if (Platform.OS !== 'android') return;
  await PermissionsAndroid.requestMultiple([
    'android.permission.BLUETOOTH_SCAN' as any,
    'android.permission.BLUETOOTH_CONNECT' as any,
    'android.permission.ACCESS_FINE_LOCATION' as any,
  ]);
}

const manager = new BleManager();

// ====== 화면 ======
export default function DeviceConnectScreen() {
  const [device, setDevice] = useState<Device | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const [leftVals, setLeftVals] = useState<Record<number, number>>({});
  const [rightVals, setRightVals] = useState<Record<number, number>>({});

  const [lastJson, setLastJson] = useState<string>('');
  const [lastRssi, setLastRssi] = useState<number | undefined>(undefined);

  const subscriptionRef = useRef<ReturnType<Device['monitorCharacteristicForService']> | null>(null);

  // —— 스캔 → 연결 → 구독
  const connect = async () => {
    await ensureBlePermissions();
    setIsScanning(true);

    return new Promise<void>((resolve, reject) => {
      manager.startDeviceScan(null, null, async (error, dev) => {
        if (error) {
          setIsScanning(false);
          reject(error);
          return;
        }
        if (!dev?.name) return;

        if (dev.name.startsWith(DEVICE_NAME_PREFIX)) {
          manager.stopDeviceScan();
          setIsScanning(false);

          try {
            const d = await dev.connect();
            setDevice(d);
            await d.discoverAllServicesAndCharacteristics();

            // RSSI 갱신
            const [lastRssi, setLastRssi] = useState<number | null>(null);
            try {
              const r = await d.readRSSI();
              setLastRssi(r.rssi);
            } catch {}

            // Notify 구독
            subscriptionRef.current = d.monitorCharacteristicForService(
              SERVICE_UUID,
              NOTIFY_UUID,
              (err, ch) => {
                if (err) return;
                if (!ch?.value) return;

                // 원문(JSON 문자열도 저장)
                const txt = Buffer.from(ch.value, 'base64').toString('utf8');
                setLastJson(txt);

                const parsed = parseJsonBase64(ch.value);
                if (!parsed) return;

                if (parsed.foot === 'L') setLeftVals(parsed.values);
                else setRightVals(parsed.values);

                setIsConnected(true);
              }
            );

            resolve();
          } catch (e) {
            reject(e);
          }
        }
      });
    });
  };

  const disconnect = async () => {
    try {
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }
      if (device) {
        await device.cancelConnection();
      }
    } catch {}
    setIsConnected(false);
    setDevice(null);
    setLeftVals({});
    setRightVals({});
    setLastJson('');
    setLastRssi(undefined);
  };

  // —— 언마운트 시 정리
  useEffect(() => {
    return () => {
      manager.stopDeviceScan();
      disconnect();
      manager.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // —— UI 파츠
  const StatusPill = ({ ok }: { ok: boolean }) => (
    <View
      style={{
        borderWidth: 2,
        borderColor: ok ? '#64a98c' : '#cbd5e1',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        alignSelf: 'flex-start',
        backgroundColor: ok ? '#e9f6f0' : '#f1f5f9',
      }}
    >
      <Text style={{ color: ok ? '#2f855a' : '#64748b', fontWeight: '800' }}>
        {ok ? 'connected' : 'disconnected'}
      </Text>
    </View>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#EEF5E8' }} contentContainerStyle={{ padding: 16 }}>
      {/* 헤더 */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 24, fontWeight: '900', color: '#215a3f' }}>기기 연결</Text>
        <StatusPill ok={isConnected} />
      </View>

      {/* 카드: 디바이스 정보 & 컨트롤 */}
      <View
        style={{
          marginTop: 12,
          backgroundColor: '#fff',
          borderRadius: 16,
          padding: 14,
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: 6 }}>
          {device?.name ?? '장치 미연결'}
        </Text>
        <Text style={{ color: '#475569' }}>
          RSSI: {lastRssi ?? '-'}  ·  Service: {SERVICE_UUID.slice(0, 8)}…  ·  Char: {NOTIFY_UUID.slice(0, 8)}…
        </Text>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
          <Pressable
            onPress={connect}
            disabled={isScanning || isConnected}
            style={{
              backgroundColor: isConnected ? '#a7f3d0' : '#2F855A',
              opacity: isScanning ? 0.6 : 1,
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: isConnected ? '#064e3b' : '#fff', fontWeight: '800' }}>
              {isConnected ? 'Connected' : isScanning ? 'Scanning…' : 'Scan & Connect'}
            </Text>
          </Pressable>

          <Pressable
            onPress={disconnect}
            disabled={!isConnected && !device}
            style={{
              backgroundColor: '#e5e7eb',
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: 10,
            }}
          >
            <Text style={{ fontWeight: '700' }}>Disconnect</Text>
          </Pressable>

          <Pressable
            onPress={() => setLastJson('')}
            style={{
              backgroundColor: '#fef3c7',
              paddingHorizontal: 12,
              paddingVertical: 10,
              borderRadius: 10,
            }}
          >
            <Text style={{ fontWeight: '700', color: '#92400e' }}>Clear Log</Text>
          </Pressable>
        </View>
      </View>

      {/* 실시간 미리보기 (FootDots) */}
      <View
        style={{
          marginTop: 16,
          backgroundColor: '#fff',
          borderRadius: 16,
          paddingVertical: 16,
          paddingHorizontal: 12,
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        <Text style={{ fontWeight: '800', marginLeft: 6, marginBottom: 8 }}>실시간 센서 미리보기</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
          <FootDots sensorValues={leftVals} mirror width={170} height={240} radius={16} />
          <FootDots sensorValues={rightVals}       width={170} height={240} radius={16} />
        </View>
      </View>

      {/* 간단 값(상위 8개만) & 원문 JSON */}
      <View
        style={{
          marginTop: 16,
          backgroundColor: '#fff',
          borderRadius: 16,
          padding: 12,
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 2,
          marginBottom: 24,
        }}
      >
        <Text style={{ fontWeight: '800', marginBottom: 8 }}>최근 수신 값</Text>
        <View style={{ flexDirection: 'row', gap: 18 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '700', marginBottom: 4, color: '#065f46' }}>Left</Text>
            {Object.entries(leftVals)
              .slice(0, 8)
              .map(([sid, v]) => (
                <Text key={`L-${sid}`} style={{ color: '#334155' }}>
                  #{sid}: {(v as number).toFixed(2)}
                </Text>
              ))}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '700', marginBottom: 4, color: '#065f46' }}>Right</Text>
            {Object.entries(rightVals)
              .slice(0, 8)
              .map(([sid, v]) => (
                <Text key={`R-${sid}`} style={{ color: '#334155' }}>
                  #{sid}: {(v as number).toFixed(2)}
                </Text>
              ))}
          </View>
        </View>

        <Text style={{ fontWeight: '800', marginTop: 12, marginBottom: 4 }}>Raw JSON</Text>
        <View
          style={{
            backgroundColor: '#F8FAFC',
            borderWidth: 1,
            borderColor: '#E2E8F0',
            borderRadius: 10,
            padding: 10,
          }}
        >
          <Text style={{ fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 12, color: '#475569' }}>
            {lastJson || '(no data yet)'}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
