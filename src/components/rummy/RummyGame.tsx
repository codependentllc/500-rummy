"use client";

import { useEffect, useRef, useState } from "react";
import { AVATARS } from "@/data/avatars";
import { CARD_BACK_STYLES, TABLE_THEMES } from "@/data/themes";
import { runAiTurn } from "@/games/rummy/ai";
import { createGame } from "@/games/rummy/engine";
import type { GameSetupState, GameState, OpponentSetup, SeatConfig, SetupStep } from "@/types/rummy";
import { CardBackScreen } from "./CardBackScreen";
import { GameScreen } from "./GameScreen";
import { OpponentSetupScreen } from "./OpponentSetupScreen";
import { PlayerSetupScreen } from "./PlayerSetupScreen";
import { TableThemeScreen } from "./TableThemeScreen";
import { WelcomeScreen } from "./WelcomeScreen";

const initialOpponents = AVATARS.slice(1, 5).map((avatar, index) => ({ id: index + 1, avatarId: avatar.id, displayName: avatar.name }));

function normalizeOpponents(playerAvatarId: string, opponents: OpponentSetup[]) {
  const used = new Set([playerAvatarId]);
  return opponents.map((opponent) => {
    const current = AVATARS.find((avatar) => avatar.id === opponent.avatarId);
    const avatar = current && !used.has(current.id) ? current : AVATARS.find((candidate) => !used.has(candidate.id)) ?? AVATARS[0];
    used.add(avatar.id);
    const displayName = !opponent.displayName.trim() || opponent.displayName === current?.name ? avatar.name : opponent.displayName;
    return { ...opponent, avatarId: avatar.id, displayName };
  });
}

export function RummyGame() {
  const [screen, setScreen] = useState<SetupStep>("welcome");
  const [setup, setSetup] = useState<GameSetupState>({
    player: { avatarId: AVATARS[0].id, displayName: "You" },
    opponentCount: 2,
    opponents: initialOpponents,
    tableThemeId: TABLE_THEMES[0].id,
    cardBackId: CARD_BACK_STYLES[0].id
  });
  const [game, setGame] = useState<GameState | null>(null);
  const aiBusy = useRef(false);

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
    const avatar = AVATARS.find((option) => option.id === setup.player.avatarId) ?? AVATARS[0];
    const seats: SeatConfig[] = [
      { avatarId: avatar.id, name: setup.player.displayName.trim() || avatar.name },
      ...setup.opponents.slice(0, setup.opponentCount).map((opponent) => ({ avatarId: opponent.avatarId, name: opponent.displayName }))
    ];
    setGame(createGame(seats.length, seats, scores));
    setScreen("game");
  };

  const updateOpponent = (opponent: OpponentSetup) => setSetup((current) => ({ ...current, opponents: current.opponents.map((option) => option.id === opponent.id ? opponent : option) }));
  const tableTheme = TABLE_THEMES.find((theme) => theme.id === setup.tableThemeId) ?? TABLE_THEMES[0];
  const cardBack = CARD_BACK_STYLES.find((style) => style.id === setup.cardBackId) ?? CARD_BACK_STYLES[0];

  if (screen === "welcome") return <WelcomeScreen onContinue={() => setScreen("player")} />;
  if (screen === "player") return <PlayerSetupScreen player={setup.player} onChange={(player) => setSetup((current) => ({ ...current, player }))} onBack={() => setScreen("welcome")} onContinue={() => { setSetup((current) => ({ ...current, opponents: normalizeOpponents(current.player.avatarId, current.opponents) })); setScreen("opponents"); }} />;
  if (screen === "opponents") return <OpponentSetupScreen player={setup.player} opponentCount={setup.opponentCount} opponents={setup.opponents} onCountChange={(opponentCount) => setSetup((current) => ({ ...current, opponentCount }))} onOpponentChange={updateOpponent} onBack={() => setScreen("player")} onContinue={() => setScreen("tableTheme")} />;
  if (screen === "tableTheme") return <TableThemeScreen selectedId={setup.tableThemeId} onChange={(tableThemeId) => setSetup((current) => ({ ...current, tableThemeId }))} onBack={() => setScreen("opponents")} onContinue={() => setScreen("cardBack")} />;
  if (screen === "cardBack") return <CardBackScreen selectedId={setup.cardBackId} onChange={(cardBackId) => setSetup((current) => ({ ...current, cardBackId }))} onBack={() => setScreen("tableTheme")} onStart={() => startGame()} />;
  if (!game) return null;
  return <GameScreen game={game} tableThemeClass={tableTheme.className} cardBackClass={cardBack.className} setGame={(update) => setGame((current) => current ? update(current) : current)} onNewGame={() => setScreen("welcome")} onNextHand={() => startGame(game.players.map((player) => player.score))} />;
}
