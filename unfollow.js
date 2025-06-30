// unfollow.js
const fs = require('fs');
const fetch = require('node-fetch');
const { BEARER_TOKEN } = require('./config');

const whitelist = JSON.parse(fs.readFileSync('whitelist.json', 'utf-8'));
const headers = {
  Authorization: `Bearer ${BEARER_TOKEN}`,
  'Content-Type': 'application/json',
};

// フォロー中のアカウント取得
async function getFollowing(userId) {
  const url = `https://api.twitter.com/2/users/${userId}/following?max_results=1000`;
  const res = await fetch(url, { headers });
  const data = await res.json();
  return data.data || [];
}

// フォロワー（自分をフォローしている人）取得
async function getFollowers(userId) {
  const url = `https://api.twitter.com/2/users/${userId}/followers?max_results=1000`;
  const res = await fetch(url, { headers });
  const data = await res.json();
  return new Set((data.data || []).map(u => u.username));
}

// フォロー解除処理
async function unfollow(userId, targetUserId) {
  const url = `https://api.twitter.com/2/users/${userId}/following/${targetUserId}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers,
  });
  console.log(`➡️ Unfollowed: ${targetUserId} | Status: ${res.status}`);
}

// 実行本体
(async () => {
  const myUserId = '自分のユーザーIDをここに'; // 例: '123456789012345678'
  const following = await getFollowing(myUserId);
  const followersSet = await getFollowers(myUserId);

  for (const user of following) {
    const username = user.username;
    const userId = user.id;

    if (whitelist.includes(username)) {
      console.log(`🛡️ Skipped (whitelisted): ${username}`);
      continue;
    }

    if (!followersSet.has(username)) {
      await unfollow(myUserId, userId);
    } else {
      console.log(`🔄 Mutual follow: ${username}`);
    }

    // 必要に応じてウェイト（例：1秒）
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
})();
