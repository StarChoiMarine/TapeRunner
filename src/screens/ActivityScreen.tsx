import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAllFinalAnalyses } from '../services/db';
import { formatKSTDate, formatKSTTime, getKSTYearMonth } from '../utils/kst';

type MonthKey = { year: number; month: number }; // month: 1~12

function formatMonthLabel({ year, month }: MonthKey) {
  return `${year}년 ${month.toString().padStart(2, '0')}월`;
}

function getCurrentMonthKey(): MonthKey {
  const d = new Date();
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

export default function ActivityScreen() {
  const nav = useNavigation<any>();
  const [items, setItems] = useState<any[]>([]);
  const [month, setMonth] = useState<MonthKey>(getCurrentMonthKey());

  useEffect(() => {
    let mounted = true;
    getAllFinalAnalyses().then((rows) => {
      if (!mounted) return;
      setItems(rows);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    return items.filter((it) => {
      const { year, month: m } = getKSTYearMonth(it.startedAt);
      return year === month.year && m === month.month;
    });
  }, [items, month]);

  const runCount = filtered.length;

  const goPrev = () => {
    const m = month.month - 1;
    if (m >= 1) setMonth({ year: month.year, month: m });
    else setMonth({ year: month.year - 1, month: 12 });
  };
  const goNext = () => {
    const m = month.month + 1;
    if (m <= 12) setMonth({ year: month.year, month: m });
    else setMonth({ year: month.year + 1, month: 1 });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F4F7F2' }}>
      {/* 상단 바 */}
      <View style={{ height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 12 }}>
        <Pressable onPress={() => nav.goBack()} hitSlop={10}>
          <Text style={{ fontSize: 20 }}>‹</Text>
        </Pressable>
        <Text style={{ fontSize: 20, fontWeight: '800' }}>내 활동</Text>
      </View>

      {/* 필터 + 요약 */}
      <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Pressable onPress={goPrev}><Text style={{ fontSize: 18 }}>◀︎</Text></Pressable>
          <Text style={{ fontSize: 18, fontWeight: '700' }}>{formatMonthLabel(month)}</Text>
          <Pressable onPress={goNext}><Text style={{ fontSize: 18 }}>▶︎</Text></Pressable>
        </View>
        <Text style={{ marginTop: 6, color: '#4B5563' }}>러닝 횟수: {runCount}회</Text>
      </View>

      {/* 최근 러닝 로그 */}
      <FlatList
        data={filtered}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item }) => {
          const date = formatKSTDate(item.startedAt);
          const time = formatKSTTime(item.startedAt);
          return (
            <Pressable
              onPress={() => nav.navigate('AnalysisDetail', { id: item.id })}
              style={{ backgroundColor: '#fff', borderRadius: 12, padding: 14, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 }}
            >
              <Text style={{ fontWeight: '700', color: '#111827' }}>{date}</Text>
              <Text style={{ color: '#6B7280' }}>{time}</Text>
            </Pressable>
          );
        }}
      />
    </View>
  );
}


