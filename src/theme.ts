// src/theme.ts
// TapeRunner 디자인 토큰 — "Deep Pine & Ivory"
// 신뢰감 있는 딥 파인 그린 + 따뜻한 아이보리 종이 배경 + 라임 액센트(생기/에너지)

export const color = {
  // 배경/표면
  bg: '#F4F1E7',            // 따뜻한 아이보리(종이)
  surface: '#FFFFFF',
  surfaceDeep: '#123529',   // 딥 파인 히어로 카드
  surfaceDeeper: '#0C271E', // 히어로 내부 인셋

  // 텍스트
  ink: '#182F27',           // 본문 (딥 파인 잉크)
  inkSoft: '#5C6F64',       // 보조 텍스트
  inkFaint: '#98A79C',      // 희미한 텍스트
  ivory: '#F6F3E9',         // 어두운 면 위 텍스트
  ivorySoft: 'rgba(246,243,233,0.64)',
  ivoryFaint: 'rgba(246,243,233,0.38)',

  // 브랜드/의미
  pine: '#1C4B3A',          // 프라이머리
  leaf: '#4FA875',          // 긍정/건강
  leafBright: '#6FD59A',    // 어두운 면 위 긍정
  lime: '#D3F26A',          // 샤프 액센트 (CTA)
  limeDeep: '#B8DD46',
  amber: '#C98A2D',         // 주의
  coral: '#D95B43',         // 위험

  // 라인/구분
  line: '#E6E1D0',          // 아이보리 위 헤어라인
  lineOnDark: 'rgba(246,243,233,0.14)',
} as const;

export const font = {
  regular: 'Pretendard-Regular',
  medium: 'Pretendard-Medium',
  semibold: 'Pretendard-SemiBold',
  bold: 'Pretendard-Bold',
  extrabold: 'Pretendard-ExtraBold',
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

// 카드 그림자 (iOS shadow* + Android elevation)
export const shadow = {
  card: {
    shadowColor: '#1A2E24',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  float: {
    shadowColor: '#0C271E',
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
} as const;
