import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import GameController from './components/GameController';
import AdminPanel from './components/AdminPanel';
import VintageOverlay from './components/VintageOverlay';
import { LanguageProvider } from './context/LanguageContext';
import Header from './components/Header';
import Footer from './components/Footer';

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <div className="relative min-h-screen bg-[#041410] flex flex-col justify-between overflow-x-hidden">
          <VintageOverlay />
          
          {/* Locked Fixed Luxury Hotel Header */}
          <Header />

          {/* Main Content Area with padding so it never gets hidden by fixed header/footer */}
          <main className="flex-1 pt-14 sm:pt-16 pb-10 w-full flex flex-col items-center">
            <Routes>
              <Route path="/admin/*" element={<AdminPanel />} />
              <Route path="/*" element={<GameController />} />
            </Routes>
          </main>

          {/* Locked Fixed Luxury Footer */}
          <Footer />
        </div>
      </BrowserRouter>
    </LanguageProvider>
  );
}

