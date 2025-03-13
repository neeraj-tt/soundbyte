import { useState, useEffect } from "react";
import spotifyApi from "../utils/spotifyApi";

const getTokenFromUrl = () => {
  return window.location.hash
    .substring(1)
    .split("&")
    .reduce((initial, item) => {
      let parts = item.split("=");
      initial[parts[0]] = decodeURIComponent(parts[1]);
      return initial;
    }, {});
};

export function useSpotifyAuth() {
  const [spotifyToken, setSpotifyToken] = useState(
    localStorage.getItem("spotify_access_token") || ""
  );
  const [loggedIn, setLoggedIn] = useState(!!spotifyToken);
  const [user, setUser] = useState({});

  // Parse token from URL on mount
  useEffect(() => {
    const urlParams = getTokenFromUrl();
    window.history.pushState({}, null, "/"); // Removes token from URL for security

    const accessToken = urlParams.access_token;
    const refreshToken = urlParams.refresh_token;

    if (accessToken && refreshToken) {
      storeToken(accessToken, refreshToken);
    } else {
      const storedAccessToken = localStorage.getItem("spotify_access_token");

      if (storedAccessToken) {
        setSpotifyToken(storedAccessToken);
        setLoggedIn(true);
      }
    }
  }, []);

  useEffect(() => {
    if (spotifyToken) {
      spotifyApi.setAccessToken(spotifyToken);
      fetchUserData();
    }
  }, [spotifyToken]);

  const storeToken = (accessToken, refreshToken) => {
    const expiresIn = 3600 * 1000; // Spotify tokens expire in 1 hour
    const expirationTime = Date.now() + expiresIn;

    localStorage.setItem("spotify_access_token", accessToken);
    localStorage.setItem("spotify_refresh_token", refreshToken);
    localStorage.setItem("spotify_token_expiration", expirationTime);

    setSpotifyToken(accessToken);
    setLoggedIn(true);
  };

  const fetchUserData = () => {
    spotifyApi
      .getMe()
      .then((userData) => {
        setUser({
          id: userData.id,
          name: userData.display_name,
        });
      })
      .catch((err) => {
        console.error("Error fetching user data", err);
        localStorage.removeItem("spotify_access_token");
        setLoggedIn(false);
      });
  };

  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("spotify_refresh_token");
    if (!refreshToken) return;

    try {
      const response = await fetch(
        `http://localhost:8888/refresh_token?refresh_token=${refreshToken}`
      );
      const data = await response.json();

      if (data.access_token) {
        console.log("🔄 Token refreshed!");
        storeToken(data.access_token, refreshToken);
      }
    } catch (err) {
      console.error("Error refreshing token:", err);
      localStorage.removeItem("spotify_access_token");
      localStorage.removeItem("spotify_refresh_token");
      setLoggedIn(false);
    }
  };

  return { spotifyToken, loggedIn, setLoggedIn, user, refreshAccessToken };
}
