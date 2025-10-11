import { create } from 'zustand';

export type Foot = 'L' | 'R';
export type GridFrame = {
  foot: Foot;
  ts: number;          // epoch ms (수신 시각)
  rows: number;        // 4
  cols: number;        // 4
  values: number[];    // length = rows*cols
};

type RTState = {
  startTime: number | null;
  lastL?: GridFrame;
  lastR?: GridFrame;
  history: { ts: number; sumL: number; sumR: number }[];  // 누적 요약(정규화 스케일 추정에 사용)
  setStart: (t: number) => void;
  pushFrame: (f: GridFrame) => void;
  reset: () => void;
};

export const useRealtime = create<RTState>((set, get) => ({
  startTime: null,
  lastL: undefined,
  lastR: undefined,
  history: [],
  setStart: (t) => set({ startTime: t, history: [] }),
  pushFrame: (f) => {
    const { startTime, history, lastL, lastR } = get();
    // 러닝 시작 전 프레임은 무시
    if (!startTime || f.ts < startTime) {
      // 최신만 갱신 (시작 전 준비화면에서 쓸 수 있게)
      if (f.foot === 'L') set({ lastL: f }); else set({ lastR: f });
      return;
    }
    // 최신 프레임 반영
    if (f.foot === 'L') set({ lastL: f }); else set({ lastR: f });

    // 프레임 합(S)을 history에 누적 (L/R 둘 다 들어온 시점에 합산하도록 여유 있게 처리)
    const l = f.foot === 'L' ? f : lastL;
    const r = f.foot === 'R' ? f : lastR;
    if (l && r) {
      const sumL = l.values.reduce((a, b) => a + Math.max(0, b), 0);
      const sumR = r.values.reduce((a, b) => a + Math.max(0, b), 0);
      const ts = Math.max(l.ts, r.ts);
      // 중복 방지: 같은 ts가 연속으로 들어오면 건너뜀
      if (history.length === 0 || history[history.length - 1].ts !== ts) {
        set({ history: [...history, { ts, sumL, sumR }] });
      }
    }
  },
  reset: () => set({ startTime: null, lastL: undefined, lastR: undefined, history: [] }),
}));
