import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Alert } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import appFirebase from '../credenciales';

const db = getFirestore(appFirebase);

export default function QrScanner({ navigation }) {
    const [hasPermission, setHasPermission] = useState(null);
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
        try {
            const eventoId = data; // Data contiene el ID del evento

            // Obtener el evento de Firestore
            const eventoRef = doc(db, 'eventos', eventoId);
            const eventoDoc = await getDoc(eventoRef);

            if (eventoDoc.exists()) {
                const auth = getAuth(appFirebase);
                const user = auth.currentUser ;

                if (user) {
                    const userId = user.uid;

                    const usuarios = eventoDoc.data().usuarios || [];
                    if (usuarios.some(usuario => usuario.id === userId)) {
                        Alert.alert('Advertencia', 'Ya estás inscrito en este evento.');
                    } else {
                        // Calcular el monto a pagar
                        const montoTotal = eventoDoc.data().monto;
                        const cantidadParticipantes = eventoDoc.data().cantidadParticipantes;
                        const montoApagar = montoTotal / (cantidadParticipantes); // Incrementar la cantidad de participantes

                        // Agregar el usuario a la lista de participantes
                        await updateDoc(eventoRef, {
                            usuarios: arrayUnion({ id: userId, montoApagar }), // Agrega el ID y el monto a pagar
                        });

                        // Actualizar el documento del usuario para agregar el evento a sus deudas
                        const userRef = doc(db, 'usuarios', userId);
                        await updateDoc(userRef, {
                            deudas: arrayUnion(eventoId), // Agregar el evento a las deudas del usuario
                        });

                        Alert.alert('Éxito', 'Te has unido al evento correctamente.');
                    }
                } else {
                    Alert.alert('Error', 'No hay usuario autenticado.');
                }
            } else {
                Alert.alert('Error', 'El evento no existe.');
            }
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
            <BarCodeScanner
                onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                style={StyleSheet.absoluteFillObject}
            />
            {scanned && (
                <Text
                    style={styles.rescanText}
                    onPress={() => setScanned(false)}
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