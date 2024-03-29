import Geolocation from '@react-native-community/geolocation';
import React, { useEffect, useState } from 'react';
import {
  Button,
  Image,
  Linking,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';
import BackgroundService from 'react-native-background-actions';
import TcpSocket from 'react-native-tcp-socket';
import { Colors } from 'react-native/Libraries/NewAppScreen';


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
  const [port, setPort] = useState<string>(''); // Aquí se almacena el puerto

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
        { enableHighAccuracy: true, distanceFilter: 0}
          //interval: 1000 } // Añade la opción interval aquí
      );
    });
  };


  const handlePressSendTCP = async () => {
    if (!locationData.latitude || !locationData.longitude) {
      console.log('ERROR: No fue posible obtener la información de coordenadasTCP');
      return;
    }

    if (!ip || !port) {
      console.log('ERROR: No se ha ingresado la dirección IP o el puerto');
      return;
    }

    try {
      const client = await TcpSocket.connect(
        {
          port: Number(port),
          host: ip
        },
        () => {
          console.log('Conexión establecida correctamente');
        }
      );

      client.on('data', function (locationDataJSON) {
        console.log('message was received', locationDataJSON);

        const response = JSON.parse(locationDataJSON.toString());

        if (response.hasOwnProperty('latitude') && response.hasOwnProperty('longitude')) {
          const latitude = response.latitude;
          const longitude = response.longitude;

          console.log('Coordenadas recibidas:', latitude, longitude);
        }
      });

      const sendPeriodically = async () => {
        const interval = 1000; // Intervalo actualizado a 1 segundo

        while (true) {
          try {
            await new Promise(resolve => setTimeout(resolve, interval)); // Esperar antes de la siguiente iteración
            await sendData(client); // Llamar a la función para enviar los datos
            console.log('entre al while');
          } catch (error) {
            console.error('Error en el bucle de envío periódico:', error);
          }
        }
      };

      sendPeriodically(); // Iniciar el bucle de envío periódico
    } catch (error) {
      console.error('Error al conectar por TCP:', error);
    }
  };

  // Función para enviar los datos de ubicación
  const sendData = async (client: any) => {
    try {
      const locationData = await obtenerUbicacion(); // Espera los datos de ubicación actualizados

      const message = `${locationData.latitude} ${locationData.longitude} ${new Date(locationData.timestamp).toLocaleString()}`;
      const locationDataJSON = JSON.stringify(message);

      client.write(locationDataJSON);
    } catch (error) {
      console.error('Error al enviar datos por TCP:', error);
    }
  };


  useEffect(() => {
    const startBackgroundTask = async () => {
      try {
        const options = {
          taskName: 'Example',
          taskTitle: 'ExampleTask title',
          taskDesc: 'ExampleTask description',
          taskIcon: {
            name: 'ic_launcher',
            type: 'mipmap',
          },
          color: '#ff00ff',
          linkingURI: 'yourSchemeHere://chat/jane',
          parameters: {
            delay: 1000,
          },
        };

        const veryIntensiveTask = async () => {
          await obtenerUbicacion();
          //await handlePressSendTCP();
          //await handlePressSendUDP();
        };

        await BackgroundService.start(veryIntensiveTask, options);
        console.log('Tarea en segundo plano iniciada con éxito');
      } catch (error) {
        console.error('Error al iniciar la tarea en segundo plano:', error);
      }
    };

    startBackgroundTask();

    return () => {
      BackgroundService.stop();
    };
  }, []);

  const handlePressStart = () => {
    setCurrentScreen(Screen.LOCATION_INFO);
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

    await Linking.openURL(`sms:+573023793697?body=${encodeURIComponent(message)}`);
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
              <Text style={style3.label}>Estos son tus datos de ubicación actual</Text>
            </View>
            {locationData && (
              <>
                <View style={style3.dataRow}>
                  <Text style={style3.label}>Latitud:</Text>
                  <View>
                    <Text style={style3.container}>{locationData.latitude !== null ? locationData.latitude.toFixed(6) : 'N/A'}</Text>
                  </View>
                </View>

                <View style={style3.dataRow}>
                  <Text style={style3.label}>Longitud:</Text>
                  <View>
                    <Text style={style3.container}>{locationData.longitude !== null ? locationData.longitude.toFixed(6) : 'N/A'}</Text>
                  </View>
                </View>

                <View style={style3.dataRow}>
                  <Text style={style3.label}>Altitud:</Text>
                  <View>
                    <Text style={style3.container}>{locationData.altitude !== null ? locationData.altitude.toFixed(2) : 'N/A'}</Text>
                  </View>
                </View>

                <View style={style3.dataRow}>
                  <Text style={style3.label}>Marca de tiempo:</Text>
                  <View>
                    <Text style={style3.container}>{locationData.timestamp !== null ? new Date(locationData.timestamp).toLocaleString() : 'N/A'}</Text>
                  </View>
                </View>
              </>
            )}
            <View style={style1.content}>
              <View style={style3.buttonContainer}>
                <Button
                  onPress={handlePressSMS}
                  title="Enviar ubicación"
                  color='rgb(8,27,42)'
                />
              </View>

              <View style={[style3.buttonContainer, { marginTop: 10 }]}>
                <Button
                  onPress={handlePressSendTCP}
                  title="Enviar TCP"
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

              <View style={[style3.buttonContainer, { marginTop: 10 }]}>
                <Button
                  onPress={handlePressBack}
                  title="Regresar"
                  color='rgb(8,27,42)'
                />
              </View>

              <View style={[style3.buttonContainer, { marginTop: 10 }]}>
                <TextInput
                  style={[styles.input, { color: 'white' }]}
                  placeholder="3.135.85.137"
                  onChangeText={setIp}
                  value={ip}
                  placeholderTextColor={Colors.white}
                />
                <TextInput
                  style={[styles.input, { color: 'white' }]}
                  placeholder="20000"
                  onChangeText={setPort}
                  value={port}
                  keyboardType='numeric'
                  placeholderTextColor={Colors.white}
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

const style1 = StyleSheet.create({
  content: {
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  container: {
    flex: 20,
    padding: 30,
  },
  title: {
    fontFamily: 'Batangas-Regular',
    fontSize: 50,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 30,
    fontWeight: 'bold',
    marginRight: 8,
    fontFamily: 'Batangas-Regular',
  },
  value: {
    fontSize: 20,
  },

  stretch: {
    width: 225,
    height: 200,
    marginLeft: -10,
    resizeMode: 'center',
    alignItems: 'center',
  },

  buttonContainer: {
    marginTop: 0,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 30,
    backgroundColor: 'rgb(8,27,42)',
    fontSize: 18,
    fontWeight: 'bold',
  },

  buttonText: {
    fontSize: 50,
    fontFamily: 'batangas-regular',
    fontWeight: 'bold',
    color: 'white',
  },
});

const style2 = StyleSheet.create({
  container: {
    padding: 8,
    flex: 4,
  },

  content: {
    paddingHorizontal: 10,
    paddingVertical: 20,
  },

  title: {
    fontFamily: 'Batangas-Regular',
    fontSize: 50,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  dataRow: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 8,
  },

  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },

  value: {
    fontSize: 18,
  },

  stretch: {
    width: 225,
    height: 40,
    resizeMode: 'center',
  }
});

const style3 = StyleSheet.create({
  content: {
    paddingHorizontal: 5,
    paddingVertical: 5,
  },

  container: {
    color: 'black',
    backgroundColor: 'rgb(191, 210, 224)',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 70,
    alignItems: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },

  title: {
    fontFamily: 'Batangas-Regular',
    fontSize: 30,
    color: 'rgb(8,27,42)',
    fontWeight: 'bold',
    marginBottom: 8,
    alignItems: 'center',
  },

  dataRow: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 10,
  },

  label: {
    fontSize: 25,
    fontWeight: 'bold',
    color: 'rgb(8,27,42)',
    marginRight: 4,
    marginBottom: 5,
    marginLeft: 4,
    fontFamily: 'Batangas-Regular',
    alignItems: 'center',
  },

  stretch: {
    width: 150,
    height: 150,
    resizeMode: 'stretch',
    alignItems: 'center',
    marginLeft: 60,
    marginBottom: 10,

  },
  buttonContainer: {
    borderRadius: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: 'rgb(8,27,42)',
    fontSize: 18,
    fontWeight: 'bold',
    width: '100%',
    marginTop: 10,
  },
});

const styles = StyleSheet.create({
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
});

export default App;

//function alert(arg0: string) {
//  throw new Error('Function not implemented.');
//}
