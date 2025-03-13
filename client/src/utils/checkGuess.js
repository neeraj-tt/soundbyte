import { cleanString } from "./cleanString";
import levenshtein from "fast-levenshtein";

//i did it, a boogie == "i said it"; may have to account for length
const levenshtein_distance = (guess, actual) => {
  const distance = levenshtein.get(guess, actual);
  const maxLength = Math.max(guess.length, actual.length);

  return 1 - distance / maxLength;
};

export const checkGuess = (userGuess, track) => {
  // maybe do contains() and >= 75%?
  // "&" and "and" should both be correct (e.g. The Party & The After Party)
  // "Comin" or "Comin'" == "Coming" (e.g. Comin Out Strong)
  // remove spaces (e.g. Hellcats & Track hawks)
  // remove  - xxx - (e.g. - Lost Tapes - or - Digitally Remastered -)

  //empty answers are always wrong
  if (userGuess.trim() === "") {
    return {
      isCorrect: false,
      message: `Wrong, it's ${track.name} - ${track.artist}`,
    };
  }

  // Clean up both user guess and track name for better matching
  const cleanedGuess = cleanString(userGuess);
  const cleanedTrackName = cleanString(track.name);

  if (
    levenshtein_distance(cleanString(userGuess), cleanString(track.name)) >= 0.8
  ) {
    return {
      isCorrect: true,
      message: `Correct, it's ${track.name} - ${track.artist}`,
    };
  }
  return {
    isCorrect: false,
    message: `Wrong, it's ${track.name} - ${track.artist}`,
  };
};
