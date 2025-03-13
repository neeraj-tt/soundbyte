import { useState } from "react";
import { Check } from "lucide-react";

const SongGuess = ({ onGuess, disabled, guessOutcome }) => {
  const [userGuess, setUserGuess] = useState("");

  const handleInputChange = (event) => {
    setUserGuess(event.target.value);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      onGuess(userGuess);
      setUserGuess("");
    }
  };

  const handleButtonClick = () => {
    onGuess(userGuess);
    setUserGuess("");
  };

  return (
    <div className="flex items-center space-x-4">
      <input
        type="text"
        value={userGuess}
        onChange={disabled ? undefined : handleInputChange}
        onKeyDown={disabled ? undefined : handleKeyDown}
        placeholder="Guess song name..."
        className={`w-52 p-3 border rounded-lg bg-gray-800 text-white focus:outline-none transition-colors duration-500 ${
          guessOutcome === "default" ? "border-green-500" : "border-red-500"
        }`}
      />
      <button
        onClick={disabled ? undefined : handleButtonClick}
        className={`w-10 h-10 flex items-center justify-center rounded-full hover:bg-white hover:text-gray-600 transition-colors duration-500 ${
          guessOutcome === "default"
            ? "bg-green-500 text-white"
            : "bg-red-500 text-black"
        }`}
      >
        <Check size={20} />
      </button>
    </div>
  );
};

export default SongGuess;
