require('dotenv').config();
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// login.html を返すルート
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// Twitter OAuth2 コールバック処理
app.get('/callback', async (req, res) => {
  const code = req.query.code;

  try {
    const response = await axios.post('https://api.twitter.com/2/oauth2/token', null, {
      params: {
        code,
        grant_type: 'authorization_code',
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        redirect_uri: process.env.REDIRECT_URI,
        code_verifier: 'challenge', // 本番ではPKCEを安全に管理
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const accessToken = response.data.access_token;
    res.send(`✅ アクセストークン: ${accessToken}`);
  } catch (error) {
    console.error('❌ トークン取得エラー:', error.response?.data || error.message);
    res.status(500).send('トークン取得失敗');
  }
});

// ✅ Render対応：PORTは環境変数から取得
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 サーバー起動: http://localhost:${PORT}/`);
});
