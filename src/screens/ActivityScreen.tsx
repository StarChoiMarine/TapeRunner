// src/screens/ActivityScreen.tsx
// 러닝 기록 조회 — 월별 요약 + 세션 카드 리스트
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAllFinalAnalyses } from '../services/db';
import { formatKSTDate, formatKSTTime, getKSTYearMonth } from '../utils/kst';
import { color, font, radius, shadow } from '../theme';

type MonthKey = { year: number; month: number }; // month: 1~12

function getCurrentMonthKey(): MonthKey {
  const d = new Date();
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

const totalOf = (m: Record<number, number>) =>
  Object.values(m || {}).reduce<number>((a, b) => a + (Number(b) || 0), 0);

function fmtDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m}분 ${s}초` : `${s}초`;
}

// 요약 스탯 칸
function Stat({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 2 }}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 2 }}>
        <Text style={{ fontFamily: font.extrabold, fontSize: 22, color: color.ivory }}>{value}</Text>
        {!!unit && <Text style={{ fontFamily: font.medium, fontSize: 11, color: color.ivoryFaint }}>{unit}</Text>}
      </View>
      <Text style={{ fontFamily: font.medium, fontSize: 11, color: color.ivoryFaint }}>{label}</Text>
    </View>
  );
}

export default function ActivityScreen() {
  const nav = useNavigation<any>();
  const [items, setItems] = useState<any[]>([]);
  const [month, setMonth] = useState<MonthKey>(getCurrentMonthKey());

  useEffect(() => {
    let mounted = true;
    getAllFinalAnalyses().then((rows) => {
      if (mounted) setItems(rows);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(
    () =>
      items.filter((it) => {
        const { year, month: m } = getKSTYearMonth(it.startedAt);
        return year === month.year && m === month.month;
      }),
    [items, month],
  );

  const totalMinutes = Math.round(filtered.reduce((a, it) => a + (it.durationSec || 0), 0) / 60);
  // 월 평균 좌우 밸런스
  const avgBalance = useMemo(() => {
    let l = 0;
    let r = 0;
    filtered.forEach((it) => {
      l += totalOf(it.left);
      r += totalOf(it.right);
    });
    if (l + r <= 0) return null;
    return Math.round((l / (l + r)) * 100);
  }, [filtered]);

  const goPrev = () =>
    setMonth((m) => (m.month > 1 ? { ...m, month: m.month - 1 } : { year: m.year - 1, month: 12 }));
  const goNext = () =>
    setMonth((m) => (m.month < 12 ? { ...m, month: m.month + 1 } : { year: m.year + 1, month: 1 }));

  return (
    <View style={{ flex: 1, backgroundColor: color.bg }}>
      {/* 상단 바 */}
      <View style={{ height: 60, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 12 }}>
        <Pressable onPress={() => nav.goBack()} hitSlop={12}>
          <Text style={{ fontSize: 26, color: color.ink, marginTop: -2 }}>‹</Text>
        </Pressable>
        <Text style={{ fontFamily: font.extrabold, fontSize: 19, color: color.ink }}>내 활동</Text>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={{ padding: 20, paddingTop: 6, paddingBottom: 40, gap: 10 }}
        ListHeaderComponent={
          <View style={{ gap: 14, marginBottom: 8 }}>
            {/* 월 네비게이션 */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Pressable
                onPress={goPrev}
                hitSlop={8}
                style={{
                  width: 34, height: 34, borderRadius: 17,
                  borderWidth: 1, borderColor: color.line,
                  alignItems: 'center', justifyContent: 'center',
                  backgroundColor: color.surface,
                }}
              >
                <Text style={{ fontSize: 15, color: color.inkSoft }}>‹</Text>
              </Pressable>
              <Text style={{ fontFamily: font.extrabold, fontSize: 17, color: color.ink }}>
                {month.year}년 {month.month}월
              </Text>
              <Pressable
                onPress={goNext}
                hitSlop={8}
                style={{
                  width: 34, height: 34, borderRadius: 17,
                  borderWidth: 1, borderColor: color.line,
                  alignItems: 'center', justifyContent: 'center',
                  backgroundColor: color.surface,
                }}
              >
                <Text style={{ fontSize: 15, color: color.inkSoft }}>›</Text>
              </Pressable>
            </View>

            {/* 월 요약 (다크 카드) */}
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: color.surfaceDeep,
                borderRadius: radius.lg,
                paddingVertical: 16,
                ...shadow.card,
              }}
            >
              <Stat label="러닝" value={String(filtered.length)} unit="회" />
              <View style={{ width: 1, backgroundColor: color.lineOnDark }} />
              <Stat label="총 시간" value={String(totalMinutes)} unit="분" />
              <View style={{ width: 1, backgroundColor: color.lineOnDark }} />
              <Stat
                label="평균 밸런스"
                value={avgBalance != null ? `${avgBalance}:${100 - avgBalance}` : '—'}
              />
            </View>
          </View>
        }
        ListEmptyComponent={
          <View
            style={{
              backgroundColor: color.surface,
              borderRadius: radius.lg,
              borderWidth: 1,
              borderColor: color.line,
              padding: 28,
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Text style={{ fontFamily: font.semibold, fontSize: 15, color: color.ink }}>
              이 달의 러닝 기록이 없어요
            </Text>
            <Text style={{ fontFamily: font.regular, fontSize: 13, color: color.inkSoft }}>
              러닝을 마치면 분석 리포트가 자동으로 저장돼요
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const date = formatKSTDate(item.startedAt);
          const time = formatKSTTime(item.startedAt);
          const tl = totalOf(item.left);
          const tr = totalOf(item.right);
          const balL = tl + tr > 0 ? Math.round((tl / (tl + tr)) * 100) : null;
          const skewed = balL != null && Math.abs(balL - 50) > 10;

          return (
            <Pressable
              onPress={() => nav.navigate('AnalysisDetail', { id: item.id })}
              style={({ pressed }) => ({
                backgroundColor: pressed ? '#FBFAF4' : color.surface,
                borderRadius: radius.lg,
                borderWidth: 1,
                borderColor: color.line,
                padding: 16,
                gap: 10,
                ...shadow.card,
                shadowOpacity: 0.04,
              })}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View>
                  <Text style={{ fontFamily: font.bold, fontSize: 15, color: color.ink }}>{date}</Text>
                  <Text style={{ fontFamily: font.regular, fontSize: 12, color: color.inkFaint, marginTop: 2 }}>
                    {time} · {fmtDuration(item.durationSec || 0)}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  {balL != null && (
                    <View
                      style={{
                        paddingHorizontal: 9,
                        paddingVertical: 4,
                        borderRadius: radius.pill,
                        backgroundColor: skewed ? 'rgba(201,138,45,0.12)' : 'rgba(79,168,117,0.1)',
                      }}
                    >
                      <Text style={{ fontFamily: font.bold, fontSize: 11, color: skewed ? color.amber : color.leaf }}>
                        L {balL} : {100 - balL} R
                      </Text>
                    </View>
                  )}
                  <Text style={{ fontFamily: font.regular, fontSize: 17, color: color.inkFaint }}>›</Text>
                </View>
              </View>

              {/* 밸런스 미니 바 */}
              {balL != null && (
                <View style={{ flexDirection: 'row', height: 5, borderRadius: 3, overflow: 'hidden', backgroundColor: color.bg }}>
                  <View style={{ flex: Math.max(balL, 1), backgroundColor: skewed ? color.amber : color.limeDeep }} />
                  <View style={{ width: 2, backgroundColor: color.surface }} />
                  <View style={{ flex: Math.max(100 - balL, 1), backgroundColor: color.leaf }} />
                </View>
              )}
            </Pressable>
          );
        }}
      />
    </View>
  );
}
