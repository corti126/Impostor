import React, { useState, useEffect } from 'react';
import './GameScreen.css';
import { useGame } from '../GameContext/GameContext';

function GameScreen() {
  const { players, isAdmin, userName, removePlayer, finishGame, startGame } = useGame();

  const [gameStatus, setGameStatus] = useState('Conectando con la sala...');

  const minPlayers = 1;

  useEffect(() => {
    if (players.length >= minPlayers) {
      setGameStatus(`¡${players.length}/${minPlayers} listo! Ya puedes comenzar la partida.`);
    } else {
      setGameStatus(`Esperando a más jugadores... (${players.length}/${minPlayers})`);
    }
  }, [players.length]);


  const handleStartGame = () => {
    if (players.length >= minPlayers) {
      startGame();
    } else {
      alert(`Necesitas al menos ${minPlayers} jugador para empezar.`);
    }
  };

  const handleEndLobby = () => {
    if (window.confirm('¿Estás seguro de finalizar la sala? Todos los jugadores serán expulsados.')) {
      finishGame();
    }
  };

  const handleRemovePlayer = (name) => {
    if (window.confirm(`¿Estás seguro de expulsar a ${name}?`)) {
      removePlayer(name);
    }
  };

  return (
    <div className="lobby-container">
      <h1 className="lobby-title">Sala de Espera (Clash Royale)</h1>

      <p className="lobby-message">
        {gameStatus} {isAdmin && <span style={{ color: '#6BFFB8' }}> (ADMIN)</span>}
      </p>

      <div className="players-list-wrapper">
        <ul className="players-list">
          {players.map((player) => (
            <li key={player.id} className="player-item">
              <span className="player-icon">👤</span> {player.name}

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

      {!isAdmin && (
        <div className="lobby-actions">
          <p className="waiting-admin-message">Esperando que el administrador ("Corti") inicie el juego...</p>
        </div>
      )}
    </div>
  );
}

export { GameScreen };