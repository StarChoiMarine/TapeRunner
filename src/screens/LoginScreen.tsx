import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const isEmail = (v: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    if (!isEmail(email)) return Alert.alert('확인', '올바른 이메일을 입력해주세요.');
    if (pw.length < 6) return Alert.alert('확인', '비밀번호는 6자 이상으로 입력해주세요.');

    // 🔧 백엔드 연동 전까지는 데모로 성공 처리
    try {
      setLoading(true);
      await new Promise(r => setTimeout(r, 600));
      Alert.alert('환영합니다!', '로그인 성공 (데모)');
      navigation.replace('Home');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex:1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ flex:1, padding:20, justifyContent:'center', gap:16 }}>
        <Text style={{ fontSize:28, fontWeight:'800' }}>Tape Runner</Text>
        <Text style={{ color:'#666' }}>이메일과 비밀번호를 입력하세요.</Text>

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
          <View style={{ borderWidth:1, borderColor:'#ddd', borderRadius:10, flexDirection:'row', alignItems:'center' }}>
            <TextInput
              placeholder="6자 이상"
              value={pw}
              onChangeText={setPw}
              secureTextEntry={!showPw}
              style={{ flex:1, padding:12 }}
            />
            <TouchableOpacity onPress={() => setShowPw(s => !s)} style={{ paddingHorizontal:12, paddingVertical:8 }}>
              <Text style={{ color:'#007aff' }}>{showPw ? '숨기기' : '보기'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          onPress={onLogin}
          disabled={loading}
          style={{ backgroundColor:'#111', padding:14, borderRadius:12, alignItems:'center' }}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color:'#fff', fontWeight:'700' }}>로그인</Text>}
        </TouchableOpacity>

        <View style={{ flexDirection:'row', justifyContent:'center', gap:8 }}>
          <Text>계정이 없으신가요?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={{ color:'#007aff', fontWeight:'600' }}>회원가입</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
