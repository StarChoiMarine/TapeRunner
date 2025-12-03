import type { RunSession } from '../types/analysis';

// 부상-센서/테이핑 레퍼런스 메모: 모델에 system/context로 제공
export const INJURY_MAP = {
  PFPS: { name: 'Patello Femoral Pain Syndrome', sensors: [6, 8, 9, 10, 11] },
  MTSS: { name: 'Medial Tibial Stress Syndrome', sensors: [7, 12] },
  ITBS: { name: 'IlioTibial Band Syndrome', sensors: [10, 11] },
  TSF: { name: 'Tibial Stress Fracture', sensors: [7, 12] },
  PlantarFasciitis: { name: 'Plantar Fasciitis', sensors: [1] },
  AchillesTendinopathy: { name: 'Achilles Tendinopathy', sensors: [1, 5] },
  InversionSprain: { name: 'Inversion Sprain', sensors: [2, 3, 13] },
  Hamstring: { name: 'Hamstring injury', sensors: [4, 8] },
} as const;

export const TAPING_VIDEOS = [
  '족저근막염 예방 테이핑(키네시오)',
  '발목 내번 부상 예방 테이핑 힐락(medial to Lateral)(C-tape)',
  '발목 전체적 안정성 제공 테이핑 figure8(힐락보다 가벼운 버전)(C-tape)',
  '햄스트링 부상 예방 테이핑(키네시오)',
  '아킬레스건 및 종아리 통증 예방 테이핑(키네시오)',
  '전체적인 무릎 통증 증후군 통증 예방 테이핑(키네시오)',
  '정강이스트레스 증후군 예방 테이핑(키네시오)',
  '무릎 뒤쪽 통증 예방 테이핑',
  '슬개연골 연화증 예방 테이핑',
  '무릎바깥쪽+장경인대 통증 예방 테이핑',
  '대퇴사두근 통증 예방 예방 테이핑',
  '비골 통증 예방 테이핑',
  'Stirup 발목 내번 안정성 강화 테이핑(C-tape)',
];

export function buildSystemPrompt() {
  return (
    '당신은 러너의 족저 압력 센서 데이터를 분석해 부상 위험과 착지 패턴을 설명하는 스포츠 메디컬 코치입니다. ' +
    '근거 기반으로 간결하고 실용적인 권고를 한국어로 작성하세요. 과도한 의학적 단정은 피하고, 통증/부상 의심 시 전문의 상담을 권고합니다.'
  );
}

export function buildUserPrompt(session: RunSession) {
  const leftTop = Object.entries(session.left || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, v]) => `${id}:${v.toFixed(2)}`)
    .join(', ');
  const rightTop = Object.entries(session.right || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, v]) => `${id}:${v.toFixed(2)}`)
    .join(', ');

  return [
    '다음은 족저 압력 센서의 정규화된 요약입니다.',
    `세션 길이(초): ${session.durationSec}`,
    `왼발 센서: ${leftTop}`,
    `오른발 센서: ${rightTop}`,
    '부상 연관 센서 그룹(참고): ' +
      Object.entries(INJURY_MAP)
        .map(([k, v]) => `${k}:${v.sensors.join('/')}`)
        .join(', '),
    '요청사항: 먼저 러닝 점수(60~100점)를 출력하고, 그 다음 한 줄 띄운 후 러닝 코멘트를 작성하세요. 코멘트는 어떤 양상으로 뛰셨는지 설명하고 다음 러닝 시도 추천을 포함하세요. 그 다음 문단에 예측 질병을 작성하세요. 마지막으로 테이핑 영상 추천과 부상 카테고리가 제공되면 그 부상 카테고리를 기반으로 연관된 부상 위험에 대해 설명하세요. *요청사항을 출력에 포함하지 않기, 특수기호 출력하지 않기',
  ].join('\n');
}


