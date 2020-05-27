import 'react-native-gesture-handler';
import * as React from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, TextInput, StyleSheet } from 'react-native';

import { events, SET_ERROR_COUNT } from './lib/events';
import { http, getSERVER, setSERVER } from './lib/http';

import BaseForm from './views/BaseForm/BaseForm';
import ScannerScreen from './views/ScannerScreen';
import { ErrorList } from './views/ErrorList';

import { HideKeyBorde } from './views/common';
import Button from 'apsl-react-native-button'

import { TextInputLayout } from 'rn-textinputlayout';
import { styles as inputStyles } from './views/BaseForm/Component';


const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const icons = {
    BaseForm: '\ue75d',
    ErrorList: '\ue6c3'
}

function TabNavigator() {
    const [badgeCount, setBadgeCount] = React.useState(0);
    const setCount = React.useCallback((count: number) => setBadgeCount(Math.min(count, 99)), []);

    React.useEffect(() => { events.on(SET_ERROR_COUNT, setCount) }, []);

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ color }) =>
                    <IconWithBadge
                        icon={icons[route.name as keyof typeof icons]}
                        size={20}
                        color={color}
                        badgeCount={route.name === 'ErrorList' ? badgeCount : 0}
                    />
            })}
        >
            <Tab.Screen name="BaseForm" component={BaseForm} options={{ title: '基站录入' }} />
            <Tab.Screen name="ErrorList" component={ErrorList} options={{ title: '失败列表' }} />
        </Tab.Navigator>
    );
}

export default function App() {
    const [ready, setReady] = React.useState(false);

    const resolveServer = React.useCallback(() => {
        http.post({
            url: getSERVER() + '/api/admin/login',
            body: { password: '123456', username: 'laienwei' },
            headers: { 'Content-Type': 'application/json' }
        })
            .catch(console.log)
            .finally(() => setReady(true));
    }, []);

    if (!ready) {
        return <ServerInput resolve={resolveServer} />;
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ header: () => null }}>
                <Stack.Screen name="TabNavigator" component={TabNavigator}></Stack.Screen>
                <Stack.Screen name="ScannerScreen" component={ScannerScreen}></Stack.Screen>
            </Stack.Navigator>
        </NavigationContainer>
    );
}

interface IconWithBadgeProps {
    icon: string;
    badgeCount: number;
    color: string;
    size: number;
}
function IconWithBadge({ icon, badgeCount, color, size }: IconWithBadgeProps) {
    return (
        <View style={{ width: 24, height: 24, margin: 5 }}>
            <Text style={{ fontFamily: 'iconfont', fontSize: size, color }}>{icon}</Text>
            {badgeCount > 0 && (
                <View style={styles.badge}>
                    <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                        {badgeCount}
                    </Text>
                </View>
            )}
        </View>
    );
}

// 确定服务器地址
function ServerInput({ resolve }: { resolve?(): void }) {
    const [server, setServer] = React.useState(getSERVER());
    React.useEffect(() => {
        (async () => {
            const data = await AsyncStorage.getItem('SERVER');
            data && setServer(data);
        })()
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

    const done = React.useCallback(() => {
        if (!checkValid(server)) {
            return;
        }
        AsyncStorage.setItem('SERVER', server);
        setSERVER(server);

        resolve?.();
    }, [server]);

    return (
        <View style={{ flex: 1, justifyContent: 'center' }}>
            <HideKeyBorde />
            <View style={inputStyles.inputLayout}>
                <TextInputLayout checkValid={checkValid}>
                    <TextInput
                        style={inputStyles.textInput}
                        placeholder="服务器地址"
                        value={server}
                        onChange={({ nativeEvent: { text } }) => setServer(text)}
                    />
                </TextInputLayout>
                <Text style={{ color: '#e00' }}>{valid ? '' : '无效地址'}</Text>
            </View>
            <Button style={styles.done} textStyle={{ fontWeight: '700' }} onPress={done}>Done</Button>
        </View>
    )
}

const styles = StyleSheet.create({
    badge: {
        position: 'absolute',
        right: -7,
        top: -7,
        backgroundColor: 'red',
        borderRadius: 8,
        width: 15,
        height: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    done: {
        position: 'absolute',
        right: 10,
        bottom: 10,
        width: 60,
        borderWidth: 0,
    }
})