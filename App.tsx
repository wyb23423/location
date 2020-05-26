import 'react-native-gesture-handler';
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text } from 'react-native';
import { events, SET_ERROR_COUNT } from './src/lib/events';

import BaseForm from './src/views/BaseForm/BaseForm';
import ScannerScreen from './src/views/ScannerScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const icons = {
    BaseForm: '\ue75d',
    ErrorList: '\ue6c3'
}


function BaseFormTab() {
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
            <Tab.Screen name="ErrorList" component={BaseForm} options={{ title: '失败列表' }} />
        </Tab.Navigator>
    )
}

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ header: () => null }}>
                <Stack.Screen name="BaseFormTab" component={BaseFormTab}></Stack.Screen>
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
                <View
                    style={{
                        position: 'absolute',
                        right: -7,
                        top: -7,
                        backgroundColor: 'red',
                        borderRadius: 8,
                        width: 15,
                        height: 15,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                        {badgeCount}
                    </Text>
                </View>
            )}
        </View>
    );
}