import { useEffect } from "react";
import { useSpotifyAuth } from "./hooks/useSpotifyAuth";
import { useSpotifyData } from "./hooks/useSpotifyData";
import AuthButton from "./components/AuthButton";
import Game from "./components/Game";

function App() {
  const { loggedIn, user, spotifyToken } = useSpotifyAuth();
  const { songs, fetchSongs } = useSpotifyData();

  useEffect(() => {
    // Just fetch the total, don't pick a random song
    if (loggedIn && spotifyToken && songs.quantity === undefined) {
      console.log("🔄 Fetching liked songs count...");
      fetchSongs();
    }
  }, [loggedIn]);

  return (
    <div className="h-screen flex items-center justify-center">
      {!loggedIn ? (
        <div className="text-center">
          <h1 className="font-kanit pb-2 text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
            soundbyte
          </h1>
          <h2 className="text-md sm:text-sm md:text-sm lg:text-md xl:text-md max-w-xs sm:max-w-md md:max-w-lg mx-auto">
            Based on your personal music taste
          </h2>
          <AuthButton isAuthenticated={loggedIn} />
        </div>
      ) : (
        <div>
          <h1 className="font-kanit text-white text-2xl absolute top-4 left-4">
            soundbyte
          </h1>
          <>
            <Game likedSongs={songs.quantity} />
          </>
          <>
            <AuthButton isAuthenticated={loggedIn} />
          </>
        </div>
      )}
    </div>
  );
}

export default App;
