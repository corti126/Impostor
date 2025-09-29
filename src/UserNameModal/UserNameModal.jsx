import React, { useState } from 'react';
import './UserNameModal.css';

/**
 * @param {boolean} isOpen - 
 * @param {function} onClose - 
 * @param {function} onConfirm - 
 */
function UserNameModal({ isOpen, onClose, onConfirm }) {
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) {
    return null;
  }

  const handleConfirm = async () => {
    const nameToConfirm = userName.trim();
    if (nameToConfirm.length < 3) {
      alert('Por favor, ingresa un nombre de usuario de al menos 3 caracteres.');
      return;
    }

    try {
      setIsLoading(true);
      
      await onConfirm(nameToConfirm); 
            
    } catch (error) {
        console.error("Error en la confirmación del nombre:", error);
        alert("Ocurrió un error inesperado al intentar unirse.");
    } finally {
        setIsLoading(false);
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