declare module 'rn-textinputlayout' {
    import { ViewStyle } from 'react-native';

    interface TextInputLayoutProps {
        style: ViewStyle | ViewStyle[];
        hintColor: string;
        errorColor: string;
        focusColor: string;
        labelFontSize: number;
        labelText: string;
        checkValid(value: string): boolean;
    }

    class TextInputLayout extends React.Component<Partial<TextInputLayoutProps>> {

    }
}