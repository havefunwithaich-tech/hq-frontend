// pages/_document.js

import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <style>{`
          /* ... (基本設定はそのまま) ... */
          /* 1. 背景を強制的に黒にする */
          html, body {
            background-color: #1c1c1c !important;
            color: white !important;
            margin: 0;
            padding: 0;
            overflow-x: hidden;
          }

          /* 2. リンク色 */
          a {
            color: #66ccff !important;
            text-decoration: none !important;
          }

          /* 3. 画像・動画・iframeの巨大化を阻止 */
          /* 💡 修正: 広告以外のiframeにのみ適用するため、クラス指定などを工夫 */
          img, video, figure, .wp-block-image {
            max-width: 100% !important;
            height: auto !important;
            display: block !important;
            margin: 0 auto !important;
          }
          /* WPの埋め込み動画調整 */
          .wp-block-embed iframe {
            max-width: 100% !important;
            aspect-ratio: 16 / 9;
          }

          /* 4. テーブルのレスポンシブ化 */
          table {
            display: block !important;
            overflow-x: auto !important;
            width: 100% !important;
          }

          /* 🚨 広告（GAM）のiframeに対する特例ルール */
          /* Google広告のiframeは、固定幅を持つ場合があるため、幅を強制しない */
          iframe[id^="google_ads_iframe"] {
            max-width: none !important; /* 幅制限を解除 */
            width: auto !important;     /* 自動幅 */
            margin: 0 auto !important;  /* 中央揃え */
            display: block !important;
          }
          /* アンカー広告（フッター固定）の調整 */
          .google-auto-placed {
             text-align: center !important;
          }
        `}</style>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
