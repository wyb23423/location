import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, TextInput, Text, Dimensions } from 'react-native';
import { TextInputLayout } from 'rn-textinputlayout';
import Picker from 'react-native-picker';

type SetStateAction<T> = React.Dispatch<React.SetStateAction<T>>

function usePicker(setMap: SetStateAction<number>): [boolean, SetStateAction<boolean>] {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const data = [];
        for (var i = 0; i < 100; i++) {
            data.push(i);
        }

        Picker.init({
            pickerData: data,
            selectedValue: [data[0]],
            pickerTitleText: '选择地图',
            pickerConfirmBtnText: '确认',
            pickerCancelBtnText: '取消',
            pickerBg: [255, 255, 255, 1],
            pickerToolBarBg: [255, 255, 255, 1],
            onPickerConfirm: data => {
                setMap(data[0]);
                Picker.select(data);
                setVisible(false);
            },
            onPickerCancel() {
                setVisible(false);
            }
        });
    }, []);

    return [visible, setVisible];
}

export default function App() {
    const [mapID, setMap] = useState(-1);
    const [visible, setVisible] = usePicker(setMap);

    const showPicker = useCallback(() => {
        setVisible(true);
        Picker.show();
    }, []);

    const hiddenPicker = useCallback(() => {
        Picker.hide();
        setVisible(false);
    }, [])

    return (
        <View>
            <View style={{ ...styles.inputLayout, ...styles.flex }}>
                <TextInputLayout style={{ width: '95%', marginRight: 5 }}>
                    <TextInput
                        style={styles.textInput}
                        placeholder='基站编号'
                    />
                </TextInputLayout>
                <Text style={styles.icon}>&#xe601;</Text>
            </View>

            {
                ['x', 'y', 'z'].map(v =>
                    <TextInputLayout style={styles.inputLayout} key={v}>
                        <TextInput
                            style={styles.textInput}
                            placeholder={v}
                        />
                    </TextInputLayout>
                )
            }

            <View onTouchEnd={showPicker} style={styles.inputLayout}>
                <TextInputLayout>
                    <TextInput
                        style={{ ...styles.textInput, color: '#000' }}
                        editable={false}
                        value={mapID >= 0 ? mapID + '' : void 0}
                        placeholder='地图'
                    />
                </TextInputLayout>
            </View>

            {visible ? <View style={styles.modal} onTouchEnd={hiddenPicker} /> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    flex: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between'
    },
    icon: {
        fontFamily: 'iconfont',
        fontSize: 24
    },
    modal: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        minHeight: Dimensions.get('window').height
    },
    textInput: {
        fontSize: 16,
        height: 40,
    },
    inputLayout: {
        marginTop: 16,
        marginHorizontal: 36,
    }
});
