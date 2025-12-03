import React, { useMemo } from 'react';
import { View } from 'react-native';
import FootDots from './FootDots';
import type { SensorValueMap } from '../types/analysis';

type Props = {
  left: SensorValueMap;
  right: SensorValueMap;
  width?: number;
  /** 전체 값 중 최대값 기준 0~1로 재정규화 */
  normalize?: boolean;
};

export default function SensorHeatmapView({ left, right, width = 160, normalize = true }: Props) {
  const w = width;
  const h = Math.round(width * 1.35);

  const { lMap, rMap } = useMemo(() => {
    if (!normalize) return { lMap: left || {}, rMap: right || {} };
    const allVals = [
      ...Object.values(left || {}),
      ...Object.values(right || {}),
    ].map((v) => (Number.isFinite(v as number) ? (v as number) : 0));
    const mx = Math.max(0.0001, ...allVals);
    const scale = (m: SensorValueMap) =>
      Object.fromEntries(Object.entries(m || {}).map(([k, v]) => [k, Math.max(0, Math.min(1, (Number(v) || 0) / mx))]));
    return { lMap: scale(left || {}), rMap: scale(right || {}) };
  }, [left, right, normalize]);

  return (
    <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
      <FootDots sensorValues={lMap} width={w} height={h} mirror />
      <FootDots sensorValues={rMap} width={w} height={h} />
    </View>
  );
}


