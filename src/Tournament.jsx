import React, { useEffect, useState } from 'react'
import { GiShare } from 'react-icons/gi';
import { io } from "socket.io-client";
import { useNavigate, useParams } from 'react-router-dom';

const url = import.meta.env.VITE_BACKEND_URL;
const socket = io(url);
export default function Tournament() {
  const { roomCode } = useParams();
  const navigator = useNavigate();
  const[index,setIndex] = useState([0,1,2,3]);
  const[players,setPlayers] = useState(['']);
  const[isHost,setIsHost] = useState(false);
  useEffect(() => {
    let name = localStorage.getItem('userName');
    // Check if this client was previously the host
    const wasHost = localStorage.getItem(`host_${roomCode}`) === socket.id;
    
    socket.emit("joinTournament", roomCode, name, wasHost, (message)=>{
      if(message) {
        alert(message);
        setTimeout(() => {
          navigator('/');
        }, 100);
      }
    })
    socket.on('playersName',(players)=>{
      setPlayers([...players]);
    });
    socket.on('host',(hostData)=>{
      setIsHost(socket.id===hostData.socketId);
      if(socket.id===hostData.socketId) {
        localStorage.setItem(`host_${roomCode}`, socket.id);
      } else {
        localStorage.removeItem(`host_${roomCode}`);
      }
    })
    socket.on("changed",(indices)=>{
      setIndex([...indices]);
    })
    return ()=>{
      // Only remove host storage if actually leaving, not on reload
      if (!document.hidden) {
        localStorage.removeItem(`host_${roomCode}`);
      }
      socket.emit("leaveTour",roomCode);
      socket.off('playersName');
      socket.off('host');
      socket.off('changed');
    }
  }, [roomCode, navigator]);
  const shareRoom = async () => {
    if (window.navigator.share) {
      try {
        await window.navigator.share({
          title: 'Bingo Game',
          text: 'Join The Bingo Tournament and play with us',
          url: `https://bingo-f.vercel.app/tournament/${roomCode}`,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      alert('Sharing is not supported in your browser.');
    }
  };
  const startTournament = ()=>{
    if(players.length<4) return;
    socket.emit("startTournament",roomCode,index);
  }
  const shuffleIndices = () => {
    let shuffled = [...index];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setIndex(shuffled);
    socket.emit("suffled",roomCode,shuffled);
  };
  const getName=(i)=> {
    const player =  players[index[i]];
    if(player && player.length>0)
      return player;
    else
      return "Waiting..."
  }
  return (
    <div className="flex flex-wrap justify-center items-center h-screen bg-gradient-to-br from-gray-800 via-gray-700 to-gray-950">
       <h1 className='font-serif text-3xl text-pretty p-2 text-white'>Coming Soon...</h1>
      {/* <div className="bg-gray-800 p-6 rounded-2xl shadow-lg w-96 text-center">
{ isHost && <button className='bg-slate-600 hover:bg-slate-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all mb-4' onClick={shuffleIndices}>Shuffle Players</button>}
        <h2 className="flex justify-center content-center text-xl font-bold text-gray-300 mb-4">Tournament ID: {roomCode}
          <GiShare className="m-1 hover:cursor-pointer" onClick={shareRoom} />
        </h2>
        <div>
          <h4 className="text-lg font-semibold text-gray-400">List of Players:</h4>
          <div className="mt-2 mb-4 space-y-4">
            <div className="bg-gray-700 p-3 rounded-md shadow-sm text-gray-300">
              <h5 className="font-semibold mb-2">Match 1</h5>
              <ul className="space-y-2">
                <li className="bg-gray-600 p-2 rounded-md">{getName(0)}</li>
                <li className="bg-gray-600 p-2 rounded-md">{getName(1)}</li>
              </ul>
            </div>
            <div className="bg-gray-700 p-3 rounded-md shadow-sm text-gray-300">
              <h5 className="font-semibold mb-2">Match 2</h5>
              <ul className="space-y-2">
                <li className="bg-gray-600 p-2 rounded-md">{getName(2)}</li>
                <li className="bg-gray-600 p-2 rounded-md">{getName(3)}</li>
              </ul>
            </div>
          </div>
  {isHost &&  <button className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all" disabled={players.length === 4}
  onClick={startTournament}>
            Start Tournament
          </button>}
        </div>
      </div> */}
    </div>
  );
}
