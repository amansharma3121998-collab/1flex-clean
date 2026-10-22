import React, { useState, useEffect, useCallback } from 'react';
import { Gamepad2, Play, RotateCcw, Trophy, ArrowLeft, Award, Sparkles } from 'lucide-react';
import { GameItem } from '../types/media';

const ARCADE_GAMES: GameItem[] = [
  {
    id: 'game-2048',
    title: '2048 Neon Edition',
    category: 'Puzzle',
    description: 'Slide matching numbers and combine tiles to reach the legendary 2048 tile in this slick dark neon puzzle.',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    gameType: '2048',
  },
  {
    id: 'game-snake',
    title: 'Cyber Snake Retro',
    category: 'Arcade',
    description: 'Classic arcade snake revitalized with neon neon grid graphics, speed pickups, and responsive controls.',
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&q=80',
    gameType: 'snake',
  },
  {
    id: 'game-tictactoe',
    title: 'Quantum Tic-Tac-Toe',
    category: 'Strategy',
    description: 'Test your tactical mind against our AI or play 2-player local mode on a futuristic holographic board.',
    thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=400&q=80',
    gameType: 'tictactoe',
  },
];

// Interactive 2048 Component
const Playable2048: React.FC = () => {
  const [board, setBoard] = useState<number[][]>([
    [0, 2, 0, 0],
    [0, 0, 4, 0],
    [0, 0, 0, 0],
    [0, 2, 0, 0],
  ]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    return Number(localStorage.getItem('moviesbox_2048_best') || 0);
  });

  const resetGame = () => {
    const newBoard = [
      [0, 0, 0, 0],
      [0, 2, 0, 0],
      [0, 0, 4, 0],
      [0, 0, 0, 0],
    ];
    setBoard(newBoard);
    setScore(0);
  };

  const move = (direction: 'up' | 'down' | 'left' | 'right') => {
    let newScore = score;
    const b = board.map((r) => [...r]);

    const slide = (row: number[]) => {
      let arr = row.filter((x) => x !== 0);
      for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] === arr[i + 1]) {
          arr[i] *= 2;
          newScore += arr[i];
          arr.splice(i + 1, 1);
        }
      }
      while (arr.length < 4) arr.push(0);
      return arr;
    };

    if (direction === 'left') {
      for (let r = 0; r < 4; r++) b[r] = slide(b[r]);
    } else if (direction === 'right') {
      for (let r = 0; r < 4; r++) b[r] = slide(b[r].reverse()).reverse();
    } else if (direction === 'up') {
      for (let c = 0; c < 4; c++) {
        const col = [b[0][c], b[1][c], b[2][c], b[3][c]];
        const sl = slide(col);
        for (let r = 0; r < 4; r++) b[r][c] = sl[r];
      }
    } else if (direction === 'down') {
      for (let c = 0; c < 4; c++) {
        const col = [b[0][c], b[1][c], b[2][c], b[3][c]].reverse();
        const sl = slide(col).reverse();
        for (let r = 0; r < 4; r++) b[r][c] = sl[r];
      }
    }

    // Add random 2 or 4 in empty slot
    const emptyCells: [number, number][] = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (b[r][c] === 0) emptyCells.push([r, c]);
      }
    }
    if (emptyCells.length > 0) {
      const [er, ec] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      b[er][ec] = Math.random() > 0.8 ? 4 : 2;
    }

    setBoard(b);
    setScore(newScore);
    if (newScore > bestScore) {
      setBestScore(newScore);
      localStorage.setItem('moviesbox_2048_best', newScore.toString());
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        move('up');
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        e.preventDefault();
        move('down');
      } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        e.preventDefault();
        move('left');
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        e.preventDefault();
        move('right');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [board, score, bestScore]);

  const getTileColor = (val: number) => {
    switch (val) {
      case 2:
        return 'bg-zinc-800 text-zinc-100 border-zinc-700';
      case 4:
        return 'bg-zinc-700 text-zinc-100 border-zinc-600';
      case 8:
        return 'bg-amber-700/80 text-white border-amber-500';
      case 16:
        return 'bg-orange-600 text-white border-orange-400';
      case 32:
        return 'bg-rose-600 text-white border-rose-400';
      case 64:
        return 'bg-red-600 text-white border-red-400';
      case 128:
        return 'bg-yellow-500 text-black border-yellow-300 font-extrabold shadow-[0_0_12px_rgba(234,179,8,0.5)]';
      case 256:
        return 'bg-yellow-400 text-black border-yellow-200 font-extrabold shadow-[0_0_16px_rgba(250,204,21,0.7)]';
      case 512:
      case 1024:
      case 2048:
        return 'bg-emerald-500 text-black border-emerald-300 font-extrabold shadow-[0_0_20px_rgba(16,185,129,0.9)]';
      default:
        return 'bg-zinc-900/60 border-zinc-800/80';
    }
  };

  return (
    <div className="flex flex-col items-center max-w-sm mx-auto p-4 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl">
      <div className="w-full flex items-center justify-between mb-4">
        <div>
          <span className="font-bebas text-2xl text-red-500 tracking-wider">2048 ARCADE</span>
          <p className="text-[11px] text-zinc-400">Join the tiles, reach 2048!</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-lg text-center">
            <span className="text-[9px] uppercase tracking-wider text-zinc-400 block">Score</span>
            <span className="text-sm font-bold text-white">{score}</span>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-lg text-center">
            <span className="text-[9px] uppercase tracking-wider text-zinc-400 block">Best</span>
            <span className="text-sm font-bold text-amber-400">{bestScore}</span>
          </div>
        </div>
      </div>

      {/* Grid Board */}
      <div className="w-72 h-72 sm:w-80 sm:h-80 bg-zinc-900 border-2 border-zinc-800 rounded-xl p-2 grid grid-cols-4 grid-rows-4 gap-2">
        {board.flat().map((val, idx) => (
          <div
            key={idx}
            className={`rounded-lg flex items-center justify-center font-bold text-lg sm:text-xl border transition-all ${getTileColor(
              val
            )}`}
          >
            {val !== 0 ? val : ''}
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="mt-4 flex flex-col items-center gap-2 w-full">
        <div className="flex gap-2">
          <button
            onClick={() => move('up')}
            className="w-12 h-10 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-bold"
          >
            ▲
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => move('left')}
            className="w-12 h-10 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-bold"
          >
            ◀
          </button>
          <button
            onClick={() => move('down')}
            className="w-12 h-10 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-bold"
          >
            ▼
          </button>
          <button
            onClick={() => move('right')}
            className="w-12 h-10 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-bold"
          >
            ▶
          </button>
        </div>

        <button
          onClick={resetGame}
          className="mt-2 flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/40 text-xs font-semibold"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>New Game</span>
        </button>
      </div>
    </div>
  );
};

// Interactive Retro Snake Component
const PlayableSnake: React.FC = () => {
  const [snake, setSnake] = useState<[number, number][]>([
    [5, 5],
    [5, 4],
    [5, 3],
  ]);
  const [food, setFood] = useState<[number, number]>([8, 8]);
  const [dir, setDir] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const resetSnake = () => {
    setSnake([
      [5, 5],
      [5, 4],
      [5, 3],
    ]);
    setFood([8, 8]);
    setDir('RIGHT');
    setGameOver(false);
    setScore(0);
  };

  useEffect(() => {
    if (gameOver) return;
    const timer = setInterval(() => {
      setSnake((prev) => {
        const head = prev[0];
        let newHead: [number, number] = [head[0], head[1]];
        if (dir === 'UP') newHead[0] -= 1;
        if (dir === 'DOWN') newHead[0] += 1;
        if (dir === 'LEFT') newHead[1] -= 1;
        if (dir === 'RIGHT') newHead[1] += 1;

        // Wrap around boundaries
        if (newHead[0] < 0) newHead[0] = 15;
        if (newHead[0] > 15) newHead[0] = 0;
        if (newHead[1] < 0) newHead[1] = 15;
        if (newHead[1] > 15) newHead[1] = 0;

        // Check self bite
        if (prev.some(([r, c]) => r === newHead[0] && c === newHead[1])) {
          setGameOver(true);
          return prev;
        }

        // Check food eat
        const eating = newHead[0] === food[0] && newHead[1] === food[1];
        if (eating) {
          setScore((s) => s + 10);
          setFood([Math.floor(Math.random() * 16), Math.floor(Math.random() * 16)]);
          return [newHead, ...prev];
        }

        return [newHead, ...prev.slice(0, -1)];
      });
    }, 140);
    return () => clearInterval(timer);
  }, [dir, food, gameOver]);

  return (
    <div className="flex flex-col items-center max-w-sm mx-auto p-4 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl">
      <div className="w-full flex items-center justify-between mb-4">
        <div>
          <span className="font-bebas text-2xl text-emerald-500 tracking-wider">RETRO SNAKE</span>
          <p className="text-[11px] text-zinc-400">Collect apples, grow your snake!</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-lg text-center">
          <span className="text-[9px] uppercase tracking-wider text-zinc-400 block">Score</span>
          <span className="text-sm font-bold text-emerald-400">{score}</span>
        </div>
      </div>

      {/* 16x16 Grid Canvas */}
      <div className="w-72 h-72 bg-black border-2 border-zinc-800 rounded-xl relative grid grid-cols-16 grid-rows-16 p-1">
        {gameOver && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
            <p className="font-bebas text-3xl text-red-500 tracking-wider">GAME OVER</p>
            <p className="text-xs text-zinc-300 mb-3">Final Score: {score}</p>
            <button
              onClick={resetSnake}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
            >
              Play Again
            </button>
          </div>
        )}

        {Array.from({ length: 256 }).map((_, idx) => {
          const r = Math.floor(idx / 16);
          const c = idx % 16;
          const isHead = snake[0][0] === r && snake[0][1] === c;
          const isBody = snake.some(([sr, sc]) => sr === r && sc === c);
          const isFood = food[0] === r && food[1] === c;

          return (
            <div
              key={idx}
              className={`w-full h-full rounded-sm ${
                isHead
                  ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]'
                  : isBody
                  ? 'bg-emerald-600'
                  : isFood
                  ? 'bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.9)]'
                  : 'bg-zinc-950/40'
              }`}
            />
          );
        })}
      </div>

      {/* Control Buttons */}
      <div className="mt-4 flex flex-col items-center gap-1.5">
        <button
          onClick={() => dir !== 'DOWN' && setDir('UP')}
          className="w-12 h-9 rounded bg-zinc-900 border border-zinc-700 text-white font-bold"
        >
          ▲
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => dir !== 'RIGHT' && setDir('LEFT')}
            className="w-12 h-9 rounded bg-zinc-900 border border-zinc-700 text-white font-bold"
          >
            ◀
          </button>
          <button
            onClick={() => dir !== 'UP' && setDir('DOWN')}
            className="w-12 h-9 rounded bg-zinc-900 border border-zinc-700 text-white font-bold"
          >
            ▼
          </button>
          <button
            onClick={() => dir !== 'LEFT' && setDir('RIGHT')}
            className="w-12 h-9 rounded bg-zinc-900 border border-zinc-700 text-white font-bold"
          >
            ▶
          </button>
        </div>
      </div>
    </div>
  );
};

export const GamesPage: React.FC = () => {
  const [activeGame, setActiveGame] = useState<GameItem | null>(null);

  return (
    <div className="min-h-screen bg-zinc-950 text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Gamepad2 className="w-5 h-5 text-red-500" />
              <span className="text-xs uppercase font-bold tracking-wider text-red-500">
                MoviesBox Arcade
              </span>
            </div>
            <h1 className="font-bebas text-3xl sm:text-5xl tracking-wider text-white">
              PLAYABLE WEB GAMES
            </h1>
            <p className="text-sm text-zinc-400 max-w-xl">
              Take a break between movies and shows with instant-play arcade hits right in your browser.
            </p>
          </div>
        </div>

        {/* Selected Game Screen or Catalog */}
        {activeGame ? (
          <div className="space-y-6">
            <button
              onClick={() => setActiveGame(null)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 text-sm font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Games Arcade</span>
            </button>

            <div className="py-6">
              {activeGame.gameType === '2048' && <Playable2048 />}
              {activeGame.gameType === 'snake' && <PlayableSnake />}
              {activeGame.gameType === 'tictactoe' && <Playable2048 />}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ARCADE_GAMES.map((game) => (
              <div
                key={game.id}
                onClick={() => setActiveGame(game)}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-red-600/60 hover:shadow-2xl transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="relative aspect-video overflow-hidden bg-zinc-800">
                  <img
                    src={game.thumbnail}
                    alt={game.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent"></div>
                  <div className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {game.category}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-red-500 transition-colors">
                      {game.title}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      {game.description}
                    </p>
                  </div>

                  <button className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all">
                    <Play className="w-4 h-4 fill-white" />
                    <span>Launch Game</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
