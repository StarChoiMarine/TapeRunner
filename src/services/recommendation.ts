import type { RunSession } from '../types/analysis';
import { injuryVideos } from '../data/injuryVideos';

export type InjuryRecommendation = {
  key: string;          // e.g., 'Achilles Tendinopathy'
  label: string;        // 표시용 라벨
  reasons: string[];
  videos: { title: string; url: string }[];
};

// 센서 그룹(추정): 프로젝트에서 4,5=뒤꿈치 / 8,9,10,12,20=전족부 사용 중
const heelIds = [4, 5];
const foreIds = [8, 9, 10, 12, 20];
const midIds = [2, 3, 7, 13, 15, 16, 17, 18, 19];

function sumSensors(map: Record<number, number>, ids: number[]): number {
  return ids.reduce((a, id) => a + (map[id] || 0), 0);
}

function pickVideosByNameLike(substr: string, limit = 2): { title: string; url: string }[] {
  const lower = substr.toLowerCase();
  const found = injuryVideos.find((it) => it.name.toLowerCase().includes(lower));
  return (found?.videos || []).slice(0, limit).map((v) => ({ title: v.title, url: v.url }));
}

export function deriveRecommendation(session: RunSession): InjuryRecommendation {
  const L = session.left || {};
  const R = session.right || {};

  const lHeel = sumSensors(L, heelIds);
  const rHeel = sumSensors(R, heelIds);
  const lFore = sumSensors(L, foreIds);
  const rFore = sumSensors(R, foreIds);
  const lMid  = sumSensors(L, midIds);
  const rMid  = sumSensors(R, midIds);

  const totalHeel = lHeel + rHeel;
  const totalFore = lFore + rFore;
  const totalMid  = lMid + rMid;

  const reasons: string[] = [];

  // 규칙 1) 뒤꿈치 하중 우세 → Achilles Tendinopathy 가능성
  if (totalHeel > totalFore + 0.25) {
    reasons.push('뒤꿈치 하중이 전족부 대비 높습니다.');
    return {
      key: 'Achilles Tendinopathy',
      label: 'Achilles Tendinopathy (아킬레스건염)',
      reasons,
      videos: pickVideosByNameLike('Achilles Tendinopathy'),
    };
  }

  // 규칙 2) 오른발 전족부 외측 편중 → Inversion Sprain (내번 염좌)
  const rightOuterFore = (R[9] || 0) + (R[10] || 0) + (R[20] || 0);
  const rightInnerFore = (R[8] || 0) + (R[12] || 0) + (R[13] || 0);
  if (rightOuterFore > rightInnerFore + 0.15 && rightOuterFore > 0.3) {
    reasons.push('오른발 전족부 외측 하중이 높습니다.');
    return {
      key: 'Inversion Sprain',
      label: 'Inversion Sprain (발목 내번 염좌)',
      reasons,
      videos: pickVideosByNameLike('Inversion Sprain'),
    };
  }

  // 규칙 3) 왼발 전족부 내측 편중 → PFPS (무릎 정렬 문제 연관)
  const leftOuterFore = (L[9] || 0) + (L[10] || 0) + (L[20] || 0);
  const leftInnerFore = (L[8] || 0) + (L[12] || 0) + (L[13] || 0);
  if (leftInnerFore > leftOuterFore + 0.15 && leftInnerFore > 0.3) {
    reasons.push('왼발 전족부 내측 하중이 높습니다.');
    return {
      key: 'PFPS',
      label: 'PFPS (슬개대퇴통증증후군)',
      reasons,
      videos: pickVideosByNameLike('PFPS'),
    };
  }

  // 규칙 4) 중족부 전반 하중 ↑ → MTSS(내측 경골 스트레스)
  if (totalMid > 0.6 && totalMid > totalFore && totalMid > totalHeel) {
    reasons.push('중족부 전반 하중이 상대적으로 높습니다.');
    return {
      key: 'MTSS',
      label: 'MTSS (내측경골스트레스증후군)',
      reasons,
      videos: pickVideosByNameLike('MTSS'),
    };
  }

  // 규칙 5) 전족부 전반 하중 ↑ → Plantar Fasciitis(족저근막염)
  if (totalFore > totalHeel + 0.2) {
    reasons.push('전족부 하중이 뒤꿈치 대비 높습니다.');
    return {
      key: 'Plantar Fasciitis',
      label: 'Plantar Fasciitis (족저근막염)',
      reasons,
      videos: pickVideosByNameLike('Plantar Fasciitis'),
    };
  }

  // 기본: PFPS를 기본 권고로 제시
  reasons.push('특정 편중 패턴이 뚜렷하지 않습니다.');
  return {
    key: 'PFPS',
    label: 'PFPS (슬개대퇴통증증후군)',
    reasons,
    videos: pickVideosByNameLike('PFPS'),
  };
}


