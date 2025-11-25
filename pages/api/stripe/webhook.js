// hq-frontend/pages/api/stripe/webhook.js (最終版)

import { buffer } from 'micro';
import stripe from '../../../lib/stripe'; // lib/stripe.js から初期化
import { UPDATE_USER_DATA } from '../../../lib/graphql/mutations'; // WPミューテーションをインポート

// Next.jsのデフォルトのbody parserを無効化（Stripeがraw bodyを要求するため）
export const config = {
  api: {
    bodyParser: false,
  },
};

// --- GraphQLへのデータ送信関数 ---
async function sendGraphQLMutation(userId, stripeData) {
  const endpoint = process.env.WP_GRAPHQL_URL; 
  // NOTE: WP_USER_TOKENと管理者のユーザー名を使用
  const authHeader = Buffer.from(`admin:${process.env.WP_USER_TOKEN}`).toString('base64');

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // アプリケーションパスワードを使用した認証ヘッダー
      'Authorization': `Basic ${authHeader}`, 
    },
    body: JSON.stringify({
      query: UPDATE_USER_DATA,
      variables: {
        id: userId,
        stripeCustomerId: stripeData.stripeCustomerId,
        subscriptionStatus: stripeData.subscriptionStatus,
      },
    }),
  });

  const result = await response.json();
  if (result.errors) {
    console.error('❌ GraphQL Mutation Error:', result.errors);
    return false;
  }
  return true;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Webhookの検証 (セキュリティチェック)
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.log(`❌ Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const subscription = event.data.object;
  const customerId = subscription.customer; // Stripeの顧客ID: cus_...

  // 🚨 重要な課題: WPユーザーIDの取得 (今回はテストとして管理者IDを使用)
  // NOTE: 実際の運用ではStripe Customer IDとWP User IDの紐付けロジックが必要です
  const wp_user_id_to_update = 'VXNlcjox'; // <-- 管理者のWP ID (databaseId: 1) を使用

  let statusToUpdate = 'active';

  // イベントタイプに応じた処理
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      statusToUpdate = subscription.status; 
      break;
    
    case 'customer.subscription.deleted':
      statusToUpdate = 'cancelled'; 
      break;
    
    default:
      // 他のイベント（支払い成功/失敗など）は、このロジックには含まれないため無視
      res.json({ received: true });
      return;
  }

  // GraphQLミューテーションの実行
  const success = await sendGraphQLMutation(wp_user_id_to_update, {
    stripeCustomerId: customerId,
    subscriptionStatus: statusToUpdate,
  });

  if (success) {
    console.log(`✅ User ${wp_user_id_to_update} updated successfully with status: ${statusToUpdate}`);
  } else {
    console.error(`❌ Failed to update user ${wp_user_id_to_update} data.`);
  }

  res.json({ received: true });
}