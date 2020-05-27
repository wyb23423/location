import React from 'react';
import { StyleSheet, Dimensions, View, TextInput } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
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

/**
 * 用于点击空白处关闭软件盘
 */
export function HideKeyBorde() {
    return (
        <View
            style={commonStyles.modal}
            onTouchEnd={() => TextInput.State.blurTextInput(TextInput.State.currentlyFocusedField())}
        ></View>
    )
}

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
    },
    modal: {
        backgroundColor: '#fff',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        minHeight: Dimensions.get('window').height
    },
});

// 从错误表中移除数据
export function removeErrorData(key: string) {
    AsyncStorage.removeItem(key)
        .then(() => AsyncStorage.getAllKeys())
        .then(keys => events.emit(SET_ERROR_COUNT, keys.filter(k => k.startsWith(ERROR_KEY)).length))
        .catch(console.log);
}