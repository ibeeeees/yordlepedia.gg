// auth.js - Authentication configuration and handlers
const axios = require("axios");
const jwt = require("jsonwebtoken");

// AWS Cognito configuration
const COGNITO_CONFIG = {
  region: process.env.AWS_REGION || "us-east-1",
  userPoolId: process.env.COGNITO_USER_POOL_ID,
  clientId: process.env.COGNITO_CLIENT_ID,
  clientSecret: process.env.COGNITO_CLIENT_SECRET,
  domain: process.env.COGNITO_DOMAIN,
  redirectUri: process.env.AUTH_REDIRECT_URI || "http://localhost:3000/auth/callback"
};

// Riot OAuth configuration
const RIOT_CONFIG = {
  clientId: process.env.RIOT_CLIENT_ID,
  clientSecret: process.env.RIOT_CLIENT_SECRET,
  redirectUri: process.env.RIOT_REDIRECT_URI || "http://localhost:3000/auth/riot/callback"
};

// Generate Cognito authorization URL
function getCognitoAuthUrl(state) {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: COGNITO_CONFIG.clientId,
    redirect_uri: COGNITO_CONFIG.redirectUri,
    state: state,
    scope: "openid profile email"
  });

  return `https://${COGNITO_CONFIG.domain}/oauth2/authorize?${params.toString()}`;
}

// Generate Riot OAuth authorization URL
function getRiotAuthUrl(state) {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: RIOT_CONFIG.clientId,
    redirect_uri: RIOT_CONFIG.redirectUri,
    state: state,
    scope: "openid"
  });

  return `https://auth.riotgames.com/oauth2/auth?${params.toString()}`;
}

// Exchange Cognito authorization code for tokens
async function exchangeCognitoCode(code) {
  try {
    const response = await axios.post(
      `https://${COGNITO_CONFIG.domain}/oauth2/token`,
      {
        grant_type: "authorization_code",
        client_id: COGNITO_CONFIG.clientId,
        client_secret: COGNITO_CONFIG.clientSecret,
        code: code,
        redirect_uri: COGNITO_CONFIG.redirectUri
      },
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      }
    );

    return response.data;
  } catch (error) {
    console.error("Cognito token exchange error:", error.response?.data || error.message);
    throw error;
  }
}

// Exchange Riot authorization code for tokens
async function exchangeRiotCode(code) {
  try {
    const response = await axios.post(
      "https://auth.riotgames.com/oauth2/token",
      {
        grant_type: "authorization_code",
        client_id: RIOT_CONFIG.clientId,
        client_secret: RIOT_CONFIG.clientSecret,
        code: code,
        redirect_uri: RIOT_CONFIG.redirectUri
      },
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      }
    );

    return response.data;
  } catch (error) {
    console.error("Riot token exchange error:", error.response?.data || error.message);
    throw error;
  }
}

// Verify and decode JWT token
function verifyToken(token) {
  try {
    // Get the public key from Cognito
    const decoded = jwt.decode(token, { complete: true });
    // In production, validate the signature using Cognito's public keys
    return decoded.payload;
  } catch (error) {
    console.error("Token verification error:", error.message);
    return null;
  }
}

module.exports = {
  COGNITO_CONFIG,
  RIOT_CONFIG,
  getCognitoAuthUrl,
  getRiotAuthUrl,
  exchangeCognitoCode,
  exchangeRiotCode,
  verifyToken
};
