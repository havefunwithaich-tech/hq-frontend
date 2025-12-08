// hq-frontend/pages/join.js (ブロンズプラン対応版)

import { useState } from 'react';
import { useRouter } from 'next/router'; // 👈 ルーティングに使用

export default function Join() {
  const [loading, setLoading] = useState(false);
  const router = useRouter(); // 👈 ルーティングフック

  // 🔴 テスト用ユーザー情報 (NOTE: 運用時は動的に取得が必要です)
  const user = {
    id: "VXNlcjox", // 管理者のWP ID (テスト用)
    email: "test_user@example.com"
  };

  // 🔴 Stripe価格IDを定義
  const SILVER_PRICE_ID = "price_1SY7VO0724S7HbUS6nrGH9sV"; // 貴殿のシルバー価格ID
  const BRONZE_PRICE_ID = "price_1SWgs20724S7HbUShLlhHxmt"; // 👈 ここにブロンズプランの価格IDを入れてください

  // 決済処理関数をプランIDを受け取るように汎用化
  const handleCheckout = async (priceId) => { // 👈 priceId を引数に追加
    setLoading(true);

    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        priceId: priceId, // 👈 動的なpriceIdを使用
        userId: user.id,
        userEmail: user.email,
      }),
    });

    const data = await res.json();
    setLoading(false); // エラー時もロード状態を解除

    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("Error processing checkout: " + (data.error || JSON.stringify(data)));
    }
  };

  return (
    <div style={{ padding: "50px", textAlign: "center", fontFamily: "sans-serif" }}>
      <h1>HQ Member Subscriptions</h1>
      <p>Access all SSM contents and supports.</p>

      {/* --- 🥈 SILVER PLAN --- */}
      <div style={{ marginTop: "40px", border: "1px solid #ddd", padding: "20px", display: "inline-block", margin: "10px" }}>
        <h2>Silver Member</h2>
        <p>Full access, $5/mo</p>
        <button
          onClick={() => handleCheckout(SILVER_PRICE_ID)} // 👈 シルバーのIDを渡す
          disabled={loading}
          style={{ cursor: "pointer", backgroundColor: "#0070f3", color: "white", /* ... style ... */ }}
        >
          {loading ? "Processing..." : "Subscribe Silver ($5/mo)"}
        </button>
      </div>

      {/* --- 🥉 BRONZE PLAN --- */}
      <div style={{ marginTop: "40px", border: "1px solid #ddd", padding: "20px", display: "inline-block", margin: "10px" }}>
        <h2>Bronze Member</h2>
        <p>Basic access, $1/mo</p>
        <button
          onClick={() => handleCheckout(BRONZE_PRICE_ID)} // 👈 ブロンズのIDを渡す
          disabled={loading}
          style={{ cursor: "pointer", backgroundColor: "#a0522d", color: "white", /* ... style ... */ }}
        >
          {loading ? "Processing..." : "Subscribe Bronze ($1/mo)"}
        </button>
      </div>
    </div>
  );
}
