import { Platform, PermissionsAndroid } from 'react-native';

export async function ensureBlePermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;

  try {
    const sdk = Platform.Version as number;
    if (sdk >= 31) {
      const scan = await PermissionsAndroid.request(
        'android.permission.BLUETOOTH_SCAN',
        { title: 'Bluetooth 권한', message: '주변 기기 스캔을 위해 권한이 필요합니다.', buttonPositive: '확인' }
      );
      const conn = await PermissionsAndroid.request(
        'android.permission.BLUETOOTH_CONNECT',
        { title: 'Bluetooth 권한', message: '기기 연결을 위해 권한이 필요합니다.', buttonPositive: '확인' }
      );
      return scan === PermissionsAndroid.RESULTS.GRANTED && conn === PermissionsAndroid.RESULTS.GRANTED;
    } else {
      const coarse = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        { title: '위치 권한', message: 'BLE 스캔을 위해 위치 권한이 필요합니다.', buttonPositive: '확인' }
      );
      const fine = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        { title: '정확한 위치 권한', message: '더 나은 스캔을 위해 권한이 필요합니다.', buttonPositive: '확인' }
      );
      return coarse === PermissionsAndroid.RESULTS.GRANTED || fine === PermissionsAndroid.RESULTS.GRANTED;
    }
  } catch {
    return false;
  }
}


