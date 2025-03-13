// useAudioPlayer.js
import { useState, useRef, useEffect } from "react";

const FADE_DURATION = 0.5;

const useAudioPlayer = (previewUrl) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(new Audio(previewUrl));
  const timeoutRef = useRef(null);
  const fadeIntervalRef = useRef(null);

  useEffect(() => {
    audioRef.current.src = previewUrl;
  }, [previewUrl]);

  // Clean up when the component unmounts
  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
      clearInterval(fadeIntervalRef.current);
      audioRef.current.pause();
    };
  }, []);

  // callback is completed once fade is done
  const fadeIn = (audio, callback) => {
    const steps = 50;
    const intervalTime = (FADE_DURATION * 1000) / steps;
    const volumeIncrement = 1 / steps;
    let currentStep = 0;

    clearInterval(fadeIntervalRef.current);
    audio.volume = 0;
    fadeIntervalRef.current = setInterval(() => {
      currentStep++;
      audio.volume = Math.min(audio.volume + volumeIncrement, 1);
      if (currentStep >= steps) {
        clearInterval(fadeIntervalRef.current);
        if (callback) callback();
      }
    }, intervalTime);
  };

  // callback is completed once fade is done
  const fadeOut = (audio, callback) => {
    const steps = 50;
    const intervalTime = (FADE_DURATION * 1000) / steps;
    const volumeDecrement = audio.volume / steps;
    let currentStep = 0;

    clearInterval(fadeIntervalRef.current);
    fadeIntervalRef.current = setInterval(() => {
      currentStep++;
      audio.volume = Math.max(audio.volume - volumeDecrement, 0);
      if (currentStep >= steps) {
        clearInterval(fadeIntervalRef.current);
        if (callback) callback();
      }
    }, intervalTime);
  };

  // Plays the audio snippet for the specified duration (in seconds) starting at startTime.
  // Always fades in/out over FADE_DURATION seconds.
  const playSnippet = (duration, startTime = 1) => {
    if (audioRef.current) {
      audioRef.current.currentTime = startTime;
      //no fade if 1 second snippet
      if (duration === 1) {
        audioRef.current.volume = 1;
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
            timeoutRef.current = setTimeout(() => {
              audioRef.current.pause();
              setIsPlaying(false);
            }, duration * 1000);
          })
          .catch((error) => console.error("Audio playback failed:", error));
      } else {
        audioRef.current.volume = 0;
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
            fadeIn(audioRef.current, () => {
              const timeUntilFadeOut = duration - FADE_DURATION;
              timeoutRef.current = setTimeout(() => {
                fadeOut(audioRef.current, () => {
                  audioRef.current.pause();
                  setIsPlaying(false);
                });
              }, timeUntilFadeOut * 1000);
            });
          })
          .catch((error) => console.error("Audio playback failed:", error));
      }
    }
  };

  // Toggle playback using the snippet function.
  const togglePlay = (duration = 1) => {
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      clearTimeout(timeoutRef.current);
    } else {
      playSnippet(duration, 1);
    }
  };

  return { isPlaying, playSnippet, togglePlay, audioRef };
};

export default useAudioPlayer;
