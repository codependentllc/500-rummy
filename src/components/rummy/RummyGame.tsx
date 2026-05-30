"use client";

import { useEffect, useRef, useState } from "react";
import { AVATARS } from "@/data/avatars";
import { runAiTurn } from "@/games/rummy/ai";
import { createGame } from "@/games/rummy/engine";
import type { GameState, ScreenState, SeatConfig } from "@/types/rummy";
import { GameScreen } from "./GameScreen";
import { SetupScreen } from "./SetupScreen";
import { WelcomeScreen } from "./WelcomeScreen";

export function RummyGame() {
  const [screen, setScreen] = useState<ScreenState>("welcome");
  const [avatarId, setAvatarId] = useState(AVATARS[0].id);
  const [playerName, setPlayerName] = useState("You");
  const [playerCount, setPlayerCount] = useState(2);
  const [seats, setSeats] = useState<SeatConfig[]>(() => AVATARS.slice(0, 4).map((avatar, index) => ({ avatarId: avatar.id, name: index === 0 ? "You" : avatar.name })));
  const [game, setGame] = useState<GameState | null>(null);
  const aiBusy = useRef(false);
  const avatar = AVATARS.find((option) => option.id === avatarId) ?? AVATARS[0];
  const displayName = playerName.trim() || avatar.name;

  useEffect(() => {
    setSeats((current) => current.map((seat, index) => index === 0 ? { avatarId, name: displayName } : seat));
  }, [avatarId, displayName]);

  useEffect(() => {
    if (!game || game.turn === 0 || game.handOver || aiBusy.current) return;
    aiBusy.current = true;
    const timer = window.setTimeout(() => {
      setGame((current) => current ? runAiTurn(current) : current);
      aiBusy.current = false;
    }, 650);
    return () => {
      window.clearTimeout(timer);
      aiBusy.current = false;
    };
  }, [game]);

  const startGame = (scores: number[] = []) => {
    setGame(createGame(playerCount, seats, scores));
    setScreen("game");
  };

  const updateSeat = (index: number, seat: SeatConfig) => setSeats((current) => current.map((option, seatIndex) => seatIndex === index ? seat : option));

  if (screen === "welcome") return <WelcomeScreen avatarId={avatarId} playerName={playerName} onAvatarChange={setAvatarId} onNameChange={setPlayerName} onContinue={() => setScreen("setup")} />;
  if (screen === "setup") return <SetupScreen playerName={displayName} playerCount={playerCount} seats={seats} onCountChange={setPlayerCount} onSeatChange={updateSeat} onStart={() => startGame()} />;
  if (!game) return null;
  return <GameScreen game={game} setGame={(update) => setGame((current) => current ? update(current) : current)} onNewGame={() => setScreen("welcome")} onNextHand={() => startGame(game.players.map((player) => player.score))} />;
}
