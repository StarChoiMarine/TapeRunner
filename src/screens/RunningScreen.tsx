import React, { useState } from 'react';
import { View, Text } from 'react-native';
import FootDots from '../components/FootDots';

export default function RunningScreen() {
  // 실시간 센서 값(정규화 0~1). 지금은 비워둠 → 위치만 옅게 보임
  const [leftVals]  = useState<Record<number, number>>({


    9:0, 10:0,
    8:0.35, 12: 0.85, 20:0.82,
    7:0.4, 16:0.77, 19:0.9,
    2: 0.77, 15:0.6, 18:0.9,
    3:0.25, 13: 0.9, 17:0.7,
    5: 0 , 4: 0
    



  });
  const [rightVals] = useState<Record<number, number>>({});

  return (
    <View style={{ flex:1, padding:16, backgroundColor:'#EEF5E8' }}>
      {/* 헤더 (간단 표기만) */}
      <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
        <Text style={{ fontSize:26, fontWeight:'800' }}>Running</Text>
        <Text style={{ color:'#64748b' }}>센서 위치 보기</Text>
      </View>

      {/* 발모양(왼/오) */}
      <View style={{ flexDirection:'row', justifyContent:'space-evenly', marginTop:24 }}>
        {/* 왼발은 mirror=true 로 좌우 반전 */}
        <FootDots sensorValues={leftVals}  mirror width={170} height={240} radius={16} showFaintWhenZero />
        <FootDots sensorValues={rightVals}       width={170} height={240} radius={16} showFaintWhenZero />
      </View>

      <Text style={{ textAlign:'center', marginTop:12, color:'#334155' }}>
        값이 들어오면 해당 센서가 색으로 칠해집니다.
      </Text>
    </View>
  );
}
