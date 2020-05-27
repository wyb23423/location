import React, { useState, useEffect, useCallback } from 'react';
import { View, AsyncStorage, ListRenderItemInfo, StyleSheet, Text, Dimensions } from "react-native";
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs/lib/typescript/src/types';
import { RouteParamList, InstallData, removeErrorData, ERROR_KEY } from './common';
import { FlatList } from 'react-native-gesture-handler';
import { events, SET_BASEID, SET_COORDINATE, SET_MAP } from '../lib/events';

const ITEM_HEIGHT = 40;
const height = Dimensions.get('window').height;

export function ErrorList({ navigation }: BottomTabScreenProps<RouteParamList>) {
    const [list, setList] = useState<string[]>([]);
    const [update, setUpdate] = useState(0);

    useEffect(() => {
        return navigation.addListener('focus', () => {
            AsyncStorage.getAllKeys((err, keys) => {
                if (err || !keys) return;

                setList(keys.filter(k => k.startsWith(ERROR_KEY)));
            });
        });
    }, [navigation]);

    const onPress = useCallback((index: number, isEdit?: boolean) => {
        if (isEdit) {
            navigation.goBack();
        } else {
            const key = list.splice(index, 1)[0];
            setList(list);
            setUpdate(pre => pre + 1);

            removeErrorData(key);
        }
    }, [list]);

    const goBack = useCallback(() => navigation.goBack(), []);
    const remove = useCallback((index: number) => {
        const key = list.splice(index, 1)[0];
        setList(list);
        setUpdate(pre => pre + 1);

        removeErrorData(key);
    }, [list])

    if (!list.length) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: '#ccc', fontSize: 200, fontFamily: 'iconfont' }}>&#xe62b;</Text>
                <Text style={{ fontSize: 24, color: '#ccc', marginTop: 20 }}>暂无数据</Text>
            </View>
        );
    }

    return (
        <FlatList
            extraData={update}
            data={list}
            renderItem={itemInfo => <ListItem {...itemInfo} onRemove={remove} goBack={goBack} />}
            ItemSeparatorComponent={() => <View style={styles.divider} />}
            getItemLayout={(_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
            initialNumToRender={Math.ceil(height / ITEM_HEIGHT)}
            keyExtractor={item => item}
            ListFooterComponent={() => (
                list.length > Math.ceil(height / ITEM_HEIGHT) ?
                    <Text style={styles.footer}>已经到底了ヾ(*>∀＜*)(ﾉ∀｀●)⊃</Text>
                    : null
            )}
        />
    );
}

type ListItemProps = ListRenderItemInfo<string> & { onRemove?(index: number): void, goBack?(): void };
function ListItem({ item, index, onRemove, goBack }: ListItemProps) {
    const edit = useCallback(async () => {
        const data = await AsyncStorage.getItem(item);
        if (!data) {
            return onRemove?.(index);
        }

        const dataObj: InstallData = JSON.parse(data);
        events
            .emit(SET_BASEID, dataObj.baseId)
            .emit(SET_COORDINATE, dataObj.coordinate)
            .emit(SET_MAP, dataObj.mapData);
        goBack?.();
    }, []);

    return (
        <View style={styles.itemContanier}>
            <Text style={{ width: '80%', fontSize: 18 }}>{item.slice(-8)}</Text>
            <View style={{ flexDirection: 'row' }}>
                <Text
                    style={{ marginRight: 20, color: '#409eff', fontSize: 18, fontFamily: 'iconfont' }}
                    onPress={edit}
                >
                    &#xebd2;
                </Text>
                <Text
                    style={{ color: '#e00', fontSize: 18, fontFamily: 'iconfont' }}
                    onPress={() => onRemove?.(index)}
                >
                    &#xe908;
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    itemContanier: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 36,
        height: ITEM_HEIGHT
    },
    divider: {
        height: 1,
        backgroundColor: '#dcdfe6',
        marginVertical: 5,
        marginHorizontal: 30
    },
    footer: {
        borderTopColor: '#dcdfe6',
        borderTopWidth: 1,
        marginTop: 5,
        color: '#ccc',
        textAlign: 'center',
        paddingVertical: 20
    }
})
