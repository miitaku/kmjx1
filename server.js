// server.js
const express = require('express');
const session = require('express-session');
const path = require('path');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ミドルウェア設定
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// セッション管理
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'default_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // 本番でHTTPSならtrue
  })
);

// EJSテンプレートエンジン設定
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 静的ファイル（CSSなど）
app.use(express.static(path.join(__dirname, 'public')));

// ルーティング
app.use('/', authRoutes);

// サーバー起動
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});