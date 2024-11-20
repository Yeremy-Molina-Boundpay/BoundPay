import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import 'react-native-gesture-handler';

import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import Login from './screens/Login';
import Registro from './screens/registro';
import BarraNavegacion from './barraNavegacion';
import DetallesEvento from './screens/DetallesEvento';
import DetallesDeudas from './screens/detalleDeuda';
import Logout from './screens/Logout';



export default function App() {

const Stack = createStackNavigator();

function MyStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={Login}
      options={{
        title:"Inicio de sesion",
        headerTintColor:"white",
        headerTitleAlign:'center',
        headerStyle: { backgroundColor: "#525FE1" },
      }} />
      <Stack.Screen name="Registro" component={Registro}
      options={{
        title:"Registro de usuario",
        headerTintColor:"white",
        headerTitleAlign:'center',
        headerStyle: { backgroundColor: "#525FE1" },
      }} />
      <Stack.Screen name="CerrarSesion" component={Logout}
      options={{
        title: "Cerrar Sesión",
        headerTintColor: "white",
        headerTitleAlign: 'center',
        headerStyle: { backgroundColor: "#525FE1" },
      }} />
      <Stack.Screen name="Detalles" component={DetallesEvento}
      options={{
        title:"BoundPay",
        headerTintColor:"white",
        headerTitleAlign:'center',
        headerStyle: { backgroundColor: "#525FE1" },
      }} />
      <Stack.Screen name="DetallesDeudas" component={DetallesDeudas}
      options={{
        title:"BoundPay",
        headerTintColor:"white",
        headerTitleAlign:'center',
        headerStyle: { backgroundColor: "#525FE1" },
      }} />
      <Stack.Screen name="barraNavegacion" component={BarraNavegacion}/*se cambio el redireccinamineto, ahora lleva a la barra de navegacion y esta permite ver todas las pantallas */
      options={{
        title:"BoundPay",
        headerTintColor:"white",
        headerTitleAlign:'center',
        headerStyle: { backgroundColor: "#525FE1" },
      }} />
    </Stack.Navigator>
  );
}

  return (
    <NavigationContainer>
      <MyStack/>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
