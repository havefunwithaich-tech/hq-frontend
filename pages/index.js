import Head from 'next/head';
import StaffSection from '../components/StaffSection';

const GET_HOME_DATA = `{
  posts(first: 3, where: { orderby: { field: DATE, order: DESC }, status: PUBLISH }) {
    nodes { title slug date content }
  }
}`;

const createSnippet = (html, length = 100) => {
  if (!html) return "";
  let text = html.replace(/<[^>]+>/g, '');
  text = text.replace(/&#8230;/g, '...');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/\s+/g, ' ').trim();
  return text.length > length ? text.substring(0, length) + '...' : text;
};

const parseTitle = (rawTitle) => {
  let title = rawTitle;
  let isRecommended = title.includes('(SSS)') || title.includes('[SSS]');
  return { cleanTitle: title.trim(), isRecommended };
};

const LaunchBanner = () => (
  <section className="launch-banner-section">
    <a href="https://www.havefunwithaich.com/articles/launch-greeting" className="launch-banner-link">
      <span className="banner-emoji">🚀</span> MAJOR ANNOUNCEMENT: Official Site Relaunch & New Content Policy (Click to Read)
    </a>
  </section>
);

const NotificationSection = ({ latestPosts }) => {
  return (
    <section className="news-section">
      <div className="layout-container center-layout">
        <div className="center-header">
          <div className="header-block philosophy-block">
            <h2 className="center-title">PHILOSOPHY</h2>
            <p className="center-desc">
              <strong>havefunwithAIch</strong> is a laboratory for Human-AI symbiosis.<br/>
              Don't just read. <span style={{ color: '#00ccff' }}>Seed your mind.</span>
            </p>
          </div>
          <div style={{ height: '20px' }}></div>
          <div className="header-block ranking-block">
            <h2 className="center-title">CONTENT RANKING SYSTEM</h2>
            <ul className="center-legend-list">
              <li className="legend-item">
                <h3><span className="badge-sample sss">SSS</span></h3>
                <div className="legend-info">
                  <span className="legend-head">PUBLICATION LEVEL: </span>
                  <span className="legend-sub">Definitive guides worthy of publication.</span>
                </div>
              </li>
              <li className="legend-item">
                <h3><span className="badge-sample ss">SS</span></h3>
                <div className="legend-info">
                  <span className="legend-head">WORLD UNIQUE: </span>
                  <span className="legend-sub">Methodologies found nowhere else.</span>
                </div>
              </li>
              <li className="legend-item">
                <h3><span className="badge-sample s">S</span></h3>
                <div className="legend-info">
                  <span className="legend-head">INDUSTRY ELITE: </span>
                  <span className="legend-sub">Rare knowledge even among professionals.</span>
                </div>
              </li>
              <li className="legend-item">
                <h3><span className="badge-sample a">A</span></h3>
                <div className="legend-info">
                  <span className="legend-head">EXPERT ONLY: </span>
                  <span className="legend-sub">Specialized data not for the general public.</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div style={{ height: '20px' }}></div>
        <div className="center-main">
          <h2 className="section-title">RECENT NEWS & UPDATES</h2>
          <div className="articles-list center-list">
            
            <article className="news-card fixed-card">
              <div className="card-badge">HQ REPORT</div>
              <div className="card-content center-content">
                <span className="news-date">DEC 18, 2025</span>
                <h3 className="news-title">
                  <a href="https://www.havefunwithaich.com/release-note-havefunwithaich-v1-1">
                    Release Note havefunwithAIch v1.1 [S]
                  </a>
                </h3>
                <p className="news-excerpt">An architectural convergence of legacy and HQ systems.</p>
                <a href="https://www.havefunwithaich.com/release-note-havefunwithaich-v1-1" className="read-more center-read-more">Read Report &rarr;</a>
              </div>
            </article>

            {latestPosts?.map((post) => {
              const { cleanTitle, isRecommended } = parseTitle(post.title);
              const mainUrl = `https://www.havefunwithaich.com/articles/${post.slug}`;
              return (
                <article className={`news-card ${isRecommended ? 'gold-card' : ''}`} key={post.slug}>
                  {isRecommended && <div className="card-badge badge-recommend">RECOMMENDED!!</div>}
                  <div className="card-content center-content">
                    <span className="news-date">{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase()}</span>
                    <h3 className="news-title"><a href={mainUrl}>{cleanTitle}</a></h3>
                    <p className="news-excerpt">{createSnippet(post.content, 100)}</p>
                    <a href={mainUrl} className="read-more center-read-more">Read Article &rarr;</a>
                  </div>
                </article>
              );
            })}

            <article className="news-card fixed-card">
              <div className="card-badge">HQ REPORT</div>
              <div className="card-content center-content">
                <span className="news-date">DEC 11, 2025</span>
                <h3 className="news-title">
                  <a href="https://www.havefunwithaich.com/site-built-in-2-weeks">
                    SITE FULLY BUILT IN 2 WEEKS BY AI + HUMAN [SS]
                  </a>
                </h3>
                <p className="news-excerpt">Detailed technical report on how we built this platform in 14 days.</p>
                <a href="https://www.havefunwithaich.com/articles/site-built-in-2-weeks" className="read-more center-read-more">Read Report &rarr;</a>
              </div>
            </article>
          </div>
        </div>
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
        html, body { background-color: #000; color: #fff; font-family: 'Helvetica Neue', Arial, sans-serif; min-height: 100vh; overflow-x: hidden; }
        a { text-decoration: none; color: inherit; }
      `}</style>
      <LaunchBanner />
      <section className="hero-section">
        <div className="hero-bg">
          <img src="/images/top-hero.jpg" alt="Hero" className="hero-img" />
        </div>
        <div className="hero-overlay"></div>
        <div className="hero-content-wrapper">
          <div className="hero-frame">
            <h1 className="hero-title">havefunwithAIch v1.1</h1>
            <p className="hero-subtitle">FORGING THE UNBREAKABLE CHARACTER</p>
          </div>
        </div>
      </section>
      <NotificationSection latestPosts={latestPosts} />
      <StaffSection />
      <footer className="site-footer">
        <div className="footer-links">
          <a href="/about" className="footer-link">About This Site</a>
          <span className="separator">|</span>
          <a href="/privacy-policy" className="footer-link">Privacy Policy</a>
          <span className="separator">|</span>
          <a href="/legal/commercial-transactions" className="footer-link">Specified Commercial Transactions Act</a>
        </div>
      </footer>
      <style jsx>{`
        .main-container { background-color: #000; color: #fff; }
        .hero-section { position: relative; width: 100%; height: min(100vh, 720px); min-height: 500px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .hero-bg { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 0; }
        .hero-img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .hero-overlay { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.85) 100%); z-index: 1; }
        .hero-content-wrapper { position: relative; z-index: 10; width: 100%; display: flex; justify-content: center; }
        .hero-frame { border: 3px solid rgba(255, 255, 255, 0.8); padding: 40px 60px; text-align: center; background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(5px); max-width: 800px; width: 90%; }
        .hero-title { font-size: 3.5rem; margin: 0; font-weight: 800; color: #fff; text-shadow: 0 4px 10px rgba(0,0,0,0.8); }
        .hero-subtitle { font-size: 1.2rem; margin-top: 20px; color: #ddd; letter-spacing: 0.2em; }
        @media (max-width: 768px) { 
          .hero-title { font-size: 1.6rem; word-break: break-word; } 
          .hero-subtitle { font-size: 0.8rem; margin-top: 10px; letter-spacing: 0.1em; }
          .hero-frame { padding: 20px 10px; width: 95%; } 
        }
        .news-section { background-color: #000; padding: 80px 0; border-bottom: 1px solid #222; }
        .center-layout { width: 100%; max-width: 800px; margin: 0 auto; padding: 0 20px; text-align: center; display: flex; flex-direction: column; align-items: center; }
        .header-block { margin-bottom: 80px; }
        .center-title { font-size: 0.9rem; letter-spacing: 0.2em; color: #666; border-bottom: 1px solid #333; padding-bottom: 15px; margin-bottom: 25px; text-transform: uppercase; display: inline-block; }
        .center-desc { color: #aaa; line-height: 1.8; font-size: 1rem; }
        .center-legend-list { list-style: none; padding: 0; display: inline-flex; flex-direction: column; gap: 25px; text-align: left; }
        .legend-item { display: flex; align-items: center; gap: 15px; }
        .badge-sample { font-size: 0.7rem; font-weight: 800; padding: 4px 10px; border-radius: 4px; color: #000; min-width: 45px; text-align: center; }
        .sss { background: #FFD700; border: 1px solid #fff; box-shadow: 0 0 5px rgba(255, 215, 0, 0.5); }
        .ss { background: #C0C0C0; } .s { background: #cd7f32; } .a { background: #00ccff; }
        .legend-info { display: flex; flex-direction: column; }
        .legend-head { font-size: 0.8rem; font-weight: bold; color: #ccc; letter-spacing: 0.05em; }
        .legend-sub { font-size: 0.75rem; color: #888; }
        .section-title { font-size: 1.8rem; margin-bottom: 40px; letter-spacing: 0.1em; border-bottom: 1px solid #333; padding-bottom: 15px; color: #fff; display: inline-block; }
        .articles-list { display: flex; flex-direction: column; gap: 30px; width: 100%; }
        .news-card { background-color: #222; border: 1px solid #444; border-radius: 12px; overflow: hidden; position: relative; transition: transform 0.2s ease; text-align: center; }
        .news-card:hover { background-color: #2a2a2a; border-color: #666; transform: translateY(-5px); }
        .gold-card { border: 2px solid #FFD700 !important; box-shadow: 0 0 15px rgba(255, 215, 0, 0.15); }
        .card-badge { position: absolute; top: 15px; right: 15px; background: #00ccff; color: #000; font-size: 0.75rem; font-weight: 800; padding: 6px 12px; border-radius: 4px; z-index: 100; }
        .badge-red { background: #ff4444; color: #fff; }
        .badge-recommend { background-color: #FFD700 !important; color: #000 !important; border: 2px solid #fff !important; animation: flash 2s infinite; z-index: 101 !important; }
        @keyframes flash { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.9; transform: scale(1.05); } }
        .card-content { padding: 30px; display: flex; flex-direction: column; align-items: center; }
        .news-date { font-size: 0.85rem; color: #888; margin-bottom: 10px; font-weight: bold; }
        .news-title { font-size: 1.5rem; margin-bottom: 15px; line-height: 1.3; }
        .news-title a:hover { color: #00ccff; text-decoration: underline; }
        .news-excerpt { font-size: 1rem; color: #ccc; line-height: 1.6; margin-bottom: 25px; }
        .read-more { font-size: 0.9rem; font-weight: bold; color: #00ccff; text-transform: uppercase; }
        .launch-banner-section { background-color: #00ccff; text-align: center; padding: 12px 20px; }
        .launch-banner-link { color: #000; font-weight: bold; }
        .site-footer { padding: 40px 20px; background: #080808; text-align: center; border-top: 1px solid #222; }
        .footer-links { display: flex; justify-content: center; gap: 15px; flex-wrap: wrap; }
        .footer-link { color: #666; font-size: 0.9rem; }
      `}</style>
    </div>
  );
}

export async function getServerSideProps() {
  const endpoint = 'https://www.havefunwithaich.com/graphql';
  if (!endpoint) return { props: { data: null } };
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': 'Next.js-Client' 
      },
      body: JSON.stringify({ query: GET_HOME_DATA })
    });
    const raw = await res.text();
    const clean = raw.replace(/\u00a0/g, ' ').trim();
    const json = JSON.parse(clean);
    return { props: { data: json.data ?? null } };
  } catch (e) { return { props: { data: null } }; }
}