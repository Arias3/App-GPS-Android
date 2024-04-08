import React from 'react';
import {
    Button,
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    View,
} from 'react-native';
import { LocationData, Screen } from './App'; // Asegúrate de ajustar la ruta correcta si es diferente
import { style1, styles } from './style1';

interface MainScreenContentProps {
    isDarkMode: boolean;
    backgroundStyle: { backgroundColor: string };
    currentScreen: Screen;
    handlePressStart: () => void;
    style3: any;
    handlePressBack: () => void;
    handlePressSendUDP: () => void;
    sendingData: boolean;
    locationData: LocationData;
    id: string;
    ip1: string;
    ip2: string;
    ip3: string;
    setId: (id: string) => void;
    setIp1: (ip1: string) => void;
    setIp2: (ip2: string) => void;
    setIp3: (ip3: string) => void;
}

const MainScreenContent: React.FC<MainScreenContentProps> = ({
    isDarkMode,
    backgroundStyle,
    currentScreen,
    handlePressStart,
    style3,
    handlePressBack,
    handlePressSendUDP,
    sendingData,
    locationData,
    id,
    setId,
    ip1,
    setIp1,
    ip2,
    setIp2,
    ip3,
    setIp3,
}) => {
    return (
        <SafeAreaView style={[style1.container, backgroundStyle]}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={backgroundStyle.backgroundColor} />
            <ScrollView contentInsetAdjustmentBehavior="automatic" style={[style1.container, backgroundStyle]}>
                {currentScreen === Screen.HOME && (
                    <View style={style1.container}>
                        <View style={style1.content}>
                            <Text style={style1.title}></Text>
                            <Image
                                style={style1.stretch}
                                source={require('./logo1.jpg')}
                            />
                            <View style={style1.container}></View>
                        </View>
                        <View style={{ width: '90%', justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={[style3.label, { fontSize: 20 }]}>Ingresa tu ID:</Text>
                        </View>
                        <TextInput
                            style={[styles.input, { color: 'rgb(8,27,42)' }]}
                            placeholder="ID"
                            onChangeText={setId}
                            value={id}
                            placeholderTextColor='color: rgb(8,27,42)'
                        />
                        <TextInput
                            style={[styles.input, { color: 'rgb(8,27,42)' }]}
                            placeholder="IP1"
                            onChangeText={setIp1}
                            value={ip1}
                            placeholderTextColor='color: rgb(8,27,42)'
                        />
                        <TextInput
                            style={[styles.input, { color: 'rgb(8,27,42)' }]}
                            placeholder="IP2"
                            onChangeText={setIp2}
                            value={ip2}
                            placeholderTextColor='color: rgb(8,27,42)'
                        />
                        <TextInput
                            style={[styles.input, { color: 'rgb(8,27,42)' }]}
                            placeholder="IP3"
                            onChangeText={setIp3}
                            value={ip3}
                            placeholderTextColor='color: rgb(8,27,42)'
                        />

                        <View style={style3.buttonContainer}>
                            <Button
                                onPress={handlePressStart}
                                title="Acceder"
                                color='rgb(8,27,42)'
                            />
                        </View>
                    </View>
                )}

                {currentScreen === Screen.LOCATION_INFO && (
                    <View style={style3.content}>
                        <Image
                            style={style3.stretch}
                            source={require('./logo1.jpg')}
                        />
                        <View>
                            <Text style={[style3.label, { fontSize: 20, width: '100%', color: 'rgba(8,27,42,0.7)', textAlign: 'center' }]}>
                                Estos son tus datos de ubicación actual:
                            </Text>
                        </View>
                        {locationData && (
                            <>
                                <View style={[style3.dataRow, { width: '100%' }]}>
                                    <View style={{ width: '90%' }}>
                                        <Text style={[style3.label, { fontSize: 20 }]}>Latitud:</Text>
                                    </View>
                                    <View style={{ width: '90%' }}>
                                        <Text style={style3.container}>{locationData.latitude !== null ? locationData.latitude.toFixed(6) : 'N/A'}</Text>
                                    </View>
                                </View>
                                <View style={[style3.dataRow, { width: '100%' }]}>
                                    <View style={{ width: '90%' }}>
                                        <Text style={[style3.label, { fontSize: 20 }]}>Longitud:</Text>
                                    </View>
                                    <View style={{ width: '90%' }}>
                                        <Text style={style3.container}>{locationData.longitude !== null ? locationData.longitude.toFixed(6) : 'N/A'}</Text>
                                    </View>
                                </View>
                                <View style={[style3.dataRow, { width: '100%' }]}>
                                    <View style={{ width: '90%' }}>
                                        <Text style={[style3.label, { fontSize: 20 }]}>Altitud:</Text>
                                    </View>
                                    <View style={{ width: '90%' }}>
                                        <Text style={style3.container}>{locationData.altitude !== null ? locationData.altitude.toFixed(2) : 'N/A'}</Text>
                                    </View>
                                </View>
                                <View style={[style3.dataRow, { width: '100%' }]}>
                                    <View style={{ width: '90%' }}>
                                        <Text style={[style3.label, { fontSize: 20 }]}>Marca de tiempo:</Text>
                                    </View>
                                    <View style={{ width: '90%' }}>
                                        <Text style={style3.container}>{locationData.timestamp !== null ? new Date(locationData.timestamp).toLocaleString() : 'N/A'}</Text>
                                    </View>
                                </View>
                            </>
                        )}
                        <View style={style1.content}>
                            <View style={[style3.buttonContainer, { marginTop: 10 }]}>
                                <Button
                                    onPress={() => { handlePressSendUDP(); }}
                                    // Cambia el estado de sendingData al presionar el botón
                                    title={sendingData ? 'Detener envío' : 'Iniciar envío'}
                                    color='rgb(8,27,42)'
                                />
                            </View>
                            <View style={[style3.buttonContainer, { marginTop: 10 }]}>
                                <Button
                                    onPress={handlePressBack}
                                    title="Regresar"
                                    color='rgb(8,27,42)'
                                />
                            </View>
                            <View style={style1.container}></View>
                        </View>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default MainScreenContent;
