import React from "react"
import { Text, View } from "react-native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";/*Con esto se crea la barra de navegacion  */
import { NavigationContainer } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import Home from "./screens/Home";
import QrScanner from "./screens/qrScanner";
import CrearEvento from "./screens/crearEvento";




const BarraNavegacion=()=>{ /*Este es el componente */
        const barraNavegacion = createBottomTabNavigator();
        const colors = {
            primary: "#525FE1",
            black: '#000000',
            lightGrayText: '#D3D3D3',
        };

        return(

            
                
            <barraNavegacion.Navigator
                screenOptions={{ /*aqui se define el estilo de la barra de navegacion */
                    tabBarActiveTintColor: colors.primary,
                    tabBarInactiveTintColor: colors.black,
                    tabBarShowLabel: true,
                    tabBarStyle: {
                        borderWidth: 0.5,
                        borderBottomWidth: 1,
                        backgroundColor: 'white',
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        borderColor: colors.lightGrayText,
                    },
                }}
            >
                <barraNavegacion.Screen /*estos son cada uno de los botones */
                    name="home"
                    component={Home}
                    options={{
                        headerShown: false,/*esto es para que no salga una segunda barra con el titulo en cada pantalla */
                        tabBarLabel: 'Deudas',
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name="cash-outline" color={color} size={size} />/*esto es para los iconos */
                        ),
                    }}
                />
                
                <barraNavegacion.Screen
                    name="qr"
                    component={QrScanner}
                    options={{
                        headerShown: false,
                        tabBarLabel: 'Escanear QR',
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name="qr-code-outline" color={color} size={size} />
                        ),
                    }}
                />
                
                <barraNavegacion.Screen
                    name="crearEvento"
                    component={CrearEvento}
                    options={{
                        headerShown: false,
                        tabBarLabel: 'Crear Evento',
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name="add-circle-outline" color={color} size={size} />
                        ),
                    }}
                />
    </barraNavegacion.Navigator>



        

            
        );
}

export default BarraNavegacion;

