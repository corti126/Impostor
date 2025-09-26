import React, { useState } from 'react';
import './GameStartedScreen.css';
import { useGame } from '../GameContext/GameContext';
import { CardModal } from '../GameScreen/CardModal/CardModal';
import { Roulette } from '../GameScreen/Roulette/Roulette';

const GameStartedScreen = () => {
  const { userName, gameStatus, players, finishGame, isAdmin, startRoulette } = useGame();

  const [isCardModalOpen, setIsCardModalOpen] = useState(true);

  const isImpostor = gameStatus.impostorName === userName;
  const localPlayer = players.find(p => p.name === userName);
  const assignedCard = localPlayer?.assignedCard || { name: 'Carta Desconocida', elixir: '?', imageUrl: '' };

  const role = isImpostor ? 'IMPOSTOR' : 'TRIPULANTE';
  const cardColorClass = isImpostor ? 'impostor-bg' : 'crewmate-bg';

  const playerToStartMessage = gameStatus.playerToStart
    ? `¡COMIENZA ${gameStatus.playerToStart}!`
    : (isAdmin
      ? 'Gira la ruleta para saber quién empieza.'
      : 'Esperando que el administrador gire la ruleta...');

  return (
    <div className={`game-started-container ${cardColorClass}`}>

      {isCardModalOpen && (
        <CardModal
          isOpen={isCardModalOpen}
          onClose={() => setIsCardModalOpen(false)}
          isImpostor={isImpostor}
          assignedCard={assignedCard}
        />
      )}

      <Roulette
        players={players}
        gameStatus={gameStatus}
      />

      <div className="game-info-panel">
        <h1 className="game-panel-title">PARTIDA EN CURSO</h1>
        <p className="game-panel-role">Tu Rol: <span className={isImpostor ? 'impostor-text' : 'crewmate-text'}>{role}</span></p>

        <div className="status-message-box">
          <p className="status-message">{playerToStartMessage}</p>
        </div>
      </div>

      {isAdmin && (
        <div className="admin-actions-game-screen">
          <button
            className="admin-roulette-button"
            onClick={startRoulette}
            disabled={gameStatus.isRouletteActive}
          >
            Girar Ruleta
          </button>

          <button
            className="admin-reset-button"
            onClick={() => {
              if (window.confirm("¿Deseas finalizar el juego y volver al lobby?")) {
                finishGame();
              }
            }}
          >
            Finalizar Partida
          </button>
        </div>
      )}
    </div>
  );
};

export { GameStartedScreen };