// src/screens/RunningScreen.tsx
// 러닝 세션 모드 — 다크 몰입형.
// 실서비스 기능 슬롯: 타이머 / 거리·페이스·케이던스 / 좌우 밸런스 / 착지 패턴
// / 하중 편향 경고 / 일시정지·길게 눌러 종료 / 데모 모드(합성 보행 데이터)
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FootDots from '../components/FootDots';
import { useBle } from '../store/ble/BleProvider';
import type { RunSession } from '../types/analysis';
import { color, font, radius, shadow } from '../theme';

type SensorMap = Record<number, number>;

// 센서 그룹 (recommendation.ts와 동일 기준)
const HEEL_IDS = [4, 5];
const MID_IDS = [2, 3, 7, 13, 15, 16, 17, 18, 19];
const FORE_IDS = [8, 9, 10, 12, 20];

const sumOf = (m: SensorMap, ids: number[]) => ids.reduce((a, id) => a + (m[id] || 0), 0);
const totalOf = (m: SensorMap) => Object.values(m).reduce((a, b) => a + (b || 0), 0);

const fmtTime = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  const mm = String(m).padStart(2, '0');
  const sss = String(ss).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${sss}` : `${mm}:${sss}`;
};

const fmtPace = (secPerKm: number | null) => {
  if (!secPerKm || !Number.isFinite(secPerKm) || secPerKm <= 0) return '—';
  const m = Math.floor(secPerKm / 60);
  const s = Math.round(secPerKm % 60);
  return `${m}'${String(s).padStart(2, '0')}"`;
};

// ── 합성 보행 데이터 (데모 모드) ──────────────────────────────
function synthFrame(t: number): { L: SensorMap; R: SensorMap } {
  const stepHz = 1.4; // 발당 약 84spm → 케이던스 ~168
  const phase = (t * stepHz) % 1; // 0~1
  const make = (p: number): SensorMap => {
    // p<0.5 접지(뒤꿈치→전족 롤링), p>=0.5 스윙(공중)
    if (p >= 0.5) return {};
    const roll = p / 0.5; // 0→1
    const stance = Math.sin(roll * Math.PI); // 접지 강도 곡선
    const out: SensorMap = {};
    HEEL_IDS.forEach((id) => { out[id] = Math.max(0, stance * (1 - roll) * (0.95 + Math.random() * 0.1)); });
    MID_IDS.forEach((id) => { out[id] = Math.max(0, stance * 0.3 * (0.7 + Math.random() * 0.3)); });
    FORE_IDS.forEach((id) => { out[id] = Math.max(0, stance * roll * (0.62 + Math.random() * 0.15)); });
    return out;
  };
  return { L: make(phase), R: make((phase + 0.5) % 1) };
}

// ── 작은 UI 조각들 ───────────────────────────────────────────
function Chip({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: on ? color.lime : color.lineOnDark,
        backgroundColor: on ? 'rgba(211,242,106,0.12)' : 'transparent',
      }}
    >
      <Text style={{ fontFamily: font.semibold, fontSize: 12, color: on ? color.lime : color.ivoryFaint }}>
        {label}
      </Text>
    </Pressable>
  );
}

function Metric({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 2 }}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 2 }}>
        <Text style={{ fontFamily: font.extrabold, fontSize: 24, color: color.ivory }}>{value}</Text>
        {!!unit && <Text style={{ fontFamily: font.medium, fontSize: 11, color: color.ivoryFaint }}>{unit}</Text>}
      </View>
      <Text style={{ fontFamily: font.medium, fontSize: 11, letterSpacing: 0.5, color: color.ivoryFaint }}>
        {label}
      </Text>
    </View>
  );
}

export default function RunningScreen() {
  const nav = useNavigation<any>();
  const { leftVals, rightVals, isLeftConnected, isRightConnected } = useBle();

  // ── 상태 ──
  const [isPaused, setIsPaused] = useState(false);
  const [isTaping, setIsTaping] = useState(false);
  const [showRealtime, setShowRealtime] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [demoL, setDemoL] = useState<SensorMap>({});
  const [demoR, setDemoR] = useState<SensorMap>({});
  const [distanceM, setDistanceM] = useState(0);
  const [cadence, setCadence] = useState<number | null>(null);
  const [alertSide, setAlertSide] = useState<'왼발' | '오른발' | null>(null);
  const [stopHint, setStopHint] = useState(false);

  // 현재 프레임 소스 (데모 우선)
  const srcL = demoMode ? demoL : leftVals;
  const srcR = demoMode ? demoR : rightVals;

  // ── 누적(합계/카운트) 버퍼 ──
  const sumL = useRef<SensorMap>({});
  const sumR = useRef<SensorMap>({});
  const cntL = useRef<SensorMap>({});
  const cntR = useRef<SensorMap>({});
  const runStartRef = useRef<number | null>(null);
  const skewCountRef = useRef(0);

  // 교대 보행 순간값 스무딩용 EMA (좌/우 · 부위별)
  const emaRef = useRef({ l: 0, r: 0, heel: 0, mid: 0, fore: 0 });
  const [bal, setBal] = useState({ l: 50, r: 50 });
  const [landing, setLanding] = useState<'후족' | '중족' | '전족' | null>(null);

  // ── 러닝 시간 (일시정지 반영) ──
  useEffect(() => {
    if (isPaused) return;
    const t = setInterval(() => setElapsedSec((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [isPaused]);

  // ── 데모 모드: 합성 보행 프레임 + 거리/케이던스 ──
  useEffect(() => {
    if (!demoMode || isPaused) return;
    let t = 0;
    const timer = setInterval(() => {
      t += 0.1;
      const { L, R } = synthFrame(t);
      setDemoL(L);
      setDemoR(R);
      setDistanceM((d) => d + 0.1 * (2.9 + 0.25 * Math.sin(t / 9))); // ~2.9m/s
      setCadence(Math.round(168 + 5 * Math.sin(t / 7)));
    }, 100);
    return () => clearInterval(timer);
  }, [demoMode, isPaused]);

  // ── 프레임 누적 + 편향 감지 ──
  useEffect(() => {
    if (isPaused) return;
    for (const [sidStr, v] of Object.entries(srcL)) {
      const sid = Number(sidStr);
      sumL.current[sid] = (sumL.current[sid] ?? 0) + (Number(v) || 0);
      cntL.current[sid] = (cntL.current[sid] ?? 0) + 1;
    }
    for (const [sidStr, v] of Object.entries(srcR)) {
      const sid = Number(sidStr);
      sumR.current[sid] = (sumR.current[sid] ?? 0) + (Number(v) || 0);
      cntR.current[sid] = (cntR.current[sid] ?? 0) + 1;
    }
    if (!runStartRef.current && (totalOf(srcL) > 0 || totalOf(srcR) > 0)) {
      runStartRef.current = Date.now();
    }

    // EMA 갱신 (걸음 교대 주기를 넘는 ~3초 시정수로 스무딩)
    const a = 0.035;
    const e = emaRef.current;
    e.l = e.l * (1 - a) + totalOf(srcL) * a;
    e.r = e.r * (1 - a) + totalOf(srcR) * a;
    // 부위별 센서 수가 다르므로(뒤꿈치 2 vs 전족 5) 센서당 평균으로 비교
    e.heel = e.heel * (1 - a) + ((sumOf(srcL, HEEL_IDS) + sumOf(srcR, HEEL_IDS)) / HEEL_IDS.length) * a;
    e.mid = e.mid * (1 - a) + ((sumOf(srcL, MID_IDS) + sumOf(srcR, MID_IDS)) / MID_IDS.length) * a;
    e.fore = e.fore * (1 - a) + ((sumOf(srcL, FORE_IDS) + sumOf(srcR, FORE_IDS)) / FORE_IDS.length) * a;

    // 좌우 밸런스 (EMA 기준)
    if (e.l + e.r > 0.05) {
      const l = Math.round((e.l / (e.l + e.r)) * 100);
      setBal({ l, r: 100 - l });

      // 하중 편향: 20% 이상 쏠림이 ~5초 지속되면 경고
      const imbalance = Math.abs(e.l - e.r) / (e.l + e.r);
      if (imbalance > 0.2) {
        skewCountRef.current += 1;
        if (skewCountRef.current > 50) setAlertSide(e.l > e.r ? '왼발' : '오른발');
      } else {
        skewCountRef.current = 0;
        setAlertSide(null);
      }
    }

    // 착지 패턴 (EMA 기준)
    if (e.heel + e.mid + e.fore < 0.03) setLanding(null);
    else if (e.heel >= e.mid && e.heel >= e.fore) setLanding('후족');
    else if (e.fore >= e.mid) setLanding('전족');
    else setLanding('중족');
  }, [srcL, srcR, isPaused]);

  const balL = bal.l;
  const balR = bal.r;

  const paceSecPerKm = distanceM > 30 ? elapsedSec / (distanceM / 1000) : null;
  const anyConnected = isLeftConnected || isRightConnected;
  const skewed = Math.abs(balL - balR) > 20;

  // ── 종료: 평균 세션 구성 → 분석 화면 ──
  const onStop = () => {
    const toAverage = (sum: SensorMap, cnt: SensorMap) => {
      const out: SensorMap = {};
      new Set([...Object.keys(sum), ...Object.keys(cnt)].map(Number)).forEach((k) => {
        const c = cnt[k] ?? 0;
        out[k] = c > 0 ? (sum[k] ?? 0) / c : 0;
      });
      return out;
    };

    const now = Date.now();
    const startedMs = runStartRef.current ?? now - elapsedSec * 1000;
    const session: RunSession = {
      id: `run-${now}`,
      startedAt: new Date(startedMs).toISOString(),
      durationSec: Math.max(1, elapsedSec),
      left: toAverage(sumL.current, cntL.current),
      right: toAverage(sumR.current, cntR.current),
    };

    // 다음 세션을 위한 리셋
    sumL.current = {}; sumR.current = {}; cntL.current = {}; cntR.current = {};
    runStartRef.current = null;
    skewCountRef.current = 0;
    emaRef.current = { l: 0, r: 0, heel: 0, mid: 0, fore: 0 };

    nav.navigate('Analysis', { session });
  };

  return (
    <View style={{ flex: 1, backgroundColor: color.surfaceDeeper }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 140 }}>
        {/* 상단: 상태 칩 */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
              <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: isLeftConnected || demoMode ? color.lime : color.ivoryFaint }} />
              <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: isRightConnected || demoMode ? color.lime : color.ivoryFaint }} />
              <Text style={{ fontFamily: font.medium, fontSize: 11, color: color.ivoryFaint, marginLeft: 2 }}>
                {demoMode ? '데모 데이터' : anyConnected ? '인솔 연결됨' : '인솔 미연결'}
              </Text>
            </View>
            <Text style={{ fontFamily: font.medium, fontSize: 11, color: color.ivoryFaint }}>· GPS 준비 중</Text>
          </View>
          <Chip label="DEMO" on={demoMode} onPress={() => setDemoMode((v) => !v)} />
        </View>

        {/* 타이머 */}
        <View style={{ alignItems: 'center', marginTop: 26 }}>
          <Text style={{ fontFamily: font.medium, fontSize: 12, letterSpacing: 2.5, color: color.ivoryFaint }}>
            {isPaused ? 'PAUSED' : 'RUNNING'}
          </Text>
          <Text
            style={{
              fontFamily: font.extrabold,
              fontSize: 68,
              color: isPaused ? color.ivoryFaint : color.ivory,
              fontVariant: ['tabular-nums'],
              marginTop: 2,
            }}
          >
            {fmtTime(elapsedSec)}
          </Text>
        </View>

        {/* 지표: 거리 / 페이스 / 케이던스 */}
        <View
          style={{
            flexDirection: 'row',
            marginTop: 18,
            backgroundColor: color.surfaceDeep,
            borderRadius: radius.lg,
            paddingVertical: 16,
          }}
        >
          <Metric label="거리" value={distanceM > 0 ? (distanceM / 1000).toFixed(2) : '—'} unit="km" />
          <View style={{ width: 1, backgroundColor: color.lineOnDark }} />
          <Metric label="평균 페이스" value={fmtPace(paceSecPerKm)} unit="/km" />
          <View style={{ width: 1, backgroundColor: color.lineOnDark }} />
          <Metric label="케이던스" value={cadence != null ? String(cadence) : '—'} unit="spm" />
        </View>

        {/* 하중 편향 경고 */}
        {alertSide && !isPaused && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              marginTop: 14,
              backgroundColor: 'rgba(201,138,45,0.16)',
              borderWidth: 1,
              borderColor: 'rgba(201,138,45,0.5)',
              borderRadius: radius.md,
              padding: 12,
            }}
          >
            <Text style={{ fontSize: 15, color: color.amber }}>▲</Text>
            <Text style={{ fontFamily: font.semibold, fontSize: 13, color: '#E8C48A', flex: 1 }}>
              {alertSide}에 하중이 계속 쏠리고 있어요. 보폭과 자세를 점검해 보세요.
            </Text>
          </View>
        )}

        {/* 좌우 밸런스 */}
        <View style={{ marginTop: 14, backgroundColor: color.surfaceDeep, borderRadius: radius.lg, padding: 16, gap: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontFamily: font.semibold, fontSize: 13, color: color.ivorySoft }}>좌우 밸런스</Text>
            <Text style={{ fontFamily: font.bold, fontSize: 13, color: skewed ? color.amber : color.leafBright }}>
              L {balL} : {balR} R
            </Text>
          </View>
          <View style={{ flexDirection: 'row', height: 10, borderRadius: 5, overflow: 'hidden', backgroundColor: 'rgba(246,243,233,0.08)' }}>
            <View style={{ flex: balL, backgroundColor: skewed && balL > balR ? color.amber : color.lime, opacity: 0.9 }} />
            <View style={{ width: 2, backgroundColor: color.surfaceDeeper }} />
            <View style={{ flex: balR, backgroundColor: skewed && balR > balL ? color.amber : color.leaf, opacity: 0.9 }} />
          </View>
          {/* 착지 패턴 */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <Text style={{ fontFamily: font.medium, fontSize: 12, color: color.ivoryFaint }}>착지 패턴</Text>
            {(['후족', '중족', '전족'] as const).map((p) => (
              <View
                key={p}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: radius.pill,
                  backgroundColor: landing === p ? 'rgba(211,242,106,0.15)' : 'transparent',
                  borderWidth: 1,
                  borderColor: landing === p ? color.lime : color.lineOnDark,
                }}
              >
                <Text style={{ fontFamily: font.semibold, fontSize: 12, color: landing === p ? color.lime : color.ivoryFaint }}>
                  {p}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* 실시간 압력 */}
        <View style={{ marginTop: 14, backgroundColor: color.surfaceDeep, borderRadius: radius.lg, padding: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <Text style={{ fontFamily: font.semibold, fontSize: 13, color: color.ivorySoft }}>실시간 발바닥 압력</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Chip label={isTaping ? '테이핑 ✓' : '테이핑'} on={isTaping} onPress={() => setIsTaping((v) => !v)} />
              <Chip label={showRealtime ? '표시 ON' : '표시 OFF'} on={showRealtime} onPress={() => setShowRealtime((v) => !v)} />
            </View>
          </View>
          {showRealtime ? (
            <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
              <FootDots sensorValues={srcL} mirror dark width={145} height={205} radius={14} showFaintWhenZero />
              <FootDots sensorValues={srcR} dark width={145} height={205} radius={14} showFaintWhenZero />
            </View>
          ) : (
            <Text style={{ fontFamily: font.regular, fontSize: 12, color: color.ivoryFaint, textAlign: 'center', paddingVertical: 30 }}>
              압력 표시를 끄면 배터리를 아낄 수 있어요
            </Text>
          )}
        </View>
      </ScrollView>

      {/* 하단 컨트롤 */}
      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          left: 0, right: 0, bottom: 0,
          paddingBottom: 26,
          paddingTop: 14,
          alignItems: 'center',
          gap: 8,
        }}
      >
        {stopHint && (
          <Text style={{ fontFamily: font.medium, fontSize: 12, color: color.ivorySoft }}>
            버튼을 길게 누르면 러닝이 종료돼요
          </Text>
        )}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 22 }}>
          {/* 일시정지/재개 */}
          <Pressable
            onPress={() => setIsPaused((p) => !p)}
            style={({ pressed }) => ({
              width: 64, height: 64, borderRadius: 32,
              borderWidth: 2,
              borderColor: isPaused ? color.lime : color.lineOnDark,
              backgroundColor: pressed ? 'rgba(246,243,233,0.08)' : color.surfaceDeep,
              alignItems: 'center', justifyContent: 'center',
            })}
          >
            <Text style={{ fontFamily: font.extrabold, fontSize: isPaused ? 20 : 16, color: isPaused ? color.lime : color.ivory }}>
              {isPaused ? '▶' : '❙❙'}
            </Text>
          </Pressable>

          {/* 종료 (길게 누르기) */}
          <Pressable
            onPress={() => {
              setStopHint(true);
              setTimeout(() => setStopHint(false), 2500);
            }}
            onLongPress={onStop}
            delayLongPress={700}
            style={({ pressed }) => ({
              width: 86, height: 86, borderRadius: 43,
              backgroundColor: pressed ? '#B84A36' : color.coral,
              alignItems: 'center', justifyContent: 'center',
              borderWidth: 4,
              borderColor: 'rgba(217,91,67,0.35)',
              ...shadow.float,
            })}
          >
            <Text style={{ fontFamily: font.extrabold, fontSize: 17, letterSpacing: 1, color: '#FFF4EC' }}>정지</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
