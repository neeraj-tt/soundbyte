import { useState, useEffect } from "react";
import { useSpotifyAuth } from "./useSpotifyAuth";
import spotifyApi from "../utils/spotifyApi";

const API_URL = "https://soundbyte-backend-2481cb7d0b5f.herokuapp.com";

export function useSpotifyData() {
  const { spotifyToken, refreshAccessToken } = useSpotifyAuth();
  const [songs, setSongs] = useState({});

  useEffect(() => {
    if (spotifyToken) {
      fetchSongs();
    }
  }, [spotifyToken]);

  const fetchSongs = async () => {
    const expirationTime = localStorage.getItem("spotify_token_expiration");
    if (expirationTime && Date.now() > expirationTime) {
      console.warn("Token expired, refreshing before fetching songs...");
      await refreshAccessToken();
    }

    try {
      const response = await spotifyApi.getMySavedTracks({ limit: 1 });
      if (response?.total) {
        setSongs({ quantity: response.total });
      }
    } catch (error) {
      console.error("Error fetching liked songs:", error);
    }
  };

  const getRandomSong = async () => {
    const maxAttempts = 5;
    let attempts = 0;

    const expirationTime = parseInt(
      localStorage.getItem("spotify_token_expiration")
    );
    if (expirationTime && Date.now() > expirationTime) {
      console.warn("Token expired, refreshing before fetching song...");
      await refreshAccessToken();
    }

    while (attempts < maxAttempts) {
      try {
        console.log(
          `🎲 Fetching a new random song... (Attempt ${attempts + 1})`
        );
        const response = await spotifyApi.getMySavedTracks({ limit: 1 });
        const totalLikedSongs = response.total;

        if (totalLikedSongs === 0) return null;

        const randomIndex = Math.floor(Math.random() * totalLikedSongs);
        const songResponse = await spotifyApi.getMySavedTracks({
          limit: 1,
          offset: randomIndex,
        });

        if (songResponse.items.length > 0) {
          const song = songResponse.items[0].track;
          const trackNameStripped = song.name
            .replace(/\s*[\(\[].*?[\)\]]\s*/g, "")
            .trim();
          const previewUrl = await getDeezerPreview(
            trackNameStripped,
            song.artists[0].name,
            song.album.album_type === "album",
            song.album.name
          );

          if (previewUrl) {
            return {
              name: song.name,
              artist: song.artists[0].name,
              allArtists: song.artists.map((artist) => artist.name).join(", "),
              albumName: song.album.name,
              albumArt: song.album.images[0]?.url || "",
              dateAdded: songResponse.items[0].added_at,
              isAlbum: song.album.album_type === "album",
              previewUrl: previewUrl,
            };
          } else {
            console.warn(
              `No preview found for "${song.name}". Trying a new song...`
            );
          }
        }
      } catch (err) {
        console.warn("Error fetching random song:", err);
        return null;
      }
      attempts++;
    }

    console.error("Max retries reached. No preview found.");
    return null;
  };

  const getDeezerPreview = async (
    trackName,
    artist,
    isAlbum = false,
    albumName = ""
  ) => {
    const trackNameStripped = trackName
      .replace(/\s*[\(\[].*?[\)\]]\s*/g, "")
      .trim();

    try {
      let query =
        isAlbum && albumName
          ? `track:"${trackNameStripped}" artist:"${artist}" album:"${albumName}"&strict=on`
          : `track:"${trackNameStripped}" artist:"${artist}"&strict=on`;

      const response = await fetch(
        `${API_URL}/deezer-search?query=${encodeURIComponent(query)}`
      );
      const data = await response.json();

      return data?.data?.[0]?.preview || null;
    } catch (error) {
      console.error("Error fetching preview from Deezer:", error);
      return null;
    }
  };

  return { songs, getRandomSong, fetchSongs };
}
