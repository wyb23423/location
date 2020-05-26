import { StyleSheet } from 'react-native';

export type SetStateAction<T> = React.Dispatch<React.SetStateAction<T>>;

export interface Vector3<T = string> {
    x: T;
    y: T;
    z: T;
}

export interface InstallData<T = number> {
    baseId: string;
    coordinate: Vector3<T>;
    mapId: number;
}

export type RouteParamList = {
    BaseForm: undefined;
    BaseFormTab: undefined;
    ScannerScreen: undefined;
}

export const Vector3Keys: Array<keyof Vector3> = ['x', 'y', 'z'];

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
    }
});