import React from 'react';
import './CardModal.css';
import { useGame } from '../../GameContext/GameContext'; // Importamos el contexto para obtener datos locales

// Usaremos un asset local para el Impostor (ajusta la ruta si es necesario)
const IMPOSTOR_IMAGE_URL = `${process.env.PUBLIC_URL}/impostor.jpg`;

function CardModal({ isOpen, onClose }) {
  const { players, userName } = useGame();

  // Obtener la información del jugador local (rol y carta)
  const localPlayer = players.find(p => p.name === userName);

  if (!isOpen || !localPlayer || !localPlayer.assignedCard) {
    return null;
  }

  const assignedCard = localPlayer.assignedCard;
  // Utilizamos el rol asignado en la DB
  const isImpostor = localPlayer.role === 'IMPOSTOR';

  const roleTitle = isImpostor ? '¡ALERTA!' : '';
  const roleText = isImpostor ? 'IMPOSTOR' : 'TRIPULANTE';

  // Configuración de estilos
  const bgColor = '#1b1c1d'; // Se mantuvo constante, eliminando la ternaria redundante

  // --- DISPLAY DE CARTA (SOLO PARA TRIPULANTES) ---
  const cardDisplay = (
    <div className="card-display-container"> {/* Nuevo contenedor para agrupar imagen y lista */}
      <div className="card-reveal-display">
        {/* Solo la imagen dentro del contenedor visual de la carta */}
        <img
          src={assignedCard.imageUrl || '/assets/cards/default.png'}
          alt={assignedCard.name}
          className="card-image-modal"
        />
      </div>
      
      {/* Bloque de lista con la información de la carta */}
      <ul className="card-info-list">
        <li><span className="info-label">Nombre:</span> {assignedCard.name}</li>
        <li><span className="info-label">Elixir:</span> {assignedCard.elixir}</li>
        <li><span className="info-label">Rareza:</span> {assignedCard.rarity}</li>
        <li><span className="info-label">Tipo:</span> {assignedCard.type}</li>
      </ul>
    </div>
  );
  // --------------------------------------------------

  const modalContent = isImpostor ? (
    // CONTENIDO PARA EL IMPOSTOR
    <>
      <img src={IMPOSTOR_IMAGE_URL} alt="Impostor" className="impostor-image-modal" />
      <h2 className="impostor-role-message">¡ERES EL IMPOSTOR!</h2>
    </>
  ) : (
    // CONTENIDO PARA EL TRIPULANTE
    <>
      <h2 className="card-reveal-heading">CARTA EN DEBATE:</h2>
      {cardDisplay}
    </>
  );

  const instructionText = isImpostor
    ? 'Objetivo: Averigua qué carta es y su elixir real. Intenta pasar desapercibido y guiar la discusión hacia la carta falsa.'
    : 'Objetivo: Identificar al Impostor. La carta de un jugador tiene un Elixir diferente (la mentira).';

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