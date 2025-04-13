import React, { useEffect, useState } from 'react'
import { GiShare } from 'react-icons/gi';
import { LuLoaderPinwheel } from "react-icons/lu";
import { useNavigate, useParams } from 'react-router-dom';

import socket from "./socket";
import BackButton from './BackButton';
import Alert from "./Alert";
const InsideDiv = ({index,player})=>{
  const positions = [
    { label: "🥇 First", bg: "bg-[#FFD700]", text: "text-black" },
    { label: "🥈 Second", bg: "bg-gray-700", text: "text-gray-200" },
    { label: "🥉 Third", bg: "bg-orange-700", text: "text-white" },
  ];
  return (
<div
            className={`flex items-center justify-between py-5 p-4 rounded-xl ${positions[index].bg} shadow-md`}
          >
            <span className={`font-semibold mr-3 text-xl ${positions[index].text}`}>
              {positions[index].label}
            </span>
            <span className={`${positions[index].text} font-medium text-xl flex justify-center items-center`}>{`${player}`.toUpperCase()}{player==='Waiting...'?<LuLoaderPinwheel className='animate-spin'/>:''}</span>
          </div>
  )
}
const FinalRound = ({socket}) => {
  const[winners,setWinners] = useState([]);
  const[Socket,setSocket] = useState(socket);
  const[end,isEnd] = useState(false);
  useEffect(()=>{
    setSocket(socket);
  },[socket]);
  useEffect(()=>{
    Socket.on("finalResult",(result)=>{
      isEnd(result.status);
      if(result.status) {
      setWinners([...result.result]);
      }
    })
  })
  return (
    <div className="w-lg mx-4 p-6 rounded-2xl shadow-lg bg-gray-900 text-white">
      <h2 className="text-2xl font-bold text-center mb-6 text-purple-400">🏆 Final Result</h2>
 { end && <div className="space-y-4">
        <InsideDiv key={0} index={0} player={winners[0]?winners[0]:"Waiting..."}/>
        <InsideDiv key={1} index={1} player={winners[1]?winners[1]:"Waiting..."}/>
        <InsideDiv key={2} index={2} player={winners[2]?winners[2]:"Waiting..."}/>
      </div>}
{!end && <h2 className='text-2xl font-bold text-center mb-6 text-purple-400 flex justify-center items-center'>Waiting for Results....{<LuLoaderPinwheel className='animate-spin'/>}</h2>}
    </div>
  );
};

export default function Tournament() {
  const { roomCode } = useParams();
  const navigator = useNavigate();
  const[index,setIndex] = useState([0,1,2,3]);
  const[result,setResult] = useState({winner:[''],looser:['']});
  const[players,setPlayers] = useState(['']);
  const[isHost,setIsHost] = useState(false);
  const[round,setRound] = useState(0);
    const [alertMsg, setAlertMsg] = useState({
      message: '',
      type: ''
    });
  const[Socket,setSocket] = useState(socket);
  const [message,setMessage] = useState(["Match1","Match2"]);
  const[isbackTrigger,setIsBackTrigger] = useState(false);

useEffect(()=>{
setSocket(socket);
const round = localStorage.getItem("round");
if(round === null || round === undefined) return;
  setRound(parseInt(round));
},[Socket,round])
// Initial join and setup
useEffect(() => {
  let name = localStorage.getItem('userName');
  if(!name || name === '') {
    name = `Player${(Date.now() * Math.random()).toString().substring(0, 4)}`;
    localStorage.setItem('userName',name);
  }
  const wasHost = localStorage.getItem(`host_${roomCode}`);
  const previousTournamet = localStorage.getItem(`${roomCode}`);
  if (!previousTournamet) {
    Socket.emit("joinTournament", roomCode, name, wasHost, (message) => {
      if (message) {
        alert(message);
        setTimeout(() => navigator('/'), 100);
      }
      localStorage.setItem("round",0);
    });
  }
}, [roomCode,Socket]);


// Handle Round 1
useEffect(() => {
  if (round === 1) {
    setMessage(["Winners of First Round", "Loosers of First Round"]);
    Socket.emit('sendWinners', roomCode);
    Socket.emit('sendLoosers', roomCode);
  }
},[roomCode,Socket,round]);

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

useEffect(()=>{
Socket.on('host',(hostData)=>{
  setIsHost(Socket.id===hostData.socketId);
      if(Socket.id===hostData.socketId) {
        localStorage.setItem(`host_${roomCode}`, true);
      } else {
        localStorage.removeItem(`host_${roomCode}`);
      }
})
Socket.on("playersName",(allPlayers)=>{
  setPlayers([...allPlayers]);
})

Socket.on("changed",(indices)=>{
      setIndex([...indices]);
})

Socket.on("round1",(matchCode)=>{
      localStorage.setItem(`${roomCode}`,true);
      setIsBackTrigger(true);
      navigator(`/room/${matchCode.matchRoom}`);
})

Socket.on("round2",(matchCode)=>{
      setIsBackTrigger(true);
      navigator(`/room/${matchCode.matchRoom}`);
});

Socket.on("loosers",(loosers)=>{
  if (loosers && loosers.length > 0)
  setResult(prev => ({ ...prev, looser: loosers })
);

Socket.on("winners",(winners)=>{
  if(winners && winners.length>0)
  setResult(prev => ({ ...prev, winner: winners }));
})

})
    return ()=>{
      // Only remove host storage if actually leaving, not on reload
      if (!document.hidden) {
        localStorage.removeItem(`host_${roomCode}`);
      }
      Socket.off('playersName');
      Socket.off('host'); 
      Socket.off('changed');
    }
  }, [roomCode,Socket,round]);

  useEffect(()=>{
    if(!isbackTrigger) {
      window.onpopstate=()=>{
        Socket.emit("leaveTour", roomCode);
        localStorage.removeItem('round');
        const name = localStorage.getItem("userName");
        localStorage.clear();
        localStorage.setItem('userName',name);
      }
    }
  },[isbackTrigger,Socket,roomCode]);
  
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
      setAlertMsg({
        message:'Sharing is not supported in your browser.',
        type:'info'
      })
    }
  };
  const startTournament = ()=>{
    if(players.length<4) 
      {
        setAlertMsg({
          message:"Minimum 4 Players are required.",
          type:"warning"
        })
        return;
      }
    localStorage.setItem(`${roomCode}`,true);
    Socket.emit("startTournament",roomCode,index);
  }
  const shuffleIndices = () => {
    let shuffled = [...index];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setIndex(shuffled);
    Socket.emit("suffled",roomCode,shuffled);
  };
  const getName=(i)=> {
    if(round===1){
      if(i<2) {
        return result.winner[i]? result.winner[i] : "Waiting...";
      }else{
        return result.looser[i-2]?result.looser[i-2] : "Waiting...";
      }
}else{
  const player = players[index[i]];
  if(player && player.length>0)
    return player;
  else
    return 'Waiting...';
}
  }
  return (
    <div className="flex flex-wrap justify-center items-center min-h-screen bg-gradient-to-br from-gray-800 via-gray-700 to-gray-950 py-4">
    <Alert key={Date.now()*Math.random()} message={alertMsg.message} type={alertMsg.type}/>
     <BackButton/>
     {round ===2 && <FinalRound socket = {Socket}/>}
      { round !== 2 && <div className="bg-gray-800 p-6 rounded-2xl shadow-lg w-96 text-center">
{ isHost && <button className='bg-slate-600 hover:bg-slate-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all mb-4' onClick={shuffleIndices}>Shuffle Players</button>}
        <h2 className="flex justify-center content-center text-xl font-bold text-gray-300 mb-4">Tournament ID: {roomCode}
          <GiShare className="m-1 hover:cursor-pointer" onClick={shareRoom} />
        </h2>
        <h2 className="flex justify-center content-center text-lg font-bold text-gray-300 mb-4">Name: {localStorage.getItem('userName')}</h2>
        <div>
          <h4 className="text-lg font-semibold text-gray-400">List of Players:</h4>
          <div className="mt-2 mb-4 space-y-4">
            <div className="bg-gray-700 p-3 rounded-md shadow-sm text-gray-300">
              <h5 className="font-semibold mb-2">{message[0]}</h5>
              <ul className="space-y-2">
                <li className="bg-gray-600 p-2 rounded-md flex justify-center items-center">{getName(0)}{getName(0)==='Waiting...'?<LuLoaderPinwheel className='animate-spin'/>:''}</li>
                <li className="bg-gray-600 p-2 rounded-md flex justify-center items-center">{getName(1)}{getName(1)==='Waiting...'?<LuLoaderPinwheel
                className='animate-spin'/>:''}</li>
              </ul>
            </div>
            <div className="bg-gray-700 p-3 rounded-md shadow-sm text-gray-300">
              <h5 className="font-semibold mb-2">{message[1]}</h5>
              <ul className="space-y-2">
              <li className="bg-gray-600 p-2 rounded-md flex justify-center items-center">{getName(2)}{getName(2)==='Waiting...'?<LuLoaderPinwheel className='animate-spin'/>:''}</li>
              <li className="bg-gray-600 p-2 rounded-md flex justify-center items-center">{getName(3)}{getName(3)==='Waiting...'?<LuLoaderPinwheel className='animate-spin'/>:''}</li>
              </ul>
            </div>
          </div>
  {isHost &&  <button className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all"
  onClick={startTournament}>
            Start Tournament
          </button>}
        </div>
      </div>}
    </div>
  );
}
