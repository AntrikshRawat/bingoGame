import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const PlayerSidebar = ({socket}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [players,setPlayers] = useState([]);
  const[Socket,setSocket] = useState(socket);
  useEffect(()=>{
    setSocket(socket);
  },[socket]);
  useEffect(()=>{
    const name = localStorage.getItem('userName');
    setPlayers([name?name:'Player']);
    Socket.on('playersName', (names) => {
      const updatedNames = names.map(name => name.trim().length === 0 ? "Player" : name);
      setPlayers([...updatedNames]);
    });
  },[Socket])
  return (
    <div className={`fixed top-0 right-0 h-full flex flex-col z-50 ${isOpen?'':'md:w-fit w-10'}`}>
      {/* Mobile Toggle Button */}
      <button
        className={`md:hidden p-3 text-white rounded-l-lg mt-4 shadow-md transition-all duration-300 absolute top-4 z-50 
        ${isOpen ? "w-12 bg-gray-600 hover:bg-gray-700 right-72" : "w-10 bg-gray-500 hover:bg-gray-600 right-0"}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`bg-gray-900 text-white w-72 h-full p-5 shadow-2xl flex flex-col gap-4 transform transition-transform duration-300 ease-in-out 
        ${isOpen ? "translate-x-0" : "translate-x-full -z-40"} md:translate-x-0 md:w-80 relative z-40`}
      >
        <h2 className="text-2xl font-bold mb-4 text-center border-b pb-2">Players</h2>
        <ul className="space-y-3 flex-1 overflow-y-auto">
          {players.length > 0 ? (
            players.map((player, index) => (
              <li
                key={index}
                className="bg-gray-800 p-4 rounded-lg shadow-md hover:bg-gray-700 transition text-lg text-center"
              >
                {player}
              </li>
            ))
          ) : (
            <p className="text-gray-400 text-center">No players joined yet.</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default PlayerSidebar;