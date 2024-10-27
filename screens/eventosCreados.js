import React, { useState, useEffect } from "react";
import { Text, StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';

import appFirebase from '../credenciales'
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, getDoc, setDoct } from 'firebase/firestore';
import { ListItem } from "@rneui/themed";
import { ListItemChevron } from "@rneui/base/dist/ListItem/ListItem.Chevron";
import { ListItemContent } from "@rneui/base/dist/ListItem/ListItem.Content";
import { ListItemTitle } from "@rneui/base/dist/ListItem/ListItem.Title";
import { ListItemSubtitle } from "@rneui/base/dist/ListItem/ListItem.Subtitle";
const db = getFirestore(appFirebase)

export default function Eventos(props){
    
    const [lista, setLista] = useState([])

    //Logica para llamar la lista de los eventos
    useEffect(() => {
        const getLista = async()=>{
            try {
                const querySnapshot = await getDocs(collection(db,'eventos'))
                const docs = []
                querySnapshot.forEach((doc)=>{
                    const {titulo, detalle, fecha, hora} = doc.data()
                    docs.push({
                        id:doc.id,
                        titulo,
                        detalle,
                        fecha
                    })
                })
                setLista(docs)
            } catch (error) {
                console.log(error);
            }
        }
        getLista()
    }, [lista])

    return(
        <ScrollView>
            <View style={styles.contenedor}>
                {lista.map((even)=>(
                    <ListItem bottomDivider key={even.id} onPress={()=>{props.navigation.navigate('Detalles',{
                        eventoId: even.id
                    })}}>
                        <ListItemChevron/>

                        <ListItemContent>
                            <ListItemTitle style={styles.titulo}>{even.titulo}</ListItemTitle>
                            <ListItemSubtitle>{even.fecha}</ListItemSubtitle>
                        </ListItemContent>
                    </ListItem>
                ))}
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    contenedor:{
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
        elevation:5
    },
    titulo:{
        fontWeight:'bold'
    }
})