// main.js
const { TwitterApi } = require('twitter-api-v2');
const fs = require('fs');
const whitelist = require('./whitelist.json');

// ユーティリティ関数
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const isWhitelisted = (username) => whitelist.includes(username.toLowerCase());

async function runBotWithToken(access_token) {
  const client = new TwitterApi(access_token); // OAuth2用
  const rwClient = client.readWrite;

  try {
    const me = await rwClient.v2.me();
    const userId = me.data.id;

    // フォロー中取得
    const following = await rwClient.v2.following(userId, { asPaginator: true });
    const followingUsers = [];
    for await (const user of following) followingUsers.push(user);

    // フォロワー取得
    const followers = await rwClient.v2.followers(userId, { asPaginator: true });
    const followerUsernames = new Set();
    for await (const user of followers) followerUsernames.add(user.username.toLowerCase());

    // 片思い解除
    for (const user of followingUsers) {
      const uname = user.username.toLowerCase();
      if (!followerUsernames.has(uname) && !isWhitelisted(uname)) {
        console.log(`片思い解除 → ${uname}`);
        await rwClient.v2.unfollow(userId, user.id);
        await sleep(1500);
      }
    }

    // 自動フォロー
    const candidates = ['example1', 'example2', 'example3']; // 任意に変更
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

    console.log('✅ Bot完了（ユーザーID: ' + userId + '）');
  } catch (error) {
    console.error('❌ Botエラー:', error);
  }
}

module.exports = { runBotWithToken };
