import { useEffect, useState } from "react";
import { FaGamepad } from "react-icons/fa";

const messages = ["Game Instructions","Any Suggestions?"];
const Instructions = () => {
  const[message, setMessage] = useState(messages[0]);
  const scrollToBottom = () => {
    if(message === messages[0]) {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }
    else{
      window.scrollTo({ 
        top: document.documentElement.scrollHeight - window.innerHeight - 500, 
        behavior: "smooth" 
    });
    }
  };

  useEffect(()=>{
    setTimeout(()=>{
      if(message === messages[0]) {
        setMessage(messages[1]);
      }
      else{
        setMessage(messages[0]);
      }
    },2000)
    return () => {
      clearTimeout();
    }
  },[message])
  return (
    <footer className="w-full bg-gray-900 text-white pb-10 px-6 relative">
      <div className="max-w-5xl mx-auto flex flex-wrap justify-center items-center">
        <h2 className="text-3xl font-bold flex items-center gap-3 my-6 text-left">
          <FaGamepad className="text-blue-400 text-4xl" /> How to Play Bingo
        </h2>
        <div className="w-full max-w-4xl border-l-4 border-blue-400 px-6 py-4 bg-gray-800 text-gray-300 rounded-lg shadow-lg">
          <ul className="list-disc pl-6 space-y-3 text-lg text-left">
          <li>Each player receives a 5x5 Bingo card filled with random numbers.</li>
  <li>Numbers are drawn randomly or players can click on a cell and the numbers will start spaning, and players mark them if present on their grid.</li>
  <li>A "Bingo" is achieved by completing a full row, column, or diagonal.</li>
  <li>The first player to complete five Bingos wins the match.</li>

  <li className="font-semibold mt-4">In 2-Player Mode:</li>
  <ul className="list-disc pl-5 space-y-2">
    <li>Two players join a room and play a standard Bingo match.</li>
    <li>The first player to complete five Bingos wins.</li>
  </ul>

  <li className="font-semibold mt-4">In Tournament Mode (4 Players):</li>
  <ul className="list-disc pl-5 space-y-2">
    <li>Four players join a tournament room.</li>
    <li>The player who creates the room becomes the <strong>host</strong> and can shuffle players and start the tournament.</li>
    <li>The tournament begins with two <strong>initial 1v1 matches</strong> running in parallel.</li>
    <li>After both matches end, <strong>winners and losers</strong> are displayed.</li>
    <li>Winners face off to decide <strong>1st and 2nd place</strong>.</li>
    <li>Losers compete to determine <strong>3rd place</strong>.</li>
    <li>Final rankings are shown at the end of the tournament.</li>
  </ul>
          </ul>
        </div>
      </div>
      <button 
        onClick={scrollToBottom} 
        className="fixed bottom-4 right-6 bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-full shadow-lg text-lg z-50">
       {message}
      </button>
    </footer>
  );
};

export default Instructions;