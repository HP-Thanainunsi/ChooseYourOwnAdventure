import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import GameController from './components/GameController';
import AdminPanel from './components/AdminPanel';
import VintageOverlay from './components/VintageOverlay';

export default function App() {
  return (
    <BrowserRouter>
      <div className="relative min-h-screen">
        <VintageOverlay />
        <Routes>
          <Route path="/admin/*" element={<AdminPanel />} />
          <Route path="/*" element={<GameController />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
