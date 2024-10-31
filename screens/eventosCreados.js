import React, { useState, useEffect } from "react";
import { Text, StyleSheet, View, ScrollView } from 'react-native';
import appFirebase from '../credenciales';
import { getFirestore, collection, getDocs, query, where, doc, getDoc,documentId } from 'firebase/firestore';
import { ListItem } from "@rneui/themed";
import { getAuth } from "firebase/auth";

const db = getFirestore(appFirebase);

export default function Eventos(props) {
    const [lista, setLista] = useState([]);
    const [userId, setUserId] = useState(null); 
    const [eventosCreados, setEventosCreados] = useState([]); // Para almacenar los eventos creados por el usuario

    // Obtener ID del usuario actual
    useEffect(() => {
        const auth = getAuth(appFirebase);
        const user = auth.currentUser; // Obtiene el usuario autenticado

        if (user) {
            setUserId(user.uid); // Guarda el ID del usuario autenticado
        } else {
            console.log("No hay usuario autenticado");
        }
    }, []);
    


    useEffect(() => {
        const getEventosCreados = async () => {
            if (userId) { 
                try {
                    const usuarioRef = doc(db, 'usuarios', userId); 
                    const usuarioDoc = await getDoc(usuarioRef); 

                    if (usuarioDoc.exists()) {
                        const data = usuarioDoc.data();
                        const eventos = data.eventosCreados || []; // Obtiene la lista de eventos creados
                        console.log("Eventos creados por el usuario:", eventos); // muestra los id de los eventos en consola, ayuda a la hora de probar el codigo, no se muestra en la app
                        setEventosCreados(eventos); // Guarda los eventos creados en el estado
                    } else {
                        console.log("El documento del usuario no existe.");
                    }
                } catch (error) {
                    console.log("Error al obtener los eventos creados:", error);
                }
            }
        };

        getEventosCreados();
    }, [userId]);


    useEffect(() => {
        const getListaEventos = async () => {
            if (eventosCreados.length > 0) { // Solo ejecuta si hay eventos creados
                try {
                    const eventosRef = collection(db, 'eventos');
                    // Verifica si eventosCreados contiene elementos válidos
                    const eventosValidos = eventosCreados.filter(id => id); 
                    console.log("Eventos válidos para la consulta:", eventosValidos);

                    if (eventosValidos.length > 0) {
                        const eventosQuery = query(eventosRef, where(documentId(), 'in', eventosValidos)); // Filtra eventos por las IDs en eventosCreados

                        const querySnapshot = await getDocs(eventosQuery);
                        const docs = [];
                        querySnapshot.forEach((doc) => {
                            const { titulo, detalle, monto, cantidadParticipantes,usuarios, fecha } = doc.data();
                            docs.push({
                                id: doc.id,
                                titulo,
                                detalle,
                                monto,
                                cantidadParticipantes,
                                usuarios,
                                fecha
                            });
                        });
                        console.log("Eventos obtenidos:", docs); // Muestra los eventos obtenidos en la consola
                        setLista(docs); // Guarda los eventos en la lista
                    } else {
                        console.log("No hay eventos válidos en eventosCreados.");
                    }
                } catch (error) {
                    console.log("Error al obtener la lista de eventos:", error);
                }
            } else {
                console.log("No hay eventos creados para mostrar.");
            }
        };

        getListaEventos();
    }, [eventosCreados]); 

    return (
        <ScrollView>
            <View style={styles.contenedor}>
                {lista.length > 0 ? ( 
                    lista.map((even) => (
                        <ListItem bottomDivider key={even.id} onPress={() => { props.navigation.navigate('Detalles', { eventoId: even.id }) }}>
                            <ListItem.Content>
                                <ListItem.Title style={styles.titulo}>{even.titulo}</ListItem.Title>
                                <ListItem.Subtitle>{even.fecha}</ListItem.Subtitle>
                            </ListItem.Content>
                        </ListItem>
                    ))
                ) : (
                    <Text>No hay eventos disponibles.</Text> // Mensaje alternativo
                )}
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
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    titulo: {
        fontWeight: 'bold'
    }
});
