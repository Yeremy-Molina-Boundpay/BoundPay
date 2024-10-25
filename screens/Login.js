import React, { useState } from "react";
import { Text, StyleSheet, View, Image, TextInput, TouchableOpacity, Alert } from "react-native";
import { auth } from "../credenciales";
import AsyncStorage from "@react-native-async-storage/async-storage";
import appFirebase from '../credenciales'
import {  signInWithEmailAndPassword, initializeAuth, getReactNativePersistence } from "firebase/auth";


//Inicializar firebase auth con persistencia


export default function Login(props){
    

    //Crear la variable de estado
    const [email, setEmail] = useState()
    const [password, setPassword] = useState()

    const login = async()=>{
        try {
            await signInWithEmailAndPassword(auth, email, password)
            Alert.alert("Iniciando sesion", "Accediendo...")
            props.navigation.navigate('barraNavegacion')
        } catch (error) {
            console.log(error)
            Alert.alert("Error", "El usuario o la contraseña son incorrectos")
        }
    }

    const registro=()=>{
        try{

            props.navigation.navigate('Registro')

        }catch(error){
            console.log(error)
            Alert.alert("Error", "El usuario o la contraseña son incorrectos")
        }

    }
        return(
            <View style={styles.padre}>
                
                <View>
                    <Image source={require('../assets/profile.jpg')} style={styles.profile} />
                </View>

                <View style={styles.tarjeta}>
                    <View style={styles.cajaTexto}>
                        <TextInput placeholder="correo@gmail.com" style={{paddingHorizontal:15}}
                        onChangeText={(text)=>setEmail(text)} />
                    </View>

                    <View style={styles.cajaTexto}>
                        <TextInput placeholder="contraseña" style={{paddingHorizontal:15}}
                        onChangeText={(text)=>setPassword(text)}
                        secureTextEntry={true} />
                    </View>

                    <View style={styles.padreBoton}>
                        <TouchableOpacity style={styles.cajaBoton} onPress={login} >
                            <Text style={styles.textoBoton}>Ingresar</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.container}>
                        <Text>¿No tienes una cuenta? </Text>
                        <TouchableOpacity onPress={() => props.navigation.navigate('Registro')}>
                            <Text style={styles.link}>Regístrate aquí</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
        );
}

const styles = StyleSheet.create({
    padre:{
        flex:1,
        justifyContent:'center',
        alignItems:'center',
        backgroundColor:'white'
    },
    profile:{
        width:100,
        height:100,
        borderRadius:50,
        borderColor:'white'
    },
    tarjeta:{
        margin:20,
        backgroundColor:'white',
        borderRadius:20,
        width:'90%',
        padding:20,
        shadowColor:'#000',
        shadowOffset:{
            width:0,
            height:2
        },
        shadowOpacity:0.25,
        shadowRadius:4,
        elevation:5,
    },
    cajaTexto:{
        paddingVertical:20,
        backgroundColor:'#cccccc40',
        borderRadius:30,
        marginVertical:10
    },
    padreBoton:{
        alignItems:'center',
    },
    cajaBoton:{
        backgroundColor:'#525FE1',
        borderRadius:30,
        paddingVertical:20,
        width:150,
        marginTop:20
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 30
    },
    link: {
        color: '#525FE1', 
        textDecorationLine: 'underline',
    },
    textoBoton:{
        textAlign:'center',
        color:'white'
        
    }
});