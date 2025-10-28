import { RunSession, TapeRecommendation, TapeVideo } from '../types/analysis';

// 간단한 샘플 영상 메타데이터 (향후 DB 연동 예정)
const TAPE_VIDEOS: TapeVideo[] = [
  {
    id: 'v1',
    category: 'lateral_ankle',
    title: '외측 발목 염좌 안정 테이핑',
    videoUrl: 'https://example.com/videos/lateral_ankle.mp4',
    thumbUrl: 'https://i.imgur.com/uWnG6OU.png',
  },
  {
    id: 'v2',
    category: 'medial_ankle',
    title: '내측 발목 안정 테이핑',
    videoUrl: 'https://example.com/videos/medial_ankle.mp4',
    thumbUrl: 'https://i.imgur.com/1pI7k1c.png',
  },
  {
    id: 'v3',
    category: 'achilles',
    title: '아킬레스건 안정 테이핑',
    videoUrl: 'https://example.com/videos/achilles.mp4',
    thumbUrl: 'https://i.imgur.com/S5vFQJx.png',
  },
];

export const mockSessions: RunSession[] = [
  {
    id: 's1',
    startedAt: '2025-10-15T18:20:00.000Z',
    durationSec: 1800,
    left: { 2: 0.2, 4: 0.4, 5: 0.35, 7: 0.12, 8: 0.18, 9: 0.06, 10: 0.09, 12: 0.22, 13: 0.18, 15: 0.3, 16: 0.28, 17: 0.12, 18: 0.14, 19: 0.25, 20: 0.1 },
    right: { 2: 0.18, 4: 0.42, 5: 0.32, 7: 0.15, 8: 0.16, 9: 0.05, 10: 0.07, 12: 0.2, 13: 0.15, 15: 0.26, 16: 0.25, 17: 0.14, 18: 0.16, 19: 0.23, 20: 0.12 },
  },
  {
    id: 's2',
    startedAt: '2025-10-18T06:30:00.000Z',
    durationSec: 2400,
    left: { 2: 0.22, 4: 0.46, 5: 0.4, 7: 0.15, 8: 0.2, 9: 0.08, 10: 0.12, 12: 0.25, 13: 0.2, 15: 0.33, 16: 0.31, 17: 0.18, 18: 0.2, 19: 0.27, 20: 0.14 },
    right: { 2: 0.2, 4: 0.44, 5: 0.36, 7: 0.18, 8: 0.22, 9: 0.09, 10: 0.13, 12: 0.24, 13: 0.18, 15: 0.3, 16: 0.28, 17: 0.2, 18: 0.22, 19: 0.29, 20: 0.16 },
  },
];

// 간단한 규칙 기반 추천 (센서 분포로 카테고리 선택)
export function deriveTapeRecommendation(session: RunSession): TapeRecommendation {
  const heelIds = [4, 5];
  const foreIds = [8, 9, 10, 12, 20];
  const leftHeel = heelIds.reduce((a, id) => a + (session.left[id] || 0), 0);
  const rightHeel = heelIds.reduce((a, id) => a + (session.right[id] || 0), 0);
  const leftFore = foreIds.reduce((a, id) => a + (session.left[id] || 0), 0);
  const rightFore = foreIds.reduce((a, id) => a + (session.right[id] || 0), 0);

  // 매우 단순한 휴리스틱
  let category: TapeRecommendation['category'] = 'lateral_ankle';
  const reasons: string[] = [];

  if (leftHeel + rightHeel > leftFore + rightFore + 0.3) {
    category = 'achilles';
    reasons.push('뒤꿈치 하중이 상대적으로 높음');
  } else if (rightFore > leftFore + 0.2) {
    category = 'lateral_ankle';
    reasons.push('오른발 전족부 외측 압력이 높음');
  } else if (leftFore > rightFore + 0.2) {
    category = 'medial_ankle';
    reasons.push('왼발 전족부 내측 압력이 높음');
  } else {
    reasons.push('양발 분포가 균형에 가까움');
  }

  const videos = TAPE_VIDEOS.filter((v) => v.category === category).slice(0, 2);
  return { category, reasons, videos };
}
