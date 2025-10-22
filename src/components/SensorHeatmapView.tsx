import React from 'react';
import { View } from 'react-native';
import FootDots from './FootDots';
import type { SensorValueMap } from '../types/analysis';

type Props = {
  left: SensorValueMap;
  right: SensorValueMap;
  width?: number;
};

export default function SensorHeatmapView({ left, right, width = 160 }: Props) {
  const w = width;
  const h = Math.round(width * 1.35);

  return (
    <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
      <FootDots sensorValues={left || {}} width={w} height={h} mirror />
      <FootDots sensorValues={right || {}} width={w} height={h} />
    </View>
  );
}


