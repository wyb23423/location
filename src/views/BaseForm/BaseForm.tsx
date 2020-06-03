import React, { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import { StyleSheet, View, Text } from 'react-native';
import { commonStyles, RouteParamList, InstallData, Vector3Keys, removeErrorData, BASE_KEY, ERROR_KEY, HideKeyBorde } from '../common';
import Button from 'apsl-react-native-button'
import { events, SET_ERROR_COUNT } from '../../lib/events';
import { useBaseId, useCoordinate, useMap } from './Component';
import { http, getSERVER } from '../../lib/http';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export default function BaseForm({ navigation }: BottomTabScreenProps<RouteParamList>) {
    const { baseId, el: baseIdEl, checkValid: checkBaseIdValid } = useBaseId(navigation);
    const { coordinate, el: coordinateEl, checkValid: checkCoordinateValid } = useCoordinate();
    const { mapData, el: mapEl, checkValid: checkMapVaild, showPicker, visible } = useMap(navigation);

    const [dataCount, setDataCount] = useState(0); // 缓存中数据的数量
    const [submitCount, setSubmitCount] = useState(0); // 提交中的数据数量
    const [_, setErrorCount] = useState(0); // 提交失败的数据数量

    useEffect(() => {
        events.on(SET_ERROR_COUNT, (count: number, shouldSet = true) => shouldSet && setErrorCount(count));

        AsyncStorage.getAllKeys((err, keys) => {
            if (err) return console.log(err);

            let reduce = 0;
            const ec = keys!.filter(k => {
                if (!k.includes(BASE_KEY)) reduce++; // 排除非基站数据的影响
                return k.startsWith(ERROR_KEY);
            }).length;
            setDataCount(keys!.length - ec - reduce);
            events.emit(SET_ERROR_COUNT, ec);
        });
    }, []);

    // 提交一条数据
    const _submit = useCallback(async (k: string, data?: InstallData) => {
        if (!k.includes(BASE_KEY)) k = BASE_KEY + k;

        try {
            if (!data) {
                const storageData = await AsyncStorage.getItem(k);
                if (!storageData) {
                    return;
                }

                data = JSON.parse(storageData);
            }

            await http.post(getSERVER() + '/api/base/init', {
                baseId: data!.baseId,
                coordinate: data!.coordinate,
                mapId: +data!.mapData.split(':')[0]
            }, {
                'Content-Type': 'application/json'
            });
        } catch (e) {
            data && AsyncStorage.setItem(ERROR_KEY + k, JSON.stringify(data));
            setErrorCount(pre => {
                events.emit(SET_ERROR_COUNT, pre + 1, false);
                return pre + 1;
            });
        }

        await AsyncStorage.removeItem(k);
        setDataCount(pre => pre - 1);
        setSubmitCount(pre => pre - 1);
    }, []);

    // 将数据添加到缓存
    const add = useCallback(async () => {
        // 检测表单是否有效
        const baseIdValid = checkBaseIdValid(baseId);
        let coordinateValid = true;
        for (const k of Vector3Keys) {
            if (!checkCoordinateValid(coordinate[k], k)) {
                coordinateValid = false;
            }
        }
        const mapValid = checkMapVaild(mapData);

        if (!(baseIdValid && coordinateValid && mapValid)) {
            return;
        }

        try {
            const data: InstallData = { baseId: baseId.padStart(8, '0'), coordinate, mapData };
            // 从错误表中移除数据
            removeErrorData(ERROR_KEY + BASE_KEY + data.baseId);

            // 判断是否新增
            const oldData = await AsyncStorage.getItem(BASE_KEY + data.baseId);
            oldData || setDataCount(pre => pre + 1);

            // 设置缓存
            await AsyncStorage.setItem(BASE_KEY + data.baseId, JSON.stringify(data));

            setSubmitCount(pre => {
                // 正在提交, 立即提交数据
                if (pre > 0) {
                    pre++;
                    _submit(data.baseId, data);
                }

                return pre;
            });
        } catch (e) {
            console.log(e);
        }
    }, [baseId, coordinate, mapData]);

    // 提交缓存中的数据
    const submit = useCallback(() => {
        AsyncStorage.getAllKeys().then(keys => {
            const baseKeys = keys.filter(k => k.startsWith(BASE_KEY));
            setSubmitCount(baseKeys.length);

            const fn = () => {
                const k = baseKeys.shift();
                if (!k) {
                    return;
                }

                _submit(k);
                setTimeout(fn, 100);
            }
            fn();

            // setSubmitCount(keys.filter(k => {
            //     if (!k.startsWith(BASE_KEY)) return false;

            //     _submit(k);
            //     return true;
            // }).length);
        }).catch(console.log);
    }, []);

    return (
        <View>
            {/* 用于点击空白处关闭软件盘 */}
            <HideKeyBorde />

            {baseIdEl}
            {coordinateEl}
            {mapEl}

            <View style={styles.buttonGroup}>
                <Button
                    style={{ ...commonStyles.primay, width: '30%', marginRight: 20 }}
                    textStyle={commonStyles.buttonText}
                    onPress={add}
                >
                    添加
                </Button>
                <View style={{ width: '30%', position: 'relative' }}>
                    <Button
                        style={commonStyles.success}
                        disabledStyle={commonStyles.successDisable}
                        textStyle={commonStyles.buttonText}
                        isDisabled={dataCount <= 0 || submitCount > 0}
                        isLoading={submitCount > 0}
                        onPress={submit}
                    >
                        提交
                    </Button>
                    {dataCount > 0 ? <Text style={styles.badge}>{dataCount}</Text> : null}
                </View>
            </View>

            {visible && <View style={[commonStyles.modal, { backgroundColor: 'rgba(0, 0, 0, 0.6)' }]} onTouchEnd={showPicker} />}
        </View>
    );
}

// ============================================================
const styles = StyleSheet.create({
    buttonGroup: {
        flex: 1,
        flexDirection: 'row',
        marginTop: 32,
        height: 40,
        marginHorizontal: 36,
        justifyContent: 'flex-start',
        alignItems: 'stretch'
    },
    badge: {
        position: 'absolute',
        top: -6,
        right: -6,
        height: 20,
        width: 20,
        textAlignVertical: 'center',
        textAlign: 'center',
        backgroundColor: '#e00',
        color: '#fff',
        borderRadius: 10,
        fontSize: 10
    }
});
