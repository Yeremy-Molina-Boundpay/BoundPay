import React, { useState, useEffect } from 'react';
import { Text, StyleSheet, View, TouchableOpacity, Alert } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { getFirestore, collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import appFirebase from '../credenciales';

const db = getFirestore(appFirebase);

export default function DetallesEvento(props) {
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [usuarios, setUsuarios] = useState([]);
  const [evento, setEvento] = useState({});

  const eventoId = props.route.params.eventoId; // Obtén el ID del evento actual desde los parámetros de navegación

  // Función para obtener los usuarios añadidos al evento
  const getUsuariosEnEvento = async (eventoId) => {
    try {
      const eventoRef = doc(db, 'eventos', eventoId);
      const eventoDoc = await getDoc(eventoRef);

      if (eventoDoc.exists()) {
        const usuariosEnEvento = eventoDoc.data().usuarios || [];
        const usuariosData = await Promise.all(
          usuariosEnEvento.map(async (usuarioId) => {
            const usuarioRef = doc(db, 'usuarios', usuarioId);
            const usuarioDoc = await getDoc(usuarioRef);
            if (usuarioDoc.exists()) {
              return { id: usuarioId, nombreUsuario: usuarioDoc.data().nombreUsuario };
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
      Alert.alert('Error', 'Por favor, ingresa un nombre de usuario.');
      return;
    }

    try {
      const q = query(collection(db, 'usuarios'), where('nombreUsuario', '==', nombreUsuario));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        querySnapshot.forEach(async (docSnapshot) => {
          const usuarioId = docSnapshot.id;
          const usuarioNombre = docSnapshot.data().nombreUsuario;

          if (!usuarios.some((usuario) => usuario.id === usuarioId)) {
            const eventoRef = doc(db, 'eventos', eventoId);
            const eventoDoc = await getDoc(eventoRef);

            if (eventoDoc.exists()) {
              const usuariosEnEvento = eventoDoc.data().usuarios || [];

              await updateDoc(eventoRef, {
                usuarios: [...usuariosEnEvento, usuarioId]
              });

              const usuarioRef = doc(db, 'usuarios', usuarioId);
              const usuarioDoc = await getDoc(usuarioRef);

              if (usuarioDoc.exists()) {
                const deudas = usuarioDoc.data().deudas || [];

                await updateDoc(usuarioRef, {
                  deudas: [...deudas, eventoId]
                });

                setUsuarios([...usuarios, { nombreUsuario: usuarioNombre, id: usuarioId }]);

                Alert.alert('Éxito', `Usuario ${usuarioNombre} añadido al evento y el evento se agregó a sus deudas.`);

                // Vacía el campo del TextInput después de agregar el usuario
                setNombreUsuario('');
              }
            }
          } else {
            Alert.alert('Advertencia', 'Este usuario ya está en la lista.');
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

  // Efecto para obtener los detalles del evento y los usuarios cuando el componente se monta
  useEffect(() => {
    getOneEvento(eventoId);
    getUsuariosEnEvento(eventoId); // Cargar usuarios cuando se carga el evento
  }, [eventoId]);

  // Función para eliminar el evento
  const deleteEvento = async (id) => {
    await deleteDoc(doc(db, 'eventos', id));
    Alert.alert('Éxito', 'Evento eliminado correctamente');
    props.navigation.navigate('EventosCreados');
  };

  return (
    <View>
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
          <View style={styles.column}>
            <Text></Text>
            <TouchableOpacity style={styles.botonAñadir} onPress={agregarUsuarioAlEvento}>
              <Text style={styles.textoEliminar}>Añadir</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.texto}>Usuarios añadidos:</Text>
        <View style={styles.textoContendor}>
          
          {usuarios.map((usuario, index) => (
            <Text key={index} style={styles.userId}>{usuario.nombreUsuario}</Text> // Muestra el nombre del usuario
          ))}
        </View>
        <TouchableOpacity style={styles.botonEliminar} onPress={() => deleteEvento(eventoId)}>
          <Text style={styles.textoEliminar}>Finalizar evento</Text>
        </TouchableOpacity>
      </View>
    </View>
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
