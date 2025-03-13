const express = require("express");
const axios = require("axios");
const cors = require("cors");
const querystring = require("querystring");
const cookieParser = require("cookie-parser");
const crypto = require("crypto");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8888;

const client_id = process.env.CLIENT_ID
const client_secret = process.env.CLIENT_SECRET
const redirect_uri = process.env.REDIRECT_URI
const client_url = process.env.CLIENT_URL || "http://localhost:5173"

const generateRandomString = (length) => {
  return crypto.randomBytes(60).toString("hex").slice(0, length);
};

const stateKey = "spotify_auth_state";

app.use(
  cors({
    origin: client_url,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.get("/login", (req, res) => {
  const state = generateRandomString(16);
  res.cookie(stateKey, state, { httpOnly: true, secure: true, sameSite: "none" });

  const scope = "user-read-private user-read-email user-library-read"

  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state,
      })
  );
});

app.get("/callback", async (req, res) => {
  const code = req.query.code || null;
  const state = req.query.state || null;
  const storedState = req.cookies ? req.cookies[stateKey] : null;

  if (!state || state !== storedState) {
    return res.redirect(
      client_url + "/#" +
        querystring.stringify({
          error: "state_mismatch",
        })
    );
  }

  res.clearCookie(stateKey);

  try {
    const authResponse = await axios.post(
      "https://accounts.spotify.com/api/token",
      querystring.stringify({
        code: code,
        redirect_uri: redirect_uri,
        grant_type: "authorization_code",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            Buffer.from(client_id + ":" + client_secret).toString("base64"),
        },
      }
    );

    const { access_token, refresh_token } = authResponse.data;

    // Fetch user info with the access token
    const userResponse = await axios.get("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    res.redirect(
      client_url + "/#" +
        querystring.stringify({
          access_token: access_token,
          refresh_token: refresh_token,
        })
    );
  } catch (error) {
    console.error(
      "Error during authentication:",
      error.response?.data || error
    );
    res.redirect(
      client_url + "/#" +
        querystring.stringify({
          error: "invalid_token",
        })
    );
  }
});

app.get("/refresh_token", async (req, res) => {
  const refresh_token = req.query.refresh_token;

  try {
    const refreshResponse = await axios.post(
      "https://accounts.spotify.com/api/token",
      querystring.stringify({
        grant_type: "refresh_token",
        refresh_token: refresh_token,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            Buffer.from(client_id + ":" + client_secret).toString("base64"),
        },
      }
    );

    res.json({
      access_token: refreshResponse.data.access_token,
      refresh_token: refreshResponse.data.refresh_token || refresh_token, // Keep the old refresh_token if not provided
    });
  } catch (error) {
    console.error("Error refreshing token:", error.response?.data || error);
    res.status(500).json({ error: "Failed to refresh token" });
  }
});

// To get 30 second preview from Deezer
app.get("/deezer-search", async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ error: "Query parameter is required" });
  }

  try {
    const deezerResponse = await axios.get("https://api.deezer.com/search", {
      params: { q: query },
    });
    res.json(deezerResponse.data);
  } catch (error) {
    console.error("❌ Error fetching from Deezer:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});


app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
