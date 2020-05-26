import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Text, View, StyleSheet, Animated, Easing, Dimensions, InteractionManager, StatusBar } from 'react-native';
import { Camera, BarCodeScanningResult } from 'expo-camera';
import * as Permissions from 'expo-permissions';
import { commonStyles } from './common';
import { BarCodeScanner } from 'expo-barcode-scanner';

const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;

function getPrepareRatio(ratios: string[]) {
    const wantedRatio = height / width
    let bestRatio = '4:3';
    let bestRatioError = 100000;
    for (const v of ratios) {
        const r = v.split(":");
        if (Math.abs(wantedRatio - +r[0] / +r[1]) < bestRatioError) {
            bestRatioError = Math.abs(wantedRatio - +r[0] / +r[1]);
            bestRatio = v;
        }
    }

    return bestRatio;
}

export default function ScannerScreen({ resolve }: { resolve?: (data: string) => any }) {
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean>();
    const [animation] = useState(new Animated.Value(0));
    const [show, setShow] = useState(true);
    const [ratio, setRatio] = useState('4:3');
    const camera = useRef<Camera>(null);

    useEffect(() => {
        (async () => {
            const { status } = await Permissions.askAsync(Permissions.CAMERA);
            setHasCameraPermission(status === Permissions.PermissionStatus.GRANTED);
        })();

        return () => setShow(false);
    }, []);

    const startAnimation = useCallback(() => {
        if (!show) return;

        animation.setValue(0);
        Animated.timing(animation, {
            toValue: 1,
            duration: 2000,
            easing: Easing.linear,
        }).start(startAnimation);
    }, [show]);
    const onCameraReady = useCallback(() => {
        // 获取可用的最佳分辨率
        camera.current?.getSupportedRatiosAsync()
            .then(getPrepareRatio)
            .then(setRatio);

        InteractionManager.runAfterInteractions(startAnimation);
    }, []);

    // 解析成功后函数
    const barcodeReceived = useCallback((e: BarCodeScanningResult) => e && resolve?.(e.data), []);

    if (hasCameraPermission === null) {
        return <View />;
    } else if (hasCameraPermission === false) {
        return <View style={{ flex: 1 }}><Text>No access to camera</Text></View>;
    }

    return (
        <Camera
            ref={camera}
            style={{ flex: 1, alignItems: 'center' }}
            type={Camera.Constants.Type.back}
            flashMode={Camera.Constants.FlashMode.auto}
            autoFocus={Camera.Constants.AutoFocus.on}
            barCodeScannerSettings={{
                barCodeTypes: [BarCodeScanner.Constants.BarCodeType.qr]
            }}
            onBarCodeScanned={barcodeReceived}
            onCameraReady={onCameraReady}
            ratio={ratio}
        >
            <StatusBar hidden={true} />
            <Text style={[commonStyles.icon, styles.back]} onPress={() => console.log(1)}>&#xe62d;</Text>
            <Animated.View style={[styles.animatedStyle, {
                transform: [{
                    translateY: animation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [height * 0.2, height * 0.8]
                    })
                }]
            }]}>
            </Animated.View>
        </Camera>
    );
}

const styles = StyleSheet.create({
    animatedStyle: {
        height: 2,
        width: '90%',
        backgroundColor: '#00c050'
    },
    back: {
        position: 'absolute',
        fontSize: 26,
        color: '#fff',
        top: 20,
        left: 20
    }
});
