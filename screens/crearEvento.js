import React, { useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';
import { Text, StyleSheet, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { getAuth } from 'firebase/auth';

import appFirebase from '../credenciales';
import { getFirestore, collection, addDoc, doc, getDoc, setDoc } from 'firebase/firestore';

const db = getFirestore(appFirebase);

export default function CrearEvento(props) {
    const initialState = {
        titulo: '',
        detalle: '',
        monto: '',
        cantidadParticipantes: '',
        usuarios: [],
    };

    const [date, setDate] = useState(new Date());
    const [mode, setMode] = useState('date');
    const [show, setShow] = useState(false);
    const [fecha, setFecha] = useState('');
    const [estado, setEstado] = useState(initialState);

    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShow(Platform.OS === 'ios');
        setDate(currentDate);

        let tempDate = new Date(currentDate);
        let fDate = tempDate.getDate() + '/' + (tempDate.getMonth() + 1) + '/' + tempDate.getFullYear();
        setFecha(fDate);
    };

    const showMode = (currentDate) => {
        setShow(true);
        setMode(currentDate);
    };

    const handleChangeText = (value, name) => {
        setEstado({ ...estado, [name]: value });
    };

    const saveEvento = async () => {
        try {
            if (estado.titulo === '' || estado.detalle === '' || fecha === '' || estado.cantidadParticipantes === '' || estado.monto === '') {
                Alert.alert('Advertencia', 'No puedes dejar los campos vacios');
            } else {
                const evento = {
                    titulo: estado.titulo,
                    detalle: estado.detalle,
                    fecha: fecha,
                    cantidadParticipantes: parseInt(estado.cantidadParticipantes, 10),
                    monto: parseInt(estado.monto, 10),
                    
                };
                
                // Añade el evento y obtiene su ID
                const docRef = await addDoc(collection(db, 'eventos'), {
                    ...evento
                });
    
                const eventId = docRef.id; // Obtiene el ID del evento creado
    
                // Obtiene el ID del usuario actual
                const auth = getAuth(appFirebase);

                const user = auth.currentUser; // Obtiene el usuario actual
    
                if (user) {
                    const userId = user.uid; // Obtiene el ID del usuario autenticado
                    const usuarioRef = doc(db, 'usuarios', userId); // Obtiene la referencia del usuario
                    
                    const usuarioDoc = await getDoc(usuarioRef);
    
                    if (usuarioDoc.exists()) {
                        const eventosCreados = usuarioDoc.data().eventosCreados || [];
    
                        // Añade el nuevo ID de evento a la lista
                        await setDoc(usuarioRef, {
                            eventosCreados: [...eventosCreados, eventId]
                        }, { merge: true }); // Usa merge para no sobreescribir otros campos
    
                        Alert.alert('Éxito', 'Evento guardado con éxito');
                        setEstado(initialState);
                        setFecha('');
                        setDate(new Date());
                        props.navigation.navigate('EventosCreados');
                    }
                } else {
                    Alert.alert('Error', 'No hay usuario autenticado');
                }
            }
        } catch (error) {
            console.log(error);
        }
    };
    return (
        <View style={styles.contenedorPadre}>
            <View style={styles.tarjeta}>
                <TextInput style={styles.textoTitulo}>Nuevo evento</TextInput>
                <View style={styles.contenedor}>
                    <TextInput
                        placeholder='Ingresa el titulo'
                        style={styles.textoInput}
                        value={estado.titulo}
                        onChangeText={(value) => handleChangeText(value, 'titulo')}
                    />

                    <TextInput
                        placeholder='Ingresa el monto total'
                        keyboardType='numeric'
                        style={styles.textoInput}
                        value={estado.monto.toString()} 
                        onChangeText={(value) => handleChangeText(value, 'monto')}
                    />

                    <TextInput
                        placeholder='Ingresa la cantidad de participantes'
                        keyboardType='numeric'
                        style={styles.textoInput}
                        value={estado.cantidadParticipantes.toString()}
                        onChangeText={(value) => handleChangeText(value, 'cantidadParticipantes')} 
                    />

                    <TextInput
                        placeholder='Ingresa la descripcion'
                        multiline={true}
                        numberOfLines={4}
                        style={styles.textoInput}
                        value={estado.detalle}
                        onChangeText={(value) => handleChangeText(value, 'detalle')}
                    />

                    {/* Contenedor de fecha */}
                    <View style={styles.inputDate}>
                        <TextInput placeholder='20/10/2024' style={styles.textoDate} value={fecha} />
                        <TouchableOpacity style={styles.botonDate} onPress={() => showMode('date')}>
                            <Text style={styles.subtitle}>Fecha</Text>
                        </TouchableOpacity>
                    </View>

                    {show && (
                        <DateTimePicker
                            testID='dataTimePicker'
                            value={date}
                            mode={mode}
                            is24Hour={true}
                            display='default'
                            onChange={onChange}
                            minimumDate={new Date('2024-01-01T00:00:00')}
                        />
                    )}

                    {/* Boton para enviar los datos */}
                    <View>
                        <TouchableOpacity style={styles.botonEnviar} onPress={saveEvento}>
                            <Text style={styles.textoBtnEnviar}>Agregar evento</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    contenedorPadre: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    tarjeta: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        width: '90%',
        padding: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    contenedor: {
        padding: 20
    },
    textoInput: {
        borderColor: 'slategray',
        borderWidth: 1,
        padding: 10,
        marginTop: 10,
        borderRadius: 8
    },
    inputDate: {
        width: '100%',
        flexWrap: 'wrap',
        flexDirection: 'row'
    },
    botonDate: {
        backgroundColor: '#525FE1',
        borderRadius: 5,
        padding: 10,
        width: '30%',
        height: '90%',
        marginTop: 10,
        marginLeft: 10
    },
    textoDate: {
        borderColor: 'slategray',
        borderWidth: 1,
        padding: 10,
        marginTop: 10,
        borderRadius: 8
    },
    subtitle: {
        color: 'white',
        fontSize: 18,
        textAlign: 'center',
        marginTop: 5
    },
    botonEnviar: {
        backgroundColor: '#525FE1',
        borderColor: '#525FE1',
        borderWidth: 3,
        borderRadius: 20,
        marginLeft: 20,
        marginRight: 20,
        marginTop: 30
    },
    textoBtnEnviar: {
        textAlign: 'center',
        padding: 10,
        color: 'white',
        fontSize: 16
    },
    textoTitulo: {
        padding: 2,
        marginTop: 10,
        fontSize: 19,
        fontWeight: 'bold',
        textAlign: 'center',
        textDecorationLine: 'underline'
    }
});
