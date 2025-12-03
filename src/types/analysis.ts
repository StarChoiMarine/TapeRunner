// 타입: 상세 분석 도메인

export type SensorValueMap = Record<number, number>; // 센서ID -> 0~1 정규화 값

export type RunSession = {
  id: string;
  startedAt: string;      // ISO 문자열
  durationSec: number;    // 러닝 시간(초)
  left: SensorValueMap;   // 왼발 스냅샷
  right: SensorValueMap;  // 오른발 스냅샷
};

export type TapeCategory = 'lateral_ankle' | 'medial_ankle' | 'achilles';

export type TapeVideo = {
  id: string;
  category: TapeCategory;
  title: string;
  videoUrl: string;
  thumbUrl: string;
};

export type TapeRecommendation = {
  category: TapeCategory;
  reasons: string[];
  videos: TapeVideo[];
};

export type AIAnalysisResult = {
  text: string;
  createdAt: string; // ISO 문자열
};


