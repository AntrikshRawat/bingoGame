import React, { useEffect, useState } from 'react'
import { GiShare } from 'react-icons/gi';
import { useParams } from 'react-router-dom';

export default function Tournament() {
  const [tId, setTId] = useState('');
  const { roomCode } = useParams();
  const[index,setIndex] = useState([0,1,2,3]);
  const[players,setPlayers] = useState(["player1", "player2", "player3", "player4"]);
  useEffect(() => {
    setTId(roomCode);
    const name = localStorage.getItem('userName');
    setPlayers((prev)=>{
      prev[0] = name?name:"Player";
      return prev;
    });
  }, [roomCode,players]);
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
  const shuffleIndices = () => {
    let shuffled = [...index];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setIndex(shuffled);
  };
  return (
    <div className="flex flex-wrap justify-center items-center h-screen bg-gradient-to-br from-gray-800 via-gray-700 to-gray-950">
       <h1 className='font-serif text-3xl text-pretty p-2'>Just wait for One more day.......</h1>
      {/* <div className="bg-gray-800 p-6 rounded-2xl shadow-lg w-96 text-center">
      <button className='bg-slate-600 hover:bg-slate-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all mb-4' onClick={shuffleIndices}>Shuffle Players</button>
        <h2 className="flex justify-center content-center text-xl font-bold text-gray-300 mb-4">Tournament ID: {tId}
          <GiShare className="m-1 hover:cursor-pointer" onClick={shareRoom} />
        </h2>
        <div>
          <h4 className="text-lg font-semibold text-gray-400">List of Players:</h4>
          <div className="mt-2 mb-4 space-y-4">
            <div className="bg-gray-700 p-3 rounded-md shadow-sm text-gray-300">
              <h5 className="font-semibold mb-2">Match 1</h5>
              <ul className="space-y-2">
                <li className="bg-gray-600 p-2 rounded-md">{players[index[0]]}</li>
                <li className="bg-gray-600 p-2 rounded-md">{players[index[1]]}</li>
              </ul>
            </div>
            <div className="bg-gray-700 p-3 rounded-md shadow-sm text-gray-300">
              <h5 className="font-semibold mb-2">Match 2</h5>
              <ul className="space-y-2">
                <li className="bg-gray-600 p-2 rounded-md">{players[index[2]]}</li>
                <li className="bg-gray-600 p-2 rounded-md">{players[index[3]]}</li>
              </ul>
            </div>
          </div>
          <button className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all" disabled={players.length === 4}>
            Start Tournament
          </button>
        </div>
      </div> */}
    </div>
  );
}
