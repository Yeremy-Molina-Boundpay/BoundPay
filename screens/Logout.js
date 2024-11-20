import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';

export default function Logout({ navigation }) {
  const auth = getAuth();


  const Logout = async () => {
    const mostrarAlerta = () => {
      Alert.alert(
        "Confirmación de Cierre de Sesión", 
        "¿Estás seguro que deseas cerrar sesión?",
        [
          {
            text: "Cancelar",
            onPress: () => console.log("Cierre de sesión cancelado"),
            style: "cancel",
          },
          {
            text: "Confirmar", 
            onPress: async () => {
                try {
                    await signOut(auth); // Cierra sesión en Firebase
                    navigation.replace('Login'); // Redirige al login
                  } catch (error) {
                    console.error('Error al cerrar sesión:', error);
                  }
            },
          },
        ]
      );
    };
    
    mostrarAlerta();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>¿Deseas cerrar sesión?</Text>
      <TouchableOpacity style={styles.botonCerrarSesion} onPress={Logout}>
        <Text style={styles.textoCerrarSesion}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  titulo: {
    fontSize: 18,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  botonCerrarSesion: {
    backgroundColor: '#FF4D4D',
    padding: 10,
    borderRadius: 5,
  },
  textoCerrarSesion: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});
