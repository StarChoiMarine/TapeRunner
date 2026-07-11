// src/components/AnalysisReport.tsx
// 러닝 분석 리포트 — 분석 결과/상세 화면 공용
// 좌우 밸런스 · 부위별 하중 · 히트맵 · AI 코치 소견 · 테이핑 추천
import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import SensorHeatmapView from './SensorHeatmapView';
import { deriveRecommendation } from '../services/recommendation';
import type { SensorValueMap } from '../types/analysis';
import { color, font, radius, shadow } from '../theme';

const HEEL_IDS = [4, 5];
const MID_IDS = [2, 3, 7, 13, 15, 16, 17, 18, 19];
const FORE_IDS = [8, 9, 10, 12, 20];

const sumOf = (m: SensorValueMap, ids: number[]) =>
  ids.reduce((a, id) => a + (Number(m?.[id]) || 0), 0);
const avgOf = (m: SensorValueMap, ids: number[]) => sumOf(m, ids) / ids.length;
const totalOf = (m: SensorValueMap) =>
  Object.values(m || {}).reduce<number>((a, b) => a + (Number(b) || 0), 0);

export type ReportSession = {
  startedAt: string;
  durationSec: number;
  left: SensorValueMap;
  right: SensorValueMap;
  id?: string;
};

// ── 공용 카드 껍데기 ─────────────────────────────────────────
function Card({ children, style }: { children: React.ReactNode; style?: object }) {
  return (
    <View
      style={[
        {
          backgroundColor: color.surface,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: color.line,
          padding: 18,
          ...shadow.card,
          shadowOpacity: 0.04,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

function SectionLabel({ en, ko }: { en: string; ko: string }) {
  return (
    <View style={{ gap: 2, marginBottom: 12 }}>
      <Text style={{ fontFamily: font.semibold, fontSize: 10, letterSpacing: 1.8, color: color.inkFaint }}>
        {en}
      </Text>
      <Text style={{ fontFamily: font.bold, fontSize: 16, color: color.ink }}>{ko}</Text>
    </View>
  );
}

// ── 좌우 밸런스 히어로 ───────────────────────────────────────
function BalanceHero({ session }: { session: ReportSession }) {
  const tl = totalOf(session.left);
  const tr = totalOf(session.right);
  const hasData = tl + tr > 0;
  const l = hasData ? Math.round((tl / (tl + tr)) * 100) : 50;
  const r = 100 - l;
  const diff = Math.abs(l - r);

  const verdict =
    !hasData ? { label: '데이터 부족', tint: color.inkFaint, desc: '센서 데이터가 충분하지 않아요' }
    : diff <= 10 ? { label: '균형 양호', tint: color.leaf, desc: '좌우 하중이 고르게 분포되어 있어요' }
    : diff <= 20 ? { label: '경미한 편차', tint: color.amber, desc: `${l > r ? '왼발' : '오른발'} 쪽 하중이 조금 더 높아요` }
    : { label: '편중 주의', tint: color.amber, desc: `${l > r ? '왼발' : '오른발'} 하중 집중이 뚜렷해요` };

  return (
    <View
      style={{
        backgroundColor: color.surfaceDeep,
        borderRadius: radius.xl,
        padding: 20,
        gap: 14,
        ...shadow.card,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontFamily: font.semibold, fontSize: 11, letterSpacing: 2, color: color.ivoryFaint }}>
          LOAD BALANCE
        </Text>
        <View
          style={{
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: radius.pill,
            backgroundColor: 'rgba(246,243,233,0.1)',
          }}
        >
          <Text style={{ fontFamily: font.bold, fontSize: 11.5, color: verdict.tint === color.leaf ? color.leafBright : verdict.tint === color.amber ? '#E8C48A' : color.ivorySoft }}>
            {verdict.label}
          </Text>
        </View>
      </View>

      {/* 큰 수치 */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 14 }}>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontFamily: font.medium, fontSize: 11, color: color.ivoryFaint }}>LEFT</Text>
          <Text style={{ fontFamily: font.extrabold, fontSize: 44, lineHeight: 50, color: color.ivory }}>{l}</Text>
        </View>
        <Text style={{ fontFamily: font.regular, fontSize: 22, color: color.ivoryFaint, marginBottom: 8 }}>:</Text>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontFamily: font.medium, fontSize: 11, color: color.ivoryFaint }}>RIGHT</Text>
          <Text style={{ fontFamily: font.extrabold, fontSize: 44, lineHeight: 50, color: color.ivory }}>{r}</Text>
        </View>
      </View>

      {/* 바 */}
      <View style={{ flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden', backgroundColor: 'rgba(246,243,233,0.08)' }}>
        <View style={{ flex: Math.max(l, 1), backgroundColor: color.lime }} />
        <View style={{ width: 2, backgroundColor: color.surfaceDeep }} />
        <View style={{ flex: Math.max(r, 1), backgroundColor: color.leaf }} />
      </View>

      <Text style={{ fontFamily: font.regular, fontSize: 12.5, color: color.ivorySoft, textAlign: 'center' }}>
        {verdict.desc}
      </Text>
    </View>
  );
}

// ── 부위별 하중 (L/R 미러 바) ────────────────────────────────
function RegionBars({ session }: { session: ReportSession }) {
  const regions = [
    { name: '전족부', l: avgOf(session.left, FORE_IDS), r: avgOf(session.right, FORE_IDS) },
    { name: '중족부', l: avgOf(session.left, MID_IDS), r: avgOf(session.right, MID_IDS) },
    { name: '뒤꿈치', l: avgOf(session.left, HEEL_IDS), r: avgOf(session.right, HEEL_IDS) },
  ];
  const mx = Math.max(0.0001, ...regions.flatMap((g) => [g.l, g.r]));

  return (
    <Card>
      <SectionLabel en="REGION LOAD" ko="부위별 하중 분포" />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
        <Text style={{ fontFamily: font.medium, fontSize: 11, color: color.inkFaint }}>왼발</Text>
        <Text style={{ fontFamily: font.medium, fontSize: 11, color: color.inkFaint }}>오른발</Text>
      </View>
      <View style={{ gap: 12 }}>
        {regions.map((g) => (
          <View key={g.name} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            {/* 왼발 (오른쪽 → 왼쪽으로 차오름) */}
            <View style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: color.bg, overflow: 'hidden', alignItems: 'flex-end' }}>
              <View style={{ width: `${(g.l / mx) * 100}%`, height: '100%', borderRadius: 4, backgroundColor: color.limeDeep }} />
            </View>
            <Text style={{ width: 44, textAlign: 'center', fontFamily: font.semibold, fontSize: 12, color: color.inkSoft }}>
              {g.name}
            </Text>
            {/* 오른발 */}
            <View style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: color.bg, overflow: 'hidden' }}>
              <View style={{ width: `${(g.r / mx) * 100}%`, height: '100%', borderRadius: 4, backgroundColor: color.leaf }} />
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
}

// ── 메인 리포트 ─────────────────────────────────────────────
export default function AnalysisReport({
  session,
  aiText,
  aiLoading = false,
}: {
  session: ReportSession;
  aiText?: string | null;
  aiLoading?: boolean;
}) {
  const nav = useNavigation<any>();
  const reco = deriveRecommendation(session as any);

  const d = new Date(session.startedAt);
  const dateStr = `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}.`;
  const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  const mins = Math.floor(session.durationSec / 60);
  const secs = session.durationSec % 60;
  const durStr = mins > 0 ? `${mins}분 ${secs}초` : `${secs}초`;

  return (
    <View style={{ gap: 14 }}>
      {/* 세션 메타 */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 2 }}>
        <Text style={{ fontFamily: font.semibold, fontSize: 13, color: color.inkSoft }}>
          {dateStr}  {timeStr}
        </Text>
        <View
          style={{
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: radius.pill,
            backgroundColor: 'rgba(28,75,58,0.08)',
          }}
        >
          <Text style={{ fontFamily: font.bold, fontSize: 12, color: color.pine }}>{durStr}</Text>
        </View>
      </View>

      {/* 좌우 밸런스 */}
      <BalanceHero session={session} />

      {/* 부위별 하중 */}
      <RegionBars session={session} />

      {/* 압력 히트맵 */}
      <Card>
        <SectionLabel en="PRESSURE MAP" ko="평균 압력 분포" />
        <View style={{ alignItems: 'center' }}>
          <SensorHeatmapView left={session.left} right={session.right} width={140} />
        </View>
        <Text style={{ fontFamily: font.regular, fontSize: 11, color: color.inkFaint, textAlign: 'center', marginTop: 10 }}>
          세션 전체 평균 · 붉을수록 하중이 높아요
        </Text>
      </Card>

      {/* AI 코치 소견 */}
      <Card>
        <SectionLabel en="AI COACH" ko="AI 코치 소견" />
        {aiLoading ? (
          <View style={{ paddingVertical: 16, alignItems: 'center', gap: 8 }}>
            <ActivityIndicator color={color.pine} />
            <Text style={{ fontFamily: font.regular, fontSize: 12, color: color.inkFaint }}>
              러닝 데이터를 분석하고 있어요…
            </Text>
          </View>
        ) : (
          <Text style={{ fontFamily: font.regular, fontSize: 14, lineHeight: 23, color: color.ink }}>
            {aiText || '분석 결과를 불러오지 못했어요.'}
          </Text>
        )}
        <View style={{ height: 1, backgroundColor: color.line, marginVertical: 12 }} />
        <Text style={{ fontFamily: font.regular, fontSize: 10.5, lineHeight: 15, color: color.inkFaint }}>
          본 소견은 운동 보조 정보이며 의료적 진단이 아니에요. 통증이 지속되면 전문의와 상담하세요.
        </Text>
      </Card>

      {/* 테이핑 추천 */}
      <Card>
        <SectionLabel en="TAPING GUIDE" ko="추천 테이핑" />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <View
            style={{
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: radius.pill,
              backgroundColor: 'rgba(79,168,117,0.12)',
            }}
          >
            <Text style={{ fontFamily: font.bold, fontSize: 12, color: color.leaf }}>{reco.label}</Text>
          </View>
        </View>
        {reco.reasons.length > 0 && (
          <Text style={{ fontFamily: font.regular, fontSize: 12.5, color: color.inkSoft, marginBottom: 12 }}>
            {reco.reasons.join(' · ')}
          </Text>
        )}
        <View style={{ gap: 8 }}>
          {reco.videos.map((v, idx) => (
            <Pressable
              key={idx}
              onPress={() => nav.navigate('VideoPlayer', { url: v.url, title: v.title })}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                padding: 12,
                borderRadius: radius.md,
                backgroundColor: pressed ? color.bg : 'rgba(28,75,58,0.04)',
              })}
            >
              <View
                style={{
                  width: 34, height: 34, borderRadius: 17,
                  backgroundColor: color.lime,
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 12, color: color.surfaceDeeper, marginLeft: 2 }}>▶</Text>
              </View>
              <Text numberOfLines={2} style={{ flex: 1, fontFamily: font.semibold, fontSize: 13.5, lineHeight: 18, color: color.ink }}>
                {v.title}
              </Text>
              <Text style={{ fontFamily: font.regular, fontSize: 16, color: color.inkFaint }}>›</Text>
            </Pressable>
          ))}
        </View>
      </Card>
    </View>
  );
}
