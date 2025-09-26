// Ubicación: src/GameContext/GameContext.jsx

import React, { createContext, useState, useContext, useEffect } from 'react';
import { database } from '../firebaseConfig'; 

import { 
    ref, 
    onValue, 
    set, 
    onDisconnect 
} from 'firebase/database';


// --- SETUP INICIAL ---
const GameContext = createContext();
export const useGame = () => useContext(GameContext);

// Constantes de la sesión y Realtime DB
const LOBBY_PATH = 'lobbies/clashRoyaleLobby';
const STORAGE_KEY_NAME = 'impostor_userName';
const STORAGE_KEY_ID = 'impostor_playerId';

// --- Funciones Asistentes de localStorage ---

const saveLocalData = (name, id) => {
    localStorage.setItem(STORAGE_KEY_NAME, name);
    localStorage.setItem(STORAGE_KEY_ID, id);
};

const clearLocalData = () => {
    localStorage.removeItem(STORAGE_KEY_NAME);
    localStorage.removeItem(STORAGE_KEY_ID);
};

const loadLocalData = () => {
    const name = localStorage.getItem(STORAGE_KEY_NAME);
    const id = localStorage.getItem(STORAGE_KEY_ID);
    return { name, id };
};

// --- GAME PROVIDER PRINCIPAL ---

export const GameProvider = ({ children }) => {
    // --- ESTADO GLOBAL ---
    const [userName, setUserName] = useState(null);
    const [players, setPlayers] = useState([]); 
    const [isAdmin, setIsAdmin] = useState(false); 
    const [currentScreen, setCurrentScreen] = useState('welcome'); 
    const [localPlayerId, setLocalPlayerId] = useState(null); 
    
    // Controla si ya intentamos cargar la sesión
    const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false); 
    
    // Referencia al nodo de la Realtime Database
    const lobbyRef = ref(database, LOBBY_PATH);

    // =========================================================
    // FUNCIÓN ASISTENTE: REGISTRO DE CONEXIÓN CON AUTO-LIMPIEZA
    // =========================================================
    const registerConnection = async (id, name, isCorti) => {
        const playerToRegister = {
            id: id,
            name: name,
            isAdmin: isCorti,
            connected: true 
        };
        
        const playerRef = ref(database, `${LOBBY_PATH}/players/${id}`);
        
        try {
            // 1. Configurar Auto-Limpieza al cerrar la pestaña
            await onDisconnect(playerRef).remove(); 

            // 2. Escribir los datos del jugador (marcando la conexión como activa)
            await set(playerRef, playerToRegister);

            return true;
        } catch (e) {
            console.error("Error al registrar la conexión o configurar onDisconnect:", e);
            return false;
        }
    };

    // =========================================================
    // 🚨 1. NUEVO useEffect: CARGA Y RECONEXIÓN INICIAL 🚨
    // (Se ejecuta SÓLO una vez al cargar la página)
    // =========================================================
    useEffect(() => {
        if (!isInitialLoadComplete) {
            const { name, id } = loadLocalData();

            if (name && id) {
                // Si encontramos datos, precargamos el estado de React
                console.log(`Intentando reconectar a ${name} (ID: ${id})`);
                
                setUserName(name);
                setIsAdmin(name.toLowerCase() === 'corti');
                setLocalPlayerId(id);
                // NOTA: No forzamos 'lobby' aquí. El listener de onValue lo hará
                // si el jugador aún existe en la base de datos.
            }
            setIsInitialLoadComplete(true);
        }
    }, [isInitialLoadComplete]);


    // =========================================================
    // 2. ESCUCHA DE DATOS EN TIEMPO REAL (onValue)
    // =========================================================
    useEffect(() => {
        const unsubscribe = onValue(lobbyRef, (snapshot) => {
            const data = snapshot.val();
            
            const playersData = data?.players || {};
            const playersArray = Object.keys(playersData).map(key => playersData[key]);
            
            setPlayers(playersArray);
            
            // Si hay un nombre de usuario local, revisamos su estado:
            if (userName) {
                const isPlayerInDB = playersArray.some(p => p.name === userName);

                if (!isPlayerInDB) {
                    // El usuario local fue expulsado o eliminado (por onDisconnect o admin)
                    setUserName(null);
                    setIsAdmin(false);
                    setLocalPlayerId(null);
                    clearLocalData(); // 🛑 CLAVE: Limpiamos la memoria local
                    setCurrentScreen('welcome');
                } else if (currentScreen !== 'lobby') {
                    // El usuario existe en la DB y aún no está en el lobby (ej: recién cargó)
                    setCurrentScreen('lobby');
                }
            } 
            
            // Si la sala fue finalizada por el admin
            if (!data || playersArray.length === 0) {
                setPlayers([]);
                clearLocalData();
                setCurrentScreen('welcome');
            }
        });

        return () => unsubscribe();
    }, [userName, lobbyRef, currentScreen]); 

    // =========================================================
    // 3. FUNCIÓN DE UNIÓN CON VALIDACIÓN ESTRICTA
    // =========================================================

    const joinLobby = async (name) => {
        const isCorti = name.toLowerCase() === 'corti';
        
        // 🚨 Validación Estricta
        const existingPlayer = players.find(p => p.name.toLowerCase() === name.toLowerCase());

        if (existingPlayer) {
            alert(`El nombre '${name}' ya está en uso por otro jugador. Por favor, sé más específico.`);
            return false;
        }
        
        // Lógica de nuevo jugador
        const newPlayerId = Date.now();
        
        const success = await registerConnection(newPlayerId, name, isCorti);

        if (success) {
            // 🛑 CLAVE: GUARDAR DATOS EN LOCAL STORAGE 🛑
            saveLocalData(name, newPlayerId); 
            
            setUserName(name);
            setIsAdmin(isCorti);
            setLocalPlayerId(newPlayerId); 
            setCurrentScreen('lobby');
            return true;
        }
        
        return false;
    };

    // =========================================================
    // 4. FUNCIONES DE SALIDA/FIN (Limpiar localStorage)
    // =========================================================

    const leaveLobby = async (name) => {
        const playerToRemove = players.find(p => p.name === name);
        if (!playerToRemove) return;
        
        try {
            // 1. Cancelar el onDisconnect para que no se active después.
            await onDisconnect(ref(database, `${LOBBY_PATH}/players/${playerToRemove.id}`)).cancel();
            // 2. Eliminar el nodo del jugador
            await set(ref(database, `${LOBBY_PATH}/players/${playerToRemove.id}`), null);
            
            // 🛑 CLAVE: LIMPIAR DATOS LOCALES al salir voluntariamente
            clearLocalData(); 
        } catch (e) {
            console.error("Error al salir/expulsar del lobby: ", e);
        }
    };
    
    const finishGame = async () => {
        try {
            await set(lobbyRef, null);
            // 🛑 CLAVE: LIMPIAR DATOS LOCALES al finalizar la partida
            clearLocalData(); 
        } catch (e) {
            console.error("Error al finalizar la partida: ", e);
        }
    };

    // --- OBJETO DE VALOR DEL CONTEXTO ---
    const contextValue = {
        userName,
        players,
        isAdmin,
        currentScreen,
        localPlayerId, 
        joinLobby,
        leaveLobby,
        finishGame,
        removePlayer: leaveLobby, 
        setCurrentScreen, 
    };

    return (
        <GameContext.Provider value={contextValue}>
            {children}
        </GameContext.Provider>
    );
};