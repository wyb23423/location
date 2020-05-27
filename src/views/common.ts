import { StyleSheet, AsyncStorage } from 'react-native';
import { events, SET_ERROR_COUNT } from '../lib/events';

export type SetStateAction<T> = React.Dispatch<React.SetStateAction<T>>;
export interface Vector3 {
    x: string;
    y: string;
    z: string;
}
export interface InstallData {
    baseId: string;
    coordinate: Vector3;
    mapData: string;
}
export type RouteParamList = Record<'BaseForm' | 'TabNavigator' | 'ScannerScreen', undefined>;

export const Vector3Keys: Array<keyof Vector3> = ['x', 'y', 'z'];
export const BASE_KEY = 'BASE_'; // 所有基站数据在缓存中存在的段
export const ERROR_KEY = 'ERR_'; // 提交失败的数据在缓存中的前缀

export const commonStyles = StyleSheet.create({
    icon: {
        fontFamily: 'iconfont',
        fontSize: 24
    },
    primay: {
        backgroundColor: '#409eff',
        borderColor: '#409eff'
    },
    primayDisable: {
        backgroundColor: '#a0cfff',
        borderColor: '#a0cfff'
    },
    success: {
        backgroundColor: '#67c23a',
        borderColor: '#67c23a'
    },
    successDisable: {
        backgroundColor: '#b3e19d',
        borderColor: '#b3e19d'
    },
    buttonText: {
        color: '#fff'
    }
});

// 从错误表中移除数据
export function removeErrorData(key: string) {
    AsyncStorage.removeItem(key)
        .then(() => AsyncStorage.getAllKeys())
        .then(keys => events.emit(SET_ERROR_COUNT, keys.filter(k => k.startsWith(ERROR_KEY)).length))
        .catch(console.log);
}