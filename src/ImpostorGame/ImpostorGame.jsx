// Ubicación: src/GameScreen/ImpostorGame/ImpostorGame.jsx

import React, { useState } from 'react';
import "./ImpostorGame.css";
import { UserNameModal } from '../UserNameModal/UserNameModal'; 
import { useGame } from '../GameContext/GameContext'; 
import { GameScreen } from '../GameScreen/GameScreen'; 


function ImpostorGame () {
  const { currentScreen, joinLobby } = useGame();
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  const clashRoyaleImageUrl = "/clash-royale-logo.webp"; 
  const futbolImageUrl = "/logo-futbol.jpg"; 
  
  const handleGameModeSelection = (mode) => {
    if (mode === 'Clash Royale') {
        setIsModalOpen(true);
    }
  };

  // Función ejecutada cuando el usuario confirma el nombre en el modal
  const handleNameConfirmed = async (name) => {
    // 🚨 Esta función ahora es ASÍNCRONA y debe esperar la respuesta de Firebase.
    const success = await joinLobby(name);
    
    if (success) {
        // Si joinLobby retorna 'true' (unión exitosa y redirección ya activada en Contexto)
        console.log(`Nombre confirmado: ${name}. Redirigiendo al lobby.`);
        // Cerramos el modal
        setIsModalOpen(false); 
    }
    // Si 'success' es false, el modal no se cierra y el usuario puede intentar con otro nombre.
  };


  // 🚨 LÓGICA DE REDIRECCIÓN/RENDERIZADO 🚨
  
  // 1. Mostrar el Lobby si el estado es 'lobby'
  if (currentScreen === 'lobby') {
      // GameScreen ya toma el nombre y lista de jugadores del Contexto
      return <GameScreen />; 
  } 
  
  // 2. Mostrar la pantalla de bienvenida si es 'welcome'
  if (currentScreen === 'welcome') {
    return (
      <div className="welcome-container">
        {/* Título y mensajes */}
        <h1 className="welcome-title">Bienvenido</h1>
        <p className="selection-message">Selecciona el modo de juego</p>
        
        {/* Contenedor de modos de juego */}
        <div className="game-modes-wrapper">
          
          {/* Modo Clash Royale - Abre el Modal */}
          <div 
            className="game-mode-card clash-royale" 
            onClick={() => handleGameModeSelection('Clash Royale')}
            role="button" 
            tabIndex="0"  
            aria-label="Seleccionar modo Clash Royale"
          >
            <img src={clashRoyaleImageUrl} alt="Modo Clash Royale" className="game-mode-image" />
          </div>
          
          {/* Modo Fútbol - Deshabilitado */}
          <div 
            className="game-mode-card futbol" 
            role="button" 
            tabIndex="-1" 
            aria-label="Seleccionar modo Fútbol (No Disponible)"
          >
            <img src={futbolImageUrl} alt="Modo Fútbol" className="game-mode-image" />
          </div>
          
        </div>

        {/* Renderizar el Modal */}
        <UserNameModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleNameConfirmed} // Pasamos la función asíncrona
        />
      </div>
    );
  }
  
  // Fallback
  return <div>Cargando...</div>
};

export { ImpostorGame };