// src/components/SideMenu.tsx
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Pressable, View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';

type Props = { open: boolean; onClose: () => void; userName?: string };

const WIDTH = Math.min(300, Dimensions.get('window').width * 0.8);

export default function SideMenu({ open, onClose, userName = '사용자' }: Props) {
  const nav = useNavigation<any>();
  const x = useRef(new Animated.Value(-WIDTH)).current;

  useEffect(() => {
    Animated.spring(x, { toValue: open ? 0 : -WIDTH, useNativeDriver: true, bounciness: 6 }).start();
  }, [open, x]);

  const Item = ({ label, to }: { label: string; to?: string }) => (
    <Pressable
      onPress={() => { to && nav.navigate(to as never); onClose(); }}
      style={{ paddingVertical: 16, borderBottomWidth: 1, borderColor: '#eee' }}
    >
      <Text style={{ fontSize: 16 }}>{label}</Text>
    </Pressable>
  );

  return (
    <>
      {open && (
        <Pressable onPress={onClose} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.2)' }} />
      )}
      <Animated.View
        style={{
          position: 'absolute', top: 0, bottom: 0, left: 0, width: WIDTH,
          backgroundColor: 'white', padding: 20, transform: [{ translateX: x }], elevation: 8,
          shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 10
        }}
      >
        <View style={{ paddingVertical: 24, borderBottomWidth: 1, borderColor: '#eee' }}>
          <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#eee', marginBottom: 8 }} />
          <Text style={{ fontSize: 18, fontWeight: '700' }}>{userName}</Text>
        </View>

        <Item label="러닝" to="Running" />
        <Item label="테이핑" to="Analysis" />
        <Item label="내 자세 분석" to="Analysis" />
        <Item label="기기 연결" to="DeviceConnect" />
        <Item label="로그아웃" to="Login" />
        <Pressable onPress={() => nav.navigate('Analysis')} style={{ position: 'absolute', right: 16, bottom: 16 }}>
          <Text style={{ backgroundColor: '#efefef', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}>가이드</Text>
        </Pressable>
      </Animated.View>
    </>
  );
}
