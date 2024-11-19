import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import appFirebase from '../credenciales';

const db = getFirestore(appFirebase);

export default function QrScanner({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanning, setScanning] = useState(false); // Controla si el escáner está activo
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const requestCameraPermission = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    requestCameraPermission();
  }, []);

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    setScanning(false); // Detener escaneo después de detectar un código
    try {
      const eventoId = data; // Data contiene el ID del evento

      // Obtener el evento de Firestore
      const eventoRef = doc(db, 'eventos', eventoId);
      const eventoDoc = await getDoc(eventoRef);

      if (!eventoDoc.exists()) {
        Alert.alert('Error', 'El evento no existe.');
        return;
      }

      const evento = eventoDoc.data();
      const auth = getAuth(appFirebase);
      const user = auth.currentUser;

      if (!user) {
        Alert.alert('Error', 'No hay usuario autenticado.');
        return;
      }

      const userId = user.uid;
      const userName = user.displayName || 'Usuario';
      const usuariosEnEvento = evento.usuarios || [];

      // Validaciones basadas en el código por nombre
      if (usuariosEnEvento.some((usuario) => usuario.id === userId)) {
        Alert.alert('Error', 'No puedes agregar el mismo usuario dos veces.');
        return;
      }

      if (usuariosEnEvento.length >= evento.cantidadParticipantes) {
        Alert.alert('Error', 'No se pueden agregar más usuarios a este evento.');
        return;
      }

      const montoApagar = evento.monto / evento.cantidadParticipantes; // Calcular el monto a pagar

      // Agregar el usuario al evento
      await updateDoc(eventoRef, {
        usuarios: [...usuariosEnEvento, { id: userId, montoApagar }],
      });

      // Actualizar las deudas del usuario
      const userRef = doc(db, 'usuarios', userId);
      const userDoc = await getDoc(userRef);
      const deudas = userDoc.exists() ? userDoc.data().deudas || [] : [];

      await updateDoc(userRef, {
        deudas: arrayUnion(eventoId), // Agregar el evento a las deudas del usuario
      });

      Alert.alert(
        'Éxito',
        'Te has unido al evento correctamente.',
        [
          {
            text: 'Ok',
            onPress: () => navigation.navigate('home'),
          },
        ]
      );
    } catch (error) {
      console.error('Error al procesar el código QR:', error);
      Alert.alert('Error', 'No se pudo procesar el código QR. Intenta nuevamente.');
    }
  };

  if (hasPermission === null) {
    return <Text>Solicitando permiso de cámara...</Text>;
  }

  if (hasPermission === false) {
    return <Text>No se tiene acceso a la cámara.</Text>;
  }

  return (
    <View style={styles.container}>
      {scanning ? (
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
      ) : (
        <TouchableOpacity style={styles.scanButton} onPress={() => setScanning(true)}>
          <Text style={styles.scanButtonText}>Comenzar a escanear</Text>
        </TouchableOpacity>
      )}
      {scanned && (
        <Text
          style={styles.rescanText}
          onPress={() => {
            setScanned(false);
            setScanning(true); // Reactivar el escaneo
          }}
        >
          Toca para escanear nuevamente
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanButton: {
    backgroundColor: 'blue',
    padding: 15,
    borderRadius: 10,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  rescanText: {
    position: 'absolute',
    bottom: 50,
    fontSize: 18,
    color: 'white',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 5,
  },
});