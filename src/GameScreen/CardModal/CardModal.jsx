import React, { useEffect } from 'react';
import './CardModal.css'; 

const IMPOSTOR_IMAGE_URL = `${process.env.PUBLIC_URL}/impostor.jpg`; 


function CardModal({ isOpen, onClose, isImpostor, assignedCard }) {
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                onClose();
            }, 10000); 
            return () => clearTimeout(timer);
        }
    }, [isOpen, onClose]);

    if (!isOpen) {
        return null;
    }

    const roleTitle = isImpostor ? '¡ALERTA!' : 'COMIENZA EL DUELO';
    const roleText = isImpostor ? 'IMPOSTOR' : 'TRIPULANTE';
    const bgColor = isImpostor ? '#8B0000' : '#003366';

    const modalContent = isImpostor ? (
        <>
            <img src={IMPOSTOR_IMAGE_URL} alt="Impostor" className="impostor-image-modal" />
            <h2 className="impostor-role-message">¡ERES EL IMPOSTOR!</h2>
        </>
    ) : (
        <>
            <h2 className="card-reveal-heading">TU CARTA CLAVE:</h2>
            <div className="card-reveal-display">
                <p className="card-elixir-modal">{assignedCard.elixir}</p>
                <img 
                    src={assignedCard.imageUrl || '/assets/cards/default.png'} 
                    alt={assignedCard.name} 
                    className="card-image-modal"
                />
                <p className="card-name-modal">{assignedCard.name}</p>
            </div>
        </>
    );

    return (
        <div className="card-modal-overlay">
            <div className="card-modal-content" style={{ backgroundColor: bgColor }}>
                
                <h1 className="role-title-modal">{roleTitle}</h1>
                <p className="role-text-modal">TU ROL: <span className={isImpostor ? 'impostor-span' : 'crewmate-span'}>{roleText}</span></p>

                {modalContent}

                <p className="instruction-modal">
                    {isImpostor 
                        ? 'Objetivo: Hacer que el grupo apueste por cartas con diferente Elixir y no ser descubierto.'
                        : 'Objetivo: Identificar al Impostor por las pistas de Elixir.'
                    }
                </p>

                <button 
                    className="close-modal-button" 
                    onClick={onClose}
                >
                    Entendido, cerrar (10s)
                </button>
            </div>
        </div>
    );
}

export { CardModal };