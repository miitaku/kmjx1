// main.js
const { TwitterApi } = require('twitter-api-v2');
const fs = require('fs');

// 認証情報
const config = require('./config');
const whitelist = require('./whitelist.json');

// クライアント設定
const client = new TwitterApi({
  appKey: config.API_KEY,
  appSecret: config.API_SECRET,
  accessToken: config.ACCESS_TOKEN,
  accessSecret: config.ACCESS_TOKEN_SECRET,
});
const rwClient = client.readWrite;

// ユーティリティ関数
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const isWhitelisted = (username) => whitelist.includes(username.toLowerCase());
(async () => {
  try {
    const me = await rwClient.v2.me();
    const userId = me.data.id;

    // フォロー中ユーザー取得
    const following = await rwClient.v2.following(userId, { asPaginator: true });
    const followingUsers = [];
    for await (const user of following) followingUsers.push(user);

    // フォロワー取得
    const followers = await rwClient.v2.followers(userId, { asPaginator: true });
    const followerUsernames = new Set();
    for await (const user of followers) followerUsernames.add(user.username.toLowerCase());

    // 片思い削除処理
    for (const user of followingUsers) {
      const uname = user.username.toLowerCase();
      if (!followerUsernames.has(uname) && !isWhitelisted(uname)) {
        console.log(`片思い解除 → ${uname}`);
        await rwClient.v2.unfollow(userId, user.id);
        await sleep(1500);
      }
    }
    // 自動フォロー処理（任意の候補者ID列）
    const candidates = ['example1', 'example2', 'example3']; // ← 適宜更新 or 外部化
    let followCount = 0;

    for (const uname of candidates) {
      if (followCount >= 10) break;
      if (isWhitelisted(uname)) continue;

      try {
        const user = await rwClient.v2.userByUsername(uname);
        const relationship = await rwClient.v2.userFollowing(userId, { asPaginator: true });
        const alreadyFollowing = [...relationship].some(u => u.username.toLowerCase() === uname);

        if (!alreadyFollowing) {
          console.log(`フォロー実行 → ${uname}`);
          await rwClient.v2.follow(userId, user.data.id);
          followCount++;
          await sleep(1500);
        }
      } catch (e) {
        console.log(`スキップ：${uname}（存在しないかエラー）`);
      }
    }

    console.log('✅ 自動整理＆フォロー完了');
  } catch (error) {
    console.error('❌ エラー発生:', error);
  }
})();
