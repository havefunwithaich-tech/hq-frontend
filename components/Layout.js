import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

const GA_MEASUREMENT_ID = 'G-PG1S76T9QW';

export default function Layout({ children, title = 'havefunwithAIch Headquarters' }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const handleRouteChange = (url) => {
      if (!window.gtag) return;
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: url,
        page_location: window.location.origin + url,
        page_title: document.title
      });
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  const checkUser = () => {
    const storedUser = localStorage.getItem('hq_user');
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); } catch (err) { setUser(null); }
    } else { setUser(null); }
    setLoadingUser(false);
  };

  useEffect(() => { checkUser(); }, [router.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('hq_token');
    localStorage.removeItem('hq_user');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <div id="site-wrapper">
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}></script>
        <script>{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', { page_path: window.location.pathname, send_page_view: true });
        `}</script>
        <script async src="https://securepubads.g.doubleclick.net/tag/js/gpt.js"></script>
        <script>{`
          window.googletag = window.googletag || {cmd: []};
          googletag.cmd.push(function() { googletag.pubads().enableSingleRequest(); googletag.enableServices(); });
        `}</script>
      </Head>

      <header className="site-header">
        <div className="layout-container header-inner">
          <div className="header-left">
            <h1 className="site-logo">
              <Link href="/" className="logo-link">HQ.havefunwithAIch</Link>
            </h1>
            <nav className="main-nav">
              <Link href="/" className="nav-link">HOME</Link>
              {/* ここをクリックすると /videos/index.js が発動し、最新動画へ即リダイレクトします */}
              <Link href="/videos/portrait/" className="nav-link">Portrait</Link>
              <Link href="/videos/landscape/" className="nav-link">Landscape</Link>
            </nav>
          </div>
          <div className="header-right">
            {loadingUser ? null : user ? (
              <div className="logged-in-area">
                <span className="welcome-msg">Welcome, {user.username}</span>
                <button onClick={handleLogout} className="btn btn-login">Logout</button>
              </div>
            ) : (
              <>
                <Link href="/login" className="btn btn-login">Login</Link>
                <Link href="/join" className="btn btn-join">Join Now</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="layout-container main-content">
        {children}
      </main>

      <footer className="site-footer">
        <div className="layout-container" style={{ color: '#666', fontSize: '0.8rem' }}>
          {/* 技術情報を削除し、シンプルに */}
          © {new Date().getFullYear()} {title}. All rights reserved.
        </div>
      </footer>

      <style jsx global>{`
        body { background-color: #000; color: #fff; margin: 0; font-family: sans-serif; }
        #site-wrapper { display: flex; flex-direction: column; min-height: 100vh; }
        .layout-container { width: 100%; max-width: 1200px; margin: 0 auto; padding: 0 20px; box-sizing: border-box; }
        .site-header { background-color: #1a1a1a; border-bottom: 1px solid #333; width: 100%; flex-shrink: 0; }
        .main-content { flex: 1; width: 100%; background-color: #0e0e0e; padding-top: 40px; padding-bottom: 60px; }
        .news-card { background-color: #1c1c1c !important; border: 1px solid #333 !important; border-radius: 8px; overflow: hidden; transition: transform 0.2s ease; margin-bottom: 20px; }
        .news-card:hover { background-color: #252525 !important; border-color: #666 !important; transform: translateY(-3px); }
        .header-inner { display: flex; align-items: center; justify-content: space-between; padding: 15px 0; }
        .header-left { display: flex; align-items: center; gap: 30px; }
        .site-logo { margin: 0; font-size: 1.5rem; }
        .logo-link { color: #66ccff; text-decoration: none; font-weight: bold; }
        .main-nav { display: flex; gap: 20px; }
        .nav-link { color: #ccc; text-decoration: none; font-weight: 500; transition: color 0.2s; }
        .nav-link:hover { color: #fff; }
        .header-right, .logged-in-area { display: flex; align-items: center; gap: 15px; }
        .btn { display: inline-flex; align-items: center; justify-content: center; text-decoration: none; padding: 8px 16px; border-radius: 4px; font-size: 0.9rem; cursor: pointer; border: none; }
        .btn-login { color: #fff; border: 1px solid #666 !important; background: transparent; }
        .btn-join { background-color: #0070f3; color: #fff; font-weight: bold; }
        .welcome-msg { font-size: 0.9rem; color: #aaa; }
        .site-footer { background-color: #050505; border-top: 1px solid #333; padding: 40px 0; text-align: center; }
        @media (max-width: 768px) { .header-inner { flex-direction: column; gap: 15px; } }
      `}</style>
    </div>
  );
}