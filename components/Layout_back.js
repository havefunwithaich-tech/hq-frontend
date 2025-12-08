// components/Layout.js

import Head from 'next/head';

export default function Layout({ children, title = 'havefunwithAIch Headquarters' }) {
  return (
    <div id="site-root">
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" href="/favicon.ico" />

        {/* GPT Tag */}
        <script async src="https://securepubads.g.doubleclick.net/tag/js/gpt.js"></script>
        <script>
          {`
            window.googletag = window.googletag || {cmd: []};
            googletag.cmd.push(function() {
              googletag.pubads().enableSingleRequest();
              googletag.enableServices();
            });
          `}
        </script>
      </Head>

      {/* 🚨 ここにCSSを直書きして強制適用する */}
      <style jsx global>{`
        /* 1. リセット & ダークモード強制 */
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body {
          background-color: #1c1c1c !important;
          color: white !important;
          width: 100%;
          overflow-x: hidden; /* 横スクロール絶対禁止 */
        }
        a { color: #66ccff !important; text-decoration: none; }

        /* 2. 画像・動画の暴走を止める */
        img, video, iframe, figure, .wp-block-image {
          max-width: 100% !important;
          height: auto !important;
          width: auto !important;
          display: block;
          margin: 0 auto;
        }
        /* 広告だけはサイズを守らせる */
        div[id^="div-gpt-ad"], iframe[id^="google_ads_iframe"] {
          width: auto; max-width: none !important;
        }

        /* 3. PC用レイアウト (デフォルト) */
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 10px 20px;
          width: 100%;
        }

        header {
          border-bottom: 1px solid #444;
          background-color: #1c1c1c;
        }

        .header-inner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 20px;
        }

        .nav-links a, .nav-links span {
          margin-left: 20px;
          font-size: 1rem;
        }

        /* 4. 📱 モバイル強制対応 (600px以下) */
        @media (max-width: 600px) {
          /* ヘッダーを縦並びにして幅を確保 */
          .header-inner {
            flex-direction: column !important;
            text-align: center !important;
            padding: 10px !important;
          }

          /* ロゴを小さく */
          h1 {
            font-size: 1.5rem !important;
            margin-bottom: 10px !important;
          }

          /* ナビゲーションの間隔調整 */
          .nav-links {
            display: flex;
            justify-content: center;
            gap: 15px;
            flex-wrap: wrap;
          }
          .nav-links a, .nav-links span {
            margin: 0 !important;
            font-size: 0.9rem !important;
          }

          /* コンテンツの余白調整 */
          .container {
            padding: 10px !important;
          }
        }
      `}</style>

      <header>
        <div className="container header-inner">
          <h1 style={{ margin: 0 }}>
            <a href="/">HQ.havefunwithAIch</a>
          </h1>
          <nav className="nav-links">
            <a href="/" style={{ color: 'white' }}>HOME</a>
            <a href="/videos" style={{ color: 'white' }}>VIDEOS</a>
            <span style={{ color: '#aaa', cursor: 'default' }}>ARTICLES</span>
          </nav>
        </div>
      </header>

      <main className="container" style={{ minHeight: '80vh' }}>
        {children}
      </main>

      <footer className="container" style={{ borderTop: '1px solid #444', textAlign: 'center', fontSize: '0.8em', marginTop: '20px', paddingTop: '20px' }}>
        © {new Date().getFullYear()} {title} | Built with Next.js & WP Headless
      </footer>
    </div>
  );
}
