import React, { useState, useEffect } from 'react'
import DateTimePicker from '@react-native-community/datetimepicker';
import { KeyboardAvoidingView, Platform, ToastAndroid } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Text, StyleSheet, View, TextInput, TouchableOpacity, Alert } from 'react-native'
import { auth } from '../credenciales';


import appFirebase from '../credenciales'
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, getDoc, setDoc } from 'firebase/firestore';
import { ScrollView } from 'react-native-gesture-handler';
const db = getFirestore(appFirebase)



export default function CrearUsuario(props) {
    const initialUserState = {
        nombreUsuario: '',
        gmail: '',
        password: '',
        password2: '',
        deudas: [],
        eventosCreados: []
    };

    const [user, setUser] = useState(initialUserState);

    const simbolosNoPermitidos =/[ ! " # $ % & ' ( ) * + , -  / : ; < = > ? @  ^  |   ]/ // lista de símbolos no permitidos

    const handleChangeText = (value, name) => {
        setUser({ ...user, [name]: value });
    };

    const registrar = async () => {
        try {
            if (user.gmail === '' || user.password === '' || user.nombreUsuario === '') {
                ToastAndroid.show("Los campos no pueden estar vacios", ToastAndroid.SHORT)
                return;
            }
            if (user.password !== user.password2) {
                ToastAndroid.show("Las contraseñas no coinciden", ToastAndroid.SHORT)
                return;
            }

      
            if (simbolosNoPermitidos.test(user.password)) {
                ToastAndroid.show('La contraseña solo puede tener letras y números.', ToastAndroid.SHORT);
                return;
            }

            if (user.password.length < 6) {
                ToastAndroid.show("La contraseña debe tener al menos 6 caracteres", ToastAndroid.SHORT)
                return;
            }

            // Registrar al usuario con Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, user.gmail, user.password);
            const registeredUser = userCredential.user;

            // Guardar datos adicionales del usuario en Firestore
            await setDoc(doc(db, 'usuarios', registeredUser.uid), {
                nombreUsuario: user.nombreUsuario,
                gmail: user.gmail,
                deudas: user.deudas,
                eventosCreados: user.eventosCreados
            });

            ToastAndroid("Usuario registrado con exito", ToastAndroid.SHORT)
            setUser(initialUserState); // Reiniciar el estado después de guardar
            props.navigation.navigate('Login');
        } catch (error) {
            console.log(error);
            Alert.alert('Error', 'Hubo un problema al registrar el usuario');
        }
    };

    return (
        <View style={styles.padre}>
            <View style={styles.tarjeta}>
            <KeyboardAvoidingView>
            <ScrollView  scrollEnabled={true}>
                <View style={styles.cajaTexto}>
                    <TextInput
                        placeholder="Correo@gmail.com"
                        style={{ paddingHorizontal: 15 }}
                        onChangeText={(text) => handleChangeText(text, 'gmail')}
                        value={user.gmail}
                    />
                </View>

                <View style={styles.cajaTexto}>
                    <TextInput
                        placeholder="Nombre de usuario"
                        style={{ paddingHorizontal: 15 }}
                        onChangeText={(text) => handleChangeText(text, 'nombreUsuario')}
                        value={user.nombreUsuario}
                    />
                </View>

                <View style={styles.cajaTexto}>
                    <TextInput
                        placeholder="Contraseña"
                        style={{ paddingHorizontal: 15 }}
                        onChangeText={(text) => handleChangeText(text, 'password')}
                        value={user.password}
                        secureTextEntry={true}
                    />
                </View>

                <View style={styles.cajaTexto}>
                    <TextInput
                        placeholder="Repita su contraseña"
                        style={{ paddingHorizontal: 15 }}
                        onChangeText={(text) => handleChangeText(text, 'password2')}
                        value={user.password2}
                        secureTextEntry={true}
                    />
                </View>

                <View style={styles.tarjeta}>
                    <Text style={styles.textoColor}>Requisitos para la contraseña:</Text>
                    <Text></Text>
                    <Text>* Longitud mínima de 6 caracteres</Text>
                    <Text>* Solo puede tener letras y números</Text>
                </View>

                <View style={styles.padreBoton}>
                    <TouchableOpacity style={styles.cajaBoton} onPress={registrar}>
                        <Text style={styles.textoBoton}>Registrarse</Text>
                    </TouchableOpacity>
                </View>
                </ScrollView>
                </KeyboardAvoidingView>
            </View>
        </View>
        
    );
}

const styles = StyleSheet.create({
    padre: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    profile: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderColor: 'white',
    },
    tarjeta: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        width: '90%',
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    textoColor: {
        color: '#525FE1'
    },
    cajaTexto: {
        paddingVertical: 20,
        backgroundColor: '#cccccc40',
        borderRadius: 30,
        marginVertical: 10,
    },
    padreBoton: {
        alignItems: 'center',
    },
    cajaBoton: {
        backgroundColor: '#525FE1',
        borderRadius: 30,
        paddingVertical: 20,
        width: 150,
        marginTop: 20,
    },
    textoBoton: {
        textAlign: 'center',
        color: 'white',
    },
});