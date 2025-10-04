import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Signup'>;

const isEmail = (v: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export default function SignupScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [loading, setLoading] = useState(false);

  const onSignup = async () => {
    if (!isEmail(email)) return Alert.alert('확인', '올바른 이메일을 입력해주세요.');
    if (pw.length < 6) return Alert.alert('확인', '비밀번호는 6자 이상으로 입력해주세요.');
    if (pw !== pw2)  return Alert.alert('확인', '비밀번호가 일치하지 않습니다.');

    // 🔧 백엔드 연동 전까지는 데모로 성공 처리
    try {
      setLoading(true);
      await new Promise(r => setTimeout(r, 700));
      Alert.alert('가입 완료', '이제 로그인해주세요.');
      navigation.replace('Login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex:1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ flex:1, padding:20, justifyContent:'center', gap:16 }}>
        <Text style={{ fontSize:28, fontWeight:'800' }}>회원가입</Text>
        <Text style={{ color:'#666' }}>기본 정보를 입력해주세요.</Text>

        <View style={{ gap:10 }}>
          <Text style={{ fontWeight:'600' }}>이메일</Text>
          <TextInput
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={{ borderWidth:1, borderColor:'#ddd', borderRadius:10, padding:12 }}
          />
        </View>

        <View style={{ gap:10 }}>
          <Text style={{ fontWeight:'600' }}>비밀번호</Text>
          <TextInput
            placeholder="6자 이상"
            value={pw}
            onChangeText={setPw}
            secureTextEntry
            style={{ borderWidth:1, borderColor:'#ddd', borderRadius:10, padding:12 }}
          />
        </View>

        <View style={{ gap:10 }}>
          <Text style={{ fontWeight:'600' }}>비밀번호 확인</Text>
          <TextInput
            placeholder="비밀번호 재입력"
            value={pw2}
            onChangeText={setPw2}
            secureTextEntry
            style={{ borderWidth:1, borderColor:'#ddd', borderRadius:10, padding:12 }}
          />
        </View>

        <TouchableOpacity
          onPress={onSignup}
          disabled={loading}
          style={{ backgroundColor:'#111', padding:14, borderRadius:12, alignItems:'center' }}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color:'#fff', fontWeight:'700' }}>회원가입</Text>}
        </TouchableOpacity>

        <View style={{ flexDirection:'row', justifyContent:'center', gap:8 }}>
          <Text>이미 계정이 있으신가요?</Text>
          <TouchableOpacity onPress={() => navigation.replace('Login')}>
            <Text style={{ color:'#007aff', fontWeight:'600' }}>로그인</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
