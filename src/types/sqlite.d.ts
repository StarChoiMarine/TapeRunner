declare module 'react-native-sqlite-storage' {
  export interface ResultSet {
    rows: { length: number; item: (index: number) => any };
    insertId?: number;
    rowsAffected?: number;
  }

  export interface SQLiteDatabase {
    executeSql(sqlStatement: string, params?: any[]): Promise<[ResultSet]>;
    close(): Promise<void>;
  }

  export interface SQLiteStatic {
    enablePromise(enabled: boolean): void;
    openDatabase(options: { name: string; location: 'default' }, success?: any, error?: any): Promise<SQLiteDatabase>;
  }

  const SQLite: SQLiteStatic;

  // 선언 병합으로 타입 네임스페이스 제공 (SQLite.SQLiteDatabase 사용 가능)
  namespace SQLite {
    interface SQLiteDatabase {
      executeSql(sqlStatement: string, params?: any[]): Promise<[ResultSet]>;
      close(): Promise<void>;
    }
  }

  export default SQLite;
}


