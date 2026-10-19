import { useState, type ComponentType } from "react";
import { Loader } from "@mantine/core";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useLanguage } from "@/context/language";
import { GameMessage } from "../components/GameMessage";
import { GameScreen } from "../components/GameScreen";
import { DefinifyGame } from "../components/DefinifyGame";
import { LexiSenseGame } from "../components/LexiSenseGame";
import { PictureWordGame } from "../components/PictureWordGame";
import { WordEchoGame } from "../components/WordEchoGame";
import { WordRecallGame } from "../components/WordRecallGame";
import { gamesListPath, parseGameOptions } from "../lib/gameOptions";
import type { GamePlayerProps } from "../lib/gamePlayer";
import { clearStoredGame } from "../lib/gameStorage";
import { useGames } from "../queries";

/**
 * The player for each `game_type`. A player owns its game's session format and screens,
 * so adding a game type is a new entry here and leaves the other games untouched.
 */
const PLAYERS: Partial<Record<string, ComponentType<GamePlayerProps>>> = {
  type_word: WordRecallGame,
  audio: WordEchoGame,
  image: PictureWordGame,
  select_def: LexiSenseGame,
  select_word: DefinifyGame,
};

export function GamePage() {
  const navigate = useNavigate();
  const gameId = Number(useParams().gameId);
  const { language: currentLanguage } = useLanguage();
  const [searchParams] = useSearchParams();

  // Fixed for the whole visit: the session is started with them, later changes are ignored.
  const [setup] = useState(() => ({ language: currentLanguage, options: parseGameOptions(searchParams) }));
  // The game's type decides how it's played. The list is usually cached from the games page.
  const games = useGames(setup.language);

  function leave() {
    clearStoredGame(gameId);
    navigate(gamesListPath(setup.options));
  }

  // Checked on data, not status: a background refetch that fails must not end a game in progress.
  if (!games.data) {
    if (games.isError) {
      return <GameMessage title="Couldn't load the game" message={games.error.message} onBack={leave} />;
    }
    return (
      <GameScreen>
        <Loader size="lg" />
      </GameScreen>
    );
  }

  const game = games.data.find((g) => g.id === gameId);
  if (!game) {
    return <GameMessage message="This game doesn't exist." onBack={leave} />;
  }
  const Player = PLAYERS[game.game_type];
  if (!Player) {
    return <GameMessage message={`${game.title} can't be played yet.`} onBack={leave} />;
  }

  return <Player gameId={game.id} language={setup.language} options={setup.options} onLeave={leave} />;
}
