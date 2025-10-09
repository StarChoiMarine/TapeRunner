// src/components/SideMenu.tsx
import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  Pressable,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

type Props = { open: boolean; onClose: () => void; userName?: string };

const WIDTH = Math.min(300, Dimensions.get('window').width * 0.8);
const CLAMP = (v: number) => Math.max(-WIDTH, Math.min(0, v));

export default function SideMenu({ open, onClose, userName = '사용자' }: Props) {
  const nav = useNavigation<any>();

  // translateX 값 (-WIDTH ~ 0)
  const tx = useRef(new Animated.Value(-WIDTH)).current;
  const startX = useRef(0); // 제스처 시작 시점의 tx 값

  // 열림/닫힘 애니메이션
  useEffect(() => {
    Animated.spring(tx, {
      toValue: open ? 0 : -WIDTH,
      useNativeDriver: true,
      bounciness: 6,
    }).start();
  }, [open, tx]);

  // 드래그 제스처 (왼쪽으로 밀면 닫힘)
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => {
          // 가로 이동이 5px 이상이면 제스처 시작
          return Math.abs(g.dx) > 5;
        },
        onPanResponderGrant: () => {
          // 현재 위치를 시작점으로 저장
          tx.stopAnimation((v: number) => {
            startX.current = v;
          });
        },
        onPanResponderMove: (_, g) => {
          // 오른쪽(열기) 드래그는 0 이상으로 못 가게, 왼쪽(닫기)은 -WIDTH까지
          const next = CLAMP(startX.current + g.dx);
          tx.setValue(next);
        },
        onPanResponderRelease: (_, g) => {
          // 스와이프 속도 또는 위치 임계값으로 닫기/열기 결정
          const shouldClose = g.vx < -0.5 || (startX.current + g.dx) < -WIDTH * 0.4;
          Animated.spring(tx, {
            toValue: shouldClose ? -WIDTH : 0,
            useNativeDriver: true,
            bounciness: 0,
          }).start(() => {
            if (shouldClose) onClose();
          });
        },
        onPanResponderTerminate: () => {
          // 다른 제스처에 뺏기면 원위치
          Animated.spring(tx, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 0,
          }).start();
        },
      }),
    [onClose, tx]
  );

  const Item = ({ label, to }: { label: string; to?: string }) => (
    <Pressable
      onPress={() => {
        to && nav.navigate(to as never);
        onClose();
      }}
      style={{ paddingVertical: 16, borderBottomWidth: 1, borderColor: '#eee' }}
    >
      <Text style={{ fontSize: 16 }}>{label}</Text>
    </Pressable>
  );

  return (
    <>
      {/* 반투명 오버레이 - 탭하면 닫힘 */}
      {open && (
        <Pressable
          onPress={onClose}
          style={{
            position: 'absolute',
            top: 0, bottom: 0, left: 0, right: 0,
            backgroundColor: 'rgba(0,0,0,0.2)',
          }}
        />
      )}

      {/* 드래그 가능한 메뉴 패널 */}
      <Animated.View
        {...panResponder.panHandlers}
        style={{
          position: 'absolute',
          top: 0, bottom: 0, left: 0, width: WIDTH,
          backgroundColor: 'white',
          padding: 20,
          transform: [{ translateX: tx }],
          elevation: 8,
          shadowColor: '#000',
          shadowOpacity: 0.15,
          shadowRadius: 10,
        }}
      >
        <View style={{ paddingVertical: 24, borderBottomWidth: 1, borderColor: '#eee' }}>
          <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#eee', marginBottom: 8 }} />
          <Text style={{ fontSize: 18, fontWeight: '700' }}>{userName}</Text>
        </View>

        <Item label="러닝" to="Home" />
        <Item label="테이핑" to="Analysis" />
        <Item label="내 자세 분석" to="Analysis" />
        <Item label="기기 연결" to="DeviceConnect" />
        <Item label="로그아웃" to="Login" />

        <Pressable
          onPress={() => nav.navigate('Analysis')}
          style={{ position: 'absolute', right: 16, bottom: 16 }}
        >
          <Text style={{ backgroundColor: '#efefef', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}>
            가이드
          </Text>
        </Pressable>
      </Animated.View>
    </>
  );
}
