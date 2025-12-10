"use client";

import { useEffect, useRef } from "react";
import * as Phaser from "phaser";
import GameScene from "./GameScene";

interface GameProps {
  onExit: () => void;
}

export default function Game({ onExit }: GameProps) {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      parent: "game-container",
      backgroundColor: "#0a0a0f",
      physics: {
        default: "arcade",
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: [GameScene],
    };

    if (!gameRef.current) {
      gameRef.current = new Phaser.Game(config);
      gameRef.current.registry.set("onExit", onExit);
    }

    const handleResize = () => {
      if (gameRef.current) {
        gameRef.current.scale.resize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [onExit]);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div id="game-container" className="w-full h-full" />
    </div>
  );
}
