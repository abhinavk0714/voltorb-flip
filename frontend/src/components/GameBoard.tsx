import React from 'react';
import './GameBoard.css';
import voltorbImg from '/voltorb.png';

export interface Tile {
  value: number;
  flipped: boolean;
}

export interface Total {
  points: number;
  voltorbs: number;
}

interface GameBoardProps {
  board: Tile[][];
  rowTotals: Total[];
  columnTotals: Total[];
  onTileClick: (row: number, col: number) => void;
  disabled?: boolean;
}

const infoColors = ['orange', 'green', 'yellow', 'blue', 'purple'];

const GameBoard: React.FC<GameBoardProps> = ({ board, rowTotals, columnTotals, onTileClick, disabled }) => {
  if (!board || !rowTotals || !columnTotals) {
    return <div>Loading board...</div>;
  }

  // Helper for tile class
  const getTileClass = (tile: Tile) => {
    if (!tile.flipped) return 'tile';
    if (tile.value === -1) return 'tile voltorb flipped';
    if (tile.value === 1) return 'tile value-1 flipped';
    if (tile.value === 2) return 'tile value-2 flipped';
    if (tile.value === 3) return 'tile value-3 flipped';
    return 'tile flipped';
  };

  // Helper for tile content
  const getTileContent = (tile: Tile) => {
    if (!tile.flipped) return '?';
    if (tile.value === -1) return <img src={voltorbImg} alt="Voltorb" className="voltorb-img" />;
    return tile.value;
  };

  return (
    <div className="board-outer-container">
      <div className="board-center-row">
        <div className="board-grid-and-bottom">
          <div className={`game-board-grid${disabled ? ' game-board-disabled' : ''}`}>
            {board.map((row, rowIdx) => (
              <div className="board-row" key={rowIdx}>
                {row.map((tile, colIdx) => (
                  <button
                    key={colIdx}
                    className={getTileClass(tile)}
                    onClick={() => !disabled && onTileClick(rowIdx, colIdx)}
                    disabled={tile.flipped || disabled}
                  >
                    <div className={`tile-inner${tile.flipped ? ' flipped' : ''}`}>
                      <div className="tile-front">
                        {/* Unflipped face: no question mark, just blank */}
                      </div>
                      <div className="tile-back">
                        {getTileContent(tile)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>
          <div className="bottom-totals-row">
            <div className="column-totals">
              {columnTotals.map((total, idx) => (
                <div className={`total-cell bottom-total ${infoColors[idx % infoColors.length]}`} key={idx}>
                  <div className="points">{String(total.points).padStart(2, '0')}</div>
                  <div className="voltorbs"><img src={voltorbImg} alt="Voltorb" className="voltorb-img" style={{width: '20px', height: '20px'}} /> {total.voltorbs}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="row-totals">
          {rowTotals.map((total, idx) => (
            <div className={`total-cell right-total ${infoColors[idx % infoColors.length]}`} key={idx}>
              <div className="points">{String(total.points).padStart(2, '0')}</div>
              <div className="voltorbs"><img src={voltorbImg} alt="Voltorb" className="voltorb-img" style={{width: '20px', height: '20px'}} /> {total.voltorbs}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameBoard; 