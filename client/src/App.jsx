import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import GameController from './components/GameController';
import AdminPanel from './components/AdminPanel';
import VintageOverlay from './components/VintageOverlay';
import { LanguageProvider } from './context/LanguageContext';
import Header from './components/Header';
import Footer from './components/Footer';

function AppRouter() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="relative min-h-screen bg-[#041410] flex flex-col justify-between overflow-x-hidden">
      <VintageOverlay />
      
      {/* Mount Header inside Admin only; GameController handles Header inside Playing / Finished states */}
      {isAdmin && <Header />}

      {/* Main Content Area */}
      <main className={`flex-1 w-full flex flex-col items-center ${isAdmin ? 'pt-14 sm:pt-16 pb-10' : 'pb-10'}`}>
        <Routes>
          <Route path="/admin/*" element={<AdminPanel />} />
          <Route path="/*" element={<GameController />} />
        </Routes>
      </main>

      {/* Locked Fixed Luxury Footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </LanguageProvider>
  );
}

