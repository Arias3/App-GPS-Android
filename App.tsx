import Geolocation from '@react-native-community/geolocation';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AppState,
  useColorScheme
} from 'react-native';
import BackgroundService from 'react-native-background-actions';
import dgram from 'react-native-udp';
import MainScreenContent from './MainScreensContent';
import { style3 } from './style1';

// Definición de la interfaz para los datos de ubicación
export interface LocationData {
  latitude: number | null;
  longitude: number | null;
  altitude: number | null;
  timestamp: number | null;
}
// Definición de las pantallas
export enum Screen {
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

  const [id, setId] = useState<string>(''); // Aquí se almacena el user
  const [ip1, setIp1] = useState<string>(''); // Aquí se almacena ip1
  const [ip2, setIp2] = useState<string>(''); // Aquí se almacena ip1
  const [ip3, setIp3] = useState<string>(''); // Aquí se almacena ip1

  // Estado para controlar qué pantalla se muestra
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.HOME);

  const appState = useRef(AppState.currentState);

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

  const [sendingData, setSendingData] = useState(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  // Define una referencia para el estado sendingData
  const sendingDataRef = useRef(sendingData);

  const handlePressSendUDP = () => {
    if (!locationData.latitude || !locationData.longitude) {
      console.log('ERROR: No fue posible obtener la información de coordenadas');
      return;
    }

    // Verificar si se han ingresado la dirección IP y el puerto
    if (!id || !ip1 || !ip2) {
      console.log('ERROR: Falta ingresar la ID o las direcciones IP');
      return;
    }

    if (!sendingData) {
      console.log('Credenciales correctas');
      console.log('Empezando el envio de datos');
    }

    else {
      console.log('Deteniendo el envio de datos');
      // Detener el intervalo
      if (intervalId !== null) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
    }
    // Cambiar el estado de sendingData
    setSendingData(prevState => !prevState);
  };

  const sendUDPData1 = useCallback((message: string) => {
    const socket = dgram.createSocket({ type: 'udp4' });
    socket.on('error', (error) => {
      console.error('Error en el socket UDP:', error);
      socket.close(); // Cierra el socket en caso de error
    });

    socket.bind(5000, () => {
      socket.send(message, 0, message.length, 5000, ip1, function (err) {
        if (err) {
          console.error('Error al enviar datos por UDP:', err);
        } else {
          console.log('Enviado a 1');
        }
        socket.close(); // Cierra el socket después de enviar el mensaje
      });
    });
  }, [ip1, ip2, ip3]);

  const sendUDPData2 = useCallback((message: string) => {
    const socket = dgram.createSocket({ type: 'udp4' });
    socket.on('error', (error) => {
      console.error('Error en el socket UDP:', error);
      socket.close(); // Cierra el socket en caso de error
    });

    socket.bind(5000, () => {
      socket.send(message, 0, message.length, 5000, ip2, function (err) {
        if (err) {
          console.error('Error al enviar datos por UDP:', err);
        } else {
          console.log('Enviado a 2');
        }
        socket.close(); // Cierra el socket después de enviar el mensaje
      });
    });
  }, [ip1, ip2, ip3]);

  const sendUDPData3 = useCallback((message: string) => {
    const socket = dgram.createSocket({ type: 'udp4' });
    socket.on('error', (error) => {
      console.error('Error en el socket UDP:', error);
      socket.close(); // Cierra el socket en caso de error
    });

    socket.bind(5000, () => {
      socket.send(message, 0, message.length, 5000, ip3, function (err) {
        if (err) {
          console.error('Error al enviar datos por UDP:', err);
        } else {
          console.log('Enviado a 3');
        }
        socket.close(); // Cierra el socket después de enviar el mensaje
      });
    });
  }, [ip1, ip2, ip3]);

  // Define la función para ejecutar en segundo plano
  const sendUDPInBackground = useCallback(async () => {

    const mensaje = async () => {
      try {
        const locationData = await obtenerUbicacion(); // Espera los datos de ubicación actualizados

        // Obtiene la fecha y hora actual
        const currentDate = new Date();
        const currentHours = currentDate.getHours();
        const currentMinutes = currentDate.getMinutes();
        const currentSeconds = currentDate.getSeconds();

        // Formatea la hora actual en formato de 24 horas
        const currentHour24 = `${String(currentHours).padStart(2, '0')}:${String(currentMinutes).padStart(2, '0')}:${String(currentSeconds).padStart(2, '0')}`;

        // Construye el mensaje con la ubicación y la hora formateada
        const message = `${locationData.latitude} ${locationData.longitude} ${new Date(locationData.timestamp).toLocaleDateString()} ${currentHour24} ${id}`;

        return message; // Devuelve el mensaje generado
      } catch (error) {
        console.error('Error al generar el mensaje', error);
        throw error; // Relanza el error para que sea manejado externamente si es necesario
      }
    };
    console.log('Aun estoy en segundo plano :p');
    while (sendingDataRef.current) {
      try {
        const message = await mensaje();
        sendUDPData1(message);
        await new Promise(resolve => setTimeout(resolve, 1000));
        sendUDPData2(message);
        await new Promise(resolve => setTimeout(resolve, 1000));
        sendUDPData3(message);
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log(message);
      } catch (error) {
        console.error('Error al enviar datos por UDP:', error);
      }
      // Esperar 5 segundos antes de enviar el próximo dato
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }, [sendUDPData1, sendingDataRef, id]);

  // Actualiza la referencia cuando cambia el estado sendingData
  useEffect(() => {
    sendingDataRef.current = sendingData;
  }, [sendingData]);

  // Inicia sendUDPInBackground cuando sea necesario
  useEffect(() => {
    if (sendingData) {
      sendUDPInBackground();
    }
  }, [sendUDPInBackground, sendingData]);

  // Registra la tarea en segundo plano
  const options = {
    taskName: 'Envío de datos UDP',
    taskTitle: 'Enviando datos por UDP',
    taskDesc: 'Enviando datos de ubicación por UDP',
    taskIcon: {
      name: 'ic_launcher',
      type: 'mipmap',
    },
    color: '#ff00ff',
  };

  const handlePressStart = () => {
    setCurrentScreen(Screen.LOCATION_INFO);
    obtenerUbicacion();
    try {
      BackgroundService.start(sendUDPInBackground, options);
      console.log('Tarea en segundo plano iniciada correctamente');
    } catch (error) {
      console.error('Error al iniciar la tarea en segundo plano:', error);
    }
  };

  const handlePressBack = () => {
    setCurrentScreen(Screen.HOME);
    try {
      BackgroundService.stop();
      console.log('Tarea en segundo plano detenida correctamente');
    } catch (error) {
      console.error('Error al detener la tarea en segundo plano:', error);
    }
    if (sendingData) {
      // Cambiar el estado de sendingData
      setSendingData(prevState => !prevState);
      console.log('cancele el envio pq me salí a Home')
    }
  };

  return (
    <MainScreenContent
      isDarkMode={isDarkMode}
      backgroundStyle={backgroundStyle}
      currentScreen={currentScreen}
      handlePressStart={handlePressStart}
      style3={style3}
      handlePressBack={handlePressBack}
      handlePressSendUDP={handlePressSendUDP}
      sendingData={sendingData}
      locationData={locationData}
      id={id}
      ip1={ip1}
      ip2={ip2}
      ip3={ip3}
      setId={setId}
      setIp1={setIp1}
      setIp2={setIp2}
      setIp3={setIp3}
    />
  );
}

export default App;