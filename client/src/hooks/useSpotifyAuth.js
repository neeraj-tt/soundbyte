import { useState, useEffect } from "react";
import spotifyApi from "../utils/spotifyApi";

const API_URL = "https://soundbyte-backend-2481cb7d0b5f.herokuapp.com";

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
    const expiresIn = 3600 * 1000; // 1 hour expiration time

    if (accessToken && refreshToken) {
      const expirationTime = Date.now() + expiresIn;
      storeToken(accessToken, refreshToken, expirationTime);
    } else {
      checkStoredToken();
    }
  }, []);

  useEffect(() => {
    if (spotifyToken) {
      spotifyApi.setAccessToken(spotifyToken);
      fetchUserData();
    }
  }, [spotifyToken]);

  // Check if stored token is expired
  useEffect(() => {
    const expirationTime = localStorage.getItem("spotify_token_expiration");
    if (expirationTime && Date.now() > expirationTime) {
      console.log("🔄 Access token expired. Refreshing...");
      refreshAccessToken();
    }
  }, []);

  const storeToken = (accessToken, refreshToken, expirationTime) => {
    localStorage.setItem("spotify_access_token", accessToken);
    localStorage.setItem("spotify_refresh_token", refreshToken);
    localStorage.setItem("spotify_token_expiration", expirationTime);

    setSpotifyToken(accessToken);
    setLoggedIn(true);
  };

  const checkStoredToken = () => {
    const storedAccessToken = localStorage.getItem("spotify_access_token");
    const expirationTime = localStorage.getItem("spotify_token_expiration");

    if (storedAccessToken && expirationTime && Date.now() < expirationTime) {
      setSpotifyToken(storedAccessToken);
      setLoggedIn(true);
    } else {
      console.log("❌ Stored token is expired or missing.");
      localStorage.removeItem("spotify_access_token");
      localStorage.removeItem("spotify_refresh_token");
      localStorage.removeItem("spotify_token_expiration");
      setLoggedIn(false);
    }
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

  // Refresh token using a POST request
  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("spotify_refresh_token");
    if (!refreshToken) return;

    try {
      const response = await fetch(`${API_URL}/refresh_token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      const data = await response.json();
      if (data.access_token) {
        console.log("🔄 Token refreshed!");
        storeToken(data.access_token, refreshToken, Date.now() + 3600 * 1000);
      }
    } catch (err) {
      console.error("Error refreshing token:", err);
      localStorage.removeItem("spotify_access_token");
      localStorage.removeItem("spotify_refresh_token");
      localStorage.removeItem("spotify_token_expiration");
      setLoggedIn(false);
    }
  };

  return { spotifyToken, loggedIn, setLoggedIn, user, refreshAccessToken };
}
