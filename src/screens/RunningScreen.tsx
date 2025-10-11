import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRealtime } from '../store/realtime';
import FootHeatmap from '../components/FootHeatmap';

// ====== 간단한 세션-누적 스케일러 ======
// - 세션 시작 이후의 합 신호(S=Σv)를 누적 저장(history)
// - 1초마다 P95를 계산해 목표 스케일로 삼고, 단조증가 + 변화율 제한
function computeP95(series: number[]) {
  if (series.length === 0) return 1;
  const a = [...series].sort((x,y)=>x-y);
  const k = Math.max(0, Math.min(a.length-1, Math.floor(0.95*(a.length-1))));
  return a[k] || a[a.length-1] || 1;
}

export default function RunningScreen() {
  const { startTime, lastL, lastR, history, setStart, pushFrame, reset } = useRealtime();
  const [scale, setScale] = useState(1);        // 전역 정규화 스케일 S*
  const [locked, setLocked] = useState(false);  // 스케일 잠금
  const [elapsed, setElapsed] = useState(0);    // 경과 시간 표시
  const rows = 4, cols = 4;

  // ====== 모의 데이터 (BLE 붙이기 전까지) ======
  const mockTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const raf = useRef<number | null>(null);
  const anim = () => { raf.current = requestAnimationFrame(anim); setElapsed(Date.now() - (startTime || Date.now())); };
  useEffect(() => { anim(); return () => { if (raf.current) cancelAnimationFrame(raf.current); }; }, [startTime]);

  const startMock = () => {
    stopMock();
    const t0 = Date.now();
    setStart(t0);
    mockTimer.current = setInterval(() => {
      const t = (Date.now() - t0) / 1000;
      const synth = (phase:number) =>
        Array.from({length: rows*cols}, (_,i) => {
          const r=Math.floor(i/cols), c=i%cols;
          const dx=(c-cols*0.5)/(cols*0.5), dy=(r-rows*0.2)/(rows*0.8);
          const radial = Math.exp(-2.5*(dx*dx+dy*dy));
          const stride = 0.5 + 0.5*Math.sin(2*Math.PI*(t+phase)+c*0.45+r*0.35);
          return Math.max(0, Math.round(800 * radial * stride));
        });
      pushFrame({ foot:'L', ts: Date.now(), rows, cols, values: synth(0.00) });
      pushFrame({ foot:'R', ts: Date.now(), rows, cols, values: synth(0.25) });
    }, 40); // ≈25Hz
  };
  const stopMock = () => { if (mockTimer.current) clearInterval(mockTimer.current); mockTimer.current=null; };

  // ====== 1초마다 세션-누적 스케일 갱신 (P95, 단조 증가, 변화율 제한) ======
  useEffect(() => {
    const h = setInterval(() => {
      if (locked || history.length < 5) return;
      // 최근 전구간(세션 전체)에서 L/R 합 신호의 상단 분위수
      const sums = history.map(h => Math.max(h.sumL, h.sumR));
      const target = Math.max(200, computeP95(sums)); // 하한값(200)으로 너무 어두운 구간 방지
      // 단조 증가 + 변화율 제한(+12%/초)
      setScale(prev => {
        if (target <= prev) return prev; // 감소 금지(누적 컨셉)
        const maxRise = prev * 1.12;
        return Math.min(target, maxRise);
      });
    }, 1000);
    return () => clearInterval(h);
  }, [history, locked]);

  // ====== 화면 떠났을 때 정리 ======
  useEffect(() => () => { stopMock(); }, []);

  const fmtTime = useMemo(() => {
    const ms = Math.max(0, elapsed); const s = Math.floor(ms/1000);
    const mm = String(Math.floor(s/60)).padStart(2,'0');
    const ss = String(s%60).padStart(2,'0');
    return `${mm}:${ss}`;
  }, [elapsed]);

  // 정규화용 최신 프레임(시각화 시 0~1 범위로 쓰되, FootHeatmap엔 maxVal=1 전달)
  const normFrame = (f?: {ts:number;rows:number;cols:number;values:number[]}) =>
    f ? { ...f, values: f.values.map(v => v / Math.max(1, scale)) } as any : undefined;

  return (
    <View style={{ flex:1, padding:16, gap:12, backgroundColor:'#F8FAF7' }}>
      {/* 상단 상태바 */}
      <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
        <Text style={{ fontSize:18, fontWeight:'800' }}>RUNNING</Text>
        <Text style={{ fontVariant:['tabular-nums'] }}>{fmtTime}</Text>
      </View>

      {/* 히트맵 */}
      <View style={{ flexDirection:'row', justifyContent:'space-evenly', marginTop:8 }}>
        <FootHeatmap frame={normFrame(lastL)} mirror width={160} height={220} />
        <FootHeatmap frame={normFrame(lastR)} width={160} height={220} />
      </View>

      {/* 스케일 표시/제어 */}
      <View style={{ alignItems:'center', marginTop:4 }}>
        <Text style={{ color:'#64748b', fontSize:12 }}>
          scale S* (세션 누적): {Math.round(scale)}
        </Text>
      </View>

      {/* 컨트롤 */}
      <View style={{ flexDirection:'row', gap:10, marginTop:12 }}>
        <Pressable onPress={startMock} style={{ backgroundColor:'#2E7D32', padding:12, borderRadius:10 }}>
          <Text style={{ color:'#fff', fontWeight:'800' }}>모의 시작</Text>
        </Pressable>
        <Pressable onPress={() => { stopMock(); }} style={{ backgroundColor:'#e5e7eb', padding:12, borderRadius:10 }}>
          <Text>일시정지</Text>
        </Pressable>
        <Pressable onPress={() => setLocked(v => !v)} style={{ backgroundColor: locked ? '#1e293b' : '#e5e7eb', padding:12, borderRadius:10 }}>
          <Text style={{ color: locked ? '#fff' : '#111' }}>{locked ? '스케일 잠금 해제' : '스케일 잠금'}</Text>
        </Pressable>
        <Pressable onPress={() => { stopMock(); reset(); setScale(1); }} style={{ backgroundColor:'#fee2e2', padding:12, borderRadius:10 }}>
          <Text style={{ color:'#b91c1c' }}>리셋</Text>
        </Pressable>
      </View>

      <View style={{ marginTop:8 }}>
        <Text style={{ color:'#64748b' }}>
          • 세션 누적 기반 정규화(P95 유사)로 점진적 스케일업(감소 없음){'\n'}
          • 좌/우 4×4 히트맵. BLE 연결 시 pushFrame만 실제 데이터로 대체
        </Text>
      </View>
    </View>
  );
}
