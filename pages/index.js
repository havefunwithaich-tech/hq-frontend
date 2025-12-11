import Head from 'next/head';
import StaffSection from '../components/StaffSection';
import Link from 'next/link';

// GraphQLクエリ
const GET_HOME_DATA = `{ 
  posts(first: 3, where: { orderby: { field: DATE, order: DESC }, stati: [PUBLISH] }) { 
    nodes { title slug date } 
  } 
}`;

const LaunchBanner = () => (
  <section className="launch-banner-section">
    <Link href="/articles/launch-greeting" className="launch-banner-link">
      <span className="banner-emoji">🚀</span> MAJOR ANNOUNCEMENT: Official Site Relaunch & New Content Policy (Click to Read)
    </Link>
  </section>
);

const NotificationSection = ({ latestPosts }) => (
  <section className="notification-section">
    <div className="notification-content">
      <h2 className="section-title">RECENT NEWS & UPDATES</h2>

      {/* ★修正: 新記事を常にトップに固定 ★ */}
      <div className="notification-item" style={{ order: -1, background: '#1c1c1c' }}> 
        <Link href="/site-built-in-2-weeks" className="notification-link link-highlight-red">
          [HQ REPORT] SITE FULLY BUILT IN 2 WEEKS BY AI + HUMAN
        </Link>
        <span className="notification-date">DEC 11, 2025</span>
      </div>
      {/* ★修正ここまで ★ */}

      {latestPosts &&
        latestPosts.map((post) => (
          <div key={post.slug} className="notification-item">
            <Link href={`/articles/${post.slug}`} className="notification-link link-highlight-blue">
              [NEW] {post.title}
            </Link>
            <span className="notification-date">
              {new Date(post.date)
                .toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
                .toUpperCase()
                .replace(',', '')}
            </span>
          </div>
        ))}

      {/* 固定記事 */}
      <div className="notification-item">
        <Link href="/veil" className="notification-link link-highlight-red">
          [POLICY] IMPORTANT: Articles Now Exclusive for Members
        </Link>
        <span className="notification-date">DEC 02, 2025</span>
      </div>
    </div>
  </section>
);

export default function Home({ data }) {
  const latestPosts = data?.posts?.nodes || null;

  return (
    <div className="main-container">
      <Head>
        <title>havefunwithAIch | Bridging Humanity and AI</title>
        <meta name="description" content="Official site of havefunwithAIch." />
      </Head>

      {/* === GLOBAL RESET === */}
      <style jsx global>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        html, body {
          background-color: #000;
          color: #fff;
          font-family: sans-serif;
          min-height: 100vh;
          overflow-x: hidden;
          text-align: left; /* ← ★センター暴走の根源を完全停止 */
        }
      `}</style>

      <LaunchBanner />

      {/* === HERO SECTION === */}
      <section className="hero-section">
        {/* 背景 */}
        <div className="hero-bg">
          <img src="/images/top-hero.jpg" alt="Hero" className="hero-img" />
        </div>

        {/* 黒幕（修復済み） */}
        <div className="hero-overlay"></div>

        {/* コンテンツレイヤー */}
        <div className="hero-content-wrapper">
          <div className="hero-frame">
            <h1 className="hero-title">havefunwithAIch</h1>
            <p className="hero-subtitle">FORGING THE UNBREAKABLE CHARACTER</p>
          </div>
        </div>
      </section>

      <NotificationSection latestPosts={latestPosts} />
      <StaffSection />

      {/* FOOTER */}
      <footer className="site-footer">
        <div className="footer-links">
          <Link href="/about" className="footer-link">About This Site</Link>
          <span className="separator">|</span>
          <Link href="/privacy-policy" className="footer-link">Privacy Policy</Link>
          <span className="separator">|</span>
          <Link href="/legal/commercial-transactions" className="footer-link">
            Specified Commercial Transactions Act (JP Only)
          </Link>
        </div>
      </footer>

      {/* === FULL CSS (修復後) === */}
      <style jsx>{`
        .main-container {
          background-color: #000;
          color: #fff;
          font-family: sans-serif;
        }

        /* ====================== */
        /*      HERO SECTION      */
        /* ====================== */

        .hero-section {
            position: relative;
            width: 100%;
            height: min(100vh, 720px);
            min-height: 500px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }

        .hero-bg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
        }

        .hero-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
        }

        /* ★ 黒幕（暴走修復） */
        .hero-overlay {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            180deg,
            rgba(0,0,0,0.4) 0%,
            rgba(0,0,0,0.75) 100%
          );
          z-index: 1;
          pointer-events: none;
        }

        /* ★ Hero文字（前面へ復帰） */
        .hero-content-wrapper {
          position: relative;
          z-index: 3; /* ←最重要：文字を最前面へ */
          width: 100%;
          padding: 20px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .hero-frame {
          border: 3px solid rgba(255, 255, 255, 0.8);
          padding: 40px 60px;
          text-align: center;
          background: rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(3px);
          max-width: 800px;
          width: 100%;
        }

        .hero-title {
          font-size: 4rem;
          margin: 0;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.02em;
          text-shadow: 0 4px 15px rgba(0,0,0,0.8);
        }

        .hero-subtitle {
          font-size: 1.2rem;
          margin-top: 20px;
          color: #eee;
          letter-spacing: 0.2em;
          text-shadow: 0 2px 4px rgba(0,0,0,0.9);
        }

        @media (max-width: 768px) {
          .hero-section { height: 70vh; min-height: 400px; }
          .hero-frame { padding: 25px 15px; border-width: 2px; }
          .hero-title { font-size: 1.8rem; }
          .hero-subtitle { font-size: 0.9rem; }
        }

        /* ====================== */
        /*     NOTIFICATIONS      */
        /* ====================== */

        /* ★ すべて左寄せに固定（暴走停止） */
        .notification-section,
        .notification-content,
        .notification-item,
        .notification-link {
          text-align: left !important;
        }

        .notification-section {
          padding: 60px 20px;
          background-color: #111;
          border-bottom: 2px solid #222;
        }

        .section-title {
          font-size: 1.8rem;
          margin-bottom: 30px;
          letter-spacing: 0.1em;
          border-bottom: 1px solid #333;
          display: inline-block;
          padding-bottom: 5px;
        }

        .notification-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 18px 0;
          border-top: 1px solid #333;
        }

        .notification-date {
          min-width: 100px;
          text-align: right;
          color: #666;
        }

        @media (max-width: 600px) {
          .notification-item {
            flex-direction: column;
            align-items: flex-start;
          }
          .notification-date {
            text-align: left;
            padding-left: 10px;
            margin-top: 5px;
          }
        }

        /* ====================== */
        /*        FOOTER          */
        /* ====================== */

        .site-footer {
          padding: 40px 20px;
          background: #050505;
          text-align: center;
          border-top: 1px solid #222;
        }

        .footer-links {
          display: flex;
          justify-content: center;
          gap: 15px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .footer-link { color: #888; text-decoration: none; font-size: 0.9rem; }
        .footer-link:hover { color: #fff; }
        .separator { color: #444; }
        .copyright { color: #444; font-size: 0.8rem; }

        /* BANNER */
        .launch-banner-section {
          background-color: #00ccff;
          text-align: center;
          padding: 15px 20px;
          animation: pulse 1.5s infinite;
        }
        .launch-banner-link {
          color: #000;
          text-decoration: none;
          font-weight: bold;
          font-size: 1.1rem;
        }
        .banner-emoji { margin-right: 10px; }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.01); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

// === Server Side Fetching ===
export async function getServerSideProps() {
  const endpoint = process.env.WORDPRESS_GRAPHQL_ENDPOINT;

  if (!endpoint) {
    console.error("FATAL: WORDPRESS_GRAPHQL_ENDPOINT is undefined.");
    return { props: { data: null } };
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: GET_HOME_DATA })
    });

    const raw = await res.text();
    const clean = raw.replace(/\u00a0/g, ' ').trim();
    const json = JSON.parse(clean);

    return { props: { data: json.data ?? null } };
  } catch (e) {
    console.error("ERROR:", e);
    return { props: { data: null } };
  }
}
