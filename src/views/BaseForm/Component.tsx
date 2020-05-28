import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, TextInput, Text } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { TextInputLayout } from 'rn-textinputlayout';
import Picker from 'react-native-picker';
import { SetStateAction, commonStyles, RouteParamList, Vector3, Vector3Keys } from '../common';
import { http, getSERVER } from '../../lib/http';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { events, SET_COORDINATE, SET_BASEID, SET_MAP } from '../../lib/events';

// ========================================================================
// 基站编号
export function useBaseId(navigation: BottomTabNavigationProp<RouteParamList>) {
    const [baseId, setBaseId] = useState('');
    const [errMsg, setErrMsg] = useState('');

    const checkValid = useCallback((value: string) => {
        if (value == null || value === '') {
            setErrMsg('不能为空');
            return false;
        }

        if (!/^[0-9A-Fa-f]{1,8}$/.test(value)) {
            setErrMsg('必须是一个长度不大于8的16进制字符串');
            return false;
        }

        setErrMsg('');
        return true;
    }, []);

    useEffect(() => { events.on(SET_BASEID, setBaseId) }, []);

    const el = (
        <View style={styles.inputLayout}>
            <View style={styles.flex}>
                <TextInputLayout style={{ width: '95%', marginRight: 5 }} checkValid={checkValid}>
                    <TextInput
                        maxLength={8}
                        style={styles.textInput}
                        placeholder='基站编号'
                        value={baseId}
                        onChange={({ nativeEvent: { text } }) => setBaseId(text)}
                    />
                </TextInputLayout>
                <Text
                    style={commonStyles.icon}
                    onPress={() => navigation.navigate('ScannerScreen')}
                >
                    &#xe601;
                </Text>
            </View>
            <Text style={{ color: '#e00' }}>{errMsg}</Text>
        </View>
    );

    return { baseId, el, checkValid };
}

// ========================================================================
// 坐标
export function useCoordinate() {
    const [coordinate, setCoordinate] = useState({} as Vector3);
    const [errMsg, setErrMsg] = useState({ x: '', y: '', z: '' });

    const checkValid = useCallback((value: string, key: keyof Vector3) => {
        let res = false;
        if (value == null || value === '') {
            errMsg[key] = '不能为空';
        } else if (isNaN(+value)) {
            errMsg[key] = '必须为有效数字'
        } else if (+value < 0) {
            errMsg[key] = '不能为负值';
        } else {
            errMsg[key] = '';
            res = true;
        }

        setErrMsg(errMsg);
        return res;
    }, []);

    useEffect(() => { events.on(SET_COORDINATE, setCoordinate) }, []);

    const el = Vector3Keys.map(k =>
        <View style={styles.inputLayout} key={k}>
            <TextInputLayout checkValid={v => checkValid(v, k)}>
                <TextInput
                    keyboardType="numeric"
                    style={styles.textInput}
                    placeholder={k}
                    value={coordinate[k]}
                    onChange={({ nativeEvent: { text } }) => setCoordinate({ ...coordinate, [k]: text })}
                />
            </TextInputLayout>
            <Text style={{ color: '#e00' }}>{errMsg[k]}</Text>
        </View>
    );

    return { coordinate, el, checkValid };
}

// ========================================================================
// 地图
export function useMap(navigation: BottomTabNavigationProp<RouteParamList>) {
    const [mapData, setMap] = useState('');

    const [errMsg, setErrMsg] = useState('');
    const checkValid = useCallback((value: string) => {
        if (value == null || value === '') {
            setErrMsg('不能为空');
            return false;
        }

        setErrMsg('');
        return true;
    }, []);

    const [visible, setVisible] = useMapPicker(setMap, checkValid, navigation);
    const showPicker = useCallback(() => {
        TextInput.State.blurTextInput(TextInput.State.currentlyFocusedField());
        visible ? Picker.hide() : Picker.show();
        setVisible(!visible);
    }, [visible]);

    useEffect(() => { events.on(SET_MAP, setMap) }, []);

    const el = (
        <View onTouchEnd={showPicker} style={styles.inputLayout}>
            <TextInputLayout>
                <TextInput
                    style={{ ...styles.textInput, color: '#000' }}
                    caretHidden={true}
                    value={mapData}
                    placeholder='地图'
                />
            </TextInputLayout>
            <Text style={{ color: '#e00' }}>{errMsg}</Text>
        </View>
    );

    return { mapData, el, checkValid, showPicker, visible };
}

// 创建地图选择器
function useMapPicker(
    setMap: SetStateAction<string>,
    checkValid: (value: string) => boolean,
    navigation: BottomTabNavigationProp<RouteParamList>
): [boolean, SetStateAction<boolean>] {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        let data: string[] = [];

        return navigation.addListener('focus', async () => {
            if (!data.length) {
                const storage = await AsyncStorage.getItem('MAPS');
                storage && (data = JSON.parse(storage));
            }

            data.length || data.push('暂无数据');
            Picker.init({
                pickerData: data,
                selectedValue: [data[0]],
                pickerTitleText: '选择地图',
                pickerConfirmBtnText: '确认',
                pickerCancelBtnText: '取消',
                pickerBg: [255, 255, 255, 1],
                pickerToolBarBg: [255, 255, 255, 1],
                onPickerConfirm: data => {
                    if (data[0] !== '暂无数据') {
                        setMap(data[0]);
                        checkValid(data[0]);
                        Picker.select(data);
                    }

                    setVisible(false);
                },
                onPickerCancel() {
                    setVisible(false);
                }
            });
        });
    }, [navigation]);

    return [visible, setVisible];
}

// =============================================================
export const styles = StyleSheet.create({
    flex: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between'
    },
    textInput: {
        fontSize: 16,
        height: 40,
    },
    inputLayout: {
        marginTop: 5,
        marginHorizontal: 36,
    },
});
