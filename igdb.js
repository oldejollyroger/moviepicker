// api/igdb.js
const axios = require('axios');

// We will store the token in memory to reuse it until it expires.
let token = {
  access_token: null,
  expires_at: 0,
};

// This function gets a new access token from Twitch
async function getAccessToken() {
  const { TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET } = process.env;

  if (!TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET) {
    throw new Error("Twitch API credentials are not set in environment variables.");
  }

  const response = await axios.post(
    `https://id.twitch.tv/oauth2/token?client_id=${TWITCH_CLIENT_ID}&client_secret=${TWITCH_CLIENT_SECRET}&grant_type=client_credentials`
  );

  const now = Date.now();
  token = {
    access_token: response.data.access_token,
    expires_at: now + (response.data.expires_in * 1000),
  };
}

// This is the main serverless function that Vercel will run
module.exports = async (request, response) => {
  // Check if we need a new token
  if (!token.access_token || Date.now() > token.expires_at) {
    try {
      await getAccessToken();
    } catch (error) {
      response.status(500).json({ error: 'Failed to authenticate with Twitch API.', details: error.message });
      return;
    }
  }

  // The 'body' of the request from our frontend contains the IGDB query
  const { endpoint, queryBody } = request.body;

  try {
    const apiResponse = await axios({
      url: `https://api.igdb.com/v4/${endpoint}`,
      method: 'POST',
      headers: {
        'Client-ID': process.env.TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${token.access_token}`,
        'Accept': 'application/json',
      },
      data: queryBody,
    });

    response.status(200).json(apiResponse.data);

  } catch (error) {
    console.error('IGDB API Error:', error.response ? error.response.data : error.message);
    const statusCode = error.response ? error.response.status : 500;
    response.status(statusCode).json({ error: 'Failed to fetch data from IGDB API.' });
  }
};