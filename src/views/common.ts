import { StyleSheet, Dimensions } from 'react-native';

export type SetStateAction<T> = React.Dispatch<React.SetStateAction<T>>;

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