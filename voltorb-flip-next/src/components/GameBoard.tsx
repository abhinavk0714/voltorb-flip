import React from 'react';
import './GameBoard.css';
import Image from 'next/image';

const voltorbSmallImg = '/voltorb_small.png';

export interface Tile {
  value: number;
  flipped: boolean;
}

export interface Total {
  points: number;
  voltorbs: number;
}

interface MemoData {
  voltorb: boolean;
  '1': boolean;
  '2': boolean;
  '3': boolean;
}

interface GameBoardProps {
  board: Tile[][];
  rowTotals: Total[];
  columnTotals: Total[];
  onTileClick: (row: number, col: number) => void;
  disabled?: boolean;
  memoMode?: boolean;
  memoData?: MemoData[][];
  selectedTile?: { row: number; col: number } | null;
}

const infoColors = ['orange', 'green', 'yellow', 'blue', 'purple'];

const GameBoard: React.FC<GameBoardProps> = ({ board, rowTotals, columnTotals, onTileClick, disabled, memoMode, memoData, selectedTile }) => {
  if (!board || !rowTotals || !columnTotals) {
    return <div>Loading board...</div>;
  }

  const getTileClass = (tile: Tile) => {
    if (!tile.flipped) return 'tile';
    if (tile.value === -1) return 'tile voltorb flipped';
    if (tile.value === 1) return 'tile value-1 flipped';
    if (tile.value === 2) return 'tile value-2 flipped';
    if (tile.value === 3) return 'tile value-3 flipped';
    return 'tile flipped';
  };

  const getTileContent = (tile: Tile) => {
    if (!tile.flipped) return null;
    if (tile.value === -1) return <Image src="/voltorb.png" alt="Voltorb" width={20} height={20} className="voltorb-img" />;
    return tile.value;
  };

  const renderMemoMarks = (rowIdx: number, colIdx: number) => {
    if (!memoData || !memoData[rowIdx]) return null;
    const marks = memoData[rowIdx][colIdx];
    if (!marks) return null;

    return (
      <div className="memo-marks">
        {marks.voltorb && <span className="memo-voltorb memo-top-left"><Image src={voltorbSmallImg} alt="Voltorb" width={20} height={20} className="memo-voltorb-img" /></span>}
        {marks['1'] && <span className="memo-num memo-num-yellow memo-top-right">1</span>}
        {marks['2'] && <span className="memo-num memo-num-yellow memo-bottom-left">2</span>}
        {marks['3'] && <span className="memo-num memo-num-yellow memo-bottom-right">3</span>}
      </div>
    );
  };

  console.log('GameBoard received board:', board);

  return (
    <div className="board-outer-container">
      <div className="board-center-row">
        <div className="board-grid-and-bottom">
          <div className={`game-board-grid${disabled ? ' game-board-disabled' : ''}`}>
            {board.map((row, rowIdx) => (
              <div className="board-row" key={rowIdx}>
                {row.map((tile, colIdx) => {
                  const isSelected = memoMode && selectedTile && selectedTile.row === rowIdx && selectedTile.col === colIdx;
                  return (
                    <button
                      key={colIdx}
                      className={getTileClass(tile) + (isSelected ? ' tile-selected' : '')}
                      onClick={() => !disabled && onTileClick(rowIdx, colIdx)}
                      disabled={tile.flipped || disabled}
                    >
                      <div className={`tile-inner${tile.flipped ? ' flipped' : ''}`}>
                        <div className="tile-front">
                          {!tile.flipped && (
                            <>
                              {renderMemoMarks(rowIdx, colIdx)}
                              <span className="question-mark">?</span>
                            </>
                          )}
                        </div>
                        <div className="tile-back">
                          {getTileContent(tile)}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="bottom-totals-row">
            <div className="column-totals">
              {columnTotals.map((total, idx) => (
                <div className={`total-cell bottom-total ${infoColors[idx % infoColors.length]}`} key={idx}>
                  <div className="points">{String(total.points).padStart(2, '0')}</div>
                  <div className="voltorbs"><Image src="/voltorb.png" alt="Voltorb" width={20} height={20} className="voltorb-img" /> {total.voltorbs}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="row-totals">
          {rowTotals.map((total, idx) => (
            <div className={`total-cell right-total ${infoColors[idx % infoColors.length]}`} key={idx}>
              <div className="points">{String(total.points).padStart(2, '0')}</div>
              <div className="voltorbs"><Image src="/voltorb.png" alt="Voltorb" width={20} height={20} className="voltorb-img" /> {total.voltorbs}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
