import { useState, useEffect } from "react";
import { useSpotifyData } from "../hooks/useSpotifyData";
import SongGuess from "./SongGuess";
import Player from "./Player";

import { checkGuess } from "../utils/checkGuess";
import { generateHint } from "../utils/generateHint";
import useAudioPlayer from "../hooks/useAudioPlayer";

const Game = () => {
  const { getRandomSong } = useSpotifyData();
  const [currentTrack, setCurrentTrack] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [hint, setHint] = useState("");
  const [isPlayDisabled, setIsPlayDisabled] = useState(false);
  const [guessOutcome, setGuessOutcome] = useState("default");

  const { playSnippet } = useAudioPlayer(currentTrack?.previewUrl);

  useEffect(() => {
    fetchNewSong();
  }, []);

  const fetchNewSong = async () => {
    const song = await getRandomSong();
    if (song) {
      setCurrentTrack(song);
    }
  };

  const handleGuess = (userGuess) => {
    if (!userGuess || !currentTrack) return;

    const result = checkGuess(userGuess, currentTrack);
    setWrongAttempts((prev) => {
      const nextWrongAttempts = result.isCorrect ? 0 : prev + 1;

      if (result.isCorrect) {
        setGuessOutcome("default");
        setFeedback(result.message);
        setIsPlayDisabled(true);
        playSnippet(6);
        setTimeout(() => {
          fetchNewSong();
          setFeedback("");
          setWrongAttempts(0);
          setHint("");
          setIsPlayDisabled(false);
        }, 6000);
      } else if (nextWrongAttempts === 2) {
        setGuessOutcome("wrong");
        setFeedback(result.message);
        setIsPlayDisabled(true);
        playSnippet(6);
        setTimeout(() => {
          fetchNewSong();
          setFeedback("");
          setWrongAttempts(0);
          setHint("");
          setIsPlayDisabled(false);
          setGuessOutcome("default");
        }, 6000);
      } else if (nextWrongAttempts === 1) {
        setGuessOutcome("wrong");
        setHint(generateHint(currentTrack));
      }

      return nextWrongAttempts;
    });
  };

  return (
    <div className="bg-customCard p-10 rounded-xl shadow-2xl flex flex-col items-center w-[80vw] max-w-[400px]">
      {currentTrack ? (
        <>
          <div className="relative w-[90%] mx-2 mt-2">
            <img
              src={currentTrack.albumArt}
              className={`transition-all duration-500 filter filter-optimized rounded-xl shadow-2xl ${
                feedback // if feedback, then must be right -> unblur
                  ? "brightness-100 blur-0"
                  : wrongAttempts === 0
                    ? "brightness-0 blur-0"
                    : wrongAttempts === 1
                      ? "brightness-100 blur-[10px]"
                      : "brightness-100 blur-0"
              }`}
            />
            <div className="absolute bottom-4 left-4">
              <Player track={currentTrack} disabled={isPlayDisabled} />
            </div>
          </div>
          <div className="flex flex-col items-start w-full p-4 min-h-[100px]">
            {wrongAttempts === 1 ? (
              <p className="text-xl font-semibold text-white">{hint}</p>
            ) : null}
            {(feedback || wrongAttempts === 2) && (
              <>
                <p className="text-xl font-semibold text-white">
                  {currentTrack.name}
                </p>
                <p className="text-md text-gray-400">
                  {currentTrack.allArtists}
                </p>
              </>
            )}
          </div>
          <SongGuess
            onGuess={handleGuess}
            disabled={isPlayDisabled}
            guessOutcome={guessOutcome}
          />
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default Game;
