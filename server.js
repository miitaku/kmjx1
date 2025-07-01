require("dotenv").config();
const express = require("express");
const axios = require("axios");
const qs = require("querystring");

const app = express();
const port = 3000;

app.get("/callback", async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send("Missing code parameter");
  }

  const code_verifier = req.query.code_verifier || req.session?.code_verifier || "取得方法に応じて変更";

  try {
    const response = await axios.post(
      "https://api.twitter.com/2/oauth2/token",
      qs.stringify({
        code: code,
        grant_type: "authorization_code",
        client_id: process.env.CLIENT_ID,
        redirect_uri: process.env.REDIRECT_URI,
        code_verifier: code_verifier,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            Buffer.from(
              `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`
            ).toString("base64"),
        },
      }
    );

    const accessToken = response.data.access_token;

    res.send("✅ ログイン成功！アクセストークン: " + accessToken);
  } catch (err) {
    console.error(err.response?.data || err);
    res.status(500).send("❌ トークン交換に失敗しました");
  }
});

app.listen(port, () => {
  console.log(`🌐 サーバー起動中：http://localhost:${port}`);
});

