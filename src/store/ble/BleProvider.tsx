// store/ble/BleProvider.tsx
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { BleManager, Device } from 'react-native-ble-plx';
import { Buffer } from 'buffer';
import { CHANNEL_TO_SENSOR } from '../../config/insoles.ts'; // 기존 매핑 사용
import { ensureBlePermissions } from './permissions';

type Side = 'L' | 'R';
type Mode = 'SLOW' | 'FAST' | 'CONNECTED';

type BleCtx = {
  // 연결 상태
  isLeftConnected: boolean;
  isRightConnected: boolean;

  // 압력값 (정규화 0~1)
  leftVals: Record<number, number>;
  rightVals: Record<number, number>;

  // 원문(최근 수신 라인)
  rawL: string;
  rawR: string;

  // --- (B) STAT: 배터리/상태 ---
  battL: number | null;   // 배터리 %
  battR: number | null;
  vbatL: number | null;   // 전압(V)
  vbatR: number | null;
  modeL: Mode | null;     // 'SLOW' | 'FAST' | 'CONNECTED'
  modeR: Mode | null;
  verL: string | null;    // 펌웨어 버전
  verR: string | null;
  lastStatAtL: number | null; // epoch ms (최근 STAT 수신 시각)
  lastStatAtR: number | null;

  // 액션
  connectInsole: (side: Side) => Promise<void>;
  disconnectInsole: (side: Side) => Promise<void>;
};

const Ctx = createContext<BleCtx | null>(null);
export const useBle = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error('BleProvider is missing (wrap App with <BleProvider>)');
  return v;
};

// ——— 고정 UUID (NUS) ———
const SERVICE_UUID = '6E400001-B5A3-F393-E0A9-E50E24DCCA9E';
const NOTIFY_UUID  = '6E400003-B5A3-F393-E0A9-E50E24DCCA9E';

// ——— 파라미터 ———
const NOISE_TH = 25;
const ADC_MAX = 1023;

// 센서별 추가 임계값 (선택)
const NOISE_THRESHOLD_DEFAULT = 0.07;
const NOISE_THRESHOLD_CUSTOM: Record<number, number> = {
  2: 0.10,
};
const applyNoiseFilter = (m: Record<number, number>) => {
  const o: Record<number, number> = {};
  for (const [k, v] of Object.entries(m)) {
    const id = Number(k);
    const th = NOISE_THRESHOLD_CUSTOM[id] ?? NOISE_THRESHOLD_DEFAULT;
    o[id] = v < th ? 0 : v;
  }
  return o;
};

// 채널(C0~15) → 센서ID 로 변환
const toSensorMapFromChannels = (vals16: number[]) => {
  const out: Record<number, number> = {};
  for (let ch = 0; ch < 16; ch++) {
    const sid = CHANNEL_TO_SENSOR[ch] ?? ch;
    out[sid] = vals16[ch];
  }
  return out;
};

// CSV/JSON 한 줄 → 16채널 0~1 정규화 배열 (FSR용)
const parseFSRLineToVals16 = (line: string): number[] | null => {
  try {
    const txt = line.trim();
    if (!txt) return null;

    // CSV
    if (txt.includes(',')) {
      const nums = txt
        .split(',')
        .map(s => Number(s.trim()))
        .filter(v => !isNaN(v));
      if (nums.length < 16) {
        while (nums.length < 16) nums.push(0);
      }
      return Array.from({ length: 16 }, (_, i) => {
        const raw = Number(nums[i] ?? 0);
        const clipped = raw <= NOISE_TH ? 0 : Math.max(0, Math.min(ADC_MAX, raw));
        return clipped / ADC_MAX;
      });
    }

    // JSON ({"type":"FSR",...})
    const j = JSON.parse(txt);
    if (!j || j.type !== 'FSR' || !Array.isArray(j.vals)) return null;
    return Array.from({ length: 16 }, (_, i) => {
      const raw = Number(j.vals[i] ?? 0);
      const clipped = raw <= NOISE_TH ? 0 : Math.max(0, Math.min(ADC_MAX, raw));
      return clipped / ADC_MAX;
    });
  } catch {
    return null;
  }
};

// STAT 라인 파싱
type StatPayload = { type: 'STAT'; batt: number; vbat: number; mode: Mode; ver: string };
const parseSTAT = (line: string): StatPayload | null => {
  try {
    const j = JSON.parse(line.trim());
    if (!j || j.type !== 'STAT') return null;
    const batt = Number(j.batt);
    const vbat = Number(j.vbat);
    const mode = String(j.mode) as Mode;
    const ver = String(j.ver ?? '');
    if (Number.isNaN(batt) || Number.isNaN(vbat)) return null;
    if (!['SLOW', 'FAST', 'CONNECTED'].includes(mode)) return null;
    return { type: 'STAT', batt, vbat, mode, ver };
  } catch {
    return null;
  }
};

export const BleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Provider 살아있는 동안만 유지되는 싱글톤 매니저
  const managerRef = useRef(new BleManager());

  // 디바이스/연결
  const [leftDevice,  setLeftDevice]  = useState<Device | null>(null);
  const [rightDevice, setRightDevice] = useState<Device | null>(null);
  const [isLeftConnected,  setIsLeftConnected]  = useState(false);
  const [isRightConnected, setIsRightConnected] = useState(false);

  // 화면에 보낼 센서값
  const [leftVals,  setLeftVals]  = useState<Record<number, number>>({});
  const [rightVals, setRightVals] = useState<Record<number, number>>({});
  const [rawL, setRawL] = useState('');
  const [rawR, setRawR] = useState('');

  // --- (B) STAT 상태값 ---
  const [battL, setBattL] = useState<number | null>(null);
  const [battR, setBattR] = useState<number | null>(null);
  const [vbatL, setVbatL] = useState<number | null>(null);
  const [vbatR, setVbatR] = useState<number | null>(null);
  const [modeL, setModeL] = useState<Mode | null>(null);
  const [modeR, setModeR] = useState<Mode | null>(null);
  const [verL, setVerL] = useState<string | null>(null);
  const [verR, setVerR] = useState<string | null>(null);
  const [lastStatAtL, setLastStatAtL] = useState<number | null>(null);
  const [lastStatAtR, setLastStatAtR] = useState<number | null>(null);

  // 구독 핸들 & 라인 버퍼
  const subL = useRef<ReturnType<Device['monitorCharacteristicForService']> | null>(null);
  const subR = useRef<ReturnType<Device['monitorCharacteristicForService']> | null>(null);
  const accL = useRef(''); // 왼발 누적 텍스트
  const accR = useRef(''); // 오른발 누적 텍스트

  // 센서 업데이트 스로틀링(최대 20Hz)
  const latestLeftRef = useRef<Record<number, number>>({});
  const latestRightRef = useRef<Record<number, number>>({});
  const updateTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startUpdateLoop = () => {
    if (updateTimerRef.current) return;
    updateTimerRef.current = setInterval(() => {
      // 최신값으로 상태 일괄 반영 (불필요한 고주파 렌더 방지)
      setLeftVals((prev) => latestLeftRef.current);
      setRightVals((prev) => latestRightRef.current);
    }, 50); // ~20Hz
  };
  const stopUpdateLoop = () => {
    if (updateTimerRef.current) {
      clearInterval(updateTimerRef.current);
      updateTimerRef.current = null;
    }
  };

  // 공통 라인 처리기: CSV/FSR/STAT 모두 처리
  const handleLine = (side: Side, line: string) => {
    if (!line) return;

    // 1) STAT 우선 처리 (JSON)
    const stat = parseSTAT(line);
    if (stat) {
      if (side === 'L') {
        setBattL(stat.batt); setVbatL(stat.vbat); setModeL(stat.mode); setVerL(stat.ver); setLastStatAtL(Date.now());
      } else {
        setBattR(stat.batt); setVbatR(stat.vbat); setModeR(stat.mode); setVerR(stat.ver); setLastStatAtR(Date.now());
      }
      // raw 표시용으로도 남길 수 있음 (원한다면 아래 주석 해제)
      // if (side === 'L') setRawL(line); else setRawR(line);
      return;
    }

    // 2) FSR 처리 (CSV 또는 {"type":"FSR"})
    const vals16 = parseFSRLineToVals16(line);
    if (vals16) {
      const sensorMap = applyNoiseFilter(toSensorMapFromChannels(vals16));
      if (side === 'L') {
        latestLeftRef.current = sensorMap;
        setRawL(line);
      } else {
        latestRightRef.current = sensorMap;
        setRawR(line);
      }
      startUpdateLoop();
    }
  };

  const connectInsole = async (side: Side) => {
    const ok = await ensureBlePermissions();
    if (!ok) throw new Error('Bluetooth permissions denied');
    const namePrefix = `SmartInsole_${side}`;
    const manager = managerRef.current;

    await new Promise<void>((resolve, reject) => {
      // 스캔 타임아웃 보호
      const scanTimeout = setTimeout(() => {
        try { manager.stopDeviceScan(); } catch {}
        reject(new Error('BLE scan timeout'));
      }, 10000);

      manager.startDeviceScan(null, null, async (error, dev) => {
        if (error) { reject(error); return; }
        if (!dev?.name?.startsWith(namePrefix)) return;

        manager.stopDeviceScan();
        try {
          const d = await dev.connect();
          try { await d.requestMTU(247); } catch {}
          await d.discoverAllServicesAndCharacteristics();

          const handle = d.monitorCharacteristicForService(
            SERVICE_UUID,
            NOTIFY_UUID,
            (err, ch) => {
              if (err || !ch?.value) return;
              // base64 → utf8 조각
              const chunk = Buffer.from(ch.value, 'base64').toString('utf8');

              // 고주파 로그는 성능/발열 저하 유발. 개발 모드에서만 출력
              if (__DEV__) {
                // 긴 로그 방지
                const snippet = chunk.length > 120 ? `${chunk.slice(0, 120)}…` : chunk;
                // eslint-disable-next-line no-console
                console.log(`[BLE][${side}] chunk:`, JSON.stringify(snippet));
              }
              
              const acc = side === 'L' ? accL : accR;
              acc.current += chunk;

              // \n 기준으로 라인 분할
              let idx: number;
              while ((idx = acc.current.search(/\r?\n/)) >= 0) {
                const line = acc.current.slice(0, idx);
                acc.current = acc.current.slice(idx + 1);
                if (!line) continue;
                handleLine(side, line);
              }
            }
          );

          if (side === 'L') { subL.current = handle; setLeftDevice(d); setIsLeftConnected(true); }
          else              { subR.current = handle; setRightDevice(d); setIsRightConnected(true); }

          clearTimeout(scanTimeout);
          resolve();
        } catch (e) { reject(e); }
      });
    });
  };

  const disconnectInsole = async (side: Side) => {
    if (side === 'L' && leftDevice) {
      subL.current?.remove?.(); subL.current = null; accL.current = '';
      try { await leftDevice.cancelConnection(); } catch {}
      setLeftDevice(null); setIsLeftConnected(false);
      setLeftVals({}); setRawL('');
      setBattL(null); setVbatL(null); setModeL(null); setVerL(null); setLastStatAtL(null);
    }
    if (side === 'R' && rightDevice) {
      subR.current?.remove?.(); subR.current = null; accR.current = '';
      try { await rightDevice.cancelConnection(); } catch {}
      setRightDevice(null); setIsRightConnected(false);
      setRightVals({}); setRawR('');
      setBattR(null); setVbatR(null); setModeR(null); setVerR(null); setLastStatAtR(null);
    }
    // 양쪽 모두 끊기면 업데이트 루프 중지
    if (!leftDevice && !rightDevice) stopUpdateLoop();
  };

  // 언마운트/종료 시 정리
  useEffect(() => {
    return () => {
      try { managerRef.current?.stopDeviceScan(); } catch {}
      try { subL.current?.remove?.(); } catch {}
      try { subR.current?.remove?.(); } catch {}
      stopUpdateLoop();
      // 연결 해제는 OS가 정리하더라도, 매니저는 명시적으로 종료
      try { managerRef.current?.destroy(); } catch {}
    };
  }, []);

  const value = useMemo(() => ({
    isLeftConnected, isRightConnected,
    leftVals, rightVals, rawL, rawR,

    // STAT 공개값
    battL, battR, vbatL, vbatR, modeL, modeR, verL, verR, lastStatAtL, lastStatAtR,

    connectInsole, disconnectInsole,
  }), [
    isLeftConnected, isRightConnected,
    leftVals, rightVals, rawL, rawR,
    battL, battR, vbatL, vbatR, modeL, modeR, verL, verR, lastStatAtL, lastStatAtR
  ]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

/* 과부하 에러 수정*/