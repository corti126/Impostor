import React, { createContext, useContext, useState, useEffect } from 'react';
import { database } from '../firebaseConfig';
import { CLASH_ROYALE_CARDS } from '../constants/cards';

import {
  ref,
  onValue,
  set,
  update,
  onDisconnect
} from 'firebase/database';

const GameContext = createContext();
export const useGame = () => useContext(GameContext);

const LOBBY_PATH = 'lobbies/clashRoyaleLobby';
const STORAGE_KEY_NAME = 'impostor_userName';
const STORAGE_KEY_ID = 'impostor_playerId';

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

/**
 * @param {Array<Object>} currentPlayers - 
 * @param {string} impostorName - 
 * @returns {Array<Object>}
 */
const assignCardsAndRoles = (currentPlayers, impostorName) => {
  const trueCard = CLASH_ROYALE_CARDS[Math.floor(Math.random() * CLASH_ROYALE_CARDS.length)];

  const trueElixir = trueCard.elixir;
  const falseElixir = trueElixir === 1 ? 2 : trueElixir - 1;

  const impostorCard = {
    ...trueCard,
    elixir: falseElixir,
    isLie: true,
    trueElixirCost: trueElixir
  };

  const crewmateCard = {
    ...trueCard,
    isLie: false
  };

  const updatedPlayers = currentPlayers.map((player) => {
    const isImpostor = player.name === impostorName;

    const role = isImpostor ? 'IMPOSTOR' : 'CREWMATE';

    const assignedCard = isImpostor ? impostorCard : crewmateCard;

    return {
      ...player,
      role: role,
      assignedCard: assignedCard,
    };
  });

  return updatedPlayers;
};

export const GameProvider = ({ children }) => {
  const [userName, setUserName] = useState(null);
  const [players, setPlayers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [localPlayerId, setLocalPlayerId] = useState(null);

  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);

  const [gameStatus, setGameStatus] = useState({
    isGameStarted: false,
    impostorName: null,
    isRouletteActive: false,
    playerToStart: null,
  });

  const lobbyRef = ref(database, LOBBY_PATH);
  const gameStatusRef = ref(database, `${LOBBY_PATH}/status`);

  const registerConnection = async (id, name, isCorti) => {
    const playerToRegister = {
      id: id,
      name: name,
      isAdmin: isCorti,
      connected: true
    };

    const playerRef = ref(database, `${LOBBY_PATH}/players/${id}`);

    try {
      await onDisconnect(playerRef).remove();
      await set(playerRef, playerToRegister);

      return true;
    } catch (e) {
      console.error("Error al registrar la conexión o configurar onDisconnect:", e);
      return false;
    }
  };

  useEffect(() => {
    if (!isInitialLoadComplete) {
      const { name, id } = loadLocalData();

      if (name && id) {
        console.log(`Intentando reconectar a ${name} (ID: ${id})`);

        setUserName(name);
        setIsAdmin(name.toLowerCase() === 'corti');
        setLocalPlayerId(id);
      }
      setIsInitialLoadComplete(true);
    }
  }, [isInitialLoadComplete]);

  useEffect(() => {
    const unsubscribePlayers = onValue(lobbyRef, async (snapshot) => {
      const data = snapshot.val();

      const playersData = data?.players || {};
      const playersArray = Object.keys(playersData).map(key => playersData[key]);

      setPlayers(playersArray);
      setGameStatus(data?.status || {});

      const gameIsStarted = data?.status?.isGameStarted;

      if (gameIsStarted && playersArray.length === 0) {
        console.log("Juego iniciado sin jugadores. Forzando reseteo en DB.");

        await update(ref(database, `${LOBBY_PATH}/status`), {
          isGameStarted: false,
          impostorName: null,
          isRouletteActive: false,
          playerToStart: null,
        });
        return;
      }

      if (userName) {
        const isPlayerInDB = playersArray.some(p => p.name === userName);


        if (!isPlayerInDB) {
          setUserName(null);
          setIsAdmin(false);
          setLocalPlayerId(null);
          clearLocalData();
          setCurrentScreen('welcome');
        } else if (gameIsStarted) {
          setCurrentScreen('game');
        } else if (currentScreen !== 'lobby' && !gameIsStarted) {
          setCurrentScreen('lobby');
        }
      }

      if (!data || playersArray.length === 0) {
        if (userName) {
          setPlayers([]);
          clearLocalData();
          setCurrentScreen('welcome');
        }
      }
    });

    return () => {
      unsubscribePlayers();
    }
  }, [userName, lobbyRef, currentScreen]);

  const startGame = async () => {
    if (players.length < 1) {
      console.log("Se requieren al menos 2 jugadores para comenzar la partida.");
      return false;
    }
    if (players.length > CLASH_ROYALE_CARDS.length) {
      console.log(`No hay suficientes cartas únicas (${CLASH_ROYALE_CARDS.length}) para los ${players.length} jugadores.`);
      return false;
    }

    const impostorIndex = Math.floor(Math.random() * players.length);
    const impostorName = players[impostorIndex].name;

    const playersWithCardsAndRoles = assignCardsAndRoles(players, impostorName);

    const updatedPlayersObject = playersWithCardsAndRoles.reduce((acc, player) => {
      acc[player.id] = player;
      return acc;
    }, {});

    const newGameStatus = {
      isGameStarted: true,
      impostorName: impostorName,
      isRouletteActive: false,
      playerToStart: null,
    };

    try {
      await update(ref(database, LOBBY_PATH), {
        status: newGameStatus,
        players: updatedPlayersObject
      });

      console.log(`Partida iniciada. Impostor asignado: ${impostorName}`);
      return true;
    } catch (e) {
      console.error("Error al iniciar la partida:", e);
      console.log("No se pudo iniciar la partida. Inténtalo de nuevo.");
      return false;
    }
  };

  const startRoulette = async () => {
    if (players.length < 1) return false;

    const playerToStart = players[Math.floor(Math.random() * players.length)];

    const rouletteUpdate = {
      isRouletteActive: true,
      playerToStart: playerToStart.name,
      rouletteStartTime: Date.now(),
    };

    try {
      await update(gameStatusRef, rouletteUpdate);

      return true;
    } catch (e) {
      console.error("Error al iniciar la ruleta:", e);
      return false;
    }
  };

  const updateGameStatus = async (newStatus) => {
    try {
      await update(gameStatusRef, newStatus);
      return true;
    } catch (e) {
      console.error("Error al actualizar el estado del juego:", e);
      return false;
    }
  };


  const joinLobby = async (name) => {
    if (gameStatus.isGameStarted) {
      console.log("La partida ya ha comenzado. Espera a que el administrador la finalice.");
      return false;
    }

    const isCorti = name.toLowerCase() === 'corti';

    const existingPlayer = players.find(p => p.name.toLowerCase() === name.toLowerCase());

    if (existingPlayer) {
      console.log(`El nombre '${name}' ya está en uso por otro jugador. Por favor, sé más específico.`);
      return false;
    }

    const newPlayerId = Date.now();
    const success = await registerConnection(newPlayerId, name, isCorti);

    if (success) {
      saveLocalData(name, newPlayerId);

      setUserName(name);
      setIsAdmin(isCorti);
      setLocalPlayerId(newPlayerId);
      setCurrentScreen('lobby');
      return true;
    }

    return false;
  };

  const leaveLobby = async (name) => {
    const playerToRemove = players.find(p => p.name === name);
    if (!playerToRemove) return;

    try {
      await onDisconnect(ref(database, `${LOBBY_PATH}/players/${playerToRemove.id}`)).cancel();
      await set(ref(database, `${LOBBY_PATH}/players/${playerToRemove.id}`), null);

      if (name === userName) {
        clearLocalData();
      }
    } catch (e) {
      console.error("Error al salir/expulsar del lobby: ", e);
    }
  };

  const finishGame = async () => {
    try {
      await set(lobbyRef, null);
    } catch (e) {
      console.error("Error al finalizar la partida: ", e);
    }
  };

  const resetGame = async () => {
    if (!isAdmin) return;

    const resetGameStatus = {
      isGameStarted: false,
      impostorName: null,
      isRouletteActive: false,
      playerToStart: null,
    };

    try {
      await update(gameStatusRef, resetGameStatus);

      const updates = {};
      players.forEach(player => {
        updates[`players/${player.id}/assignedCard`] = null;
        updates[`players/${player.id}/role`] = null; // Limpiamos el rol
      });
      await update(ref(database, LOBBY_PATH), updates);

      console.log("Partida reseteada. Jugadores en lobby.");
    } catch (e) {
      console.error("Error al resetear la partida: ", e);
      console.log("No se pudo resetear la partida. Inténtalo de nuevo.");
    }
  };


  const contextValue = {
    userName,
    players,
    isAdmin,
    currentScreen,
    localPlayerId,
    gameStatus,
    joinLobby,
    leaveLobby,
    finishGame,
    startGame,
    startRoulette,
    removePlayer: leaveLobby,
    setCurrentScreen,
    resetGame,
    updateGameStatus,
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};
