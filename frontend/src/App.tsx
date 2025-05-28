/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react'
import GameBoard from './components/GameBoard'
import './App.css'
import { gameService } from './services/gameService'
import type { GameState } from './services/gameService'

const MEMO_MARKS = ['voltorb', '1', '2', '3'] as const;
type MemoMark = typeof MEMO_MARKS[number];

interface MemoData {
  voltorb: boolean;
  '1': boolean;
  '2': boolean;
  '3': boolean;
}

function App() {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [gameOverPhase, setGameOverPhase] = useState<null | 'reveal' | 'reset'>(null)
  const [memoMode, setMemoMode] = useState(false);
  const [memoData, setMemoData] = useState<MemoData[][]>([]);
  const [showMemoMenu, setShowMemoMenu] = useState(false);
  const [selectedMemoMarks, setSelectedMemoMarks] = useState<MemoMark[]>([]);
  const [selectedTile, setSelectedTile] = useState<{ row: number; col: number } | null>(null);

  useEffect(() => {
    startNewGame()
  }, [])

  const startNewGame = async () => {
    setIsLoading(true)
    setError(null)
    setGameOverPhase(null)
    try {
      const state = await gameService.startNewGame()
      setGameState(state)
      // Reset memo data for new board
      setMemoData(Array.from({ length: state.board.length }, () => 
        Array(state.board[0].length).fill(null).map(() => ({
          voltorb: false,
          '1': false,
          '2': false,
          '3': false
        }))
      ))
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError('Failed to start new game. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTileClick = async (row: number, col: number) => {
    if (!gameState || gameOverPhase) return;
    if (memoMode) {
      // Select the tile for memo marking
      if (gameState.board[row][col].flipped) return;
      setSelectedTile({ row, col });
      return;
    }
    try {
      const result = await gameService.flipTile(row, col);
      const newState = await gameService.getGameState();
      setGameState(newState);
      if (result.game_over) {
        setError('Game Over! You hit a Voltorb! Click anywhere to reveal all tiles.');
        setGameOverPhase('reveal');
        return;
      }
      if (result.game_won) {
        setError('Congratulations! You won! Click anywhere to reveal all tiles.');
        setGameOverPhase('reveal');
        return;
      }
    } catch (err) {
      setError('Failed to flip tile. Please try again.');
    }
  };

  const handleMemoMarkToggle = (mark: MemoMark) => {
    if (!selectedTile) return;
    const { row, col } = selectedTile;
    setMemoData(prev => {
      const newData = [...prev];
      const tileMemos = { ...newData[row][col] };
      tileMemos[mark] = !tileMemos[mark];
      newData[row] = [...newData[row]];
      newData[row][col] = tileMemos;
      return newData;
    });
  };

  const handleMemoModeToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMemoMode(m => {
      if (m) setSelectedTile(null);
      return !m;
    });
  };

  // Handler for post-game-over clicks
  const handleAppClick = () => {
    if (!gameState || !gameOverPhase) return
    if (gameOverPhase === 'reveal') {
      // Reveal all tiles
      const revealedState = {
        ...gameState,
        board: gameState.board.map(row => row.map(tile => ({ ...tile, flipped: true })))
      }
      setGameState(revealedState)
      setError('Click anywhere to start a new game.')
      setGameOverPhase('reset')
    } else if (gameOverPhase === 'reset') {
      startNewGame()
    }
  }

  if (isLoading) {
    return (
      <div className="app">
        <div className="top-info">
          <div className="info-box">Level: --</div>
          <div className="info-box">Total Coins: ------</div>
          <div className="info-box">Coins collected this Level: ------</div>
        </div>
        <div>Loading game...</div>
      </div>
    )
  }

  if (!gameState) {
    return (
      <div className="app">
        <div className="top-info">
          <div className="info-box">Level: --</div>
          <div className="info-box">Total Coins: ------</div>
          <div className="info-box">Coins collected this Level: ------</div>
        </div>
        <div className="error">Failed to load game. Please refresh the page.</div>
        <button onClick={startNewGame} className="quit-button">
          Try Again
        </button>
      </div>
    )
  }

  // If in game over phase, overlay a click handler
  const appProps = gameOverPhase ? { onClick: handleAppClick, style: { cursor: 'pointer' } } : {}

  return (
    <div className="app" {...appProps}>
      <div className="top-info">
        <div className="info-box">Level: {gameState.level}</div>
        <div className="info-box">Total Coins: {String(gameState.coins).padStart(6, '0')}</div>
        <div className="info-box">Coins collected this Level: {String(gameState.coins).padStart(6, '0')}</div>
      </div>
      {/* Only show error at the top if not in gameOverPhase */}
      {error && !gameOverPhase && <div className="error">{error}</div>}
      <div className="main-content-row">
        <GameBoard
          board={gameState.board}
          rowTotals={gameState.row_totals}
          columnTotals={gameState.column_totals}
          onTileClick={handleTileClick}
          disabled={!!gameOverPhase}
          memoMode={memoMode}
          memoData={memoData}
          selectedTile={memoMode ? selectedTile : null}
        />
        <div className="memo-sidebar">
          <button
            className={`memo-toggle-button-sidebar${memoMode ? ' active' : ''}`}
            onClick={handleMemoModeToggle}
          >
            <span className="memo-close-icon">{memoMode ? '✖️' : '📝'}</span>
            <span className="memo-close-text">{memoMode ? 'Close Memo' : 'Open Memo'}</span>
          </button>
          {memoMode ? (
            <div className="memo-marker-grid">
              <button
                className={`memo-marker-btn${selectedTile && memoData[selectedTile.row][selectedTile.col]['voltorb'] ? ' selected' : ''}`}
                onClick={e => { e.stopPropagation(); handleMemoMarkToggle('voltorb'); }}
              >
                <img src="/voltorb_small.png" alt="Voltorb" className="memo-voltorb-img" />
              </button>
              <button
                className={`memo-marker-btn${selectedTile && memoData[selectedTile.row][selectedTile.col]['1'] ? ' selected' : ''}`}
                onClick={e => { e.stopPropagation(); handleMemoMarkToggle('1'); }}
              >
                1
              </button>
              <button
                className={`memo-marker-btn${selectedTile && memoData[selectedTile.row][selectedTile.col]['2'] ? ' selected' : ''}`}
                onClick={e => { e.stopPropagation(); handleMemoMarkToggle('2'); }}
              >
                2
              </button>
              <button
                className={`memo-marker-btn${selectedTile && memoData[selectedTile.row][selectedTile.col]['3'] ? ' selected' : ''}`}
                onClick={e => { e.stopPropagation(); handleMemoMarkToggle('3'); }}
              >
                3
              </button>
            </div>
          ) : (
            <div className="memo-marker-grid" style={{ visibility: 'hidden' }}>
              <button className="memo-marker-btn" tabIndex={-1} aria-hidden="true" />
              <button className="memo-marker-btn" tabIndex={-1} aria-hidden="true" />
              <button className="memo-marker-btn" tabIndex={-1} aria-hidden="true" />
              <button className="memo-marker-btn" tabIndex={-1} aria-hidden="true" />
            </div>
          )}
        </div>
      </div>
      {/* Centered overlay for game over/win message */}
      {gameOverPhase && error && (
        <div className="gameover-overlay">
          <div className="gameover-message">{error}</div>
        </div>
      )}
    </div>
  )
}

export default App
