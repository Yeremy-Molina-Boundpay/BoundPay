import React, { useState, useEffect } from "react";
import { Text, StyleSheet, View, ScrollView, RefreshControl } from 'react-native';
import appFirebase from '../credenciales';
import { getFirestore, collection, getDocs, query, where, doc, getDoc, documentId } from 'firebase/firestore';
import { ListItem } from "@rneui/themed";
import { getAuth } from "firebase/auth";

const db = getFirestore(appFirebase);

export default function Eventos(props) {
    const [lista, setLista] = useState([]);
    const [userId, setUserId] = useState(null); 
    const [eventosCreados, setEventosCreados] = useState([]);
    const [refreshing, setRefreshing] = useState(false); // Estado de refreshing

    // Obtener ID del usuario actual
    useEffect(() => {
        const auth = getAuth(appFirebase);
        const user = auth.currentUser;

        if (user) {
            setUserId(user.uid);
        } else {
            console.log("No hay usuario autenticado");
        }
    }, []);
    
    const getEventosCreados = async () => {
        if (userId) {
            try {
                const usuarioRef = doc(db, 'usuarios', userId);
                const usuarioDoc = await getDoc(usuarioRef);

                if (usuarioDoc.exists()) {
                    const data = usuarioDoc.data();
                    const eventos = data.eventosCreados || [];
                    console.log("Eventos creados por el usuario:", eventos);
                    setEventosCreados(eventos);
                } else {
                    console.log("El documento del usuario no existe.");
                }
            } catch (error) {
                console.log("Error al obtener los eventos creados:", error);
            }
        }
    };

    const getListaEventos = async () => {
        if (eventosCreados.length > 0) {
            try {
                const eventosRef = collection(db, 'eventos');
                const eventosValidos = eventosCreados.filter(id => id);
                console.log("Eventos válidos para la consulta:", eventosValidos);

                if (eventosValidos.length > 0) {
                    const eventosQuery = query(eventosRef, where(documentId(), 'in', eventosValidos));
                    const querySnapshot = await getDocs(eventosQuery);
                    const docs = [];
                    querySnapshot.forEach((doc) => {
                        const { titulo, detalle, monto, cantidadParticipantes, usuarios, fecha } = doc.data();
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
                    console.log("Eventos obtenidos:", docs);
                    setLista(docs);
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

    useEffect(() => {
        getEventosCreados();
    }, [userId]);

    useEffect(() => {
        getListaEventos();
    }, [eventosCreados]);

    // Función onRefresh para el gesto recargar
    const onRefresh = async () => {
        setRefreshing(true); // Inicia el estado de refresco
        await getEventosCreados(); // Vuelve a ejecutar getEventosCreados
        await getListaEventos(); // Vuelve a ejecutar getListaEventos
        setRefreshing(false); // Termina el estado de refresco
    };

    return (
        <ScrollView
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
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
                    <Text>No hay eventos disponibles.</Text>
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
