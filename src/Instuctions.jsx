import { FaGamepad } from "react-icons/fa";

const Instructions = () => {
  const scrollToBottom = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  return (
    <footer className="w-full bg-gray-900 text-white py-10 px-6 relative">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold flex items-center gap-3 mb-6 text-left">
          <FaGamepad className="text-blue-400 text-4xl" /> How to Play Bingo
        </h2>
        <div className="w-full max-w-4xl border-l-4 border-blue-400 pl-6 py-4 bg-gray-800 text-gray-300 rounded-lg shadow-lg">
          <ul className="list-disc pl-6 space-y-3 text-lg text-left">
            <li>Each player gets a 5x5 Bingo card with random numbers.</li>
            <li>The center space is a free spot.</li>
            <li>Numbers are drawn randomly, and players mark them if present on their cards.</li>
            <li>A "Bingo" is achieved when a player completes a full row, column, or diagonal.</li>
            <li>To win the game, a player must complete five Bingos.</li>
            <li>In Tournament mode, four players compete in three rounds.</li>
            <li>Two initial matches occur simultaneously with two players each.</li>
            <li>The winners of the initial matches face off in the final round.</li>
            <li>The final winner is declared the Bingo Champion!</li>
          </ul>
        </div>
      </div>
      <button 
        onClick={scrollToBottom} 
        className="fixed bottom-4 right-6 bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-full shadow-lg text-lg z-50">
        Game Instructions
      </button>
    </footer>
  );
};

export default Instructions;