import type { RunSession } from '../types/analysis';
import { injuryVideos } from '../data/injuryVideos';

export type InjuryRecommendation = {
  key: string;          // e.g., 'Achilles Tendinopathy'
  label: string;        // 표시용 라벨
  reasons: string[];
  videos: { title: string; url: string }[];
};

// 센서 그룹 정밀화 - 부상별 특성에 따른 그룹화
const heelIds = [4, 5];                                    // 뒤꿈치 센서
const foreIds = [8, 9, 10, 12, 20];                        // 전족부 센서
const foreInnerIds = [8, 12, 13];                          // 전족부 내측
const foreOuterIds = [9, 10, 20];                          // 전족부 외측
const midIds = [2, 3, 7, 13, 15, 16, 17, 18, 19];        // 중족부 센서
const midInnerIds = [7, 12, 13, 15];                      // 중족부 내측
const lateralIds = [2, 3, 10, 11, 16, 17, 18];            // 측면/외측 센서
const posteriorIds = [1, 4, 5, 6];                        // 후방 센서 (햄스트링/아킬레스 관련)

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

  // 센서 그룹별 합계 계산
  const lHeel = sumSensors(L, heelIds);
  const rHeel = sumSensors(R, heelIds);
  const lFore = sumSensors(L, foreIds);
  const rFore = sumSensors(R, foreIds);
  const lForeInner = sumSensors(L, foreInnerIds);
  const rForeInner = sumSensors(R, foreInnerIds);
  const lForeOuter = sumSensors(L, foreOuterIds);
  const rForeOuter = sumSensors(R, foreOuterIds);
  const lMid = sumSensors(L, midIds);
  const rMid = sumSensors(R, midIds);
  const lMidInner = sumSensors(L, midInnerIds);
  const rMidInner = sumSensors(R, midInnerIds);
  const lLateral = sumSensors(L, lateralIds);
  const rLateral = sumSensors(R, lateralIds);
  const lPosterior = sumSensors(L, posteriorIds);
  const rPosterior = sumSensors(R, posteriorIds);

  // 전체 합계
  const totalHeel = lHeel + rHeel;
  const totalFore = lFore + rFore;
  const totalMid = lMid + rMid;
  const totalPosterior = lPosterior + rPosterior;

  const reasons: string[] = [];

  // 규칙 1) 아킬레스건염: 뒤꿈치 압력 우세 + 후방 압력 증가
  if (totalHeel > totalFore + 0.3 && totalPosterior > 0.4) {
    reasons.push('뒤꿈치와 후방부 하중이 높아 아킬레스건에 무리가 갈 수 있습니다.');
    return {
      key: 'Achilles Tendinopathy',
      label: 'Achilles Tendinopathy (아킬레스건염)',
      reasons,
      videos: pickVideosByNameLike('Achilles Tendinopathy'),
    };
  }

  // 규칙 2) 햄스트링 부상: 후방 압력 비정상적 증가
  if (totalPosterior > totalFore + 0.25 && totalPosterior > 0.5) {
    reasons.push('후방부 하중이 비정상적으로 높아 햄스트링에 부담이 됩니다.');
    return {
      key: 'Hamstring injury',
      label: 'Hamstring injury (햄스트링 부상)',
      reasons,
      videos: pickVideosByNameLike('Hamstring injury'),
    };
  }

  // 규칙 3) 발목 내번 염좌: 전족부 외측 압력 우세 (특히 오른발)
  if (rForeOuter > rForeInner + 0.2 && rForeOuter > 0.35) {
    reasons.push('오른발 전족부 외측 하중이 높아 발목 내번 염좌 위험이 있습니다.');
    return {
      key: 'Inversion Sprain',
      label: 'Inversion Sprain (발목 내번 염좌)',
      reasons,
      videos: pickVideosByNameLike('Inversion Sprain'),
    };
  }

  // 규칙 4) 장경인대증후군: 측면 압력 증가 + 무릎 관련 패턴
  if ((lLateral + rLateral) > (lMidInner + rMidInner) + 0.25 && totalMid > totalFore) {
    reasons.push('측면과 중족부 하중이 높아 장경인대에 스트레스가 발생할 수 있습니다.');
    return {
      key: 'ITBS',
      label: 'ITBS (장경인대증후군)',
      reasons,
      videos: pickVideosByNameLike('ITBS'),
    };
  }

  // 규칙 5) 슬개대퇴통증증후군: 전족부 내측 압력 우세 (무릎 정렬 문제)
  if (lForeInner > lForeOuter + 0.15 && lForeInner > 0.3) {
    reasons.push('왼발 전족부 내측 하중이 높아 무릎 정렬에 문제가 생길 수 있습니다.');
    return {
      key: 'PFPS',
      label: 'PFPS (슬개대퇴통증증후군)',
      reasons,
      videos: pickVideosByNameLike('PFPS'),
    };
  }

  // 규칙 6) 족저근막염: 전족부 압력 비정상적 증가
  if (totalFore > totalHeel + 0.25 && totalFore > totalMid + 0.2) {
    reasons.push('전족부 하중이 상대적으로 높아 족저근막에 부담이 됩니다.');
    return {
      key: 'Plantar Fasciitis',
      label: 'Plantar Fasciitis (족저근막염)',
      reasons,
      videos: pickVideosByNameLike('Plantar Fasciitis'),
    };
  }

  // 규칙 7) 내측경골스트레스증후군: 중족부 내측 압력 우세
  if ((lMidInner + rMidInner) > (lFore + rFore) * 0.8 && totalMid > 0.7) {
    reasons.push('중족부 내측 하중이 높아 정강이에 스트레스가 누적될 수 있습니다.');
    return {
      key: 'MTSS',
      label: 'MTSS (내측경골스트레스증후군)',
      reasons,
      videos: pickVideosByNameLike('MTSS'),
    };
  }

  // 규칙 8) 정강이 미세골절: 중족부/전족부 압력 과도한 증가 (MTSS보다 심각)
  if (totalMid > 1.0 && (totalMid + totalFore) > totalHeel + 0.5) {
    reasons.push('중족부와 전족부 하중이 과도하게 높아 정강이 미세골절 위험이 있습니다.');
    return {
      key: 'TSF',
      label: 'TSF (정강이 미세골절)',
      reasons,
      videos: pickVideosByNameLike('TSF'),
    };
  }

  // 기본 권고: PFPS (가장 흔한 부상)
  reasons.push('특정 편중이 뚜렷하지 않으나 예방 차원에서 기본적인 무릎 케어를 권장합니다.');
  return {
    key: 'PFPS',
    label: 'PFPS (슬개대퇴통증증후군)',
    reasons,
    videos: pickVideosByNameLike('PFPS'),
  };
}


