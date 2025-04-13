import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { GiShare } from "react-icons/gi";
import PlayerSidebar from "./PlayerSidebar";
import socket from "./socket";
import cellclick from "../Sound-Effect/clicksound.wav";
import BackButton from "./BackButton";
import Alert from "./Alert";

const cellClickSound = new Audio(cellclick);

const calculateBingos = (grid) => {
  let count = 0;
  for (let i = 0; i < 5; i++) {
    if (grid[i].every((cell) => cell === "X")) count++;
    if (grid.map((row) => row[i]).every((cell) => cell === "X")) count++;
  }
  if ([0, 1, 2, 3, 4].every((i) => grid[i][i] === "X")) count++;
  if ([0, 1, 2, 3, 4].every((i) => grid[i][4 - i] === "X")) count++;
  return count;
};

const BingoCell = ({ value, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-16 h-16 flex justify-center items-center text-lg font-semibold border-2 rounded-md ${
      value === "X"
        ? "bg-red-400 text-white border-gray-300"
        : value === null
        ? "bg-white"
        : "bg-green-500 text-black border-gray-900"
    }`}
  >
    {value}
  </button>
);

const BingoGame = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();

  const [grid, setGrid] = useState(Array(5).fill(null).map(() => Array(5).fill(null)));
  const [availableNumbers, setAvailableNumbers] = useState(
    Array.from({ length: 25 }, (_, i) => i + 1)
  );
  const [gameStarted, setGameStarted] = useState(false);
  const [bingoCount, setBingoCount] = useState(0);
  const [winner, setWinner] = useState(null);
  const [waiting, setWaiting] = useState(false);
  const [isTurn, setIsTurn] = useState(false);
  const [isTour, setIsTour] = useState(false);
  const [round, setRound] = useState(1);
  const [isWinner, setIsWinner] = useState(false);
  const [isBackTrigger, setIsBackTrigger] = useState(false);
  const[Socket,setSocket]=useState(socket);
  const gridRef = useRef(grid);
    const [alertMsg, setAlertMsg] = useState({
      message: '',
      type: ''
    });
  useEffect(()=>{
    setSocket(socket);
  },[Socket])
  useEffect(()=>{
    if(alertMsg.message !== '' && alertMsg.message) {
      setTimeout(() => {
        setAlertMsg({
          message:'',
          type:''
        })
      }, 1000);
    }
    return clearTimeout();
  },[alertMsg])
  useEffect(() => {
    gridRef.current = grid;
    const count = calculateBingos(grid);
    if (count !== bingoCount) setBingoCount(count);
  }, [grid, bingoCount]);

  useEffect(() => {
    Socket.on("istournament", ({ status, round, isWinner }) => {
      setIsTour(status);
      setRound(round);
      localStorage.setItem('round',round)
      setIsWinner(isWinner);
    });
  }, [Socket]);

  useEffect(() => {
    if (bingoCount >= 5) {
      Socket.emit("gameOver", roomCode);
      if (isTour) {
        setTimeout(() => {
          round === 1
            ? Socket.emit("roundover", roomCode)
            : Socket.emit("finalEnd", roomCode, isWinner);
        }, 2000);
      }
    }
  }, [bingoCount, isTour, round, roomCode, isWinner,Socket]);

  useEffect(() => {
    const handleConnect = () => {
      let name = localStorage.getItem("userName");
      if(!name || name === '') {
        name = `Player${(Date.now() * Math.random()).toString().substring(0, 4)}`;
        localStorage.setItem('userName',name);
      }
      Socket.emit("joinRoom", roomCode, name, (message) => {
        if (message) {
          alert(message);
          setTimeout(() => {
            navigate('/');
          }, 100);
        }
      });
    };
    handleConnect();
    Socket.on("roomState", ({ gameStarted }) => setGameStarted(gameStarted));
    Socket.on("gameResult", (result) => setWinner(result ? "win" : "lose"));
    Socket.on("startGame", ({ gameStarted }) => {
      setGameStarted(gameStarted);
      setWaiting(false);
    });
    Socket.on("updateCell", (val) => {
      cellClickSound.play();
      setGrid((prevGrid) =>
        prevGrid.map((row) => row.map((cell) => (cell === val ? "X" : cell)))
      );
    });
    Socket.on("resetGame", (room, newGrid) => {
      if (room === roomCode) {
        setGameStarted(false);
        setBingoCount(0);
        setWaiting(false);
        setWinner(null);
        setGrid(newGrid);
        setAvailableNumbers(Array.from({ length: 25 }, (_, i) => i + 1));
      }
    });
    Socket.on("changeTurn", (room, turn) => {
      if (room === roomCode) setIsTurn(turn);
    });
    Socket.on("backToTour", (tourId) => {
      setIsBackTrigger(true);
      navigate(`/tournament/${tourId}`);
    });
  window.onpopstate=()=>{
    Socket.emit("leaveroom", roomCode);
    if(!isBackTrigger) {
    Socket.emit("leavetour", roomCode);
    const name = localStorage.getItem('userName');
    localStorage.clear();
    localStorage.setItem('userName',name);
    }
  }
  }, [roomCode, isBackTrigger, Socket]);

  const handleCellClick = (row, col) => {
    cellClickSound.play();
    const cell = grid[row][col];
    if (!gameStarted && cell !== null){
      setAlertMsg({
        message:"Cell already filled",
        type:"warning"
      })
      return;
    }
    if (!gameStarted && cell === null) {
      const newGrid = grid.map((r, i) =>
        r.map((c, j) => (i === row && j === col ? availableNumbers[0] : c))
      );
      setGrid(newGrid);
      setAvailableNumbers((prev) => prev.slice(1));
    } else if (gameStarted && cell !== "X") {
      Socket.emit("cellClick", roomCode, cell);
    }
  };

  const handleStartGame = () => {
    if (grid.flat().includes(null)){
      setAlertMsg({
        message:"Please fill all the cells!",
        type:"error"
      })
      return;
    }
    setWaiting(true);
    Socket.emit("submitGrid", roomCode);
  };

  const handleResetGame = () => {
    const emptyGrid = Array(5).fill(null).map(() => Array(5).fill(null));
    Socket.emit("resetGame", roomCode, emptyGrid);
  };

  const handleFillGrid = () => {
    const shuffled = [...availableNumbers].sort(() => Math.random() - 0.5);
    let idx = 0;
    let delay = 0;
    const newGrid = grid.map(row => [...row]); // Clone grid
  
    for (let i = 0; i < newGrid.length; i++) {
      for (let j = 0; j < newGrid[i].length; j++) {
        if (newGrid[i][j] === null && idx < shuffled.length) {
          cellClickSound.play();
          setTimeout(() => {
            newGrid[i][j] = shuffled[idx++];
            setGrid([...newGrid]);
           // Trigger re-render with new state
          }, delay);
          delay += 30; // Add delay between cell fills
        }
      }
    }
  
    setTimeout(() => {
      setAvailableNumbers(shuffled.slice(idx));
    }, delay);
  };
  

  const shareRoom = async () => {
    if (window.navigator.share) {
      try {
        await window.navigator.share({
          title: "Bingo Game",
          text: "Join my Bingo Room and play with me",
          url: `https://bingo-f.vercel.app/room/${roomCode}`,
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      setAlertMsg({
        message:"Sharing not supported in your browser.",
        type:"warning"
      })
    }
  };

  return (
    <>
      <PlayerSidebar socket={Socket} roomCode={roomCode} />
      <BackButton/>
      <Alert key={Date.now()*Math.random()} message={alertMsg.message} type={alertMsg.type}/>
      <div className="min-h-screen flex flex-col items-center text-white py-10">
        <h1 className="text-4xl font-bold mb-6">🎉 Bingo Game 🎲</h1>
      {isTour &&  <h1 className="text-2xl font-bold mb-6">Round:-{round}</h1>}
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={handleFillGrid}
            className="bg-blue-600 p-2 rounded-lg hover:bg-blue-800"
          >
            Fill Randomly
          </button>

          <h3 className="text-xl mt-3 flex items-center">
            Room Code: {roomCode}
            <GiShare className="mx-2 hover:cursor-pointer" onClick={shareRoom} />
          </h3>
        </div>

        <div className="text-center mb-5">
          {gameStarted && (
            <>
              <h3 className="text-xl mb-2">Bingo Count: {bingoCount} / 5</h3>
              <h3 className={`${isTurn ? "text-2xl animate-bounce text-purple-900 font-extrabold" : "text-xl"}`}>
                {isTurn ? "Your Turn" : "Opponent Turn"}
              </h3>
            </>
          )}

          {winner === "win" && (
            <h2 className="text-2xl font-bold mt-5">🎉 Bingo! You Won The Game 🎉</h2>
          )}

          {winner === "lose" && (
            <h2 className="text-2xl font-bold mt-5">🥲 You Lost! Better Luck Next Time</h2>
          )}
        </div>

        <div className="grid grid-cols-5 gap-2">
          {grid.map((row, rowIdx) =>
            row.map((cell, colIdx) => (
              <BingoCell
                key={`${rowIdx}-${colIdx}`}
                value={cell}
                onClick={() => handleCellClick(rowIdx, colIdx)}
                disabled={gameStarted && !isTurn && availableNumbers.length === 0}
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
            🎮 {waiting ? "Waiting for Opponent..." : "Start Game"}
          </button>
        )}

        {(winner || gameStarted) && !isTour && (
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
