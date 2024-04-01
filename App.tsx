import Geolocation from '@react-native-community/geolocation';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AppState,
  useColorScheme
} from 'react-native';
import BackgroundService from 'react-native-background-actions';
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
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Define una referencia para el estado sendingData
  const sendingDataRef = useRef(sendingData);

  const handlePressSendTCP = () => {

    // Verificar si se han ingresado la dirección IP y el puerto
    if (!id) {
      console.log('ERROR: No se ha ingresado una ID');
      return;
    }

    if (!ip || !port) {
      console.log('ERROR: No se ha ingresado la dirección IP o el puerto');
      return;
    }

    console.log('Validaciones correctas');

    // Cambiar el estado de sendingData
    setSendingData(prevState => !prevState);
  };
  
  // Actualiza la referencia cuando cambia el estado sendingData
  useEffect(() => {
    sendingDataRef.current = sendingData;
  }, [sendingData]);

  // Define la función para ejecutar en segundo plano
  const sendTCPInBackground = useCallback(async () => {
    console.log('Iniciando envío de datos en segundo plano...');
    
    while (true) {
      if (sendingDataRef.current) {
        console.log('holi');
      }
      await sleep(1000); // Espera 1 segundo antes de volver a verificar sendingData
    }
  }, []);

  // Inicia sendTCPInBackground cuando sea necesario
  useEffect(() => {
    if (sendingData) {
      sendTCPInBackground();
    }
  }, [sendTCPInBackground, sendingData]);


  // Registra la tarea en segundo plano
  const options = {
    taskName: 'Envío de datos TCP',
    taskTitle: 'Enviando datos por TCP',
    taskDesc: 'Enviando datos de ubicación por TCP',
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
      BackgroundService.start(sendTCPInBackground, options);
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

  };

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