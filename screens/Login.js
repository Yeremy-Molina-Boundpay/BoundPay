import React, { useState,useEffect } from "react";
import { Text, StyleSheet, View, Image,ToastAndroid, TextInput, TouchableOpacity, Alert } from "react-native";
import { auth } from "../credenciales";
import AsyncStorage from "@react-native-async-storage/async-storage";
import appFirebase from '../credenciales'
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { ScrollView,RefreshControl } from 'react-native';
import {  signInWithEmailAndPassword,sendEmailVerification, initializeAuth, getReactNativePersistence } from "firebase/auth";


//Inicializar firebase auth con persistencia
const db = getFirestore(appFirebase);

export default function Login(props){
    

    //Crear la variable de estado
    const [email, setEmail] = useState()
    const [password, setPassword] = useState()
    const [estado, setEstado] = useState("loading");
    const [refreshing, setRefreshing] = useState(false); 


    async function fetchModoMantencion() {
        try {
            const docRef = doc(db, "config", "mantencion"); 
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return docSnap.data().modoMantencion; // Devuelve el valor de modoMantencion
            } else {
                console.log("El documento no existe");
                return false;
            }
        } catch (error) {
            console.error("Error al obtener modoMantencion:", error);
            return false; 
        }
    }

   
    const verificarModoMantencion = async () => {
        const isMantencion = await fetchModoMantencion();
        if (isMantencion) {
            setEstado("mantencion");
        } else {
            setEstado("normal");
        }
    };

    useEffect(() => {
        verificarModoMantencion();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true); // Inicia el estado de refresco
        await verificarModoMantencion()
        setRefreshing(false); // Termina el estado de refresco
    };

    const login = async()=>{
        try {
            await signInWithEmailAndPassword(auth, email, password)
            ToastAndroid.show('Sesion iniciada correctamente.', ToastAndroid.SHORT, ToastAndroid.BOTTOM);
            props.navigation.replace('barraNavegacion')
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
    if (estado === "loading") {
        return <Image 
        source={require('../assets/splash.png')} 
        style={styles.image} 
      />;
    }
    
    if (estado === "mantencion") {
        return (
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>
    }>
            <View style={styles.padre}>
                <View>
                    <Image source={require('../assets/mantencion.png')} style={styles.mantencion} />
                </View>

                <View style={styles.tarjeta}>
                    <View >
                        <Text style={styles.textoTitulo}>App en mantenimiento</Text>
                        <Text></Text>
                        <Text style={styles.textoParrafo}>En estos momentos estamos trabajando </Text>
                        <Text style={styles.textoParrafo}>para mejorar la app. Vuelva a intentar más tarde...</Text>
                    </View>
                </View>
            </View>
            </ScrollView>
        );
    }
        return(
            <View style={styles.padre}>
                
                <View>
                    <Image source={require('../assets/profile.jpg')} style={styles.profile} />
                </View>

                <View style={styles.tarjeta}>
                    <View style={styles.cajaTexto}>
                        <TextInput placeholder="Correo@gmail.com" style={{paddingHorizontal:15}}
                        onChangeText={(text)=>setEmail(text)} />
                    </View>

                    <View style={styles.cajaTexto}>
                        <TextInput placeholder="Contraseña" style={{paddingHorizontal:15}}
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
    mantencion:{
        width:150,
        height:150,
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
        
    },
    textoTitulo: {
        padding: 2,
        marginTop: 10,
        borderRadius: 8,
        fontSize: 19,
        fontWeight: 'bold',
        textAlign: 'center'
      },
      textoParrafo:{
        padding: 2,
        marginTop: 10,
        borderRadius: 8,
        fontSize: 15,
        textAlign: 'center'
      },
      image: {
        flex: 1, 
        resizeMode: 'cover', 
        width: '100%', 
        height: '100%', 
      },
});