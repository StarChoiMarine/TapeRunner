// src/services/sensorDataCollector.ts
let RNFS: any = null;
try {
  RNFS = require('react-native-fs');
} catch (error) {
  console.warn('[SensorDataCollector] react-native-fs not available:', error);
}

export interface SensorDataPoint {
  timestamp: number;
  leftSensors: Record<number, number>;  // 센서ID -> 값 (0~1)
  rightSensors: Record<number, number>; // 센서ID -> 값 (0~1)
}

export interface DataCollectionSession {
  sessionId: string;
  startTime: number;
  dataPoints: SensorDataPoint[];
  isCollecting: boolean;
}

class SensorDataCollector {
  private currentSession: DataCollectionSession | null = null;

  /**
   * 데이터 수집 세션 시작
   */
  startSession(sessionId?: string): void {
    const id = sessionId || `session_${Date.now()}`;
    this.currentSession = {
      sessionId: id,
      startTime: Date.now(),
      dataPoints: [],
      isCollecting: true,
    };
    console.log(`[SensorDataCollector] Started session: ${id}`);
  }

  /**
   * 센서 데이터 포인트 추가
   */
  addDataPoint(leftSensors: Record<number, number>, rightSensors: Record<number, number>): void {
    if (!this.currentSession || !this.currentSession.isCollecting) {
      return;
    }

    const dataPoint: SensorDataPoint = {
      timestamp: Date.now(),
      leftSensors: { ...leftSensors },
      rightSensors: { ...rightSensors },
    };

    this.currentSession.dataPoints.push(dataPoint);
  }

  /**
   * 데이터 수집 중지
   */
  stopSession(): DataCollectionSession | null {
    if (!this.currentSession) {
      return null;
    }

    this.currentSession.isCollecting = false;
    console.log(`[SensorDataCollector] Stopped session: ${this.currentSession.sessionId}, collected ${this.currentSession.dataPoints.length} data points`);

    return this.currentSession;
  }

  /**
   * 수집된 데이터를 CSV 형식으로 변환
   */
  private convertToCSV(session: DataCollectionSession): string {
    if (session.dataPoints.length === 0) {
      return '';
    }

    // 헤더 생성: timestamp,left_1,left_2,...,left_16,right_1,...,right_16
    const leftHeaders = Array.from({ length: 16 }, (_, i) => `left_${i + 1}`).join(',');
    const rightHeaders = Array.from({ length: 16 }, (_, i) => `right_${i + 1}`).join(',');
    const headers = `timestamp,${leftHeaders},${rightHeaders}`;

    // 데이터 행 생성
    const rows = session.dataPoints.map(point => {
      const timestamp = point.timestamp;

      // 왼발 센서 데이터 (1-16)
      const leftValues = Array.from({ length: 16 }, (_, i) => {
        const sensorId = i + 1;
        return point.leftSensors[sensorId] ?? 0;
      }).join(',');

      // 오른발 센서 데이터 (1-16)
      const rightValues = Array.from({ length: 16 }, (_, i) => {
        const sensorId = i + 1;
        return point.rightSensors[sensorId] ?? 0;
      }).join(',');

      return `${timestamp},${leftValues},${rightValues}`;
    });

    return [headers, ...rows].join('\n');
  }

  /**
   * CSV 파일로 저장
   */
  async saveToCSV(session: DataCollectionSession, customPath?: string): Promise<string> {
    if (!RNFS) {
      throw new Error('File system not available. Please check react-native-fs installation.');
    }

    const csvContent = this.convertToCSV(session);

    if (!csvContent) {
      throw new Error('No data to save');
    }

    // 기본 저장 경로 설정 (Downloads 폴더)
    const fileName = `sensor_data_${session.sessionId}_${new Date(session.startTime).toISOString().split('T')[0]}.csv`;

    let filePath: string;
    filePath = customPath || `${RNFS.DownloadDirectoryPath}/${fileName}`;

    console.log('📄 File will be saved to:', filePath);

    try {
      await RNFS.writeFile(filePath, csvContent, 'utf8');
      console.log(`[SensorDataCollector] Saved CSV file: ${filePath}`);
      return filePath;
    } catch (error) {
      console.error('[SensorDataCollector] Failed to save CSV file:', error);
      throw error;
    }
  }

  /**
   * 현재 세션 상태 확인
   */
  getCurrentSession(): DataCollectionSession | null {
    return this.currentSession;
  }

  /**
   * 세션 초기화 (다음 세션 준비)
   */
  resetSession(): void {
    this.currentSession = null;
  }

  /**
   * 데이터 통계 정보 반환 (디버깅용)
   */
  getSessionStats(session?: DataCollectionSession): {
    totalPoints: number;
    durationMs: number;
    avgDataRate: number; // Hz
    leftSensorIds: number[];
    rightSensorIds: number[];
  } | null {
    const targetSession = session || this.currentSession;
    if (!targetSession || targetSession.dataPoints.length === 0) {
      return null;
    }

    const totalPoints = targetSession.dataPoints.length;
    const durationMs = targetSession.dataPoints[targetSession.dataPoints.length - 1].timestamp - targetSession.startTime;
    const avgDataRate = durationMs > 0 ? (totalPoints / durationMs) * 1000 : 0;

    const leftSensorIds = [...new Set(
      targetSession.dataPoints.flatMap(point => Object.keys(point.leftSensors).map(Number))
    )].sort((a, b) => a - b);

    const rightSensorIds = [...new Set(
      targetSession.dataPoints.flatMap(point => Object.keys(point.rightSensors).map(Number))
    )].sort((a, b) => a - b);

    return {
      totalPoints,
      durationMs,
      avgDataRate,
      leftSensorIds,
      rightSensorIds,
    };
  }
}

// 싱글톤 인스턴스
export const sensorDataCollector = new SensorDataCollector();
