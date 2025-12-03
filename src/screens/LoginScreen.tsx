import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import SQLite from 'react-native-sqlite-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

SQLite.enablePromise(true);

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);

  // DB 연결
  useEffect(() => {
    const initDB = async () => {
      try {
        const database = await SQLite.openDatabase({ name: 'taperunner.db', location: 'default' });
        await database.executeSql(`
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            nickname TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at TEXT NOT NULL
          );
        `);
        setDb(database);
      } catch (e) {
        console.error('DB 연결 오류:', e);
      }
    };
    initDB();

    // 앱 실행 시 자동 로그인 시도
    const checkLoginStatus = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('loggedInUser');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          console.log('자동 로그인 사용자:', user.email);
          navigation.replace('Home', { userName: user.nickname });
        }
      } catch (err) {
        console.error('자동 로그인 확인 오류:', err);
      }
    };
    checkLoginStatus();
  }, []);

  const onLogin = async () => {
    if (!isEmail(email)) {
      Alert.alert('오류', '올바른 이메일을 입력해주세요.');
      return;
    }
    if (pw.length < 6) {
      Alert.alert('오류', '비밀번호는 6자 이상으로 입력해주세요.');
      return;
    }

    if (!db) {
      Alert.alert('오류', '데이터베이스 연결 실패');
      return;
    }

    try {
      setLoading(true);

      const [results] = await db.executeSql(`SELECT * FROM users WHERE email = ?`, [email]);

      if (results.rows.length === 0) {
        Alert.alert('오류', '등록되지 않은 이메일입니다.');
        setLoading(false);
        return;
      }

      const user = results.rows.item(0);
      if (user.password !== pw) {
        Alert.alert('오류', '비밀번호가 일치하지 않습니다.');
        setLoading(false);
        return;
      }

      // ✅ 로그인 성공 시 사용자 정보 저장
      await AsyncStorage.setItem('loggedInUser', JSON.stringify({
        id: user.id,
        email: user.email,
        nickname: user.nickname,
      }));

      Alert.alert('환영합니다!', `${user.nickname}님, 로그인 성공`);
      navigation.replace('Home', { userName: user.nickname });
    } catch (error) {
      console.error('로그인 오류:', error);
      Alert.alert('오류', '로그인 중 문제가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ flex: 1, padding: 20, justifyContent: 'center', gap: 16 }}>
        <Text style={{ fontSize: 28, fontWeight: '800' }}>Tape Runner</Text>
        <Text style={{ color: '#666' }}>이메일과 비밀번호를 입력하세요.</Text>

        <View style={{ gap: 10 }}>
          <Text style={{ fontWeight: '600' }}>이메일</Text>
          <TextInput
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12 }}
          />
        </View>

        <View style={{ gap: 10 }}>
          <Text style={{ fontWeight: '600' }}>비밀번호</Text>
          <View style={{
            borderWidth: 1,
            borderColor: '#ddd',
            borderRadius: 10,
            flexDirection: 'row',
            alignItems: 'center'
          }}>
            <TextInput
              placeholder="6자 이상"
              value={pw}
              onChangeText={setPw}
              secureTextEntry={!showPw}
              style={{ flex: 1, padding: 12 }}
            />
            <TouchableOpacity
              onPress={() => setShowPw(s => !s)}
              style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
              <Text style={{ color: '#007aff' }}>{showPw ? '숨기기' : '보기'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          onPress={onLogin}
          disabled={loading}
          style={{
            backgroundColor: '#111',
            padding: 14,
            borderRadius: 12,
            alignItems: 'center'
          }}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={{ color: '#fff', fontWeight: '700' }}>로그인</Text>}
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
          <Text>계정이 없으신가요?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={{ color: '#007aff', fontWeight: '600' }}>회원가입</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
