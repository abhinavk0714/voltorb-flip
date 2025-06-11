import React from 'react';
import Confetti from 'react-confetti';

interface CelebrationModalProps {
  message: string;
  onPlayAgain: () => void;
}

const CelebrationModal: React.FC<CelebrationModalProps> = ({ message, onPlayAgain }) => {
  // Get window size for confetti
  const [dimensions, setDimensions] = React.useState({ width: window.innerWidth, height: window.innerHeight });
  React.useEffect(() => {
    const handleResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="celebration-modal">
      <Confetti width={dimensions.width} height={dimensions.height} numberOfPieces={350} recycle={false} />
      <div className="celebration-content">
        <img src="/voltorb.png" alt="Dancing Voltorb" className="bouncing-voltorb" />
        <div className="celebration-title">Congratulations!</div>
        <div className="celebration-message">{message}</div>
        <button className="celebration-play-again" onClick={onPlayAgain}>Play Again</button>
      </div>
    </div>
  );
};

export default CelebrationModal; 