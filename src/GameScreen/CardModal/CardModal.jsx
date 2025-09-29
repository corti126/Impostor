import React from 'react';
import './CardModal.css';
import { useGame } from '../../GameContext/GameContext';

const IMPOSTOR_IMAGE_URL = `${process.env.PUBLIC_URL}/impostor.jpg`;

function CardModal({ isOpen, onClose }) {
  const { players, userName } = useGame();

  const localPlayer = players.find(p => p.name === userName);

  if (!isOpen || !localPlayer || !localPlayer.assignedCard) {
    return null;
  }

  const assignedCard = localPlayer.assignedCard;
  const isImpostor = localPlayer.role === 'IMPOSTOR';

  const roleTitle = isImpostor ? '¡ALERTA!' : '';
  const roleText = isImpostor ? 'IMPOSTOR' : 'TRIPULANTE';

  const bgColor = '#1b1c1d';

  const cardDisplay = (
    <div className="card-display-container">
      <div className="card-reveal-display">
        <img
          src={assignedCard.imageUrl || '/assets/cards/default.png'}
          alt={assignedCard.name}
          className="card-image-modal"
        />
      </div>
      
      <ul className="card-info-list">
        <li><span className="info-label">Nombre:</span> {assignedCard.name}</li>
        <li><span className="info-label">Elixir:</span> {assignedCard.elixir}</li>
        <li><span className="info-label">Rareza:</span> {assignedCard.rarity}</li>
        <li><span className="info-label">Tipo:</span> {assignedCard.type}</li>
      </ul>
    </div>
  );

  const modalContent = isImpostor ? (
    <>
      <img src={IMPOSTOR_IMAGE_URL} alt="Impostor" className="impostor-image-modal" />
      <h2 className="impostor-role-message">¡ERES EL IMPOSTOR!</h2>
    </>
  ) : (
    <>
      <h2 className="card-reveal-heading">CARTA:</h2>
      {cardDisplay}
    </>
  );

  const instructionText = isImpostor
    ? 'Objetivo: Averigua qué carta tienen los tripulantes. Intenta no ser descubierto.'
    : 'Objetivo: Identificar al Impostor.';

  return (
    <div className="card-modal-overlay">
      <div className={`card-modal-content ${isImpostor ? 'impostor-theme' : 'crewmate-theme'}`} style={{ backgroundColor: bgColor }}>

        <h1 className="role-title-modal">
          <span className={isImpostor ? 'impostor-span' : 'crewmate-span'}>{roleTitle}</span>
        </h1>
        <p className="role-text-modal">
          TU ROL: <span className={isImpostor ? 'impostor-span' : 'crewmate-span'}>{roleText}</span>
        </p>

        {modalContent}

        <p className="instruction-modal">
          {instructionText}
        </p>

        <button
          className="close-modal-button"
          onClick={onClose}
        >
          Entendido, cerrar
        </button>
      </div>
    </div>
  );
}

export { CardModal };