// Ubicación: src/App.js

import React from 'react';
import './App.css'; 
import { ImpostorGame } from './ImpostorGame/ImpostorGame';
import { GameProvider } from './GameContext/GameContext'; // 🚨 Importa el proveedor

function App() {
  return (
    // 🚨 Envolvemos el componente principal con el Proveedor de Contexto
    <GameProvider>
      <ImpostorGame />
    </GameProvider>
  );
}

export default App;