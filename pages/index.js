import Head from 'next/head';
import StaffSection from '../components/StaffSection';
import Link from 'next/link';

// GraphQLクエリ: 最新記事を3件取得（多すぎるとレイアウトが崩れるので調整可能）
const GET_HOME_DATA = `{ 
  posts(first: 3, where: { orderby: { field: DATE, order: DESC }, stati: [PUBLISH] }) { 
    nodes { title slug date excerpt } 
  } 
}`;

// HTMLタグ除去 ＆ 文字実体参照の簡易デコード
const stripHtml = (html) => {
  if (!html) return "";
  let text = html.replace(/<[^>]+>/g, ''); 
  text = text.replace(/&#8230;/g, '...');   
  text = text.replace(/&amp;/g, '&');       
  return text.trim();
};

const LaunchBanner = () => (
  <section className="launch-banner-section">
    <Link href="/articles/launch-greeting" className="launch-banner-link">
      <span className="banner-emoji">🚀</span> MAJOR ANNOUNCEMENT: Official Site Relaunch & New Content Policy (Click to Read)
    </Link>
  </section>
);

const NotificationSection = ({ latestPosts }) => {
  return (
    <section className="news-container">
      <h2 className="section-title">RECENT NEWS & UPDATES</h2>

      {/* グリッドコンテナ */}
      <div className="articles-grid">
        
        {/* === CARD 1: 固定記事 (HQ REPORT) === */}
        <article className="news-card fixed-card">
          <div className="card-badge">HQ REPORT</div>
          <div className="card-content">
            <span className="news-date">DEC 11, 2025</span>
            <h3 className="news-title">
              <Link href="/site-built-in-2-weeks">
                SITE FULLY BUILT IN 2 WEEKS BY AI + HUMAN
              </Link>
            </h3>
            <p className="news-excerpt">
              Detailed technical report on how we built this entire platform in just 14 days using AI-human collaboration. Discover the stack and philosophy behind the speed.
            </p>
            <span className="read-more">Read Report &rarr;</span>
          </div>
        </article>

        {/* === CARD 2: WordPress最新記事 (Loop) === */}
        {latestPosts?.map((post) => (
          <article className="news-card" key={post.slug}>
            <div className="card-content">
              <span className="news-date">
                {new Date(post.date)
                  .toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
                  .toUpperCase()}
              </span>
              <h3 className="news-title">
                <Link href={`/articles/${post.slug}`}>
                  {post.title}
                </Link>
              </h3>
              <p className="news-excerpt">
                {stripHtml(post.excerpt)}
              </p>
              <span className="read-more">Read Article &rarr;</span>
            </div>
          </article>
        ))}

        {/* === CARD 3: 固定記事 (POLICY) === */}
        <article className="news-card policy-card">
          <div className="card-badge badge-red">IMPORTANT</div>
          <div className="card-content">
            <span className="news-date">DEC 02, 2025</span>
            <h3 className="news-title">
              <Link href="/veil">
                [POLICY] Articles Now Exclusive for Members
              </Link>
            </h3>
            <p className="news-excerpt">
              Important update regarding our content access policy. Some in-depth articles are now exclusive to Veil members.
            </p>
            <span className="read-more">Check Policy &rarr;</span>
          </div>
        </article>

      </div>
    </section>
  );
};

export default function Home({ data }) {
  const latestPosts = data?.posts?.nodes || null;

  return (
    <div className="main-container">
      <Head>
        <title>havefunwithAIch | Bridging Humanity and AI</title>
        <meta name="description" content="Official site of havefunwithAIch." />
      </Head>

      <style jsx global>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body {
          background-color: #000;
          color: #fff;
          font-family: 'Helvetica Neue', Arial, sans-serif; /* フォントを少し洗練 */
          min-height: 100vh;
          overflow-x: hidden;
          text-align: left;
        }
        a { text-decoration: none; color: inherit; }
      `}</style>

      <LaunchBanner />

      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-bg">
          <img src="/images/top-hero.jpg" alt="Hero" className="hero-img" />
        </div>
        <div className="hero-overlay"></div>
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
          <Link href="/legal/commercial-transactions" className="footer-link">Specified Commercial Transactions Act</Link>
        </div>
      </footer>

      {/* === CSS (ここを強化しました) === */}
      <style jsx>{`
        .main-container { background-color: #000; color: #fff; }

        /* HERO Styles */
        .hero-section {
          position: relative;
          overflow: visible;
          width: 100%;
          height: min(100vh, 720px);
          min-height: 500px;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden;
        }
        .hero-bg { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 0; }
        .hero-img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .hero-overlay {
          height: 100%;
          position: absolute; inset: 0;
          background: linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.85) 100%);
          z-index: 1;
        }
        .hero-content-wrapper { position: relative; z-index: 10; width: 100%; display: flex; justify-content: center; }
        .hero-frame {
          border: 3px solid rgba(255, 255, 255, 0.8);
          padding: 40px 60px; text-align: center;
          background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(5px);
          max-width: 800px; width: 90%;
        }
        .hero-title { font-size: 3.5rem; margin: 0; font-weight: 800; color: #fff; text-shadow: 0 4px 10px rgba(0,0,0,0.8); }
        .hero-subtitle { font-size: 1.2rem; margin-top: 20px; color: #ddd; letter-spacing: 0.2em; }
        @media (max-width: 768px) {
          .hero-title { font-size: 2rem; }
          .hero-frame { padding: 30px 20px; }
        }

        /* ====================== */
        /* カードデザイン (強化版) */
        /* ====================== */

        .news-container {
          position: relative;
          z-index: 5;          
         max-width: 1200px;
          margin: 0 auto;
          padding: 60px 20px;
          background-color: #000;
        }

        .section-title {
          font-size: 1.8rem;
          margin-bottom: 40px;
          letter-spacing: 0.1em;
          border-bottom: 1px solid #333;
          padding-bottom: 10px;
          color: #fff;
        }

        .articles-grid {
          display: grid;
          /* ここ重要: 320px以上のカードを敷き詰める */
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
         gap: 30px;
          width: 100%;
        }

        .news-card {
          /* 背景色を明るくして見えるようにする */
          background-color: #222; 
          border: 1px solid #444;
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          position: relative;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          
          /* グリッドが効かない場合の保険（スマホなど） */
          margin-bottom: 0; 
        }

        .news-card:hover {
           background-color: #2a2a2a;
           border-color: #666;
           transform: translateY(-5px);
        }

        /* バッジ（飾り） */
        .card-badge {
          position: absolute;
          top: 15px; right: 15px;
          background: #00ccff; color: #000;
          font-size: 0.7rem; font-weight: bold;
          padding: 4px 8px; border-radius: 4px;
          z-index: 2;
        }
        .badge-red { background: #ff4444; color: #fff; }

        .card-content {
          padding: 25px;
          display: flex; flex-direction: column;
          height: 100%;
        }

        .news-date {
          font-size: 0.8rem; color: #888;
          margin-bottom: 10px; font-weight: bold; letter-spacing: 1px;
        }

        .news-title {
          font-size: 1.3rem; margin: 0 0 15px 0;
          line-height: 1.4; color: #fff;
        }
        
        .news-title :global(a:hover) {
          color: #00ccff;
          text-decoration: underline;
        }

        .news-excerpt {
          font-size: 0.95rem; color: #ccc;
          line-height: 1.6; margin-bottom: 25px;
          flex-grow: 1;
          
          /* 3行で省略 */
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .read-more {
          font-size: 0.9rem; font-weight: bold;
          color: #00ccff; text-transform: uppercase;
          letter-spacing: 1px; margin-top: auto;
          display: inline-flex; align-items: center;
        }
        
        /* カードの種類による微調整 */
        .fixed-card { border-left: 4px solid #00ccff; }
        .policy-card { border-left: 4px solid #ff4444; }

        /* FOOTER & BANNER */
        .site-footer { padding: 40px 20px; background: #080808; text-align: center; border-top: 1px solid #222; margin-top: 60px; }
        .footer-links { display: flex; justify-content: center; gap: 15px; flex-wrap: wrap; }
        .footer-link { color: #666; font-size: 0.9rem; }
        .footer-link:hover { color: #fff; }
        .separator { color: #444; }

        .launch-banner-section { background-color: #00ccff; text-align: center; padding: 12px 20px; }
        .launch-banner-link { color: #000; font-weight: bold; font-size: 1rem; }
        .banner-emoji { margin-right: 10px; }
      `}</style>
    </div>
  );
}

export async function getServerSideProps() {
  const endpoint = process.env.WORDPRESS_GRAPHQL_ENDPOINT;
  if (!endpoint) return { props: { data: null } };
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