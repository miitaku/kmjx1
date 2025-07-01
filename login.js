const client_id = "YOUR_CLIENT_ID";
const redirect_uri = "https://yourdomain.com/callback";  // ←後で合わせる
const scope = "tweet.read users.read follows.write offline.access";
const state = "kmjx1login";
const code_challenge = "challenge"; // PKCE対応（後ほどJS生成）
const code_challenge_method = "plain";

document.getElementById("loginBtn").href =
  `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${client_id}&redirect_uri=${redirect_uri}&scope=${encodeURIComponent(scope)}&state=${state}&code_challenge=${code_challenge}&code_challenge_method=${code_challenge_method}`;
