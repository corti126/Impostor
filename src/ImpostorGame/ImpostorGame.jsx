// Ubicación: src/GameScreen/ImpostorGame/ImpostorGame.jsx

import React, { useState } from 'react';
import "./ImpostorGame.css";
import { UserNameModal } from '../UserNameModal/UserNameModal';
import { useGame } from '../GameContext/GameContext';
import { GameScreen } from '../GameScreen/GameScreen';
import { GameStartedScreen } from '../GameStartedScreen/GameStartedScreen';


function ImpostorGame() {
  const { currentScreen, joinLobby } = useGame();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const clashRoyaleImageUrl = "/clash-royale-logo.webp";
  const futbolImageUrl = "/logo-futbol.jpg";

  const handleGameModeSelection = (mode) => {
    if (mode === 'Clash Royale') {
      setIsModalOpen(true);
    }
  };

  const handleNameConfirmed = async (name) => {
    const success = await joinLobby(name);

    if (success) {
      console.log(`Nombre confirmado: ${name}. Redirigiendo al lobby.`);
      // Cerramos el modal
      setIsModalOpen(false);
    }
  };


  const renderScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return (
          <div className="welcome-container">
            <h1 className="welcome-title">Bienvenido</h1>
            <p className="selection-message">Selecciona el modo de juego</p>

            <div className="game-modes-wrapper">

              <div
                className="game-mode-card clash-royale"
                onClick={() => handleGameModeSelection('Clash Royale')}
                role="button"
                tabIndex="0"
                aria-label="Seleccionar modo Clash Royale"
              >
                <img src={clashRoyaleImageUrl} alt="Modo Clash Royale" className="game-mode-image" />
              </div>

              <div
                className="game-mode-card futbol"
                role="button"
                tabIndex="-1"
                aria-label="Seleccionar modo Fútbol (No Disponible)"
              >
                <img src={futbolImageUrl} alt="Modo Fútbol" className="game-mode-image" />
              </div>

            </div>

            <UserNameModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onConfirm={handleNameConfirmed}
            />
          </div>
        );

      case 'lobby':
        return <GameScreen />;

      case 'game':
        return <GameStartedScreen />;

      default:
        return <div>Cargando la aplicación...</div>
    }
  };

  return (
    <div className="impostor-game-wrapper">
      {renderScreen()}
    </div>
  );
};

export { ImpostorGame };