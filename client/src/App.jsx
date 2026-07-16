import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import GameController from './components/GameController';
import AdminPanel from './components/AdminPanel';
import VintageOverlay from './components/VintageOverlay';

function QuickNavToggle() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="fixed top-3 right-3 z-[100]">
      <Link
        to={isAdmin ? '/' : '/admin'}
        className="px-3 py-1.5 bg-[#1a1a1a]/85 hover:bg-[#1a1a1a] text-[#00f5ff] font-['Bangers'] tracking-wider text-sm border-2 border-[#00f5ff] rounded-lg shadow-[0_0_12px_rgba(0,245,255,0.4)] backdrop-blur transition-all flex items-center gap-1.5"
      >
        <span>{isAdmin ? '🎮 BACK TO GAME' : '⚙️ CMS ADMIN'}</span>
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="relative min-h-screen">
        <VintageOverlay />
        <QuickNavToggle />
        <Routes>
          <Route path="/admin/*" element={<AdminPanel />} />
          <Route path="/*" element={<GameController />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
