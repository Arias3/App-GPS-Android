import Geolocation from '@react-native-community/geolocation';
import React, { useEffect, useRef, useState } from 'react';
import {
  AppState,
  useColorScheme
} from 'react-native';
import BackgroundJob from 'react-native-background-actions';
import TcpSocket from 'react-native-tcp-socket';
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
  // Estado para controlar qué pantalla se muestra
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.HOME);

  // Estado para almacenar la dirección IP y el puerto
  const [ip, setIp] = useState<string>(''); // Aquí se almacena la dirección IP
  const port: number = 5000;// puerto
  const [id, setId] = useState<string>(''); // Aquí se almacena el user

  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);

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
  const [tcpClient, setTcpClient] = useState<any>(null);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  const handlePressSendTCP = async () => {

    if (!sendingData) {

      // Verificar si se han ingresado la dirección IP y el puerto
      if (!id) {
        console.log('ERROR: No se ha ingresado una ID');
        return;
      }

      if (!ip) {
        console.log('ERROR: No se ha ingresado la dirección IP o el puerto');
        return;
      }

      console.log('Iniciando envío de datos...');

      try {
        // Establecer conexión TCP
        const client = await TcpSocket.connect(
          {
            port: port,
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

        const sendDataTCP = async () => {
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
            const message = `${locationData.latitude} ${locationData.longitude} ${currentHour24} ${id}`;

            const locationDataJSON = JSON.stringify(message);
            client.write(locationDataJSON); // Escribir los datos en el cliente TCP
            console.log('Datos enviados:', locationDataJSON); // Registro de envío de datos
          } catch (error) {
            console.error('Error al enviar datos por TCP:', error);
          }
        };

        // Establecer intervalo para enviar datos periódicamente
        const interval = 2000; // Intervalo actualizado a 2 segundos
        const sendDataInterval = setInterval(sendDataTCP, interval);

        // Almacenar el socket y el intervalo en el estado
        setTcpClient(client);
        setIntervalId(sendDataInterval);
      } catch (error) {
        console.error('Error al conectar por TCP:', error);
      }
    } else {
      // Detener el envío de datos
      if (tcpClient) {
        tcpClient.end(); // Cerrar el socket
        console.log('Se detuvo el envio de datos');
      }
      // Detener el intervalo
      if (intervalId !== null) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
    }

    // Cambiar el estado de sendingData
    setSendingData(prevState => !prevState);
  };






  const handlePressStart = () => {
    setCurrentScreen(Screen.LOCATION_INFO);
    obtenerUbicacion();
  };

  const handlePressBack = () => {
    setCurrentScreen(Screen.HOME);
  };

  useEffect(() => {
    // Definir la tarea en segundo plano
    const startBackgroundTask = async () => {
      try {
        const taskOptions: BackgroundJobOptions = {
          taskName: 'Example Task',
          taskTitle: 'Example Task Title',
          taskDesc: 'Example Task Description',
          taskIcon: {
            name: 'ic_notification',
            type: 'mipmap',
          },
          color: '#ff00ff',
        };
        
  
        await BackgroundJob.start(taskOptions, async () => {
          // Código para ejecutar en segundo plano
        });
  
      } catch (e) {
        console.error(e);
      }
    };
  
    startBackgroundTask();
  
    return () => {
      BackgroundJob.stop(); // Detener la tarea en segundo plano al desmontar el componente
    };
  }, [sendingData]);


  return (
    <MainScreenContent
      isDarkMode={isDarkMode}
      backgroundStyle={backgroundStyle}
      currentScreen={currentScreen}
      handlePressStart={handlePressStart}
      style3={style3}
      handlePressBack={handlePressBack}
      handlePressSendTCP={handlePressSendTCP}
      sendingData={sendingData}
      locationData={locationData}
      ip={ip}
      setIp={setIp}
      id={id}
      setId={setId}
    />
  );
}
export default App;
