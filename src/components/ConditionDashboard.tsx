// src/components/ConditionDashboard.tsx
// 홈 대시보드: 최근 러닝 기반 부위별 부상 위험 리포트 + 회복 점수
import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { color, font, fontRole, radius, shadow } from '../theme';

// 부상 키 → 신체 부위/표시 정보
const INJURY_TO_AREA: Record<string, { area: string; sub: string }> = {
  PFPS: { area: '무릎', sub: '슬개대퇴 부위' },
  'Achilles Tendinopathy': { area: '아킬레스건', sub: '발뒤꿈치 위' },
  'Inversion Sprain': { area: '발목', sub: '외측 인대' },
  MTSS: { area: '정강이', sub: '내측 경골' },
  'Plantar Fasciitis': { area: '발바닥', sub: '족저근막' },
  ITBS: { area: '무릎 외측', sub: '장경인대' },
  Hamstring: { area: '햄스트링', sub: '허벅지 뒤' },
};

type RiskLevel = { label: '주의' | '관찰' | '양호'; pct: number; tint: string };

// 예측 순위 → 위험 수준 (실데이터 연동 전 UI 규칙)
const levelByRank = (rank: number): RiskLevel => {
  if (rank === 0) return { label: '주의', pct: 64, tint: color.amber };
  if (rank === 1) return { label: '관찰', pct: 42, tint: color.limeDeep };
  return { label: '관찰', pct: 33, tint: color.limeDeep };
};

// 회복 점수 링
function ScoreRing({ score }: { score: number }) {
  const size = 74;
  const stroke = 7;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: 'absolute' }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={color.line} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={score >= 70 ? color.leaf : score >= 40 ? color.amber : color.coral}
          strokeWidth={stroke} fill="none"
          strokeDasharray={`${circ} ${circ}`}
          strokeDashoffset={circ - (circ * score) / 100}
          strokeLinecap="round"
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <Text style={{ fontFamily: fontRole.dataBold, fontSize: 22, color: color.ink }}>{score}</Text>
      <Text style={{ fontFamily: font.medium, fontSize: 9, color: color.inkFaint, marginTop: -2 }}>
        회복 점수
      </Text>
    </View>
  );
}

// 부위별 위험 행
function AreaRow({ area, sub, level }: { area: string; sub: string; level: RiskLevel }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 }}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: font.semibold, fontSize: 14, color: color.ink }}>{area}</Text>
        <Text style={{ fontFamily: font.regular, fontSize: 11, color: color.inkFaint, marginTop: 1 }}>{sub}</Text>
      </View>

      {/* 게이지 */}
      <View style={{ width: 110, height: 6, borderRadius: 3, backgroundColor: color.bg, overflow: 'hidden' }}>
        <View style={{ width: `${level.pct}%`, height: '100%', borderRadius: 3, backgroundColor: level.tint }} />
      </View>

      {/* 수준 칩 */}
      <View
        style={{
          width: 44,
          paddingVertical: 4,
          borderRadius: radius.pill,
          alignItems: 'center',
          backgroundColor: level.label === '주의' ? 'rgba(201,138,45,0.14)' : 'rgba(79,168,117,0.12)',
        }}
      >
        <Text
          style={{
            fontFamily: font.bold,
            fontSize: 11,
            color: level.label === '주의' ? color.amber : color.leaf,
          }}
        >
          {level.label}
        </Text>
      </View>
    </View>
  );
}

export default function ConditionDashboard({ predictedInjuries }: { predictedInjuries: string[] }) {
  const rows = predictedInjuries
    .map((key, i) => {
      const info = INJURY_TO_AREA[key];
      return info ? { ...info, level: levelByRank(i) } : null;
    })
    .filter(Boolean) as { area: string; sub: string; level: RiskLevel }[];

  // 회복 점수: 위험 부위 수/수준 기반 (실데이터 연동 전 UI 규칙)
  const score = Math.max(30, 96 - rows.reduce((a, r) => a + Math.round(r.level.pct / 4), 0));

  return (
    <View
      style={{
        backgroundColor: color.surface,
        borderRadius: radius.xl,
        borderWidth: 1,
        borderColor: color.line,
        padding: 18,
        ...shadow.card,
        shadowOpacity: 0.05,
      }}
    >
      {/* 헤더 */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text style={{ fontFamily: font.semibold, fontSize: 11, letterSpacing: 2, color: color.inkFaint }}>
            BODY CONDITION
          </Text>
          <Text style={{ fontFamily: font.extrabold, fontSize: 18, color: color.ink, marginTop: 3 }}>
            부상 위험 리포트
          </Text>
          <Text style={{ fontFamily: font.regular, fontSize: 12, color: color.inkSoft, marginTop: 3 }}>
            최근 러닝 압력 패턴 기준
          </Text>
        </View>
        <ScoreRing score={score} />
      </View>

      {/* 부위별 행 */}
      <View style={{ marginTop: 10 }}>
        {rows.length > 0 ? (
          rows.map((r, i) => (
            <View key={r.area}>
              {i > 0 && <View style={{ height: 1, backgroundColor: color.line }} />}
              <AreaRow area={r.area} sub={r.sub} level={r.level} />
            </View>
          ))
        ) : (
          <Text style={{ fontFamily: font.regular, fontSize: 13, color: color.inkSoft, paddingVertical: 10 }}>
            아직 데이터가 부족해요. 러닝을 시작하면 부위별 위험도를 알려드릴게요.
          </Text>
        )}
      </View>

      {/* 푸터 */}
      <Text style={{ fontFamily: font.regular, fontSize: 10.5, color: color.inkFaint, marginTop: 8 }}>
        그 외 부위는 양호해요 · 본 리포트는 운동 보조 정보이며 의료적 진단이 아니에요
      </Text>
    </View>
  );
}
