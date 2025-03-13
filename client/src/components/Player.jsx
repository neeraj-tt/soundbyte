// click this to play the snippet
import useAudioPlayer from "../hooks/useAudioPlayer";
import { Pause, Play } from "lucide-react";

const Player = ({ track, disabled }) => {
  // Initialize the custom hook with the track preview URL.
  const { isPlaying, togglePlay } = useAudioPlayer(track.previewUrl);

  const handleTogglePlay = () => {
    if (!disabled) {
      togglePlay(1);
    }
  };

  return (
    <div>
      {track?.previewUrl ? (
        <>
          <button
            onClick={handleTogglePlay}
            disabled={disabled}
            className={`w-10 h-10 flex items-center justify-center bg-green-500 text-white rounded-full hover:bg-white hover:text-gray-600 transition ${
              disabled ? "opacity-0" : "hover:bg-white hover:text-gray-600"
            }`}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
        </>
      ) : (
        <p>Loading track...</p>
      )}
    </div>
  );
};

export default Player;
