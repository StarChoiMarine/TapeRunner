// src/components/SideMenu.tsx
import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  Pressable,
  Text,
  View,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { color, font, radius } from '../theme';

type Props = { open: boolean; onClose: () => void; userName?: string };

const WIDTH = Math.min(300, Dimensions.get('window').width * 0.8);
const CLAMP = (v: number) => Math.max(-WIDTH, Math.min(0, v));

export default function SideMenu({ open, onClose, userName = '사용자' }: Props) {
  const nav = useNavigation<any>();

  // translateX 값 (-WIDTH ~ 0)
  const tx = useRef(new Animated.Value(-WIDTH)).current;
  const startX = useRef(0);

  // 열림/닫힘 애니메이션
  useEffect(() => {
    Animated.spring(tx, {
      toValue: open ? 0 : -WIDTH,
      useNativeDriver: true,
      bounciness: 6,
    }).start();
  }, [open, tx]);

  // 드래그 제스처
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 5,
        onPanResponderGrant: () => {
          tx.stopAnimation((v: number) => (startX.current = v));
        },
        onPanResponderMove: (_, g) => {
          const next = CLAMP(startX.current + g.dx);
          tx.setValue(next);
        },
        onPanResponderRelease: (_, g) => {
          const shouldClose = g.vx < -0.5 || startX.current + g.dx < -WIDTH * 0.4;
          Animated.spring(tx, {
            toValue: shouldClose ? -WIDTH : 0,
            useNativeDriver: true,
            bounciness: 0,
          }).start(() => {
            if (shouldClose) onClose();
          });
        },
        onPanResponderTerminate: () => {
          Animated.spring(tx, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 0,
          }).start();
        },
      }),
    [onClose, tx]
  );

  // ✅ 로그아웃 처리 함수
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('loggedInUser');
      Alert.alert('로그아웃 완료', '정상적으로 로그아웃되었습니다.');
      onClose();
      nav.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (err) {
      console.error('로그아웃 오류:', err);
      Alert.alert('오류', '로그아웃 중 문제가 발생했습니다.');
    }
  };

  const Item = ({
    label,
    to,
    onPress,
    danger,
  }: {
    label: string;
    to?: string;
    onPress?: () => void;
    danger?: boolean;
  }) => (
    <Pressable
      onPress={() => {
        if (onPress) {
          onPress();
        } else if (to) {
          nav.navigate(to as never);
        }
        onClose();
      }}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 14,
        borderRadius: radius.md,
        backgroundColor: pressed ? 'rgba(246,243,233,0.07)' : 'transparent',
      })}
    >
      <Text
        style={{
          fontFamily: font.medium,
          fontSize: 16,
          color: danger ? '#E8907D' : color.ivory,
        }}
      >
        {label}
      </Text>
      <Text style={{ fontFamily: font.regular, fontSize: 16, color: color.ivoryFaint }}>›</Text>
    </Pressable>
  );

  return (
    <>
      {/* 반투명 오버레이 */}
      {open && (
        <Pressable
          onPress={onClose}
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(12,39,30,0.45)',
          }}
        />
      )}

      {/* 드래그 가능한 메뉴 패널 */}
      <Animated.View
        {...panResponder.panHandlers}
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          width: WIDTH,
          backgroundColor: color.surfaceDeep,
          padding: 20,
          transform: [{ translateX: tx }],
          elevation: 12,
          shadowColor: '#000',
          shadowOpacity: 0.3,
          shadowRadius: 16,
        }}
      >
        {/* 프로필 */}
        <View
          style={{
            paddingTop: 28,
            paddingBottom: 24,
            marginBottom: 12,
            borderBottomWidth: 1,
            borderColor: color.lineOnDark,
          }}
        >
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: color.lime,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}
          >
            <Text style={{ fontFamily: font.extrabold, fontSize: 22, color: color.surfaceDeeper }}>
              {userName.slice(0, 1)}
            </Text>
          </View>
          <Text style={{ fontFamily: font.bold, fontSize: 18, color: color.ivory }}>{userName}</Text>
          <Text style={{ fontFamily: font.regular, fontSize: 12, color: color.ivoryFaint, marginTop: 2 }}>
            TAPE RUNNER MEMBER
          </Text>
        </View>

        <Item label="러닝" to="Home" />
        <Item label="내 활동" to="Activity" />
        <Item label="테이핑" to="Video" />
        <Item label="기기 연결" to="DeviceConnect" />

        <View style={{ height: 1, backgroundColor: color.lineOnDark, marginVertical: 12 }} />

        {/* ✅ 로그아웃 버튼 */}
        <Item label="로그아웃" onPress={handleLogout} danger />

        <Pressable
          onPress={() => nav.navigate('Activity')}
          style={{ position: 'absolute', right: 20, bottom: 24 }}
        >
          <Text
            style={{
              fontFamily: font.medium,
              fontSize: 13,
              color: color.ivorySoft,
              borderWidth: 1,
              borderColor: color.lineOnDark,
              paddingHorizontal: 14,
              paddingVertical: 7,
              borderRadius: radius.pill,
              overflow: 'hidden',
            }}
          >
            가이드
          </Text>
        </Pressable>
      </Animated.View>
    </>
  );
}
