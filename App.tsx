import Geolocation from '@react-native-community/geolocation';
import React, { useEffect, useRef, useState } from 'react';
import {
  AppState,
  AppStateStatus,
  Button,
  Image,
  Linking,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
  useColorScheme
} from 'react-native';
import BackgroundService from 'react-native-background-actions';
import TcpSocket from 'react-native-tcp-socket';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { style1, style3, styles } from './style1';


// Definición de la interfaz para los datos de ubicación
interface LocationData {
  latitude: number | null;
  longitude: number | null;
  altitude: number | null;
  timestamp: number | null;
}

enum Screen {
  HOME,
  LOCATION_INFO,
}


function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: 'white',
  };

  // Inicialización del estado para los datos de ubicación
  const [locationData, setLocationData] = useState<LocationData>({
    latitude: null,
    longitude: null,
    altitude: null,
    timestamp: null,
  });

  // Estado para controlar qué pantalla se muestra
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.HOME);

  // Estado para almacenar la dirección IP y el puerto
  const [ip, setIp] = useState<string>(''); // Aquí se almacena la dirección IP
  const [port, setPort] = useState<string>('3000'); // Aquí se almacena el puerto

  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);

  var [sendingData, setSendingData] = useState<boolean>(false);

  useEffect(() => {
    const appStateHandler = async (nextAppState: AppStateStatus) => {
      // Actualiza el estado de la aplicación
      appState.current = nextAppState;
      setAppStateVisible(appState.current);

      // Verifica si la aplicación está en segundo plano
      if (appState.current.match(/inactive|background/)) {
        // La aplicación está en segundo plano, inicia la tarea en segundo plano
        try {
          const options = {
            taskName: 'GEOTRACK',
            taskTitle: 'UPDATED TRACK',
            taskDesc: 'Geotrack está corriendo en segundo plano',
            taskIcon: {
              name: 'ic_launcher',
              type: 'mipmap',
            },
            color: '#081B2A',
            linkingURI: 'yourSchemeHere://chat/jane',
            parameters: {
              delay: 1000,
            },
          };

          // Definir la tarea intensiva en segundo plano
          const veryIntensiveTask = async () => {
            // Verificar si la pantalla actual es LOCATION_INFO y sendingData es verdadero antes de continuar
            if (currentScreen === Screen.LOCATION_INFO && sendingData) {
              // Obtener la ubicación una vez antes de entrar en el bucle
              await obtenerUbicacion();
              // Bucle infinito que ejecuta la lógica en segundo plano
              while (true) {
                // Verificar si sendingData es verdadero antes de continuar
                if (sendingData) {
                  // Muestra un mensaje si sendingData es verdadero y llama a handlePressSendTCP
                  console.log('Enviando datos en segundo plano...');
                  await handlePressSendTCP();
                }
              }
            }
          };

          // Iniciar la tarea en segundo plano
          await BackgroundService.start(veryIntensiveTask, options);
          console.log('Tarea en segundo plano iniciada con éxito');
        } catch (error) {
          console.error('Error al iniciar la tarea en segundo plano:', error);
        }
      } else {
        // La aplicación está en primer plano
        console.log('App has come to the foreground!');
      }
    };

    // Suscribirse al evento de cambio de estado de la aplicación
    const subscription = AppState.addEventListener('change', appStateHandler);

    // Llamar al manejador de estado de la aplicación para manejar el estado inicial
    appStateHandler(AppState.currentState);

    // Devolver una función de limpieza para eliminar la suscripción al desmontar el componente
    return () => {
      subscription.remove();
      BackgroundService.stop(); // Detener la tarea en segundo plano al desmontar el componente
    };
  }, [currentScreen]); // Dependencias del efecto useEffect

  // Función para obtener la ubicación actual
  const obtenerUbicacion = (): Promise<{ latitude: number; longitude: number; altitude: number; timestamp: number }> => {
    return new Promise((resolve, reject) => {
      Geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, altitude } = position.coords;
          const timestamp = position.timestamp; // Obtiene la marca de tiempo actual


          // Asegúrate de que altitude sea un número, incluso si es null
          const alt = altitude !== null ? altitude : 0;

          const locationData = { latitude, longitude, altitude: alt, timestamp };
          setLocationData(locationData); // Actualizar el estado con los datos de ubicación
          resolve(locationData); // Resuelve la promesa con los datos de ubicación
        },
        (error) => {
          console.log('Error al obtener la ubicación:', error);
          reject(error); // Rechaza la promesa en caso de error
        },
        { enableHighAccuracy: true, distanceFilter: 0 }
        //interval: 1000 } // Añade la opción interval aquí
      );
    });
  };

  const handlePressSendTCP = async () => {
    // Verificamos si ya se están enviando datos
    if (sendingData) {
      setSendingData(false);
      console.log('Deteniendo el envío de datos');
    } else {
      setSendingData(true);
      console.log('Iniciando el envío de datos');
      try {

        // Verificamos si tenemos la información necesaria para enviar los datos
        if (!locationData.latitude || !locationData.longitude) {
          console.log('ERROR: No fue posible obtener la información de coordenadasTCP');
          return;
        }

        if (!ip || !port) {
          console.log('ERROR: No se ha ingresado la dirección IP o el puerto');
          return;
        }

        // Establecemos la conexión con el cliente TCP
        const client = await TcpSocket.connect(
          {
            port: Number(port),
            host: ip
          },
          () => {
            console.log('Conexión establecida correctamente');
          }
        );

        // Función para enviar los datos de ubicación
        const sendDataTCP = async () => {
          try {
            const locationData = await obtenerUbicacion(); // Espera los datos de ubicación actualizados
            const message = `${locationData.latitude} ${locationData.longitude} ${new Date(locationData.timestamp).toLocaleString()}`;
            const locationDataJSON = JSON.stringify(message);
            client.write(locationDataJSON); // Escribir los datos en el cliente TCP
            console.log('Datos enviados:', locationDataJSON); // Registro de envío de datos
          } catch (error) {
            console.error('Error al enviar datos por TCP:', error);
          }
        };

        setSendingData(true);

        // Enviamos datos periódicamente mientras sendingData sea true
        while (sendingData) {
          try {
            await sendDataTCP(); // Llamar a la función para enviar los datos
            await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar antes de la siguiente iteración
          } catch (error) {
            console.error('Error en el bucle de envío periódico:', error);
          }
        }

        // Si sendingData se cambia a false, detenemos el envío de datos
        console.log('Envío de datos detenido');
      } catch (error) {
        console.error('Error al conectar por TCP:', error);
      }
    }
  };

  const handlePressStart = () => {
    setCurrentScreen(Screen.LOCATION_INFO);
    obtenerUbicacion();
  };

  const handlePressBack = () => {
    setCurrentScreen(Screen.HOME);
  };

  const handlePressSMS = async () => {
    if (!locationData.latitude || !locationData.longitude) {
      console.log('ERROR: No fue posible obtener la información de coordenadas');
      return;
    }

    const message = `¡Hola! Mis coordenadas son: Latitud: ${locationData.latitude}, Longitud: ${locationData.longitude}, Altitud: ${locationData.altitude || 'N/A'}, Marca de tiempo: ${locationData.timestamp ? new Date(locationData.timestamp).toLocaleString() : 'N/A'}`;

    await Linking.openURL(`sms:+573242937580?body=${encodeURIComponent(message)}`);
    console.log('Mensaje SMS enviado');
  };

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
            </View>

            <View style={style3.buttonContainer}>
              <Button
                onPress={handlePressStart}
                title="Comenzar Track"
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

            <View style={[style3.buttonContainer, { marginTop: 10 }]}>
              <TextInput
                style={[styles.input, { color: 'white' }]}
                placeholder="IP publica"
                onChangeText={setIp}
                value={ip}
                placeholderTextColor={Colors.white}
              />
              <TextInput
                style={[styles.input, { color: 'white' }]}
                placeholder="Puerto"
                onChangeText={setPort}
                value={port}
                keyboardType='numeric'
                placeholderTextColor={Colors.white}
              />
            </View>

            <View style={style1.content}>
              <View style={[style3.buttonContainer, { marginTop: 10 }]}>
                <Button
                  onPress={() => {
                    handlePressSendTCP();
                    // Cambia el estado de sendingData al presionar el botón
                  }}
                  title={sendingData ? 'Detener envío' : 'Iniciar envío'}
                  color='rgb(8,27,42)'
                />
              </View>


              <View style={[style3.buttonContainer, { marginTop: 10 }]}>
                <Button
                  //onPress={handlePressSendUDP}
                  title="Enviar UDP"
                  color='rgb(8,27,42)'
                />
              </View>

              <View style={style3.buttonContainer}>
                <Button
                  onPress={handlePressSMS}
                  title="Enviar ubicación por SMS"
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
}

export default App;