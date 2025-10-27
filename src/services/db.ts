import SQLite from 'react-native-sqlite-storage';

// Android에서 기본 동작 최적화
SQLite.enablePromise(true);

const DB_NAME = 'taperunner.db';
const DB_DISPLAY = 'TapeRunner Local DB';
const DB_SIZE = 5 * 1024 * 1024;

export type FinalAnalysisRow = {
  id?: number;
  sessionId: string;
  startedAt: string;
  durationSec: number;
  left: Record<number, number>;
  right: Record<number, number>;
  aiText: string;
  aiCreatedAt: string;
  tapeVideoUrl: string | null;
  createdAt?: string;
};

let dbInstance: SQLite.SQLiteDatabase | null = null;

async function getDB(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) return dbInstance;
  dbInstance = await SQLite.openDatabase({
    name: DB_NAME,
    location: 'default',
  }, undefined, undefined);
  await migrate(dbInstance);
  return dbInstance;
}

async function migrate(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS final_analyses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      started_at TEXT NOT NULL,
      duration_sec INTEGER NOT NULL,
      left_json TEXT NOT NULL,
      right_json TEXT NOT NULL,
      ai_text TEXT NOT NULL,
      ai_created_at TEXT NOT NULL,
      tape_video_url TEXT,
      created_at TEXT NOT NULL
    );
  `);
  // 간단한 인덱스
  await db.executeSql(`CREATE INDEX IF NOT EXISTS idx_final_analyses_session ON final_analyses(session_id);`);
  await db.executeSql(`CREATE UNIQUE INDEX IF NOT EXISTS uniq_final_analyses_session ON final_analyses(session_id);`);

  // 마이그레이션: 기존 테이블에 left_json/right_json 누락 시 추가
  const [info] = await db.executeSql(`PRAGMA table_info(final_analyses);`);
  const cols: string[] = [];
  const len = info.rows.length;
  for (let i = 0; i < len; i++) {
    // @ts-ignore
    const r = info.rows.item(i);
    cols.push(String(r.name));
  }
  if (!cols.includes('left_json')) {
    await db.executeSql(`ALTER TABLE final_analyses ADD COLUMN left_json TEXT NOT NULL DEFAULT '{}';`);
  }
  if (!cols.includes('right_json')) {
    await db.executeSql(`ALTER TABLE final_analyses ADD COLUMN right_json TEXT NOT NULL DEFAULT '{}';`);
  }
}

export async function saveFinalAnalysis(row: FinalAnalysisRow): Promise<number> {
  const db = await getDB();
  const createdAt = new Date().toISOString();
  const [res] = await db.executeSql(
    `INSERT INTO final_analyses(session_id, started_at, duration_sec, left_json, right_json, ai_text, ai_created_at, tape_video_url, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      row.sessionId,
      row.startedAt,
      row.durationSec,
      JSON.stringify(row.left || {}),
      JSON.stringify(row.right || {}),
      row.aiText,
      row.aiCreatedAt,
      row.tapeVideoUrl ?? null,
      createdAt,
    ],
  );
  // @ts-ignore
  const insertId: number = res.insertId as number;
  return insertId;
}

export async function getAllFinalAnalyses(): Promise<FinalAnalysisRow[]> {
  const db = await getDB();
  const [res] = await db.executeSql(
    `SELECT id, session_id as sessionId, started_at as startedAt, duration_sec as durationSec,
            left_json as leftJson, right_json as rightJson,
            ai_text as aiText, ai_created_at as aiCreatedAt, tape_video_url as tapeVideoUrl, created_at as createdAt
       FROM final_analyses
       ORDER BY id DESC;`
  );
  const rows: FinalAnalysisRow[] = [];
  const len = res.rows.length;
  for (let i = 0; i < len; i++) {
    // @ts-ignore
    const it = res.rows.item(i);
    rows.push({
      id: it.id,
      sessionId: it.sessionId,
      startedAt: it.startedAt,
      durationSec: it.durationSec,
      left: safeParseJsonMap(it.leftJson),
      right: safeParseJsonMap(it.rightJson),
      aiText: it.aiText,
      aiCreatedAt: it.aiCreatedAt,
      tapeVideoUrl: it.tapeVideoUrl,
      createdAt: it.createdAt,
    });
  }
  return rows;
}

export async function clearAllFinalAnalyses(): Promise<void> {
  const db = await getDB();
  await db.executeSql('DELETE FROM final_analyses;');
}

export async function hasFinalAnalysis(sessionId: string): Promise<boolean> {
  const db = await getDB();
  const [res] = await db.executeSql(
    `SELECT 1 as v FROM final_analyses WHERE session_id = ? LIMIT 1;`,
    [sessionId]
  );
  // @ts-ignore
  return res.rows.length > 0;
}

function safeParseJsonMap(input: string | null | undefined): Record<number, number> {
  if (!input) return {};
  try {
    const obj = JSON.parse(input);
    return obj || {};
  } catch {
    return {};
  }
}


