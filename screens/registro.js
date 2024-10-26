import React, { useState } from "react";
import { Text, StyleSheet, View, Image,ToastAndroid, TextInput, TouchableOpacity, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import appFirebase from '../credenciales';
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth } from "../credenciales";





export default function Registro(props) {
    
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");

   
    

    const registrar = async () => {
        try {
            if(password==password2){
                await createUserWithEmailAndPassword(auth, email, password);

               
    
                
                ToastAndroid.show('Tu cuenta se creo exitosamente.', ToastAndroid.SHORT);
                props.navigation.navigate('Login');
                

            }else{
                ToastAndroid.show('Las contraseñas no coinciden', ToastAndroid.LONG);
            }
            
        } catch (error) {
            console.log(error);
            Alert.alert("Error", "No se pudo crear la cuenta. Intenta de nuevo.");
        }
    };

    return (
        <View style={styles.padre}>
            <View>
                <Image source={require('../assets/profile.jpg')} style={styles.profile} />
            </View>

            <View style={styles.tarjeta}>
                <View style={styles.cajaTexto}>
                    <TextInput
                        placeholder="Correo@gmail.com"
                        style={{ paddingHorizontal: 15 }}
                        onChangeText={(text) => setEmail(text)}
                    />
                </View>


                <View style={styles.cajaTexto}>
                    <TextInput
                        placeholder="Contraseña"
                        style={{ paddingHorizontal: 15 }}
                        onChangeText={(text) => setPassword(text)}
                        secureTextEntry={true}
                    />
                </View>

                <View style={styles.cajaTexto}>
                    <TextInput
                        placeholder="Repita su contraseña"
                        style={{ paddingHorizontal: 15 }}
                        onChangeText={(text) => setPassword2(text)}
                        secureTextEntry={true}
                    />
                </View>

                <View style={styles.padreBoton}>
                    <TouchableOpacity style={styles.cajaBoton} onPress={registrar}>
                        <Text style={styles.textoBoton}>Registrarse</Text>
                    </TouchableOpacity>
                </View>
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