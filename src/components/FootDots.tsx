import React, { memo } from 'react';
import Svg, { Ellipse, Defs, RadialGradient, Stop, G } from 'react-native-svg';
import { View } from 'react-native';
import { RIGHT_LAYOUT_20 } from '../config/insoles';

type Props = {
  /** 센서ID -> 정규화(0~1) 값 */
  sensorValues: Record<string | number, number>;

  width?: number; height?: number;
  /** 왼발이면 true (좌우 반전) */
  mirror?: boolean;
  /** 기본 타원 반경(px) */
  radius?: number;
  /** 라디얼 발광 효과 */
  glow?: boolean;
  /** 값이 없을 때(0/undefined)도 옅게 그릴지 */
  showFaintWhenZero?: boolean;
  /** 어두운 배경 위에 그릴 때(무압력 패드를 밝은 반투명으로) */
  dark?: boolean;
};

const clamp01 = (v: unknown) => {
  const n = typeof v === 'string' ? parseFloat(v) : Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
};

// 압력값(t: 0~1)에 따라 초록→노랑→빨강으로 색상 변화
const colorFor = (t: number) => {
  const x = Math.max(0, Math.min(1, t));

  let r, g, b;

  if (x < 0.5) {
    // 0.0 ~ 0.5 구간: 초록(0,255,0) → 노랑(255,255,0)
    r = Math.round(510 * x);     // 0 → 255
    g = 200;                     // 항상 밝은 초록 유지
    b = 0;
  } else {
    // 0.5 ~ 1.0 구간: 노랑(255,255,0) → 빨강(255,0,0)
    r = 255;
    g = Math.round(255 - 510 * (x - 0.5)); // 255 → 0
    b = 0;
  }

  return `rgb(${r},${g},${b})`;
};

const FootDots: React.FC<Props> = ({
  sensorValues,
  width = 160,
  height = 220,
  mirror = false,
  radius = 16,
  glow = true,
  showFaintWhenZero = true,
  dark = false,
}) => {
  if (!sensorValues) return <View style={{ width, height }} />;

  return (
    <Svg width={width} height={height}>
      <Defs>
        <RadialGradient id="dotsGlow" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopOpacity={0.85} stopColor="#ffffff" />
          <Stop offset="100%" stopOpacity={0} stopColor="#ffffff" />
        </RadialGradient>
      </Defs>

      <G transform={mirror ? `translate(${width},0) scale(-1,1)` : undefined}>
        {RIGHT_LAYOUT_20.map(({ id, x, y}) => {
          const v = clamp01(sensorValues[String(id)]);
          const cx = x * width;
          const cy = y * height;

          // 값이 0/없음 → 옅은 회색 패드로 위치만 표시
          if (v <= 0) {
            if (!showFaintWhenZero) return null;
            const rx0 = radius * 0.55;
            const ry0 = radius * 0.75;
            return (
              <Ellipse
                key={id}
                cx={cx}
                cy={cy}
                rx={rx0}
                ry={ry0}
                origin={`${cx},${cy}`}
                fill={dark ? 'rgba(246,243,233,0.16)' : '#e5e7eb'}
                stroke={dark ? 'rgba(246,243,233,0.25)' : '#000000'}
                strokeWidth={1.2}
                opacity={dark ? 1 : 0.85}
              />
            );
          }

          // 값이 있을 때는 컬러 + 하이라이트 + (선택)글로우
          const rx = radius * (0.55 + 0.2 * v);
          const ry = radius * (0.75 + 0.2 * v);
          const fill = colorFor(v);

          return (
            <React.Fragment key={id}>
              {glow && (
                <Ellipse
                  cx={cx}
                  cy={cy}
                  rx={rx * 1.5}
                  ry={ry * 1.2}
                  origin={`${cx},${cy}`}
                  fill="url(#dotsGlow)"
                  opacity={0.35 * v}
                />
              )}
              <Ellipse
                cx={cx}
                cy={cy}
                rx={rx}
                ry={ry}
                origin={`${cx},${cy}`}
                fill={fill}
                opacity={0.95}
              />
              <Ellipse
                cx={cx}
                cy={cy}
                rx={rx * 0.33}
                ry={ry * 0.33}
                origin={`${cx},${cy}`}
                fill="#fff"
                opacity={0.25}
              />
            </React.Fragment>
          );
        })}
      </G>
    </Svg>
  );
};

export default memo(FootDots);
