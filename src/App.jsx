import React from "react";
import BingoGame from "./BingoGame";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CreateAndJoin from "./CreateAndJoin";
import Tournament from "./Tournament";

function App() {
  return (
    <Router>
      <div className="App min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
        <Routes>
          {/* Home Page with Create & Join Logic */}
          <Route path="/" element={<CreateAndJoin />} />

          {/* Game Room with dynamic roomCode */}
          <Route path="/room/:roomCode" element={<BingoGame />} />
          <Route path="/tournament/:roomCode" element={<Tournament />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
