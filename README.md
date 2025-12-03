# TapeRunner 🏃‍♂️

스마트 인솔 기반 러닝 부상 예방 및 분석 모바일 앱

TapeRunner는 블루투스 스마트 인솔을 통해 러너들의 보행 데이터를 실시간으로 수집하고, AI 기반 분석을 통해 부상 위험을 예측하며, 맞춤형 테이핑 가이드를 제공하는 혁신적인 러닝 헬스케어 앱입니다.

## 📋 프로젝트 개요

**TapeRunner**는 러너들의 건강한 러닝 라이프를 지원하기 위해 개발된 모바일 애플리케이션입니다. 주요 목표는 다음과 같습니다:

- 🦶 **스마트 인솔 연동**: 블루투스 기술을 활용한 실시간 보행 데이터 수집
- 🤖 **AI 기반 분석**: 머신러닝을 통한 부상 위험 예측 및 분석
- 🎥 **교육 콘텐츠**: 부상 예방을 위한 전문 테이핑 교육 비디오
- 📊 **데이터 시각화**: 히트맵을을 통한 직관적인 데이터 표현

## ✨ 주요 기능

### 🔄 실시간 데이터 수집
- 블루투스 LE를 통한 스마트 인솔 연결
- 실시간 보행 패턴 및 압력 데이터 수집
- 배터리 상태 및 연결 상태 모니터링

### 🤖 AI 분석 시스템
- 머신러닝 기반 부상 위험 예측
- 족저근막염, 아킬레스건염 등 주요 부상 분석
- 개인 맞춤형 건강 리포트 생성

### 🎥 교육 콘텐츠
- 전문 테이핑 기술 교육 비디오
- 부상별 맞춤형 예방 가이드
- 키네시오 테이핑, 스포츠 테이핑 등 다양한 테크닉

### 📈 데이터 시각화
- 압력 히트맵을 통한 보행 패턴 분석
- 활동 히스토리 및 트렌드 차트
- 상세한 분석 리포트

## 🛠️ 기술 스택

### Frontend
- **React Native 0.75.4** - 크로스 플랫폼 모바일 앱 개발
- **TypeScript 5.0.4** - 타입 안전성 보장
- **React Navigation 7.x** - 네비게이션 관리

### Backend & Database
- **SQLite** - 로컬 데이터 저장소
- **AsyncStorage** - 로컬 캐시 및 설정 저장

### Hardware Integration
- **React Native BLE PLX** - 블루투스 LE 통신
- **React Native FS** - 파일 시스템 관리

### State Management & Utils
- **Zustand** - 경량 상태 관리
- **React Native Video** - 비디오 플레이어
- **React Native SVG** - 벡터 그래픽 렌더링

### Development Tools
- **ESLint** - 코드 품질 관리
- **Prettier** - 코드 포맷팅
- **Jest** - 단위 테스트
- **React Native Dotenv** - 환경 변수 관리

## 🚀 실행 방법

### 사전 요구사항

1. **Node.js 18 이상** 설치
2. **React Native 개발 환경** 설정
3. **Android Studio** 또는 **Xcode** 설치 (플랫폼별)
4. **Java JDK 17** 이상

### 설치 및 실행

1. **프로젝트 클론 및 의존성 설치**
   ```bash
   git clone <repository-url>
   cd TapeRunner
   npm install
   ```

2. **Metro 번들러 시작**
   ```bash
   cd android
   npm start
   ```

### 📱 앱 사용법

1. **회원가입/로그인** 후 메인 화면 진입
2. **디바이스 연결** 메뉴에서 스마트 인솔 페어링
3. **러닝 시작**으로 실시간 데이터 수집
4. **분석 결과** 확인 및 교육 비디오 시청
5. **활동 히스토리**에서 과거 데이터 리뷰

## 📁 프로젝트 구조

```
src/
├── assets/          # 이미지 및 미디어 리소스
├── components/      # 재사용 가능한 UI 컴포넌트
├── config/          # 앱 설정 및 상수
├── data/           # 정적 데이터 및 목업
├── screens/        # 앱 화면 컴포넌트
├── services/       # API 및 비즈니스 로직
├── store/          # 상태 관리 (Zustand)
├── types/          # TypeScript 타입 정의
└── utils/          # 유틸리티 함수
```