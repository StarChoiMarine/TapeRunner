// src/store/appStore.ts
import create from 'zustand';

export type AnkleState = '안전' | '주의';

type AppState = {
  isConnected: boolean;
  batteryLeft: number;   // 0~100
  batteryRight: number;  // 0~100
  recentRuns: number;
  ankleState: AnkleState;
  setConnection: (v: boolean) => void;
  setBatteries: (l: number, r: number) => void;
  setRecentRuns: (n: number) => void;
  setAnkleState: (s: AnkleState) => void;
};

export const useAppStore = create<AppState>((set) => ({
  isConnected: true,
  batteryLeft: 100,
  batteryRight: 98,
  recentRuns: 5,
  ankleState: '안전',
  setConnection: (v) => set({ isConnected: v }),
  setBatteries: (l, r) => set({ batteryLeft: l, batteryRight: r }),
  setRecentRuns: (n) => set({ recentRuns: n }),
  setAnkleState: (s) => set({ ankleState: s }),
}));
