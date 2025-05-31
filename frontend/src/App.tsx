/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react'
import GameBoard from './components/GameBoard'
import './App.css'
import { gameService } from './services/gameService'
import type { GameState } from './services/gameService'
import CelebrationModal from './components/CelebrationModal'

const MEMO_MARKS = ['voltorb', '1', '2', '3'] as const;
type MemoMark = typeof MEMO_MARKS[number];

interface MemoData {
  voltorb: boolean;
  '1': boolean;
  '2': boolean;
  '3': boolean;
}

type NewGameResponse = GameState | { reset: true; message: string };
function isResetResponse(response: unknown): response is { reset: true; message: string } {
  return (
    typeof response === 'object' &&
    response !== null &&
    'reset' in response &&
    (response as { reset?: boolean }).reset === true &&
    'message' in response &&
    typeof (response as { message?: unknown }).message === 'string'
  );
}

function App() {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [gameOverPhase, setGameOverPhase] = useState<null | 'reveal' | 'reset'>(null)
  const [messagePhase, setMessagePhase] = useState<null | 'win1' | 'win2' | 'lose1' | 'lose2'>(null)
  const [memoMode, setMemoMode] = useState(false);
  const [memoData, setMemoData] = useState<MemoData[][]>([]);
  const [showMemoMenu, setShowMemoMenu] = useState(false);
  const [selectedMemoMarks, setSelectedMemoMarks] = useState<MemoMark[]>([]);
  const [selectedTile, setSelectedTile] = useState<{ row: number; col: number } | null>(null);
  const [celebration, setCelebration] = useState<{ show: boolean; message: string }>({ show: false, message: '' });
  const [showRules, setShowRules] = useState(false);

  useEffect(() => {
    startNewGame()
  }, [])

  const startNewGame = async () => {
    setIsLoading(true)
    setError(null)
    setGameOverPhase(null)
    try {
      const response: NewGameResponse = await gameService.startNewGame()
      if (isResetResponse(response)) {
        setCelebration({ show: true, message: response.message });
        setGameState(null);
        setIsLoading(false);
        return;
      }
      setGameState(response)
      // Reset memo data for new board
      setMemoData(Array.from({ length: response.board.length }, () => 
        Array(response.board[0].length).fill(null).map(() => ({
          voltorb: false,
          '1': false,
          '2': false,
          '3': false
        }))
      ))
    } catch (err) {
      setError('Failed to start new game. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTileClick = async (row: number, col: number) => {
    if (!gameState || gameOverPhase || messagePhase) return;
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
        setError('Oh no, you get 0 coins');
        setMessagePhase('lose1');
        return;
      }
      if (result.game_won) {
        setError(`Level Cleared! You earned ${newState.coins_earned_this_level} coins`);
        setMessagePhase('win1');
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

  // Handler for post-game-over and message phase clicks
  const handleAppClick = () => {
    if (!gameState) return;

    if (messagePhase === 'win1') {
      // Reveal all tiles before showing second message
      const revealedState = {
        ...gameState,
        board: gameState.board.map(row => row.map(tile => ({ ...tile, flipped: true })))
      }
      setGameState(revealedState)
      setError(`Advancing to level ${gameState.level}`);
      setMessagePhase('win2');
      return;
    }
    
    if (messagePhase === 'win2') {
      setError(null);
      setMessagePhase(null);
      startNewGame();
      return;
    }
    
    if (messagePhase === 'lose1') {
      // Reveal all tiles before showing second message
      const revealedState = {
        ...gameState,
        board: gameState.board.map(row => row.map(tile => ({ ...tile, flipped: true })))
      }
      setGameState(revealedState)
      setError(`Dropped to level ${gameState.level}`);
      setMessagePhase('lose2');
      return;
    }
    
    if (messagePhase === 'lose2') {
      setError(null);
      setMessagePhase(null);
      startNewGame();
      return;
    }

    if (!gameOverPhase) return;
    
    if (gameOverPhase === 'reset') {
      startNewGame()
    }
  }

  if (celebration.show) {
    return (
      <CelebrationModal
        message={celebration.message}
        onPlayAgain={() => {
          setCelebration({ show: false, message: '' });
          startNewGame();
        }}
      />
    );
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

  // If in game over phase or message phase, overlay a click handler
  const appProps = (gameOverPhase || messagePhase) ? { onClick: handleAppClick, style: { cursor: 'pointer' } } : {}

  return (
    <div className="app" {...appProps}>
      <div className="top-info">
        <div className="info-box">Level: {gameState.level}</div>
        <div className="info-box">Total Coins: {String(gameState.coins).padStart(6, '0')}</div>
        <div className="info-box">Coins collected this Level: {String(gameState.coins_earned_this_level).padStart(6, '0')}</div>
      </div>
      {/* Only show error at the top if not in gameOverPhase or messagePhase */}
      {error && !gameOverPhase && !messagePhase && <div className="error">{error}</div>}
      <div className="main-content-row">
        <GameBoard
          board={gameState.board}
          rowTotals={gameState.row_totals}
          columnTotals={gameState.column_totals}
          onTileClick={handleTileClick}
          disabled={!!gameOverPhase || !!messagePhase}
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
          <button
            className="rules-button"
            onClick={() => setShowRules(true)}
          >
            Rules & About
          </button>
        </div>
      </div>
      {/* Centered overlay for game over/win/messagePhase message */}
      {(gameOverPhase || messagePhase) && error && (
        <div className="gameover-overlay">
          <div className="gameover-message">{error}</div>
        </div>
      )}
      {/* Rules modal */}
      {showRules && (
        <div className="rules-overlay" onClick={() => setShowRules(false)}>
          <div className="rules-content" onClick={e => e.stopPropagation()}>
            <h2>About Voltorb Flip</h2>
            <p>This is a recreation of the Voltorb Flip game that appears in the Korean and Western releases of Pokémon HeartGold and SoulSilver. The game is a mix between Minesweeper and Picture Cross and the placement of the bombs are given for each row and column. The goal of the game is to uncover all of the 2 and 3 tiles on a given board and move up to higher levels which have higher coin totals.</p>
            <p>The numbers on the side and bottom of the game board denote the sum of the tiles and how many bombs are present in that row/column, respectively. Each tile you flip multiplies your collected coins by that value. Once you uncover all of the 2 and 3 tiles, all of the coins you gained this level will be added to your total and you'll go up one level to a max of 7. If you flip over a Voltorb, you lose all your coins from the current level and risk going down to a lower level.</p>
            <p>More about this project and the source code is available on <a href="https://github.com/abhinavk0714/voltorb-flip" target="_blank" rel="noopener noreferrer">my GitHub</a>. This project was highly inspired by <a href="https://www.brandonstein.com/projects/voltorbflip" target="_blank" rel="noopener noreferrer">Brandon Stein's version</a> of this minigame. I do not claim to own any of the assets used on this website, including the Voltorb sprite, or the Voltorb Flip game itself. Enjoy!</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
