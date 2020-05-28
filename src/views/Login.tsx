import React, { useEffect, useImperativeHandle, Ref, forwardRef, useRef, useState, useCallback } from 'react';
import { View, Image, TextInput, Text } from 'react-native';
import { useNetInfo } from "@react-native-community/netinfo";
import { commonStyles, HideKeyBorde } from './common';
import { styles as inputStyles } from './BaseForm/Component';
import AsyncStorage from '@react-native-community/async-storage';
import { getSERVER, http } from '../lib/http';
import { TextInputLayout } from 'rn-textinputlayout';
import Button from 'apsl-react-native-button';

interface RefHandler {
    getValue: () => string | void;
}

export default function Login({ resolve }: { resolve?(): void }) {
    const server = useRef<RefHandler>({ getValue: () => void 0 });
    const [user, setUser] = useState({ username: '', password: '' });
    const [err, setErr] = useState({ username: false, password: false });
    const [isLoging, setIsLoging] = useState(false);
    const netInfo = useNetInfo();

    useEffect(() => {
        (async () => {
            const data = await AsyncStorage.getItem('USER');
            data && setUser(JSON.parse(data));
        })();
    }, []);

    const checkValid = useCallback((value: string, k: 'username' | 'password') => {
        if (value == null || value == '') {
            setErr(pre => ({ ...pre, [k]: true }));
            return false;
        }

        setErr(pre => ({ ...pre, [k]: false }));
        return true;
    }, []);

    const login = async () => {
        const serverValue = server.current?.getValue();
        const usernameValid = checkValid(user.username, 'username');
        const passValid = checkValid(user.password, 'password');

        if (!(serverValue && usernameValid && passValid)) {
            return;
        }

        if (netInfo.isConnected) {
            setIsLoging(true);

            try {
                // 登录
                await http.post({
                    url: getSERVER() + '/api/admin/login',
                    body: user,
                    headers: { 'Content-Type': 'application/json' }
                });
                AsyncStorage.setItem('USER', JSON.stringify(user));

                // 获取地图数据
                const res = await http.get(getSERVER() + '/api/map/getall', {
                    currentPage: 1,
                    pageSize: 100000
                });
                AsyncStorage.setItem('MAPS', JSON.stringify(res.pagedData.datas.map(v => `${v.id}: ${v.name}`)));
            } catch (e) {
                setIsLoging(false);
                return alert('登录失败, 请重试!');
            }

            setIsLoging(false);
        }

        resolve?.();
    };

    const userArr: Array<{ key: 'username' | 'password', name: string }> = [
        { key: 'username', name: '用户名' },
        { key: 'password', name: '密码' }
    ];

    return (
        <View style={commonStyles.container}>
            <HideKeyBorde />
            <Image source={require('../logo.png')}></Image>
            <View style={{ width: '100%', marginTop: 30 }}>
                <ServerInput ref={server} />
                {
                    userArr.map(v => (
                        <View style={inputStyles.inputLayout}>
                            <TextInputLayout checkValid={value => checkValid(value, v.key)}>
                                <TextInput
                                    secureTextEntry={v.key === 'password'}
                                    keyboardType="url"
                                    style={inputStyles.textInput}
                                    placeholder={v.name}
                                    value={user[v.key]}
                                    onChange={({ nativeEvent: { text } }) => setUser(pre => ({ ...pre, [v.key]: text }))}
                                />
                            </TextInputLayout>
                            <Text style={{ color: '#e00' }}>{err[v.key] ? '不能为空' : ''}</Text>
                        </View>
                    ))
                }
                <Button
                    isDisabled={isLoging}
                    isLoading={isLoging}
                    onPress={login}
                    style={{
                        borderColor: commonStyles.primay.borderColor,
                        marginTop: 36,
                        marginHorizontal: 36,
                    }}
                    textStyle={{ color: commonStyles.primay.borderColor }}
                >
                    Login
                </Button>
            </View>
        </View>
    )
}

const ServerInput = forwardRef(ServerInputComponent);
function ServerInputComponent(_: {}, ref: Ref<RefHandler>) {
    const [server, setServer] = React.useState(getSERVER());
    useEffect(() => {
        (async () => {
            const data = await AsyncStorage.getItem('SERVER');
            data && setServer(data);
        })();
    }, []);

    const [valid, setValid] = React.useState(true);
    const checkValid = React.useCallback((value: string) => {
        const domainReg = '([a-zA-Z0-9]([a-zA-Z0-9\\-]{0,61}[a-zA-Z0-9])?\\.)+[a-zA-Z]{2,6}';
        const ipReg = '((2(5[0-5]|[0-4]\\d))|[0-1]?\\d{1,2})(\\.((2(5[0-5]|[0-4]\\d))|[0-1]?\\d{1,2})){3}';
        const portReg = '(\\d{1,4}|[1-5]\\d{4}|6[1-4]\\d{3}|65[1-4]\\d{2}|655[1-2]\\d|6553[1-5])';

        const reg = new RegExp(`^https?://(${domainReg}|${ipReg}|localhost)(:${portReg})?/?$`);
        const result = reg.test(value);
        setValid(result);
        return result;
    }, []);

    useImperativeHandle(ref, () => ({
        getValue() {
            if (checkValid(server)) {
                return server;
            }
        },
    }), [server]);

    return (
        <View style={inputStyles.inputLayout}>
            <TextInputLayout checkValid={checkValid}>
                <TextInput
                    keyboardType="url"
                    style={inputStyles.textInput}
                    placeholder="服务器地址"
                    value={server}
                    onChange={({ nativeEvent: { text } }) => setServer(text)}
                />
            </TextInputLayout>
            <Text style={{ color: '#e00' }}>{valid ? '' : '无效地址'}</Text>
        </View>
    );
}
