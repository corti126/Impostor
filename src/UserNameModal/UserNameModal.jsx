// Ubicación: src/UserNameModal/UserNameModal.jsx

import React, { useState } from 'react';
import './UserNameModal.css';

/**
 * Modal para que el usuario ingrese y confirme su nombre de usuario.
 * @param {boolean} isOpen - Controla la visibilidad del modal.
 * @param {function} onClose - Función para cerrar el modal sin confirmar.
 * @param {function} onConfirm - Función ASÍNCRONA que se ejecuta al confirmar.
 */
function UserNameModal({ isOpen, onClose, onConfirm }) {
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Estado de carga

  if (!isOpen) {
    return null;
  }

  const handleConfirm = async () => { // Hacemos esta función ASÍNCRONA
    // 1. Validación
    const nameToConfirm = userName.trim();
    if (nameToConfirm.length < 3) {
      alert('Por favor, ingresa un nombre de usuario de al menos 3 caracteres.');
      return;
    }

    try {
      setIsLoading(true);
      
      // 2. Llamar a la función onConfirm del componente padre (ImpostorGame)
      // Esta función es la que llama a joinLobby(name) de Firebase.
      await onConfirm(nameToConfirm); 
      
      // La limpieza y cierre del modal ahora se maneja en ImpostorGame
      
    } catch (error) {
        console.error("Error en la confirmación del nombre:", error);
        alert("Ocurrió un error inesperado al intentar unirse.");
    } finally {
        setIsLoading(false);
        // Opcional: limpiar el input si el padre ya cerró el modal
        setUserName(''); 
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && userName.trim().length >= 3 && !isLoading) {
      handleConfirm();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">¡Bienvenido, Impostor!</h2>
        <p className="modal-message">Ingresa tu nombre para comenzar a jugar.</p>

        <input
          type="text"
          className="username-input"
          placeholder="Tu nombre de usuario"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          onKeyDown={handleKeyPress}
          maxLength={15}
          disabled={isLoading}
        />

        <div className="modal-actions">
          <button 
            className="confirm-button" 
            onClick={handleConfirm}
            // Bloqueamos el botón si no hay suficiente texto o si está cargando
            disabled={userName.trim().length < 3 || isLoading} 
          >
            {isLoading ? 'Conectando...' : 'Confirmar'}
          </button>
          
          <button 
            className="cancel-button" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export { UserNameModal };