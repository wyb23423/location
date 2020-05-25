import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, TextInput, Text } from 'react-native';
import { TextInputLayout } from 'rn-textinputlayout';
import Picker from 'react-native-picker';
import { SetStateAction, commonStyles } from '../common';
import { http, SERVER } from '../../lib/http';

export interface Vector3<T = string> {
    x: T;
    y: T;
    z: T;
}
export const Vector3Keys: Array<keyof Vector3> = ['x', 'y', 'z'];

// 基站编号
export function useBaseId() {
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

    const el = (
        <View style={styles.inputLayout}>
            <View style={styles.flex}>
                <TextInputLayout style={{ width: '95%', marginRight: 5 }} checkValid={checkValid}>
                    <TextInput
                        style={styles.textInput}
                        placeholder='基站编号'
                        value={baseId}
                        onChange={({ nativeEvent: { text } }) => setBaseId(text)}
                    />
                </TextInputLayout>
                <Text style={commonStyles.icon}>&#xe601;</Text>
            </View>
            <Text style={{ color: '#e00' }}>{errMsg}</Text>
        </View>
    );

    return { baseId, el, checkValid, setBaseId };
}

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

    const el = Vector3Keys.map(k =>
        <View style={styles.inputLayout} key={k}>
            <TextInputLayout checkValid={v => checkValid(v, k)}>
                <TextInput
                    style={styles.textInput}
                    placeholder={k}
                    value={coordinate[k]}
                    onChange={({ nativeEvent: { text } }) => setCoordinate({ ...coordinate, [k]: text })}
                />
            </TextInputLayout>
            <Text style={{ color: '#e00' }}>{errMsg[k]}</Text>
        </View>
    );

    return { coordinate, el, checkValid, setCoordinate };
}

// 地图
export function useMap() {
    const [mapID, setMap] = useState(-1);

    const [errMsg, setErrMsg] = useState('');
    const checkValid = useCallback((value: string) => {
        if (value == null || value === '') {
            setErrMsg('不能为空');
            return false;
        }

        setErrMsg('');
        return true;
    }, []);

    const [visible, setVisible] = useMapPicker(setMap, checkValid);
    const showPicker = useCallback(() => {
        visible ? Picker.hide() : Picker.show();
        setVisible(!visible);
    }, [visible]);


    const el = (
        <View onTouchEnd={showPicker} style={styles.inputLayout}>
            <TextInputLayout>
                <TextInput
                    style={{ ...styles.textInput, color: '#000' }}
                    editable={false}
                    value={mapID >= 0 ? mapID + '' : void 0}
                    placeholder='地图'
                />
            </TextInputLayout>
            <Text style={{ color: '#e00' }}>{errMsg}</Text>
        </View>
    );

    return { mapID, el, checkValid, showPicker, visible, setMap };
}

async function initMapOptions() {
    let options = [];
    try {
        console.log(1111111111111)
        const res = await http.get(SERVER + '/api/map/getall');
        console.log(2222222222222222);
    } catch (e) {
        console.log(33333333333333);
        console.log(`${e.status}: ${e.statusText}`);
    }
}
// 创建地图选择器
function useMapPicker(
    setMap: SetStateAction<number>,
    checkValid: (value: string) => boolean
): [boolean, SetStateAction<boolean>] {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const data = [];
        for (var i = 0; i < 100; i++) {
            data.push(i);
        }

        Picker.init({
            pickerData: data,
            selectedValue: [data[0]],
            pickerTitleText: '选择地图',
            pickerConfirmBtnText: '确认',
            pickerCancelBtnText: '取消',
            pickerBg: [255, 255, 255, 1],
            pickerToolBarBg: [255, 255, 255, 1],
            onPickerConfirm: data => {
                setMap(data[0]);
                Picker.select(data);
                checkValid(data[0]);
                setVisible(false);
            },
            onPickerCancel() {
                setVisible(false);
            }
        });
    }, []);

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
