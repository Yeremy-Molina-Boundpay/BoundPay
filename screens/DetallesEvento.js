import React, { useState, useEffect } from 'react';
import { Text, StyleSheet, View, TouchableOpacity, Alert, ToastAndroid } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { getFirestore, collection, query, where, getDocs, doc, getDoc, updateDoc,deleteDoc } from 'firebase/firestore';
import appFirebase from '../credenciales';
import { KeyboardAvoidingView } from 'react-native';
import { ScrollView } from 'react-native';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Qr from './generarQr'

const db = getFirestore(appFirebase);

export default function DetallesEvento(props) {
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [usuarios, setUsuarios] = useState([]);
  const [evento, setEvento] = useState({});
  const [montosEditados, setMontosEditados] = useState({}); 
  const [mostrarQr, setMostrarQr] = useState(false);
 const [modalVisible, setModalVisible] =useState(false);



  const eventoId = props.route.params.eventoId; // Obtiene el ID del evento actual desde los parámetros de navegación

  // Función para obtener los usuarios añadidos al evento
  const getUsuariosEnEvento = async (eventoId) => {
    try {
      const eventoRef = doc(db, 'eventos', eventoId);
      const eventoDoc = await getDoc(eventoRef);
  
      if (eventoDoc.exists()) {
        const usuariosEnEvento = eventoDoc.data().usuarios || [];
  
        const usuariosData = await Promise.all(
          usuariosEnEvento.map(async (usuarioData) => {
            const usuarioRef = doc(db, 'usuarios', usuarioData.id);
            const usuarioDoc = await getDoc(usuarioRef);
            if (usuarioDoc.exists()) {
              return { 
                id: usuarioData.id,
                nombreUsuario: usuarioDoc.data().nombreUsuario,
                montoApagar: usuarioData.montoApagar 
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
  const agregarUsuarioAlEvento = async () => {
    if (!nombreUsuario.trim()) {
      ToastAndroid.show('Por favor, ingresa un nombre de usuario.', ToastAndroid.SHORT);
      return;
    }
  
    try {
      const q = query(collection(db, 'usuarios'), where('nombreUsuario', '==', nombreUsuario));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        querySnapshot.forEach(async (docSnapshot) => {
          const usuarioId = docSnapshot.id;
          const usuarioNombre = docSnapshot.data().nombreUsuario;
          
  
          const montoApagar = evento.monto / evento.cantidadParticipantes;  

          if (!usuarios.some((usuario) => usuario.id === usuarioId)) {
            const eventoRef = doc(db, 'eventos', eventoId);
            const eventoDoc = await getDoc(eventoRef);
            const usuariosEnEvento = eventoDoc.data().usuarios || [];  // Obtener usuarios ya existentes o un arreglo vacío
  
  
            if (eventoDoc.exists()&& usuariosEnEvento.length < evento.cantidadParticipantes) {
              
              // Añadir el usuario junto con el monto que debe pagar
              await updateDoc(eventoRef, {
                usuarios: [...usuariosEnEvento, { id: usuarioId, montoApagar }]  // Guardamos el id y el montoApagar
              });

  
              const usuarioRef = doc(db, 'usuarios', usuarioId);
              const usuarioDoc = await getDoc(usuarioRef);
              

              if (usuarioDoc.exists()) {
                const deudas = usuarioDoc.data().deudas || [];
                
  
                await updateDoc(usuarioRef, {
                  deudas: [...deudas, eventoId]  // Añadir el evento a las deudas del usuario
                });
  
                // Agregar al estado de usuarios para mostrarlo en la UI
                setUsuarios([...usuarios, { nombreUsuario: usuarioNombre, id: usuarioId, montoApagar }]);
  
                ToastAndroid.show('Añadido al evento y el evento se agregó a sus deudas.',ToastAndroid.SHORT);
  
                // Vaciar el campo del TextInput después de añadir el usuario
                setNombreUsuario('');
              }
            }
            if (usuariosEnEvento.length >= evento.cantidadParticipantes){
              ToastAndroid.show('No puede agregar más usuarios a este evento', ToastAndroid.SHORT)
            }
          } else {
            ToastAndroid.show('No puede agregar el mismo usuario dos veces', ToastAndroid.SHORT);
          }
        });
      } else {
        Alert.alert('Error', 'No se encontró ningún usuario con ese nombre.');
      }
    } catch (error) {
      console.error('Error al obtener el ID del usuario:', error);
      Alert.alert('Error', 'Ocurrió un error al obtener el usuario.');
    }
  };
  
  const generarQr = async () => {
    try {
      setModalVisible(true)
      setMostrarQr(true); 
      console.log(eventoId);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getOneEvento(eventoId);
    getUsuariosEnEvento(eventoId); // Carga usuarios cuando se carga el evento
  }, [eventoId]);

const deleteEvento = async (id) => {
    await deleteDoc(doc(db, 'eventos', id));
    ToastAndroid.show('Evento eliminado correctamente', ToastAndroid.SHORT);
    props.navigation.navigate('EventosCreados');
  };
  // Función para asignar los montos personalizados y actualizarlos en la base de datos
  const asignarMonto = async () => {
    try {
      const eventoRef = doc(db, 'eventos', eventoId);
      const eventoDoc = await getDoc(eventoRef);

      if (eventoDoc.exists()) {
        const usuariosActualizados = usuarios.map((usuario) => ({
          id: usuario.id,
          montoApagar: montosEditados[usuario.id] || usuario.montoApagar,
        }));

        await updateDoc(eventoRef, { usuarios: usuariosActualizados });

        Alert.alert('Éxito', 'Montos actualizados correctamente');
        getUsuariosEnEvento(eventoId); // Recarga usuarios después de actualizar
      }
    } catch (error) {
      console.error('Error al actualizar los montos:', error);
      Alert.alert('Error', 'Ocurrió un error al actualizar los montos.');
    }
  };


    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100} 
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.contenedor}>
        <Text style={styles.textoTitulo}>{evento.titulo}</Text>
        <Text style={styles.texto}>Descripcion:</Text>
        <Text style={styles.textoContendor}>{evento.detalle}</Text>
        <Text style={styles.texto}>Fecha:</Text>
        <Text style={styles.textoContendor}>{evento.fecha}</Text>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.texto}>Monto total:</Text>
            <Text style={styles.textoContendor}>{evento.monto}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.texto}>Cantidad usuarios:</Text>
            <Text style={styles.textoContendor}>{evento.cantidadParticipantes}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.texto}>Añadir participantes:</Text>
            <TextInput
              style={styles.textoContendor}
              placeholder="Nombre de usuario"
              value={nombreUsuario}
              onChangeText={(text) => setNombreUsuario(text)} // Actualiza el valor ingresado
            />
          </View>
          
          <View style={styles.row2}>
            
            <View style={styles.column2}>
            
            <Text></Text>
            <TouchableOpacity style={styles.botonAñadir} onPress={agregarUsuarioAlEvento}>
              <Text style={styles.textoEliminar}><Ionicons size={20} name="person-add-outline"/></Text>
              {mostrarQr && <Qr idEvento={eventoId} modalVisible={modalVisible} 
        setModalVisible={setModalVisible} />}{mostrarQr && <Qr  idEvento={eventoId} modalVisible={modalVisible} 
        setModalVisible={setModalVisible} />}
            </TouchableOpacity>

            

            
            </View>
            <View style={styles.column2}>
            <Text></Text>
            <TouchableOpacity style={styles.botonQr} onPress={generarQr}>
              <Text style={styles.textoEliminar}><Ionicons size={20} name="qr-code-outline"/></Text>
           </TouchableOpacity>

            </View>
            </View>

        </View>
        

        <Text style={styles.texto}>Usuarios añadidos:</Text>
        
        <View style={styles.textoContendor}>
        {usuarios.map((usuario, index) => (
          <View key={index} style={styles.usuarioMontoContainer}>
            <Text style={styles.usuarioNombre}>{usuario.nombreUsuario}:</Text>
            <TextInput
              style={styles.usuarioMonto}
              placeholder={`$${usuario.montoApagar}`}
              keyboardType="numeric"
              value={montosEditados[usuario.id]?.toString() || (isNaN(usuario.montoApagar) ? '' : usuario.montoApagar.toString())}  // Evitar NaN
                  onChangeText={(text) => {
                    const monto = text.trim();
                    if (monto === '' || !isNaN(monto)) {  // Aceptar vacío o valores numéricos
                      setMontosEditados({ ...montosEditados, [usuario.id]: monto === '' ? 0 : parseFloat(monto) });
                    }
                  }}
                />
          </View>
        ))}
        
        <TouchableOpacity style={styles.botonMonto} onPress={asignarMonto}>
            <Text style={styles.textoEliminar}>Cambiar montos</Text>
          </TouchableOpacity>
        </View>  
        
        <TouchableOpacity style={styles.botonEliminar} onPress={() => deleteEvento(eventoId)}>
          <Text style={styles.textoEliminar}>Finalizar evento</Text>
        </TouchableOpacity>
        
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  column2: {
    width: '35%' 
  },
  row2: {
    flexDirection: 'row',
    
  },
  botonAñadir: {
    backgroundColor: '#525FE1',
    borderColor: '#525FE1',
    borderWidth: 3,
    borderRadius: 20,
    marginHorizontal: 10, 
    marginTop: 25,
  },
  botonQr: {
    backgroundColor: '#525FE1',
    borderColor: '#525FE1',
    borderWidth: 3,
    borderRadius: 20,
    marginHorizontal: 10, 
    marginTop: 25,
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
  botonMonto: {
    backgroundColor: '#525FE1',
    borderColor: '#525FE1',
    width:150,
    height:50,
    borderWidth: 3,
    borderRadius: 20,
    marginLeft: 75,
    marginRight: 20,
    marginTop: 10
  },
  column: {
    width: '48%'
  },
  label: {
    fontWeight: 'bold',
    marginTop: 10
  },
  usuarioMontoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  usuarioNombre: {
    flex: 1,
    fontSize: 14,
    marginRight: 10,
  },
  usuarioMonto: {
    flex: 1,
    borderColor: 'slategray',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
  }

});
