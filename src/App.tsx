import React, { useState, useEffect, useRef, useCallback } from 'react';

type Point = { x: number; y: number };

const GRID_SIZE = 20;
const INITIAL_SNAKE: Point[] = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION: Point = { x: 0, y: -1 };
const GAME_SPEED = 100; // Faster, more brutal

const TRACKS = [
  {
    id: 1,
    title: "SYS.AUDIO_01.DAT",
    artist: "UNIT_ALPHA_GEN",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    id: 2,
    title: "SYS.AUDIO_02.DAT",
    artist: "UNIT_BETA_GEN",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
  {
    id: 3,
    title: "SYS.AUDIO_03.DAT",
    artist: "UNIT_GAMMA_GEN",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  }
];

const generateFood = (snake: Point[]): Point => {
  let newFood: Point;
  while (true) {
    newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    if (!snake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
      break;
    }
  }
  return newFood;
};

export default function App() {
  // Game State
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isGamePlaying, setIsGamePlaying] = useState(false);
  
  const directionRef = useRef<Point>(INITIAL_DIRECTION);
  const nextDirectionRef = useRef<Point>(INITIAL_DIRECTION);

  // Music State
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);

  // Initialize food
  useEffect(() => {
    setFood(generateFood(INITIAL_SNAKE));
  }, []);

  const resetGame = useCallback(() => {
    setSnake(INITIAL_SNAKE);
    directionRef.current = INITIAL_DIRECTION;
    nextDirectionRef.current = INITIAL_DIRECTION;
    setScore(0);
    setGameOver(false);
    setIsGamePlaying(true);
    setFood(generateFood(INITIAL_SNAKE));
  }, []);

  const moveSnake = useCallback(() => {
    if (gameOver || !isGamePlaying) return;

    setSnake((prevSnake) => {
      const head = prevSnake[0];
      directionRef.current = nextDirectionRef.current;
      const newHead = {
        x: head.x + directionRef.current.x,
        y: head.y + directionRef.current.y,
      };

      // Check collision with walls
      if (
        newHead.x < 0 ||
        newHead.x >= GRID_SIZE ||
        newHead.y < 0 ||
        newHead.y >= GRID_SIZE
      ) {
        setGameOver(true);
        return prevSnake;
      }

      // Check collision with self
      if (prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
        setGameOver(true);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check food
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore((s) => s + 16); // Hexadecimal feel
        setFood(generateFood(newSnake));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [gameOver, isGamePlaying, food]);

  useEffect(() => {
    const interval = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(interval);
  }, [moveSnake]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
        e.preventDefault();
      }

      if (gameOver) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (directionRef.current.y !== 1) nextDirectionRef.current = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (directionRef.current.y !== -1) nextDirectionRef.current = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (directionRef.current.x !== 1) nextDirectionRef.current = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (directionRef.current.x !== -1) nextDirectionRef.current = { x: 1, y: 0 };
          break;
        case ' ':
          if (!isGamePlaying && !gameOver) {
            setIsGamePlaying(true);
          } else if (isGamePlaying) {
            setIsGamePlaying(false);
          } else {
            resetGame();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, isGamePlaying, resetGame]);

  useEffect(() => {
    if (isPlayingMusic) {
      audioRef.current?.play().catch(e => console.error("AUDIO_ERR:", e));
    } else {
      audioRef.current?.pause();
    }
  }, [isPlayingMusic, currentTrackIndex]);

  const toggleMusic = () => setIsPlayingMusic(!isPlayingMusic);
  
  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlayingMusic(true);
  };

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlayingMusic(true);
  };

  return (
    <div className="h-screen w-full bg-black text-[#00FFFF] font-vt uppercase overflow-hidden relative screen-tear">
      <div className="scanlines" />
      <div className="static-noise" />
      
      <header className="h-16 border-b-4 border-[#FF00FF] flex items-center justify-between px-4 md:px-8 z-10 relative bg-black shadow-[0_4px_20px_rgba(255,0,255,0.2)]">
        <h1 className="font-pixel text-sm md:text-xl glitch-text" data-text="SYS.OP // NEON_SNAKE.EXE">
          SYS.OP // NEON_SNAKE.EXE
        </h1>
        <div className="border-2 border-[#00FFFF] px-3 py-1 bg-black text-[#FF00FF] font-pixel text-[10px] md:text-sm shadow-[inset_0_0_10px_rgba(0,255,255,0.2)]">
          DATA_HARVESTED: {score.toString().padStart(4, '0')}
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 z-10 relative min-h-0">
        <div 
          className="relative bg-black border-4 border-[#00FFFF] shadow-[0_0_30px_rgba(0,255,255,0.3)]"
          style={{ 
            width: '100%',
            maxWidth: '500px',
            aspectRatio: '1 / 1',
            maxHeight: '100%'
          }}
        >
          {/* Grid lines */}
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'linear-gradient(to right, #00FFFF 1px, transparent 1px), linear-gradient(to bottom, #00FFFF 1px, transparent 1px)',
            backgroundSize: `${100 / GRID_SIZE}% ${100 / GRID_SIZE}%`
          }} />

          {/* Food */}
          <div 
            className="absolute bg-[#FF00FF] shadow-[0_0_15px_#FF00FF]"
            style={{
              width: `${100 / GRID_SIZE}%`,
              height: `${100 / GRID_SIZE}%`,
              left: `${(food.x / GRID_SIZE) * 100}%`,
              top: `${(food.y / GRID_SIZE) * 100}%`,
            }}
          />

          {/* Snake */}
          {snake.map((segment, index) => {
            const isHead = index === 0;
            return (
              <div
                key={`${segment.x}-${segment.y}-${index}`}
                className={`absolute ${
                  isHead 
                    ? 'bg-[#FFFFFF] shadow-[0_0_15px_#FFFFFF] z-10' 
                    : 'bg-[#00FFFF] shadow-[0_0_8px_#00FFFF]'
                }`}
                style={{
                  width: `${100 / GRID_SIZE}%`,
                  height: `${100 / GRID_SIZE}%`,
                  left: `${(segment.x / GRID_SIZE) * 100}%`,
                  top: `${(segment.y / GRID_SIZE) * 100}%`,
                  border: '1px solid #000'
                }}
              />
            );
          })}

          {/* Overlays */}
          {gameOver && (
            <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-20 border-4 border-[#FF00FF] p-4 text-center">
              <h2 className="font-pixel text-xl md:text-2xl text-[#FF00FF] glitch-text mb-4" data-text="CRITICAL_FAILURE">CRITICAL_FAILURE</h2>
              <p className="font-vt text-xl md:text-2xl text-[#00FFFF] mb-8">KERNEL_PANIC // SCORE: {score}</p>
              <button 
                onClick={resetGame}
                className="font-pixel text-[10px] md:text-sm border-2 border-[#00FFFF] px-6 py-3 text-[#00FFFF] hover:bg-[#00FFFF] hover:text-black transition-none shadow-[0_0_15px_rgba(0,255,255,0.4)]"
              >
                [ REBOOT_SYSTEM ]
              </button>
            </div>
          )}

          {!isGamePlaying && !gameOver && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20 p-4 text-center">
              <button 
                onClick={() => setIsGamePlaying(true)}
                className="font-pixel text-[10px] md:text-sm border-2 border-[#FF00FF] px-6 py-3 text-[#FF00FF] hover:bg-[#FF00FF] hover:text-black transition-none shadow-[0_0_15px_rgba(255,0,255,0.4)] mb-6"
              >
                {score === 0 ? '[ EXECUTE_SEQUENCE ]' : '[ RESUME_PROCESS ]'}
              </button>
              <div className="font-vt text-lg md:text-xl text-[#00FFFF] opacity-70">
                <p>&gt; INPUT: W,A,S,D OR ARROWS</p>
                <p>&gt; INTERRUPT: SPACEBAR</p>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="h-24 border-t-4 border-[#FF00FF] bg-black flex items-center justify-between px-4 md:px-8 z-10 relative shadow-[0_-4px_20px_rgba(255,0,255,0.2)]">
        <audio 
          ref={audioRef} 
          src={TRACKS[currentTrackIndex].url} 
          onEnded={nextTrack}
          preload="auto"
        />

        <div className="flex flex-col w-1/2">
          <span className="font-pixel text-[#FF00FF] text-[8px] md:text-[10px] mb-1 glitch-text" data-text="AUDIO_SUBSYSTEM_ACTIVE">AUDIO_SUBSYSTEM_ACTIVE</span>
          <span className="font-vt text-xl md:text-3xl truncate">{TRACKS[currentTrackIndex].title}</span>
          <span className="font-vt text-sm md:text-lg text-[#00FFFF]/60 truncate">SRC: {TRACKS[currentTrackIndex].artist}</span>
        </div>

        <div className="flex gap-2 md:gap-4 font-pixel text-[10px] md:text-sm">
          <button 
            onClick={prevTrack} 
            className="border-2 border-[#00FFFF] px-2 py-2 md:px-4 md:py-3 text-[#00FFFF] hover:bg-[#00FFFF] hover:text-black active:scale-95 transition-none"
          >
            [&lt;&lt;]
          </button>
          <button 
            onClick={toggleMusic} 
            className="border-2 border-[#00FFFF] px-2 py-2 md:px-4 md:py-3 text-[#00FFFF] hover:bg-[#00FFFF] hover:text-black active:scale-95 transition-none min-w-[48px] md:min-w-[64px]"
          >
            {isPlayingMusic ? '[||]' : '[&gt;]'}
          </button>
          <button 
            onClick={nextTrack} 
            className="border-2 border-[#00FFFF] px-2 py-2 md:px-4 md:py-3 text-[#00FFFF] hover:bg-[#00FFFF] hover:text-black active:scale-95 transition-none"
          >
            [&gt;&gt;]
          </button>
        </div>
      </footer>
    </div>
  );
}
