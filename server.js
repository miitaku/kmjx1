require('dotenv').config();
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Middleware設定
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// 静的ファイルの提供（例: publicフォルダにCSSなどを置いた場合）
app.use(express.static(path.join(__dirname, 'public')));

// EJSテンプレート設定
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// indexルート（トップページ）
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// loginルート（EJSで動的埋め込み）
app.get('/login', (req, res) => {
  res.render('login', {
    clientId: process.env.CLIENT_ID,
    redirectUri: process.env.REDIRECT_URI,
  });
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
        code_verifier: 'challenge', // 実運用ではPKCEのcode_verifierを生成・保持・送信
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

// Render用ポート設定
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 サーバー起動: http://localhost:${PORT}/`);
});
