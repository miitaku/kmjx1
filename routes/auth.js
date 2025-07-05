const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');
const querystring = require('querystring');
require('dotenv').config();

const CLIENT_ID = process.env.X_CLIENT_ID;
const REDIRECT_URI = 'https://kmjx1.onrender.com/auth/callback';
const SCOPE = 'tweet.read tweet.write users.read offline.access';
const STATE = crypto.randomBytes(10).toString('hex');

// PKCE用 code_challenge
const codeVerifier = crypto.randomBytes(32).toString('hex');
const codeChallenge = crypto
  .createHash('sha256')
  .update(codeVerifier)
  .digest('base64')
  .replace(/=/g, '')
  .replace(/\+/g, '-')
  .replace(/\//g, '_');

// ④: 認可リクエスト
router.get('/auth/twitter', (req, res) => {
  const authUrl = 'https://twitter.com/i/oauth2/authorize?' + querystring.stringify({
    response_type: 'code',
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: SCOPE,
    state: STATE,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  res.redirect(authUrl);
});

// ⑤: コールバックでトークン取得
router.get('/auth/callback', async (req, res) => {
  const { code, state } = req.query;

  if (state !== STATE) return res.status(403).send('Invalid state');

  try {
    const response = await axios.post(
      'https://api.twitter.com/2/oauth2/token',
      querystring.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        code_verifier: codeVerifier,
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );

    const accessToken = response.data.access_token;
    res.send(`✅ ログイン成功！アクセストークン: ${accessToken}`);
  } catch (err) {
    console.error('❌ トークン取得エラー:', err.response?.data || err.message);
    res.status(500).send('認証失敗');
  }
});

module.exports = router;