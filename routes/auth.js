// routes/auth.js
const express = require('express');
const router = express.Router();
const axios = require('axios');

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

// ログインページを表示
router.get('/', (req, res) => {
  res.render('login', {
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI
  });
});

// コールバック処理（アクセストークン取得）
router.get('/callback', async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.status(400).send('認証コードが見つかりませんでした。');
  }

  try {
    const tokenResponse = await axios.post(
      'https://api.twitter.com/2/oauth2/token',
      new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        code_verifier: 'challenge' // PKCE使用しない場合は"challenge"固定
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`
        }
      }
    );

    const accessToken = tokenResponse.data.access_token;
    req.session.accessToken = accessToken;

    res.send(`
      <h2>✅ ログイン成功！</h2>
      <p>Access Token:</p>
      <code>${accessToken}</code>
    `);
  } catch (error) {
    console.error('❌ 認証エラー:', error.response?.data || error.message);
    res.status(500).send('ログインに失敗しました。');
  }
});

module.exports = router;