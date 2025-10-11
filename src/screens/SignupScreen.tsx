import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';

import { getApp } from '@react-native-firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword
} from '@react-native-firebase/auth';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  serverTimestamp
} from '@react-native-firebase/firestore';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Signup'>;

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isNickname = (v: string) => /^[a-zA-Z0-9가-힣]{2,10}$/.test(v);

export default function SignupScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [loading, setLoading] = useState(false);

  const onSignup = async () => {
    if (!email || !nickname || !pw) {
      Alert.alert('오류', '모든 필드를 입력해주세요.');
      return;
    }
    if (!isEmail(email)) {
      Alert.alert('오류', '이메일의 형식이 올바르지 않습니다.');
      return;
    }
    if (!isNickname(nickname)) {
      Alert.alert('오류', '닉네임은 2~10자의 한글, 영어, 숫자만 사용할 수 있습니다.');
      return;
    }
    if (pw !== pw2) {
      Alert.alert('오류', '비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      setLoading(true);

      const app = getApp();
      const db = getFirestore(app);
      const auth = getAuth(app);

      // 닉네임 중복 확인
      const q = query(collection(db, 'users'), where('nickname', '==', nickname));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        Alert.alert('오류', '이미 사용 중인 닉네임입니다.');
        setLoading(false);
        return;
      }

      // 이메일로 회원가입
      const userCredential = await createUserWithEmailAndPassword(auth, email, pw);
      const { uid } = userCredential.user;

      // Firestore에 사용자 데이터 저장
      await setDoc(doc(db, 'users', uid), {
        nickname,
        email,
        created_At: serverTimestamp(),
      });

      Alert.alert('가입 완료', '이제 로그인해주세요.');
      navigation.replace('Login');
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert('오류', '이미 사용 중인 이메일입니다.');
      } else if (error.code === 'auth/weak-password') {
        Alert.alert('오류', '비밀번호는 6자 이상이어야 합니다.');
      } else if (error.code === 'auth/configuration-not') {
        Alert.alert('오류', 'Firebase 설정을 찾을 수 없습니다. google-services.json을 확인하세요.');
      } else {
        Alert.alert('오류', '회원가입 중 문제가 발생했습니다.');
      }
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
          <Text style={{ fontWeight:'600' }}>닉네임</Text>
          <TextInput
            placeholder="2~10자, 특수문자 금지"
            value={nickname}
            onChangeText={setNickname}
            autoCapitalize="none"
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
