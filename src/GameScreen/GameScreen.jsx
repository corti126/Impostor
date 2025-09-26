// Ubicación: src/GameScreen/GameScreen.jsx (o donde lo hayas ubicado)

import React, { useState, useEffect } from 'react';
import './GameScreen.css';
import { useGame } from '../GameContext/GameContext'; // Importamos el Contexto

// Componente GameScreen: El lobby de espera
// Ya no necesitamos recibir userName por props, lo tomamos del Contexto
function GameScreen() { 
    // Usamos el hook de Contexto para acceder al estado global
    const { players, isAdmin, userName, removePlayer, finishGame } = useGame();
    
    const [gameStatus, setGameStatus] = useState('Conectando con la sala...');
    const minPlayers = 4; // Mínimo de jugadores para empezar

    // Efecto para actualizar el estado del juego
    useEffect(() => {
        if (players.length >= minPlayers) {
            setGameStatus(`¡${players.length}/${minPlayers} listos! Puedes comenzar la partida.`);
        } else {
            setGameStatus(`Esperando a más jugadores... (${players.length}/${minPlayers})`);
        }
    }, [players.length]);


    const handleStartGame = () => {
        if (players.length >= minPlayers) {
            alert('Partida Iniciada! (Lógica de asignación de cartas/impostor)');
            // 🚨 Aquí iría la lógica para notificar a Firebase que la partida comienza.
        } else {
            alert(`Necesitas al menos ${minPlayers} jugadores para empezar.`);
        }
    };

    const handleEndLobby = () => {
        if (window.confirm('¿Estás seguro de finalizar la sala? Todos los jugadores serán expulsados.')) {
            finishGame(); // Llama a la función del Contexto para reiniciar el estado
        }
    };
    
    // Función para que el admin elimine jugadores
    const handleRemovePlayer = (name) => {
        if (window.confirm(`¿Estás seguro de expulsar a ${name}?`)) {
            removePlayer(name);
        }
    };

    return (
        <div className="lobby-container">
            <h1 className="lobby-title">Sala de Espera (Clash Royale)</h1>
            
            <p className="lobby-message">
                {gameStatus} {isAdmin && <span style={{color: '#6BFFB8'}}> (ADMIN)</span>}
            </p>

            {/* Lista de Jugadores */}
            <div className="players-list-wrapper">
                <ul className="players-list">
                    {players.map((player) => (
                        <li key={player.id} className="player-item">
                            <span className="player-icon">👤</span> {player.name}
                            
                            {/* Botón de eliminar visible solo para el admin y si no es a sí mismo */}
                            {isAdmin && player.name !== userName && (
                                <button 
                                    className="remove-button" 
                                    onClick={() => handleRemovePlayer(player.name)}
                                >
                                    X
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Botones de Control visibles solo si el usuario es Admin */}
            {isAdmin && (
                <div className="lobby-actions">
                    <button 
                        className={`start-button ${players.length < minPlayers ? 'disabled' : ''}`}
                        onClick={handleStartGame}
                        disabled={players.length < minPlayers}
                    >
                        Comenzar Partida ({players.length}/{minPlayers})
                    </button>
                    <button 
                        className="end-button"
                        onClick={handleEndLobby}
                    >
                        Finalizar Sala
                    </button>
                </div>
            )}
            
            {/* Mensaje para jugadores NO admin */}
            {!isAdmin && (
                <div className="lobby-actions">
                    <p className="waiting-admin-message">Esperando que el administrador ("Corti") inicie el juego...</p>
                </div>
            )}
        </div>
    );
}

export { GameScreen };