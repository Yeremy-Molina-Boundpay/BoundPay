import React, { useState, useEffect } from 'react';
import { Text, StyleSheet, View, TouchableOpacity, Alert } from 'react-native';
import { RefreshControl, ScrollView, TextInput } from 'react-native-gesture-handler';
import { getFirestore, collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import appFirebase from '../credenciales';
import { getAuth } from 'firebase/auth';

const auth = getAuth(appFirebase)
const usuarioId = auth.currentUser

const db = getFirestore(appFirebase);

export default function DetallesDeudas(props) {

  const [usuarios, setUsuarios] = useState([]);
  const [evento, setEvento] = useState({});
  const [refreshing, setRefreshing] = useState(false); // Estado de refreshing

  const eventoId = props.route.params.eventoId; // Obtiene el ID del evento actual desde los parámetros de navegación

 
// Función para obtener los usuarios añadidos al evento
const getUsuariosEnEvento = async (eventoId) => {
  try {
    const eventoRef = doc(db, 'eventos', eventoId);
    const eventoDoc = await getDoc(eventoRef);

    if (eventoDoc.exists()) {
      const usuariosEnEvento = eventoDoc.data().usuarios || [];
      
      // Obtener datos de los usuarios y su monto
      const usuariosData = await Promise.all(
        usuariosEnEvento.map(async (usuarioData) => {
          const usuarioRef = doc(db, 'usuarios', usuarioData.id);
          const usuarioDoc = await getDoc(usuarioRef);
          if (usuarioDoc.exists()) {
            return { 
              id: usuarioData.id,
              nombreUsuario: usuarioDoc.data().nombreUsuario,
              montoApagar: usuarioData.montoApagar,
              estadoPago: usuarioData.estadoPago
            };
          }
        })
      );

      setUsuarios(usuariosData.filter(user => user)); // Filtrar usuarios válidos
    }
  } catch (error) {
    console.error('Error al obtener usuarios del evento:', error);
  }
};

const notificarPago= async()=>{
    const notificarPagos = async () => {
      Alert.alert(
        "¿Quieres notificar tu pago?",
        "Confirma si deseas hacerlo.",
        [
          {
            text: "Cancelar",
            onPress: () => console.log("Acción cancelada"),
            style: "cancel",
          },
          {
            text: "Confirmar",
            onPress: async () => {
              try {
                const usuarioId = auth.currentUser.uid;
                const eventoRef = doc(db, 'eventos', eventoId);
                const eventoDoc = await getDoc(eventoRef);
    
                if (!eventoDoc.exists()) {
                  console.error('El evento no existe');
                  return;
                }
    
                const usuariosEnEvento = eventoDoc.data().usuarios || [];
                const usuariosActualizados = usuariosEnEvento.map((usuario) =>
                  usuario.id === usuarioId ? { ...usuario, estadoPago: "Pago notificado" } : usuario
                );
    
                await updateDoc(eventoRef, { usuarios: usuariosActualizados });
    
                console.log('Pago notificado correctamente');
              } catch (error) {
                console.error('Error al notificar el pago:', error);
              }
            },
          },
        ]
      );
    };
    notificarPagos();
}




  // Función para obtener los detalles del evento
  const getOneEvento = async (id) => {
    try {
      const docRef = doc(db, 'eventos', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setEvento(docSnap.data());
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Función para agregar un usuario al evento
  

  // Efecto para obtener los detalles del evento y los usuarios cuando el componente se monta
  useEffect(() => {
    getOneEvento(eventoId);
    getUsuariosEnEvento(eventoId); // Cargar usuarios cuando se carga el evento
  }, [eventoId]);

  // Función onRefresh para el gesto recargar
  const onRefresh = async () => {
    setRefreshing(true); // Inicia el estado de refresco
    await getOneEvento(eventoId); // Vuelve a cargar los detalles del evento
    await getUsuariosEnEvento(eventoId); // Vuelve a cargar los usuarios del evento
    setRefreshing(false); // Termina el estado de refresco
};

 

  return (
    <ScrollView refreshControl={
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>
    }>
      <View style={styles.contenedor}>
        <Text style={styles.textoTitulo}>{evento.titulo}</Text>
        <Text style={styles.texto}>Descripcion:</Text>
        <Text style={styles.textoContendor}>{evento.detalle}</Text>
        <Text style={styles.texto}>Fecha:</Text>
        <Text style={styles.textoContendor}>{evento.fecha}</Text>
        
        <View>
          <Text style={styles.texto}>Monto total:</Text>
          <Text style={styles.textoContendor}>{evento.monto}</Text>
        </View>
          
        
        <Text style={styles.texto}>Usuarios añadidos:</Text>
        <View style={styles.textoContendor}>
          
          {usuarios.map((usuario, index) => (
            <Text key={index} style={styles.textoContendor}>
              {usuario.nombreUsuario} : ${usuario.montoApagar} - {usuario.estadoPago}
            </Text>
          ))}
        </View>  
        <TouchableOpacity style={styles.botonEliminar} onPress={() => notificarPago() }>
          <Text style={styles.textoEliminar}>Marcar como pagado</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
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
  texto: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10
  },
  botonEliminar: {
    backgroundColor: '#525FE1',
    borderColor: '#525FE1',
    borderWidth: 3,
    borderRadius: 20,
    marginLeft: 20,
    marginRight: 20,
    marginTop: 20
  },
  botonAñadir: {
    backgroundColor: '#525FE1',
    borderColor: '#525FE1',
    borderWidth: 3,
    borderRadius: 20,
    marginLeft: 10,
    marginRight: 20,
    marginTop: 25
  },
  textoEliminar: {
    textAlign: 'center',
    padding: 10,
    color: 'white',
    fontSize: 16
  },
  textoContendor: {
    borderColor: 'slategray',
    borderWidth: 1,
    padding: 10,
    marginTop: 10,
    borderRadius: 8
  },
  textoTitulo: {
    borderColor: 'black',
    borderWidth: 1,
    padding: 2,
    marginTop: 10,
    borderRadius: 8,
    fontSize: 19,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  userId: {
    fontSize: 14,
    marginVertical: 5
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  column: {
    width: '48%'
  },
  label: {
    fontWeight: 'bold',
    marginTop: 10
  }
});