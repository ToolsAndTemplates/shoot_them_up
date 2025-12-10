"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const GameComponent = dynamic(() => import("@/components/Game"), {
  ssr: false,
});

export default function Home() {
  const [gameStarted, setGameStarted] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  if (gameStarted) {
    return <GameComponent onExit={() => setGameStarted(false)} />;
  }

  return (
    <main className="min-h-screen game-bg flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated stars background */}
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: Math.random() * 0.7 + 0.3,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-2xl w-full">
        <div className="text-center space-y-8">
          {/* Title */}
          <div className="space-y-4">
            <h1 className="text-7xl md:text-8xl font-bold bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink bg-clip-text text-transparent animate-pulse-slow">
              SPACE SHOOTER
            </h1>
            <p className="text-xl md:text-2xl text-neon-green neon-glow">
              Defend the galaxy from alien invaders!
            </p>
          </div>

          {/* Menu */}
          {!showInstructions ? (
            <div className="space-y-4 pt-8">
              <button
                onClick={() => setGameStarted(true)}
                className="btn-primary w-full max-w-md mx-auto block text-xl"
              >
                START GAME
              </button>
              <button
                onClick={() => setShowInstructions(true)}
                className="btn-secondary w-full max-w-md mx-auto block"
              >
                HOW TO PLAY
              </button>
              <div className="pt-4 text-sm text-gray-400">
                <p>Best played in fullscreen mode</p>
              </div>
            </div>
          ) : (
            <div className="bg-black/60 backdrop-blur-sm p-8 rounded-lg border-2 border-neon-blue space-y-6">
              <h2 className="text-3xl font-bold text-neon-blue neon-glow">
                Instructions
              </h2>
              <div className="text-left space-y-4 text-lg">
                <div className="space-y-2">
                  <h3 className="text-neon-pink font-semibold">Controls:</h3>
                  <ul className="space-y-1 text-gray-300 list-disc list-inside">
                    <li>
                      <strong>Arrow Keys</strong> or <strong>WASD</strong> - Move ship
                    </li>
                    <li>
                      <strong>Shooting</strong> - Automatic rapid fire (no button needed!)
                    </li>
                    <li>
                      <strong>Mobile</strong> - Touch and drag to move
                    </li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h3 className="text-neon-pink font-semibold">Powerups:</h3>
                  <ul className="space-y-1 text-gray-300 list-disc list-inside">
                    <li>
                      <span className="text-neon-blue">Blue Shield</span> - Extra protection
                    </li>
                    <li>
                      <span className="text-neon-green">Green Speed</span> - Faster movement
                    </li>
                    <li>
                      <span className="text-neon-pink">Pink Weapon</span> - Ultra rapid fire (2x faster!)
                    </li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h3 className="text-neon-pink font-semibold">Objective:</h3>
                  <p className="text-gray-300">
                    Survive enemy waves, collect powerups, and achieve the highest score!
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowInstructions(false)}
                className="btn-secondary w-full"
              >
                BACK
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
