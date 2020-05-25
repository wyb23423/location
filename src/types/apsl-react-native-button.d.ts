declare module 'apsl-react-native-button' {
    import { ViewStyle, TextStyle, BackgroundPropType } from 'react-native';

    interface ButtonProps {
        style: ViewStyle;
        textStyle: TextStyle;
        disabledStyle: TextStyle;
        isLoading: boolean;
        isDisabled: boolean;
        activeOpacity: number;
        activityIndicatorColor: string;
        background: BackgroundPropType; // Android only

        onPress: (ev: NativeSyntheticEvent<NativeTouchEvent>) => void;
        onPressIn: (ev: NativeSyntheticEvent<NativeTouchEvent>) => void;
        onPressOut: (ev: NativeSyntheticEvent<NativeTouchEvent>) => void;
        onLongPress: (ev: NativeSyntheticEvent<NativeTouchEvent>) => void;
    }

    export default class Button extends React.Component<Partial<ButtonProps>> {

    }
}