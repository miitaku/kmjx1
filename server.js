require('dotenv').config();
const express = require('express');
const axios = require('axios');
const qs = require('querystring');
const path = require('path');
const { runBotWithToken } = require('./main'); // ← 追加：Bot関数を読み込む

const app = express();
const port = 3000;

// /login にアクセスが来たら login.html を返す
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// Twitter 認証後の callback URL に対応
app.get('/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send('No code provided.');

  const data = {
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: process.env.REDIRECT_URI,
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
  };

  try {
    const response = await axios.post(
      'https://api.twitter.com/2/oauth2/token',
      qs.stringify(data),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );

    console.log('✅ トークン取得成功:', response.data);

    // ⬇️ 追加：Botをこのトークンで実行！
    const accessToken = response.data.access_token;
    await runBotWithToken(accessToken);

    res.send('✅ 認証＆Bot完了！ターミナルをチェックしてね。');
  } catch (error) {
    console.error('❌ エラー:', error.response?.data || error.message);
    res.status(500).send('❌ 認証エラー。再確認してください。');
  }
});

app.listen(port, () => {
  console.log(`🚀 http://localhost:${port}/callback が起動しました`);
});
