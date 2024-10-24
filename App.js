import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import 'react-native-gesture-handler';

import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import Login from './screens/Login';
import Home from './screens/Home';
import BarraNavegacion from './barraNavegacion';



export default function App() {

const Stack = createStackNavigator();

function MyStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={Login}
      options={{
        title:"Inicio De Sesion",
        headerTintColor:"white",
        headerTitleAlign:'center',
        headerStyle: { backgroundColor: "#525FE1" },
      }} />
      <Stack.Screen name="barraNavegacion" component={BarraNavegacion}/*se cambio el redireccinamineto, ahora lleva a la barra de navegacion y esta permite ver todas las pantallas */
      options={{
        title:"Boundpay",
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
