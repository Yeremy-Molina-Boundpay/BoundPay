import React, { useState, useEffect } from 'react'
import { Text, StyleSheet, View, TouchableOpacity, Alert } from 'react-native'

import appFirebase from '../credenciales'
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, getDoc, setDoct } from 'firebase/firestore';
const db = getFirestore(appFirebase)

export default function DetallesEvento(props) {

    const [evento, setEvento] = useState({})

    const getOneEvento = async(id)=>{
        try {
           const docRef = doc(db, 'eventos', id)
           const docSnap = await getDoc(docRef)
           setEvento(docSnap.data()) 
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(()=>{
        getOneEvento(props.route.params.eventoId)
    },[])

    const deleteEvento = async(id)=>{
        await deleteDoc(doc(db, 'eventos', id))
        Alert.alert('Exito', 'Evento eliminado correctamente')
        props.navigation.navigate('EventosCreados')
    }

    return (
      <View>
        <View style={styles.contenedor}>
            <Text style={styles.textoTitulo}>{evento.titulo}</Text>
            <Text style={styles.texto}>Descripcion:</Text>
            <Text style={styles.textoContendor}>{evento.detalle}</Text>
            <Text style={styles.texto}>Monto total:</Text>
            <Text style={styles.textoContendor}>{evento.monto}</Text>
            <Text style={styles.texto}>Cantidad participantes:</Text>
            <Text style={styles.textoContendor}>{evento.cantidadParticipantes}</Text>
            <Text style={styles.texto}>Fecha:</Text>
            <Text style={styles.textoContendor}>{evento.fecha}</Text>

            <TouchableOpacity style={styles.botonEliminar} onPress={()=>deleteEvento(props.route.params.eventoId)}>
                <Text style={styles.textoEliminar}>Finalizar evento</Text>
            </TouchableOpacity>
        </View>
      </View>
    )
  }


const styles = StyleSheet.create({
    contenedor:{
        margin:20,
        backgroundColor:'white',
        borderRadius:20,
        width:'90%',
        padding:10,
        shadowColor:'#000',
        shadowOffset:{
            width:0,
            height:2
        },
        shadowOpacity:0.25,
        shadowRadius:4,
        elevation:5
    },
    texto:{
        fontSize:16,
        fontWeight:'600',
        marginTop:10
    },
    botonEliminar:{
        backgroundColor:'#525FE1',
        borderColor:'#525FE1',
        borderWidth:3,
        borderRadius:20,
        marginLeft:20,
        marginRight:20,
        marginTop:20
    },
    textoEliminar:{
        textAlign:'center',
        padding:10,
        color:'white',
        fontSize:16
    },
    textoContendor:{
        borderColor:'slategray',
        borderWidth:1,
        padding:10,
        marginTop:10,
        borderRadius:8
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
    }
})