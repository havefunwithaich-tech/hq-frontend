// hq-frontend/pages/_app.js

import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Script from 'next/script'
import Layout from '../components/Layout' // 👈 修正: Layout コンポーネントをインポート

// グローバルCSSがあればインポート
// import '../styles/globals.css' 

function MyApp({ Component, pageProps }) {
  const router = useRouter()

  // 1. GA4: ページ遷移時の計測を処理 (SPA対応)
  useEffect(() => {
    const handleRouteChange = (url) => {
      // ページ遷移が完了するたびに、新しいURLでGAに通知
      window.gtag('config', 'G-PG1S76T9QW', {
        page_path: url,
      })
    }
    router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events])


  return (
    // 2. Layoutでサイト全体を囲む
    <Layout>
      
      {/* --- GA4 スクリプト本体 --- */}
      <Script
        strategy="afterInteractive"
        src="https://www.googletagmanager.com/gtag/js?id=G-PG1S76T9QW"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-PG1S76T9QW', {
            // 初期ロード時のページパスを設定
            page_path: window.location.pathname, 
          });
        `}
      </Script>
      {/* --------------------------- */}
      
      <Component {...pageProps} />
    </Layout>
  )
}

export default MyApp