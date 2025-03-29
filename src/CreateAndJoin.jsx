import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';


const url = import.meta.env.VITE_BACKEND_URL;
const socket = io(url)

const CreateAndJoin = () => {
  const [joinCode, setJoinCode] = useState('');
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const[userName , setUserName] = useState('');
  const[input,setInput] = useState('');
  const navigate = useNavigate();

  // Function to generate a random 8-character alphanumeric code
  const generateRoomCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  };

  // Handle Create Room button click
  const handleCreateRoom = (size) => {
    const roomCode = generateRoomCode();
    if(size === 2)
    navigate(`/room/${roomCode}`);
    else
    navigate(`/tournament/${roomCode}`);
  };

  // Handle Join Room button click
  const handleJoinRoomClick = () => {
    setShowJoinInput(true);
  };

  // Handle joining with a code
  const handleJoinWithCode = () => {
    // Ensure joinCode is an 8-character code
    if (joinCode.trim().length !== 8) {
      setErrorMessage('Invalid room code. Please enter a valid 8-character code.');
      return;
    }

    socket.emit("checkRoom",joinCode.trim(),(msg)=>{
      if(!msg) {
        socket.emit("checkTour",joinCode.trim(),(message)=>{
          if(!message.status){
            setErrorMessage(message.message);
            return;
          }
          setErrorMessage("");
          navigate(`tournament/${joinCode.trim()}`);
        })
      }
      else if(!msg.status) {
        setErrorMessage(msg.message);
      } else{
        navigate(`room/${joinCode.trim()}`);
      }
    })
  };
  function getName() {
    let name = localStorage.getItem('userName');
    if(name !== '' && name) {
      setUserName(name);
    }
  }
  useEffect(()=>{
    getName();
  },[userName]);
  return (
    <div className="flex flex-col items-center gap-4 min-h-screen justify-center">
     {userName && <h2 className='text-white text-md font-bold -mb-5'>Welcome {userName} to</h2>}
      <h1 className="text-white text-3xl font-bold mb-3">🎉 Bingo Game 🎲</h1>

<span>
      <input
            type="text"
            placeholder="Enter Your Name"
            value={input}
            onChange={(e)=>{setInput(e.target.value)}}
            className="w-48 h-10 px-4 rounded-l-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
          <button className='w-16 h-10 bg-gradient-to-r from-emerald-700 to-emerald-500 text-white rounded-r-lg hover:from-emerald-600 hover:to-emerald-800 transition-all shadow-md'
          disabled = {input.length===0}
          onClick={()=>{
            localStorage.setItem('userName',`${input}`);
            getName();
          }}
          >Save</button>
</span>

      {/* Conditionally Render the Create Room button */}
      {!showJoinInput && (
        <button
        onClick={()=>{handleCreateRoom(2)}}
          className="w-48 h-12 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg hover:from-blue-600 hover:to-blue-800 hover:brightness-125 hover:scale-105 transition-all shadow-md"
        >
          Create Room
        </button>
      )}
      {!showJoinInput && (
        <button
          onClick={()=>{handleCreateRoom(4)}} 
          className="w-48 h-12 bg-gradient-to-br from-[#00a9a5] via-[#0b5351] to-[#092327] text-white rounded-lg transition-all shadow-md hover:brightness-125 hover:scale-105"
        >
          Create Tournament
        </button>
      )}

      {/* Show Join Room Input when showJoinInput is true */}
      {showJoinInput ? (
        <div className="flex flex-col items-center gap-2">
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            placeholder="Enter Room/Tournament Code"
            className="bg-white w-60 h-12 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleJoinWithCode}
            className="w-48 h-12 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-lg hover:from-green-600 hover:to-green-800 transition-all shadow-md"
          >
            Join
          </button>
          {errorMessage && (
            <p className="text-red-600 font-bold mt-2">{errorMessage}</p>
          )}
        </div>
      ) : (
        <button
          onClick={handleJoinRoomClick}
          className="w-48 h-12 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-lg hover:from-green-600 hover:to-green-800 hover:brightness-125 hover:scale-105 transition-all shadow-md"
        >
          Join Room/Tournament
        </button>
      )}
    </div>
  );
};

export default CreateAndJoin;
