import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, AsyncStorage, Dimensions } from 'react-native';
import { commonStyles, RouteParamList, InstallData, Vector3Keys } from '../common';
import Button from 'apsl-react-native-button'
import { events, SET_ERROR_COUNT } from '../../lib/events';
import { useBaseId, useCoordinate, useMap } from './Component';
import { http, SERVER } from '../../lib/http';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export default function BaseForm({ navigation }: BottomTabScreenProps<RouteParamList>) {
    const { baseId, el: baseIdEl, checkValid: checkBaseIdValid } = useBaseId(navigation);
    const { coordinate, el: coordinateEl, checkValid: checkCoordinateValid } = useCoordinate();
    const { mapID, el: mapEl, checkValid: checkMapVaild, showPicker, visible } = useMap(navigation);

    const [dataCount, setDataCount] = useState(0); // 缓存中数据的数量
    const [submitCount, setSubmitCount] = useState(0); // 提交中的数据数量
    const [errorCount, setErrorCount] = useState(0); // 提交失败的数据数量

    useEffect(() => {
        AsyncStorage.getAllKeys((err, keys) => {
            if (err) return console.log(err);

            const ec = keys!.filter(k => k.startsWith('ERR')).length;
            setDataCount(keys!.length - ec);
            setErrorCount(ec);
            events.emit(SET_ERROR_COUNT, ec);
        });
    }, []);

    // 提交一条数据
    const _submit = useCallback(async (k: string, data?: InstallData) => {
        try {
            if (!data) {
                const storageData = await AsyncStorage.getItem(k);
                if (!storageData) {
                    return;
                }

                data = JSON.parse(storageData);
            }

            await http.post(SERVER + '/api/base/init', data, {
                'Content-Type': 'application/json'
            });
        } catch (e) {
            data && AsyncStorage.setItem('ERR' + k, JSON.stringify(data));
            events.emit(SET_ERROR_COUNT, errorCount + 1);
            setErrorCount(errorCount + 1);
        }

        await AsyncStorage.removeItem(k);
        setDataCount(dataCount - 1);
        setSubmitCount(submitCount - 1);
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
        const mapValid = checkMapVaild(mapID < 0 ? '' : mapID + '');

        if (!(baseIdValid && coordinateValid && mapValid)) {
            return;
        }

        try {
            const data: InstallData = {
                baseId: baseId.padStart(8, '0'),
                coordinate: { x: +coordinate.x, y: +coordinate.y, z: +coordinate.z },
                mapId: mapID
            };
            // 从错误表中移除数据
            AsyncStorage.removeItem('ERR_' + data.baseId)
                .then(() => AsyncStorage.getAllKeys())
                .then(keys => {
                    const ec = keys.filter(k => k.startsWith('ERR')).length;
                    setErrorCount(ec);
                    events.emit(SET_ERROR_COUNT, ec);
                }).catch(console.log);

            // 判断是否新增
            const oldData = await AsyncStorage.getItem(data.baseId);
            oldData && setDataCount(dataCount + 1);

            // 设置缓存
            await AsyncStorage.setItem(data.baseId, JSON.stringify(data));

            // 正在提交, 立即提交数据
            if (submitCount > 0) {
                setSubmitCount(submitCount + 1)
                _submit(data.baseId, data);
            }
        } catch (e) {
            console.log(e);
        }
    }, [baseId, coordinate, mapID]);

    // 提交缓存中的数据
    const submit = useCallback(() => {
        AsyncStorage.getAllKeys().then(keys => {
            setSubmitCount(keys.filter(k => {
                if (k.startsWith('ERR')) return false;
                _submit(k);

                return true;
            }).length);
        }).catch(console.log);
    }, []);

    return (
        <View>
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

            {visible && <View style={styles.modal} onTouchEnd={showPicker} />}
        </View>
    );
}

// ============================================================
const styles = StyleSheet.create({
    modal: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        minHeight: Dimensions.get('window').height
    },
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
        top: -10,
        right: -10,
        height: 30,
        width: 30,
        textAlignVertical: 'center',
        textAlign: 'center',
        backgroundColor: '#e00',
        color: '#fff',
        borderRadius: 24,
    }
});
