import Head from 'next/head';
import StaffSection from '../components/StaffSection';
import Link from 'next/link';

// === コンポーネント定義 ===
const LaunchBanner = () => (
  <section className="launch-banner-section">
    <Link href="/articles/launch-greeting" className="launch-banner-link">
      <span className="banner-emoji">🚀</span> MAJOR ANNOUNCEMENT: Official Site Relaunch & New Content Policy (Click to Read)
    </Link>
  </section>
);

const NotificationSection = () => (
  <section className="notification-section">
    <div className="notification-content">
      <h2 className="section-title">RECENT NEWS & UPDATES</h2>
      {/* Notification Items... (中身は変更なし) */}
      <div className="notification-item">
        <Link href="/about" className="notification-link link-highlight-blue">
          [LAUNCH] SITE LAUNCHED: Full Content Policy Update (Dec 2)
        </Link>
        <span className="notification-date">DEC 02, 2025</span>
      </div>
      <div className="notification-item">
        <Link href="/veil" className="notification-link link-highlight-red">
          [POLICY] IMPORTANT: Articles Now Exclusive for Members
        </Link>
        <span className="notification-date">DEC 02, 2025</span>
      </div>
      <div className="notification-item">
        <Link href="/videos" className="notification-link">
          [CONTENT] All Videos Accessible (Ad Supported)
        </Link>
        <span className="notification-date">DEC 02, 2025</span>
      </div>
      <div className="notification-item">
        <Link href="/pre-launch-info" className="notification-link">
          [HISTORY] Pre-Launch Phase Completed (Nov 27)
        </Link>
        <span className="notification-date">NOV 27, 2025</span>
      </div>
    </div>
  </section>
);

// === メインページコンポーネント ===
export default function Home() {
  return (
    <div className="main-container">
      <Head>
        <title>havefunwithAIch | Bridging Humanity and AI</title>
        <meta name="description" content="Official site of havefunwithAIch." />
      </Head>

      {/* グローバルなスタイルリセット（念のため適用） */}
      <style jsx global>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>

      <LaunchBanner />

      {/* === Hero Section === */}
      <section className="hero-section">
        {/* 1. 背景画像レイヤー */}
        <div className="hero-bg">
          <picture>
            <source srcSet="/images/top-hero.webp" type="image/webp" />
            <img src="/images/top-hero.jpg" alt="Hero Background" className="hero-img" />
          </picture>
        </div>
        
        {/* 2. オーバーレイ（暗幕）レイヤー */}
        <div className="hero-overlay"></div>

        {/* 3. コンテンツレイヤー */}
        <div className="hero-content-wrapper">
          <div className="hero-frame">
            <h1 className="hero-title">havefunwithAIch</h1>
            <p className="hero-subtitle">FORGING THE UNBREAKABLE CHARACTER</p>
          </div>
        </div>
      </section>

      <NotificationSection />
      <StaffSection />

      <footer className="site-footer">
        {/* Footer Content... (変更なし) */}
        <div className="footer-links">
          <Link href="/about" className="footer-link">About This Site</Link>
          <span className="separator">|</span>
          <Link href="/privacy-policy" className="footer-link">Privacy Policy</Link>
          <span className="separator">|</span>
          <Link href="/legal/commercial-transactions" className="footer-link">Specified Commercial Transactions Act (JP Only)</Link>
        </div>
      </footer>

      {/* === CSS Styling === */}
      <style jsx>{`
        .main-container {
          background-color: #000;
          min-height: 100vh;
          color: #fff;
          font-family: sans-serif;
          /* ナビゲーションバーが重なる場合は、ここに padding-top を追加してください */
        }

        /* --- Hero Section --- */
        .hero-section {
          position: relative;
          width: 100%;
          height: 80vh;
          min-height: 500px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .hero-bg {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          z-index: 0;
        }
        .hero-img {
          width: 100%; height: 100%;
          object-fit: cover; object-position: center;
          display: block;
        }

        .hero-overlay {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%);
          z-index: 1;
        }

        .hero-content-wrapper {
          position: relative;
          z-index: 2;
          width: 100%;
          padding: 20px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        /* PC向けの白い枠のデザイン */
        .hero-frame {
          border: 3px solid rgba(255, 255, 255, 0.8);
          padding: 40px 60px;
          text-align: center;
          background: rgba(0, 0, 0, 0.3); 
          backdrop-filter: blur(3px);
          max-width: 800px;
          width: 100%;
          box-sizing: border-box; /* 重要: paddingとborderを幅に含める */
        }

        .hero-title {
          font-size: 4rem;
          margin: 0;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.02em;
          text-shadow: 0 4px 15px rgba(0,0,0,0.8);
          line-height: 1.1;
          word-break: break-word; /* 長い単語を折り返す */
        }

        .hero-subtitle {
          font-size: 1.2rem;
          color: #eee;
          margin-top: 20px;
          letter-spacing: 0.2em;
          text-shadow: 0 2px 4px rgba(0,0,0,0.9);
          font-weight: 500;
          text-transform: uppercase;
        }

        /* --- Mobile Responsiveness (重要) --- */
        @media (max-width: 768px) {
          .hero-section {
            height: 70vh; /* モバイルでは少し高さを抑える */
            min-height: 400px;
          }
          .hero-content-wrapper {
             padding: 10px; /* モバイルでの左右の余白を狭く */
          }
          .hero-frame {
            padding: 25px 15px; /* 枠内の余白を調整 */
            border-width: 2px; /* 枠線を少し細く */
            /* width: 100%; はそのまま効く */
          }
          .hero-title {
            font-size: 1.8rem; /* フォントサイズを大幅に縮小 */
            line-height: 1.2;
          }
          .hero-subtitle {
            font-size: 0.9rem;
            margin-top: 15px;
            letter-spacing: 0.1em;
          }
        }

        /* --- Other Sections (変更なし) --- */
        .site-footer { padding: 40px 20px; background-color: #050505; text-align: center; border-top: 1px solid #222; }
        .footer-links { display: flex; justify-content: center; gap: 15px; flex-wrap: wrap; margin-bottom: 20px; }
        .footer-link { color: #888; text-decoration: none; font-size: 0.9rem; }
        .footer-link:hover { color: #fff; }
        .separator { color: #444; }
        .copyright { color: #444; font-size: 0.8rem; }

        .launch-banner-section { background-color: #00ccff; text-align: center; padding: 15px 20px; animation: pulse 1.5s infinite; }
        .launch-banner-link { color: #000; text-decoration: none; font-weight: bold; font-size: 1.1rem; letter-spacing: 0.05em; display: block; }
        .banner-emoji { margin-right: 10px; }
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.01); } 100% { transform: scale(1); } }
        @media (max-width: 768px) { .launch-banner-link { font-size: 0.9rem; } }

        .notification-section { padding: 60px 20px; background-color: #111; text-align: center; border-bottom: 2px solid #222; }
        .section-title { font-size: 1.8rem; color: #fff; margin-bottom: 30px; letter-spacing: 0.1em; border-bottom: 1px solid #333; display: inline-block; padding-bottom: 5px; }
        .notification-content { max-width: 800px; margin: 0 auto; }
        .notification-item { display: flex; justify-content: space-between; align-items: center; padding: 18px 0; border-top: 1px solid #333; transition: background-color 0.3s; }
        .notification-item:hover { background-color: #1a1a1a; cursor: pointer; }
        .notification-item:last-child { border-bottom: 1px solid #333; }
        .notification-link { color: #bbb; text-decoration: none; font-size: 1rem; text-align: left; flex-grow: 1; padding-left: 10px; }
        .notification-link:hover { color: #007bff; }
        .notification-date { color: #666; font-size: 0.85rem; min-width: 100px; text-align: right; }
        .link-highlight-blue { color: #00ccff; font-weight: bold; }
        .link-highlight-red { color: #ff4444; font-weight: bold; }
        @media (max-width: 600px) {
          .notification-item { flex-direction: column; align-items: flex-start; padding: 10px 0; }
          .notification-date { text-align: left; padding-left: 10px; margin-top: 5px; font-size: 0.75rem; }
        }
      `}</style>
    </div>
  );
}
