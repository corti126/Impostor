import React from 'react';
import './App.css'; 
import { ImpostorGame } from './ImpostorGame/ImpostorGame';
import { GameProvider } from './GameContext/GameContext';

function App() {
  return (
    <GameProvider>
      <ImpostorGame />
    </GameProvider>
  );
}

export default App;