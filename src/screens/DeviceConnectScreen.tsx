import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, ScrollView, Platform, PermissionsAndroid } from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';
import { Buffer } from 'buffer';
import FootDots from '../components/FootDots';
import { useBle } from '../store/ble/BleProvider';

export default function DeviceConnectScreen() {
  const {
    isLeftConnected, isRightConnected,
    leftVals, rightVals, rawL, rawR,
    connectInsole, disconnectInsole,
  } = useBle();

  const StatusPill = ({ok}:{ok:boolean}) => (
    <View style={{
      borderWidth:2,borderColor:ok?'#64a98c':'#cbd5e1',
      paddingHorizontal:10,paddingVertical:4,borderRadius:8,
      backgroundColor:ok?'#e9f6f0':'#f1f5f9'
    }}>
      <Text style={{color:ok?'#2f855a':'#64748b',fontWeight:'800'}}>{ok?'connected':'disconnected'}</Text>
    </View>
  );

  return (
    <ScrollView style={{flex:1,backgroundColor:'#EEF5E8'}} contentContainerStyle={{padding:16}}>
      <Text style={{fontSize:24,fontWeight:'900',color:'#215a3f',marginBottom:12}}>스마트 인솔 연결</Text>

      {/* 좌/우 연결 카드 */}
      <View style={{flexDirection:'row',gap:10}}>
        {[{side:'L',ok:isLeftConnected,con:()=>connectInsole('L'),dis:()=>disconnectInsole('L')},
          {side:'R',ok:isRightConnected,con:()=>connectInsole('R'),dis:()=>disconnectInsole('R')}]
          .map(({side,ok,con,dis})=>(
          <View key={side} style={{flex:1,backgroundColor:'#fff',borderRadius:16,padding:12,shadowColor:'#000',shadowOpacity:0.08,shadowRadius:8,elevation:2}}>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
              <Text style={{fontSize:18,fontWeight:'700'}}>{side==='L'?'왼쪽 인솔':'오른쪽 인솔'}</Text>
              <StatusPill ok={ok}/>
            </View>
            <View style={{flexDirection:'row',gap:8,marginTop:10}}>
              <Pressable onPress={con} disabled={ok} style={{flex:1,backgroundColor:ok?'#a7f3d0':'#2F855A',borderRadius:8,padding:8,alignItems:'center'}}>
                <Text style={{color:ok?'#064e3b':'#fff',fontWeight:'700'}}>Connect</Text>
              </Pressable>
              <Pressable onPress={dis} disabled={!ok} style={{flex:1,backgroundColor:'#e5e7eb',borderRadius:8,padding:8,alignItems:'center'}}>
                <Text style={{fontWeight:'700'}}>Disconnect</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>

      {/* FootDots */}
      <View style={{marginTop:16,backgroundColor:'#fff',borderRadius:16,paddingVertical:16,shadowColor:'#000',shadowOpacity:0.08,shadowRadius:8,elevation:2}}>
        <Text style={{fontWeight:'800',marginLeft:12,marginBottom:8}}>실시간 센서 미리보기</Text>
        <View style={{flexDirection:'row',justifyContent:'space-evenly'}}>
          <FootDots sensorValues={leftVals}  mirror width={170} height={240} radius={16}/>
          <FootDots sensorValues={rightVals}       width={170} height={240} radius={16}/>
        </View>
      </View>

      {/* Raw 최근 라인 (옵션) */}
      <View style={{marginTop:16,backgroundColor:'#fff',borderRadius:16,padding:12,shadowColor:'#000',shadowOpacity:0.08,shadowRadius:8,elevation:2,marginBottom:24}}>
        <Text style={{fontWeight:'800',marginBottom:8}}>최근 수신 라인</Text>
        <Text style={{color:'#0f766e',marginBottom:6}}>L: {rawL || '(no data)'}</Text>
        <Text style={{color:'#1e3a8a'}}>R: {rawR || '(no data)'}</Text>
      </View>
    </ScrollView>
  );
}