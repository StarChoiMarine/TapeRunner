// 0~1 정규화 좌표 (오른발 기준) — 화면 좌표: (0,0)=좌상단, y는 아래로 증가
export type SensorPt = { id: number; x: number; y: number };

// 👇 이미지(발끝 위 / 뒤꿈치 아래) 배치에 맞춘 초기 좌표
// 필요하면 0.02 단위로 미세 조정하세요.
export const RIGHT_LAYOUT_20: SensorPt[] = [
  // 발끝(위쪽)
  { id:10, x:0.35, y:0.08 }, { id:9,  x:0.57, y:0.10 },
  { id:20, x:0.28, y:0.24 }, { id:12, x:0.50, y:0.24 }, { id:8,  x:0.72, y:0.23 },
  { id:19, x:0.27, y:0.41 }, { id:16, x:0.50, y:0.41 }, { id:7,  x:0.73, y:0.41 },

  // 스트랩 위/아래 두 줄
  { id:18, x:0.35, y:0.57 }, { id:15, x:0.50, y:0.57 }, { id:2, x:0.67, y:0.57 },
  { id:17, x:0.35, y:0.74 }, { id:13, x:0.50, y:0.75 }, { id:3, x:0.65, y:0.75 },

  // 뒤꿈치(아래쪽)
  { id:4,  x:0.40, y:0.90 }, { id:5,  x:0.57, y:0.90 },

];

// ──────────────────────────────────────────────────────────────────────────────
// C0~C15 → 센서ID 매핑 (임시안). 실제 하드 매핑과 다르면 여기만 바꾸면 됩니다.
export const CHANNEL_TO_SENSOR: Record<number, number> = {
  0:19,  1:18,  2:17,  3:13,
  4:15,  5:14,  6:12,  7: 2,   // ✅ C6 → 12 로 교체 (예시)
  8:10,  9: 9, 10: 8, 11: 7,
 12: 5, 13: 4, 14:16, 15:20,
};

// 센서ID → 채널 역매핑 (JSON이 센서ID로 올 때 프레임 배열 채우는 용도)
export const SENSOR_TO_CHANNEL: Record<number, number> = Object.fromEntries(
  Object.entries(CHANNEL_TO_SENSOR).map(([ch, sid]) => [sid, Number(ch)])
);
