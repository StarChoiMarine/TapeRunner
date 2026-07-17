import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { color, fontRole, radius, shadow } from '../theme';

/**
 * FontSystemExample
 *
 * Next.js/Tailwind 예시로 치면:
 * - `font-sans` -> fontRole.sans / fontRole.body
 * - `font-data` -> fontRole.data
 * - `font-display` -> fontRole.display
 *
 * 실제 앱 화면에 붙일 때는 이 컴포넌트를 원하는 screen에 import해서 렌더링하면 됩니다.
 * Space Grotesk/Monument Extended 파일을 추가하기 전에는 OS 기본 폰트로 fallback될 수 있습니다.
 */
export default function FontSystemExample() {
  return (
    <View
      style={{
        backgroundColor: color.surface,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: color.line,
        padding: 18,
        gap: 14,
        ...shadow.card,
      }}
    >
      <Text
        style={{
          fontFamily: fontRole.display,
          fontSize: 28,
          lineHeight: 34,
          color: color.ink,
        }}
      >
        TAPE RUNNER
      </Text>

      <Text
        style={{
          fontFamily: fontRole.body,
          fontSize: 14,
          lineHeight: 22,
          color: color.inkSoft,
        }}
      >
        발바닥 압력과 케이던스를 정밀하게 읽고, 러닝 리듬을 더 직관적으로 보여줍니다.
      </Text>

      <View style={{ flexDirection: 'row', gap: 18 }}>
        <View>
          <Text style={{ fontFamily: fontRole.bodyMedium, fontSize: 11, color: color.inkFaint }}>
            CADENCE
          </Text>
          <Text style={{ fontFamily: fontRole.dataBold, fontSize: 32, color: color.pine }}>
            172
          </Text>
        </View>

        <View>
          <Text style={{ fontFamily: fontRole.bodyMedium, fontSize: 11, color: color.inkFaint }}>
            SYNC
          </Text>
          <Text style={{ fontFamily: fontRole.dataBold, fontSize: 32, color: color.leaf }}>
            86%
          </Text>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => ({
          alignSelf: 'flex-start',
          backgroundColor: pressed ? color.limeDeep : color.lime,
          borderRadius: radius.pill,
          paddingHorizontal: 18,
          paddingVertical: 11,
        })}
      >
        <Text style={{ fontFamily: fontRole.bodyStrong, fontSize: 13, color: color.surfaceDeeper }}>
          Start rhythm run
        </Text>
      </Pressable>
    </View>
  );
}
