// src/screens/HomeScreen.tsx
import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import SideMenu from '../components/SideMenu';
import DeviceStatusCard from '../components/DeviceStatusCard';
import TapeCarousel from '../components/TapeCarousel';

export default function HomeScreen() {
  const nav = useNavigation<any>();
  const [open, setOpen] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: '#E8F2DF' }}>
      {/* Top bar */}
      <View style={{
        height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 12
      }}>
        <Pressable onPress={() => setOpen(true)} hitSlop={10}><Text style={{ fontSize: 24 }}>☰</Text></Pressable>
        <Text style={{ fontSize: 22, fontWeight: '800' }}>TAPE</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <DeviceStatusCard />
        <TapeCarousel />
      </ScrollView>

      {/* RUN button */}
      <Pressable
        onPress={() => nav.navigate('Running')}
        style={{
          position: 'absolute', left: 0, right: 0, bottom: 24, alignItems: 'center'
        }}
      >
        <View style={{
          width: 90, height: 90, borderRadius: 45, backgroundColor: '#2E7D32',
          alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 12, elevation: 6
        }}>
          <Text style={{ color: 'white', fontWeight: '800' }}>RUN</Text>
        </View>
      </Pressable>

      <SideMenu open={open} onClose={() => setOpen(false)} userName="최성" />
    </View>
  );
}
