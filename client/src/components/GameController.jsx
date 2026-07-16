/**
 * GameController.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Central game orchestrator. Manages the entire game state machine:
 *
 *   loading → playing → loading_result → finished
 *
 * Child components receive only the current question and an onSelect callback;
 * they know nothing about scores, totals, or what comes next.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect } from 'react';

import SwipeGame    from './SwipeGame';
import MixologyGame from './MixologyGame';
import TarotGame    from './TarotGame';
import DrinkResult  from './DrinkResult';
import LoadingScreen from './LoadingScreen';
import StoryScrollContainer from './StoryScrollContainer';

// ─── Map question.type → React component ──────────────────────────────────────
const COMPONENT_MAP = {
  swipe:    SwipeGame,
  drag_drop: MixologyGame,
  tarot:    TarotGame,
};

// ─── Human-readable labels per question type ──────────────────────────────────
const TYPE_META = {
  swipe:    { label: 'Swipe Your Truth',  icon: '👆' },
  drag_drop: { label: 'Mix & Rank',        icon: '🧪' },
  tarot:    { label: 'Draw a Card',        icon: '🃏' },
};

// ─── Game Status constants ────────────────────────────────────────────────────
const STATUS = {
  LOADING:        'loading',
  PLAYING:        'playing',
  LOADING_RESULT: 'loading_result',
  FINISHED:       'finished',
};

export default function GameController() {
  // ── Core game state ─────────────────────────────────────────────────────────
  const [questions,      setQuestions]      = useState([]);
  const [userSelections, setUserSelections] = useState([]);   // array of selected option IDs
  const [gameStatus,     setGameStatus]     = useState(STATUS.LOADING);
  const [result,         setResult]         = useState(null);
  const [error,          setError]          = useState(null);
  const [preloadProgress, setPreloadProgress] = useState(0);
  const [preloadMsg,     setPreloadMsg]     = useState('Connecting to Bangkok Speakeasy Database…');

  // ── Fetch game flow on mount ─────────────────────────────────────────────────
  useEffect(() => {
    fetchGameFlow();
  }, []);

  async function fetchGameFlow() {
    setError(null);
    setGameStatus(STATUS.LOADING);
    setPreloadProgress(15);
    setPreloadMsg('Connecting to Bangkok Speakeasy Database…');
    try {
      const res = await fetch('/api/game-flow');
      if (!res.ok) throw new Error(`Server responded ${res.status}. Is the backend running on port 3000?`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Unknown error from server.');
      setQuestions(data.data);

      // Collect all image URLs from stages and options
      const urls = new Set([
        '/images/stages/morning-bangkok.png',
        '/images/stages/sukhumvit-bts.png',
        '/images/stages/nana-speakeasy.png',
        '/images/drinks/sparkling-water.png',
        '/images/drinks/tropical-smoothie.png',
        '/images/drinks/dark-espresso.png',
      ]);

      if (Array.isArray(data.data)) {
        data.data.forEach((q) => {
          if (q.background_image_url) urls.add(q.background_image_url);
          if (Array.isArray(q.options)) {
            q.options.forEach((opt) => {
              if (opt.image_url) urls.add(opt.image_url);
            });
          }
        });
      }

      const imageUrls = Array.from(urls).filter(Boolean);
      let loadedCount = 0;
      const totalImages = imageUrls.length;

      setPreloadMsg(`Preloading High-Res Cyberpunk Graphics (0/${totalImages})…`);
      setPreloadProgress(30);

      // Preload images into browser cache with safety timeout
      await Promise.all(
        imageUrls.map((url) => {
          return new Promise((resolve) => {
            const img = new Image();
            let settled = false;

            const done = () => {
              if (settled) return;
              settled = true;
              loadedCount++;
              setPreloadProgress(30 + Math.round((loadedCount / totalImages) * 70));
              setPreloadMsg(`Preloading High-Res Cyberpunk Graphics (${loadedCount}/${totalImages})…`);
              resolve();
            };

            const timer = setTimeout(done, 3000); // 3s max per image to prevent hanging

            img.onload = () => {
              clearTimeout(timer);
              done();
            };
            img.onerror = () => {
              clearTimeout(timer);
              done();
            };
            img.src = url;
          });
        })
      );

      setPreloadProgress(100);
      setPreloadMsg('All assets loaded! Starting journey…');
      setTimeout(() => {
        setGameStatus(STATUS.PLAYING);
      }, 350);
    } catch (err) {
      setError(err.message);
    }
  }

  // ── Submit all selections → calculate result ─────────────────────────────────
  async function submitResult(finalSelections) {
    setGameStatus(STATUS.LOADING_RESULT);
    try {
      const flatIds = Array.isArray(finalSelections) ? finalSelections.flat().filter(id => id !== null && id !== undefined) : [];
      const res = await fetch('/api/calculate-result', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ selectedOptionIds: flatIds }),
      });
      if (!res.ok) throw new Error(`Calculation failed (${res.status}).`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Could not calculate result.');
      setResult(data);
      setGameStatus(STATUS.FINISHED);
    } catch (err) {
      setError(err.message);
    }
  }

  // ── Restart the game ──────────────────────────────────────────────────────────
  function handleRestart() {
    setUserSelections([]);
    setResult(null);
    setGameStatus(STATUS.PLAYING);
  }

  // ─── Render: Error state ─────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="glass rounded-3xl p-10 text-center max-w-md w-full animate-fade-in">
          <div className="text-6xl mb-5">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-3">Something went wrong</h2>
          <p className="text-white/50 text-sm leading-relaxed mb-8">{error}</p>
          <button onClick={fetchGameFlow} className="btn-primary w-full">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ─── Render: Initial loading ──────────────────────────────────────────────────
  if (gameStatus === STATUS.LOADING) {
    return <LoadingScreen message={preloadMsg || "Preparing your adventure…"} progressPercent={preloadProgress} />;
  }

  // ─── Render: Calculating result ───────────────────────────────────────────────
  if (gameStatus === STATUS.LOADING_RESULT) {
    return <LoadingScreen message="The spirits are reading your soul…" mystical />;
  }

  // ─── Render: Finished — show drink result ────────────────────────────────────
  if (gameStatus === STATUS.FINISHED) {
    return <DrinkResult result={result} onRestart={handleRestart} />;
  }

  // ─── Render: Playing (Scrollytelling 3D Parallax Flow) ───────────────────────
  return (
    <main className="min-h-screen w-full bg-[#1a1a1a]">
      <StoryScrollContainer
        questions={questions}
        userSelections={userSelections}
        onSelectOption={(idx, optionId) => {
          const newSelections = [...userSelections];
          newSelections[idx] = optionId;
          setUserSelections(newSelections);
        }}
        onCompleteAll={(finalSelections) => {
          submitResult(finalSelections);
        }}
      />
    </main>
  );
}
