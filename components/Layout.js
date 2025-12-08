import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

// ★設定: ここにご自身の測定IDを入れてください
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
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Failed to parse user", err);
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoadingUser(false);
  };

  useEffect(() => {
    checkUser();
  }, [router.pathname]);

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
        <script>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
              send_page_view: true
            });
          `}
        </script>

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

      <header className="site-header">
        <div className="layout-container header-inner">
          <div className="header-left">
            <h1 className="site-logo">
              <Link href="/" className="logo-link">
                HQ.havefunwithAIch
              </Link>
            </h1>
            <nav className="main-nav">
              <Link href="/" className="nav-link">HOME</Link>
              <Link href="/videos" className="nav-link">VIDEOS</Link>
              <Link href="/articles" className="nav-link">ARTICLES</Link>
            </nav>
          </div>

          <div className="header-right">
            {loadingUser ? (
              null
            ) : user ? (
              <div className="logged-in-area">
                <span className="welcome-msg">Welcome, {user.username}</span>
                <button onClick={handleLogout} className="btn btn-login">
                  Logout
                </button>
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
        <div className="layout-container" style={{ color: '#fff' }}>
          © {new Date().getFullYear()} {title}. All rights reserved. | Built with Next.js & WP Headless
        </div>
      </footer>

      <style jsx>{`
        .layout-container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          box-sizing: border-box;
        }

        #site-wrapper {
          background-color: #333333;
          color: #fff;
          font-family: sans-serif;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .site-header {
          background-color: #2a2a2a;
          border-bottom: 1px solid #2a2a2a;
          width: 100%;
        }

        .header-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 15px;
          padding-bottom: 15px;
          flex-wrap: wrap;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 30px;
          flex-wrap: wrap;
        }

        .site-logo {
          margin: 0;
          font-size: clamp(1.2rem, 4vw, 1.5em);
          line-height: 1.2;
        }

        .logo-link {
          color: #66ccff;
          text-decoration: none;
          font-weight: bold;
        }

        .main-nav {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
        }

        .nav-link {
          color: white;
          text-decoration: none;
          font-weight: 500;
          white-space: nowrap;
        }
        .nav-link:hover {
          color: #66ccff;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .logged-in-area {
          display: flex;
          align-items: center;
          gap: 15px;
          width: 100%;
        }

        .welcome-msg {
          color: #fff;
          font-size: 0.9rem;
          flex: 1;
          text-align: right;
          white-space: nowrap;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          padding: 0 16px;
          border-radius: 4px;
          font-size: 0.9rem;
          white-space: nowrap;
          cursor: pointer;
          font-family: inherit;
          box-sizing: border-box;
          transition: background-color 0.2s;
          min-height: 38px;
          line-height: 1;
        }

        button.btn {
          appearance: none;
          -webkit-appearance: none;
          background: transparent;
          border: none;
        }

        .btn-login {
          color: #fff;
          border: 1px solid #666 !important;
          background-color: transparent;
        }
        .btn-login:hover {
          background-color: #444;
        }

        .btn-join {
          background-color: #0070f3;
          color: #fff;
          border: 1px solid #0070f3;
          font-weight: bold;
        }
        .btn-join:hover {
          background-color: #005bb5;
        }

        .main-content {
          flex: 1;
          padding-top: 40px;
          padding-bottom: 40px;
        }

        .site-footer {
          border-top: 1px solid #444;
          padding: 40px 0;
          text-align: center;
          font-size: 0.8em;
          color: #888;
        }

        @media (max-width: 600px) {
          .layout-container {
            padding: 0 10px;
          }

          .header-inner {
            flex-direction: column;
            align-items: flex-start;
            justify-content: flex-start;
            gap: 15px;
          }

          .header-left {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
            width: 100%;
          }

          .main-nav {
            gap: 10px;
            flex-wrap: wrap;
            width: 100%;
          }

          .nav-link {
            white-space: normal;
            font-size: 0.9rem;
            padding: 5px 0;
          }

          .header-right {
            display: flex;
            flex-direction: column;
            gap: 10px;
            width: 100%;
            margin-top: 5px;
          }

          .header-right .btn {
             display: flex;
             width: 100%;
             text-align: center;
             margin-bottom: 10px;
          }

          .header-right .btn:last-child {
             margin-bottom: 0;
          }

          .logged-in-area {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
            width: 100%;
          }

          .welcome-msg {
            margin-bottom: 10px;
            text-align: left;
            width: 100%;
            white-space: normal;
          }

          .logged-in-area button {
             width: 100%;
             margin-bottom: 10px;
          }

          .logged-in-area button:last-child {
            margin-bottom: 0;
          }
        }
      `}</style>
    </div>
  );
}
