/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react'
import GameBoard from './components/GameBoard'
import './App.css'
import { gameService } from './services/gameService'
import type { GameState } from './services/gameService'

function App() {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [gameOverPhase, setGameOverPhase] = useState<null | 'reveal' | 'reset'>(null)

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError('Failed to start new game. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTileClick = async (row: number, col: number) => {
    if (!gameState || gameOverPhase) return

    try {
      const result = await gameService.flipTile(row, col)
      const newState = await gameService.getGameState()
      setGameState(newState)
      if (result.game_over) {
        setError('Game Over! You hit a Voltorb! Click anywhere to reveal all tiles.')
        setGameOverPhase('reveal')
        return
      }
      if (result.game_won) {
        setError('Congratulations! You won! Click anywhere to reveal all tiles.')
        setGameOverPhase('reveal')
        return
      }
    } catch (err) {
      setError('Failed to flip tile. Please try again.')
    }
  }

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
      {error && <div className="error">{error}</div>}
      <GameBoard
        board={gameState.board}
        rowTotals={gameState.row_totals}
        columnTotals={gameState.column_totals}
        onTileClick={handleTileClick}
        disabled={!!gameOverPhase}
      />
    </div>
  )
}

export default App
