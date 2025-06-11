'use client';

import React, { useState, useEffect } from 'react';
import GameBoard from '../components/GameBoard';
import CelebrationModal from '../components/CelebrationModal';
import { gameService } from '../services/gameService';
import type { GameState } from '@/types/game';
import '../styles/App.css';
import Image from 'next/image';

console.log('!!! Voltorb Flip main page loaded !!!');

type MemoMark = 'voltorb' | '1' | '2' | '3';

interface MemoData {
    voltorb: boolean;
    '1': boolean;
    '2': boolean;
    '3': boolean;
}

export default function Home() {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [messagePhase, setMessagePhase] = useState<null | 'win1' | 'win2' | 'win3' | 'lose1' | 'lose2' | 'lose3'> (null);
    const [memoMode, setMemoMode] = useState(false);
    const [memoData, setMemoData] = useState<MemoData[][]>([]);
    const [selectedTile, setSelectedTile] = useState<{ row: number; col: number } | null>(null);
    const [celebration, setCelebration] = useState<{ show: boolean; message: string }>({ show: false, message: '' });
    const [showRules, setShowRules] = useState(false);
    const [pendingLevel, setPendingLevel] = useState<number | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [advanceLevelPending, setAdvanceLevelPending] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        startNewGame();
        const checkMobile = () => setIsMobile(window.innerWidth <= 500);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resetMemoData = (board: any) => {
        if (board && board.tiles && board.tiles.length > 0) {
            setMemoData(Array.from({ length: board.tiles.length }, () =>
                Array(board.tiles[0].length).fill(null).map(() => ({
                    voltorb: false,
                    '1': false,
                    '2': false,
                    '3': false
                }))
            ));
        }
    };

    const startNewGame = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await gameService.startNewGame();
            if ('message' in response) {
                setCelebration({ show: true, message: response.message || '' });
                setGameState(null);
                setIsLoading(false);
                return;
            }
            if ('board' in response) {
                setGameState(response);
                resetMemoData(response.board);
            }
        } catch {
            setError('Failed to start new game. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleTileClick = async (row: number, col: number) => {
        if (!gameState || messagePhase) return;
        if (memoMode) {
            if (gameState.board.tiles[row][col].flipped) return;
            setSelectedTile({ row, col });
            return;
        }
        try {
            const result = await gameService.flipTile(row, col);
            setGameState(result);
            if ('game_over' in result && result.game_over) {
                setPendingLevel(result.level);
                setError('Oh no! You get 0 coins!');
                setMessagePhase('lose1');
                return;
            }
            if ('game_won' in result && result.game_won) {
                setError(`Level clear! You received ${result.coinsEarnedThisLevel} coins!`);
                setMessagePhase('win1');
                setAdvanceLevelPending(false);
                return;
            }
        } catch {
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

    const handleAppClick = async () => {
        if (!gameState) return;
        if (messagePhase === 'win1') {
            const revealedState = {
                ...gameState,
                board: {
                    ...gameState.board,
                    tiles: gameState.board.tiles.map(row => row.map(tile => ({ ...tile, flipped: true })))
                }
            };
            setGameState(revealedState);
            setError(null);
            setMessagePhase('win2');
            return;
        }
        if (messagePhase === 'win2') {
            setError(`Advanced to level ${gameState.level + 1}`);
            setMessagePhase('win3');
            setAdvanceLevelPending(true);
            const newState = await gameService.advanceLevel();
            setTimeout(() => {
                setGameState(newState);
                resetMemoData(newState.board);
                setError(null);
                setMessagePhase(null);
                setAdvanceLevelPending(false);
            }, 1000);
            return;
        }
        if (messagePhase === 'win3') {
            return;
        }
        if (messagePhase === 'lose1') {
            const revealedState = {
                ...gameState,
                board: {
                    ...gameState.board,
                    tiles: gameState.board.tiles.map(row => row.map(tile => ({ ...tile, flipped: true })))
                }
            };
            setGameState(revealedState);
            setError(null);
            setMessagePhase('lose2');
            return;
        }
        if (messagePhase === 'lose2') {
            setError(`Dropped to level ${pendingLevel}`);
            setMessagePhase('lose3');
            setAdvanceLevelPending(true);
            const newState = await gameService.startNewGame(pendingLevel ?? undefined);
            setTimeout(() => {
                if ('board' in newState) {
                    setGameState(newState);
                    resetMemoData(newState.board);
                } else if ('message' in newState) {
                    setGameState(null);
                }
                setMessagePhase(null);
                setError(null);
                setPendingLevel(null);
                setAdvanceLevelPending(false);
            }, 1000);
            return;
        }
        if (messagePhase === 'lose3') {
            return;
        }
    };

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
        );
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
        );
    }

    return (
        <div className="app" style={{ position: 'relative' }}>
            <div className="top-info">
                <div className="info-box">Level: {gameState.level}</div>
                <div className="info-box">Total Coins: {String(gameState.coins).padStart(6, '0')}</div>
                <div className="info-box">Coins collected this Level: {String(gameState.coinsEarnedThisLevel).padStart(6, '0')}</div>
            </div>
            {/* Only show error at the top if not in any win/advance/drop messagePhase */}
            {error && !['win1','win2','win3','lose1','lose2','lose3'].includes(messagePhase ?? '') && <div className="error">{error}</div>}
            {messagePhase === 'win1' && error && (
                <div className="gameover-overlay" onClick={handleAppClick} style={{ cursor: 'pointer' }}>
                    <div className="gameover-message">{error}</div>
                </div>
            )}
            {messagePhase === 'win3' && error && (
                <div className="gameover-overlay">
                    <div className="gameover-message">{error}</div>
                </div>
            )}
            {messagePhase === 'lose1' && error && (
                <div className="gameover-overlay" onClick={handleAppClick} style={{ cursor: 'pointer' }}>
                    <div className="gameover-message">{error}</div>
                </div>
            )}
            {messagePhase === 'lose3' && error && (
                <div className="gameover-overlay">
                    <div className="gameover-message">{error}</div>
                </div>
            )}
            <div className="main-content-row">
                <GameBoard
                    board={gameState.board.tiles || []}
                    rowTotals={gameState.rowTotals || []}
                    columnTotals={gameState.columnTotals || []}
                    onTileClick={handleTileClick}
                    disabled={!!messagePhase}
                    memoMode={memoMode}
                    memoData={memoData}
                    selectedTile={memoMode ? selectedTile : null}
                />
                {isMobile ? (
                    <>
                        <div className="mobile-controls-row">
                            <button
                                className={`mobile-memo-btn${memoMode ? ' active' : ''}`}
                                onClick={handleMemoModeToggle}
                            >
                                {memoMode ? '✖️ Close Memo' : '📝 Open Memo'}
                            </button>
                            <button
                                className="mobile-rules-btn"
                                onClick={() => setShowRules(true)}
                            >
                                Rules & About
                            </button>
                        </div>
                        <div className="mobile-memo-dropdown">
                            {memoMode && (
                                <div className="memo-marker-grid">
                                    <button
                                        className={`memo-marker-btn${selectedTile && memoData[selectedTile.row][selectedTile.col]['voltorb'] ? ' selected' : ''}`}
                                        onClick={e => { e.stopPropagation(); handleMemoMarkToggle('voltorb'); }}
                                    >
                                        <Image
                                            src="/voltorb.png"
                                            alt="Voltorb"
                                            width={24}
                                            height={24}
                                        />
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
                            )}
                        </div>
                    </>
                ) : (
                    <div className="memo-sidebar">
                        <button
                            className={`memo-toggle-button-sidebar${memoMode ? ' active' : ''}`}
                            onClick={handleMemoModeToggle}
                        >
                            <span className="memo-close-icon">{memoMode ? '✖️' : '📝'}</span>
                            <span className="memo-close-text">{memoMode ? 'Close Memo' : 'Open Memo'}</span>
                        </button>
                        <div style={{ height: 140, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {memoMode ? (
                                <div className="memo-marker-grid">
                                    <button
                                        className={`memo-marker-btn${selectedTile && memoData[selectedTile.row][selectedTile.col]['voltorb'] ? ' selected' : ''}`}
                                        onClick={e => { e.stopPropagation(); handleMemoMarkToggle('voltorb'); }}
                                    >
                                        <Image
                                            src="/voltorb.png"
                                            alt="Voltorb"
                                            width={24}
                                            height={24}
                                        />
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
                            ) : null}
                        </div>
                        <button
                            className="rules-about-btn"
                            onClick={() => setShowRules(true)}
                        >
                            Rules & About
                        </button>
                    </div>
                )}
            </div>
            {messagePhase && (
                <div
                    className="progression-overlay"
                    onClick={handleAppClick}
                    style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        zIndex: 100,
                        cursor: 'pointer',
                        background: 'rgba(0,0,0,0.01)',
                    }}
                />
            )}
            {showRules && (
                <div className="rules-overlay" onClick={() => setShowRules(false)}>
                    <div className="rules-content" onClick={e => e.stopPropagation()}>
                        <h2>About Voltorb Flip</h2>
                        <p>This is a recreation of the Voltorb Flip game that appears in the Korean and Western releases of Pokémon HeartGold and SoulSilver. The game is a mix between Minesweeper and Picture Cross and the placement of the bombs are given for each row and column. The goal of the game is to uncover all of the 2 and 3 tiles on a given board and move up to higher levels which have higher coin totals.</p>
                        <p>The numbers on the side and bottom of the game board denote the sum of the tiles and how many bombs are present in that row/column, respectively. Each tile you flip multiplies your collected coins by that value. Once you uncover all of the 2 and 3 tiles, all of the coins you gained this level will be added to your total and you&apos;ll go up one level to a max of 8. If you flip over a Voltorb, you lose all your coins from the current level and risk going down to a lower level.</p>
                        <p>More about this project and the source code is available on <a href="https://github.com/abhinavk0714/voltorb-flip" target="_blank" rel="noopener noreferrer">my GitHub</a>. This project was highly inspired by <a href="https://www.brandonstein.com/projects/voltorbflip" target="_blank" rel="noopener noreferrer">Brandon Stein&apos;s version</a> of this minigame. I do not claim to own any of the assets used on this website, including the Voltorb sprite, or the Voltorb Flip game itself. Enjoy!</p>
                    </div>
                </div>
            )}
        </div>
    );
}
