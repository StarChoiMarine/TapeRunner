import React from 'react';
import Svg, { Rect, G } from 'react-native-svg';
import { View } from 'react-native';
import type { GridFrame } from '../store/realtime';

const clamp = (v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));

// 파랑→초록→노랑→빨강
function colorScale01(x: number) {
  const t = clamp(x, 0, 1);
  const r = Math.round(255 * Math.max(0, Math.min(1, (t - 0.5) * 2)));
  const g = Math.round(255 * (1 - Math.abs(t - 0.5) * 2));
  const b = Math.round(255 * Math.max(0, Math.min(1, (0.5 - t) * 2)));
  return `rgb(${r},${g},${b})`;
}

export default function FootHeatmap({
  frame, maxVal = 1, // 정규화 후 0~1을 기대. maxVal은 안전장치.
  mirror=false, width=150, height=210, borderRadius=12,
}: {
  frame?: GridFrame;
  maxVal?: number;
  mirror?: boolean;
  width?: number; height?: number; borderRadius?: number;
}) {
  if (!frame) return <View style={{ width, height, backgroundColor:'#f3f4f6', borderRadius }} />;
  const { rows, cols, values } = frame;
  const cw = width / cols;
  const ch = height / rows;

  return (
    <Svg width={width} height={height}>
      <G transform={mirror ? `translate(${width},0) scale(-1,1)` : undefined}>
        {values.map((v, i) => {
          const r = Math.floor(i / cols);
          const c = i % cols;
          const x = c * cw;
          const y = r * ch;
          const t = clamp(v / maxVal, 0, 1);
          return <Rect key={i} x={x+1} y={y+1} width={cw-2} height={ch-2} rx={6} ry={6} fill={colorScale01(t)} />;
        })}
      </G>
    </Svg>
  );
}
