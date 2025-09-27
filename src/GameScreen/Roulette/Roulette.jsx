import React, { useRef, useState, useEffect, useCallback } from "react";
import './Roulette.css';

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="feather feather-x">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const getColor = (name, index) => {
  const colors = [
    '#00BFA5', '#1976D2', '#D81B60', '#FFB300',
    '#6A1B9A', '#43A047', '#E91E63', '#00BCD4'
  ];
  return colors[index % colors.length];
};

export const Roulette = ({ players, gameStatus, onClose }) => {
  const { isRouletteActive, playerToStart } = gameStatus;

  const canvasRef = useRef(null);
  const [hasStartedSpinning, setHasStartedSpinning] = useState(false);

  const [winnerDisplayed, setWinnerDisplayed] = useState(false);

  const dibujarRuleta = useCallback((currentAngle = 0) => {
    const canvas = canvasRef.current;
    if (!canvas || players.length === 0) return;

    const ctx = canvas.getContext("2d");
    const size = canvas.width;
    const outsideRadius = size / 2 - 10;
    const insideRadius = 40;

    const currentArc = (2 * Math.PI) / players.length;


    ctx.clearRect(0, 0, size, size);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 12px sans-serif';

    for (let i = 0; i < players.length; i++) {
      const angle = currentAngle + i * currentArc;
      ctx.fillStyle = getColor(players[i].name, i);

      ctx.beginPath();
      ctx.arc(size / 2, size / 2, outsideRadius, angle, angle + currentArc, false);
      ctx.arc(size / 2, size / 2, insideRadius, angle + currentArc, angle, true);
      ctx.fill();

      ctx.save();
      ctx.fillStyle = "#fff";

      ctx.translate(size / 2, size / 2);
      ctx.rotate(angle + currentArc / 2);

      const textX = outsideRadius - 30;

      ctx.rotate(Math.PI / 2);
      ctx.fillText(players[i].name, textX, 0);

      ctx.restore();
    }
  }, [players]);

  const girar = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !playerToStart || players.length === 0) return;

    let startAngle = Math.random() * 2 * Math.PI;
    const spinTimeTotal = 4500;
    const spinAngleTotal = (Math.random() * 5 + 10) * 2 * Math.PI;
    const start = performance.now();

    const winnerIndex = players.findIndex(p => p.name === playerToStart);
    if (winnerIndex === -1) return;

    const animar = (now) => {
      const elapsed = now - start;
      if (elapsed >= spinTimeTotal) {

        const degreesPerSegment = 360 / players.length;

        const targetDegree = degreesPerSegment * (players.length - winnerIndex) - (degreesPerSegment / 2);

        const finalRotationDegrees = spinAngleTotal * (180 / Math.PI) % 360;
        const offset = (finalRotationDegrees + 360 - targetDegree) % 360;

        const finalAngle = spinAngleTotal - (offset * Math.PI / 180);

        dibujarRuleta(finalAngle);

        setWinnerDisplayed(true);

        return;
      }

      const progress = elapsed / spinTimeTotal;
      const easing = 1 - Math.pow(1 - progress, 3);
      const angle = startAngle + easing * spinAngleTotal;

      dibujarRuleta(angle);

      requestAnimationFrame(animar);
    };

    requestAnimationFrame(animar);
  }, [players, dibujarRuleta, playerToStart]);

  useEffect(() => {
    dibujarRuleta();
  }, [dibujarRuleta]);

  useEffect(() => {
    if (isRouletteActive && !hasStartedSpinning) {
      setHasStartedSpinning(true);
      setWinnerDisplayed(false);
      girar();
    }

    if (!isRouletteActive && hasStartedSpinning) {
      const resetTimeout = setTimeout(() => setHasStartedSpinning(false), 500);
      return () => clearTimeout(resetTimeout);
    }
  }, [isRouletteActive, girar, hasStartedSpinning]);


  useEffect(() => {
    let timerClose;
    let timerCountdown;

    if (winnerDisplayed && typeof onClose === 'function') {
      timerClose = setTimeout(() => {
        onClose();
        clearInterval(timerCountdown);
      }, 3000);

      return () => {
        clearTimeout(timerClose);
        clearInterval(timerCountdown);
      };
    }
    return () => {
      clearTimeout(timerClose);
      clearInterval(timerCountdown);
    };
  }, [winnerDisplayed, onClose]);

  if (!isRouletteActive) return null;

  const showWinner = winnerDisplayed && playerToStart;

  return (
    <div className="roulette-modal-overlay">
      <div className="roulette-modal-content">
        {showWinner && typeof onClose === 'function' && (
          <button className="roulette-close-button" onClick={onClose}>
            <CloseIcon />
          </button>
        )}

        <h1 className="roulette-main-title">
          {showWinner ? '¡EMPIEZA...!' : 'GIRANDO...'}
        </h1>

        <div className="ruleta-wrapper">
          <div className="roulette-pointer"></div>
          <canvas
            ref={canvasRef}
            width="300"
            height="300"
            className="roulette-canvas"
          ></canvas>
          <div className="rouleta-center-cover"></div>
        </div>

        <div className={`roulette-winner-box ${showWinner ? 'message-winner' : 'message-spinning'}`}>
          {showWinner
            ? <h2>{playerToStart.toUpperCase()}</h2>
            : <p>SISTEMA SELECCIONANDO...</p>
          }
        </div>

        {showWinner && (
          <p className="roulette-instruction">
            ¡**{playerToStart.toUpperCase()}** comienza la ronda.
          </p>
        )}
      </div>
    </div>
  );
};
