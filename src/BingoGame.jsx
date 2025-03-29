import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { GiShare } from "react-icons/gi";
import PlayerSidebar from "./PlayerSidebar";

// Socket initialization
const url = import.meta.env.VITE_BACKEND_URL;
const socket = io(url);

// Utility functions
const calculateBingos = (grid) => {
  let count = 0;
  // Check rows
  for (let i = 0; i < 5; i++) {
    if (grid[i].every((cell) => cell === "X")) count++;
  }
  // Check columns
  for (let i = 0; i < 5; i++) {
    if (grid.map((row) => row[i]).every((cell) => cell === "X")) count++;
  }
  // Check diagonals
  if ([0, 1, 2, 3, 4].every((i) => grid[i][i] === "X")) count++;
  if ([0, 1, 2, 3, 4].every((i) => grid[i][4 - i] === "X")) count++;
  return count;
};

// Cell Component
const BingoCell = ({ value, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-16 h-16 flex justify-center items-center text-lg font-semibold border-2 rounded-md ${
      value === "X"
        ? "bg-red-400 text-white border-gray-300"
        : value === null
        ? "bg-white "
        : "bg-green-500 text-black border-gray-900"
    }`}
  >
    {value}
  </button>
);

const BingoGame = () => {
  const { roomCode } = useParams();
  const [grid, setGrid] = useState(Array(5).fill(null).map(() => Array(5).fill(null)));
  const [availableNumbers, setAvailableNumbers] = useState(
    Array.from({ length: 25 }, (_, index) => index + 1)
  );
  const navigator = useNavigate();
  const [gameStarted, setGameStarted] = useState(false);
  const [bingoCount, setBingoCount] = useState(0);
  const [winner, setWinner] = useState(null);
  const [waiting, setWaiting] = useState(false);
  const [isTurn, setIsTurn] = useState(false);
  const gridRef = useRef(grid);
  useEffect(() => {
    gridRef.current = grid;
    setBingoCount(calculateBingos(grid));
  }, [grid]);

  useEffect(() => {
    if (bingoCount >= 5) {
      socket.emit("gameOver", roomCode);
    }
  }, [bingoCount, roomCode]);

  useEffect(() => {
    let name = localStorage.getItem('userName');
    name = name.length>0?name:`Player${Date.now()}`;
    socket.emit("joinRoom", roomCode,name,(message)=>{
      if(message) {
        alert(message);
        setTimeout(() => {
          navigator('/');
        }, 100);
      }
    });
    socket.on('roomState', (room) => {
      setGameStarted(room.gameStarted);
    });

    socket.on('gameResult', (result) => {
      setWinner(result ? 'win' : 'lose');
    });

    socket.on('startGame', (room) => {
      setGameStarted(room.gameStarted);
      setWaiting(false);
    });

    socket.on('updateCell', (val) => {
      const updatedGrid = gridRef.current.map(row =>
        row.map(cell => (cell === val ? "X" : cell))
      );
      setGrid(updatedGrid);
    });

    socket.on("resetGame", (room, newGrid) => {
      if (roomCode === room) {
        setGameStarted(false);
        setBingoCount(0);
        setWaiting(false);
        setWinner(null);
        setGrid(newGrid);
        setAvailableNumbers(Array.from({ length: 25 }, (_, index) => index + 1));
      }
    });

    socket.on("changeTurn", (roomCodeFromServer, turn) => {
      if (roomCodeFromServer === roomCode) {
        setIsTurn(turn);
      }
    });
    return()=> {
      socket.emit("leaveroom",roomCode);
    }
  }, [roomCode,navigator]);

  const handleCellClick = (row, col) => {
    if ((!gameStarted && grid[row][col] !== null) || (gameStarted && grid[row][col] === 'X')) {
      alert('Cell already filled');
    } else if (!gameStarted && grid[row][col] === null) {
      const newGrid = [...grid];
      newGrid[row][col] = availableNumbers[0];
      setGrid(newGrid);
      setAvailableNumbers(availableNumbers.slice(1));
    } else {
      socket.emit("cellClick", roomCode, grid[row][col]);
    }
  };

  const handleStartGame = () => {
    if (grid.every((row) => row.every((cell) => cell !== null))) {
      setWaiting(true);
      socket.emit("submitGrid", roomCode);
    } else {
      alert("Please fill all the cells!");
    }
  };

  const handleResetGame = () => {
    const emptyGrid = Array(5).fill(null).map(() => Array(5).fill(null));
    socket.emit("resetGame", roomCode, emptyGrid);
  };

  const handleFillGrid = () => {
    const shuffledNumbers = [...availableNumbers].sort(() => Math.random() - 0.5);
    const newGrid = grid.map(row => [...row]);
    let numberIndex = 0;

    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        if (newGrid[i][j] === null && shuffledNumbers[numberIndex]) {
          newGrid[i][j] = shuffledNumbers[numberIndex++];
        }
      }
    }

    setGrid(newGrid);
    setAvailableNumbers(shuffledNumbers.slice(numberIndex));
  };

  const shareRoom = async () => {
    if (window.navigator.share) {
      try {
        await window.navigator.share({
          title: 'Bingo Game',
          text: 'Join my Bingo Room and play with me',
          url: `https://bingo-f.vercel.app/room/${roomCode}`,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      alert('Sharing is not supported in your browser.');
    }
  };

  return (
    <>
    <PlayerSidebar socket = {socket} roomCode= {roomCode}/>
    <div className="min-h-screen flex flex-col items-center text-white py-10">
      <h1 className="text-4xl font-bold mb-6">🎉 Bingo Game 🎲</h1>
      
      <div className="flex flex-col items-center gap-4">
        <button 
          onClick={handleFillGrid}
          className="bg-blue-600 p-2 rounded-lg hover:bg-blue-800"
        >
          Fill Randomly
        </button>
        
        <h3 className="text-xl m-2 mt-3 flex items-center">
          Room Code: {roomCode}
          <GiShare className="mx-2 hover:cursor-pointer" onClick={shareRoom}/>
        </h3>
      </div>

      <div className="text-center mb-5">
        {gameStarted && (
          <>
            <h3 className="text-xl mb-2">Bingo Count: {bingoCount} / 5</h3>
            <h3 className={`${isTurn?'text-2xl animate-bounce text-purple-900 font-extrabold':'text-xl'}`}>{isTurn ? 'Your Turn' : 'Opponent Turn'}</h3>
          </>
        )}
        
        {winner === 'win' && (
          <h2 className="text-2xl font-bold mt-5">
            🎉 Bingo! You Won The Game 🎉
          </h2>
        )}
        
        {winner === 'lose' && (
          <h2 className="text-2xl font-bold mt-5">
            🥲 You Lose !! Better Luck next time
          </h2>
        )}
      </div>

      <div className="grid grid-cols-5 gap-2">
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <BingoCell
              key={`${rowIndex}-${colIndex}`}
              value={cell}
              onClick={() => handleCellClick(rowIndex, colIndex)}
              disabled={!isTurn && gameStarted}
            />
          ))
        )}
        
      </div>
      {!gameStarted && !winner && (
          <button
            onClick={handleStartGame}
            disabled={waiting}
            className="my-5 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-lg rounded-lg shadow-lg"
          >
            🎮 {waiting ? 'Waiting for Opponent...' : 'Start Game'}
          </button>
        )}

        {(winner || gameStarted) && (
          <button
            onClick={handleResetGame}
            className="my-5 px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-lg rounded-lg shadow-lg"
          >
            🔄 Reset Game
          </button>
        )}
    </div>
    </>
  );
};

export default BingoGame;