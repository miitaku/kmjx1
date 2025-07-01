// ==============================
// PKCE関連ユーティリティ関数
// ==============================

// ランダムなcode_verifierを生成
function generateCodeVerifier(length = 128) {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let text = '';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

// code_verifierからcode_challengeを生成（SHA-256 → Base64URL）
async function generateCodeChallenge(codeVerifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// ==============================
// メイン処理
// ==============================

window.onload = async () => {
  const client_id = "YOUR_CLIENT_ID"; // ← Twitter Developer Portal で取得したID
  const redirect_uri = "https://yourdomain.com/callback"; // ← あなたのサーバーのcallback先
  const scope = "tweet.read users.read follows.write offline.access";
  const state = "kmjx1login"; // 任意の文字列でOK

  const code_verifier = generateCodeVerifier();
  const code_challenge = await generateCodeChallenge(code_verifier);
  const code_challenge_method = "S256";

  // コードベリファイアを保存（callback側で使用）
  localStorage.setItem("code_verifier", code_verifier);

  // 認証用URLを構築
  const authUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${client_id}&redirect_uri=${encodeURIComponent(redirect_uri)}&scope=${encodeURIComponent(scope)}&state=${state}&code_challenge=${code_challenge}&code_challenge_method=${code_challenge_method}`;

  // ボタンにURLをセット
  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) {
    loginBtn.href = authUrl;
  }
};
