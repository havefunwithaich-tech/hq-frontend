// pages/videos/index.js

import { GraphQLClient, gql } from 'graphql-request';
import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
// import Image from 'next/image'; // 不要なので削除

// ===============================================
// Constants & Config
// ===============================================
// const IMAGE_BASE_URL... // WebPサーバー設定を削除

const FETCH_BATCH_SIZE = 100;
const DISPLAY_BATCH_SIZE = 9;
const HOUSE_AD_INTERVAL = 5;

const AD_PATHS = {
  header: '/23326444898/Header_Below',
  shorts: '/23326444898/Shorts_First_Item',
  long: '/23326444898/Long_First_Item'
};

const FALLBACK_CONFIG = {
  imageUrl: 'https://hq.havefunwithaich.com/site_ad.png',
  targetUrl: 'https://hq.havefunwithaich.com/',
  altText: 'Check out our contents'
};

// ===============================================
// Helpers
// ===============================================
const processData = (nodes) => {
  const now = new Date();
  return nodes.map(node => {
    const postDate = new Date(node.date);
    const isFeatured = postDate > now;
    const img = node?.featuredImage?.node;

    // ★WebP変換ロジックを完全撤廃。WordPressの元画像をそのまま使う。
    return {
      ...node,
      isFeatured,
      mapped: {
        thumbnail: img?.sourceUrl || null, // ここがシンプルになります
        alt: img?.altText || node.title,
        width: img?.mediaDetails?.width || 0,
        height: img?.mediaDetails?.height || 0
      }
    };
  });
};

// ===============================================
// GraphQL
// ===============================================
const GET_VIDEO_LIST = gql`
  query GetVideoList($first: Int!, $after: String) {
    portfolios(
      first: $first,
      after: $after,
      where: {
        orderby: { field: DATE, order: DESC },
        stati: [PUBLISH, FUTURE]
      }
    ) {
      pageInfo {
        endCursor
        hasNextPage
      }
      nodes {
        title
        slug
        date
        featuredImage {
          node {
            sourceUrl
            altText
            mediaDetails {
              width
              height
            }
          }
        }
      }
    }
  }
`;

// ===============================================
// Components
// ===============================================

// AdSlot (変更なし)
const AdSlotComponent = ({ divId, adUnitPath, disableFallback = false }) => {
  const [slotDisplay, setSlotDisplay] = useState('block');

  useEffect(() => {
    if (typeof window.googletag === 'undefined' || !window.googletag.cmd) return;

    window.googletag.cmd.push(function() {
      const existingSlot = window.googletag.pubads().getSlots().find(s => s.getSlotElementId() === divId);
      if(existingSlot) window.googletag.destroySlots([existingSlot]);

      const sizes = adUnitPath === AD_PATHS.header
        ? [[728, 90], [300, 250], 'fluid']
        : [[300, 250], 'fluid'];

      const adSlot = window.googletag.defineSlot(adUnitPath, sizes, divId);

      if (adSlot) {
        adSlot.addService(window.googletag.pubads());
        const renderListener = (event) => {
          if (event.slot === adSlot) {
              setSlotDisplay(event.isEmpty ? 'none' : 'block');
          }
        };
        window.googletag.pubads().addEventListener('slotRenderEnded', renderListener);
        window.googletag.display(divId);
      }
    });
  }, [divId, adUnitPath]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      { !disableFallback && (
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000'
      }}>
        <a href={FALLBACK_CONFIG.targetUrl} target="_blank" rel="noopener noreferrer" style={{display:'block', width:'100%', height:'100%'}}>
           {/* 標準のimgタグに戻す */}
           <img
             src={FALLBACK_CONFIG.imageUrl}
             alt={FALLBACK_CONFIG.altText}
             style={{width:'100%', height:'100%', objectFit:'cover', display:'block', border:'none'}}
           />
        </a>
      </div>
      )}
      <div id={divId} style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        zIndex: 2, display: slotDisplay
      }}></div>
    </div>
  );
};

const DynamicAdSlot = dynamic(() => Promise.resolve(AdSlotComponent), { ssr: false });

// Video Card
const VideoCard = ({ video, isLandscape }) => {
  const linkPath = `/videos/${video.slug}`;
  const titleColor = isLandscape ? "#ffcc00" : "#66cfff";
  
  // 単純なimgタグなのでState管理は不要
  const imgSrc = video.mapped.thumbnail;

  if (!imgSrc) return null;

  return (
    <Link href={linkPath} legacyBehavior>
      <a style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
        <li style={{
          display: "flex", flexDirection: "column", height: '100%',
          border: video.isFeatured ? "1px solid #ffcc00" : "1px solid #333",
          borderRadius: "8px", overflow: "hidden", background: "#000",
          boxShadow: video.isFeatured ? "0 0 15px rgba(255, 204, 0, 0.2)" : "0 4px 6px rgba(0,0,0,0.3)",
        }}>
          <div style={{ position: "relative", width: "100%", paddingTop: isLandscape ? '56.25%' : '177.77%', background: '#000' }}>
            {/* ★ここを標準のimgタグに戻す。loading="lazy"だけで十分高速 */}
            <img
              src={imgSrc}
              alt={video.mapped.alt}
              loading="lazy"
              style={{
                position: 'absolute', 
                top: 0, 
                left: 0, 
                width: "100%", 
                height: "100%", 
                objectFit: "cover", 
                display: "block"
              }}
            />
            
            <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'48px', height:'48px', borderRadius:'50%', background:'rgba(0,0,0,0.6)', border:'2px solid #fff' }}>
              <span style={{ display:'block', margin:'14px 0 0 16px', borderTop:'8px solid transparent', borderBottom:'8px solid transparent', borderLeft:'14px solid #fff' }}></span>
            </div>
          </div>

          <div style={{ padding: "10px 12px", background: "#111", borderTop: "1px solid #222", flexShrink: 0 }}>
            <h3 style={{ margin: 0, fontSize: "0.85rem", color: titleColor, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", fontWeight: 'normal' }}>
              {video.isFeatured && <span style={{ marginRight: "6px", color: "#ffcc00" }}>★</span>}
              {video.title}
            </h3>
          </div>
        </li>
      </a>
    </Link>
  );
};

// House Ad Card
const HouseAdCard = ({ isLandscape }) => {
    const adPaddingTop = isLandscape ? '56.25%' : '177.77%';
    const scaleFactor = '115%';
    let imageWrapperStyle = isLandscape ? {
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        display: 'flex', justifyContent: 'center', alignItems: 'center'
    } : {
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        display: 'block'
    };

    return (
        <li style={{
            display: "flex", flexDirection: "column", height: '100%',
            position: 'relative',
            border: "1px solid #333", borderRadius: "8px", overflow: "hidden",
            backgroundColor: '#000', boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
            justifyContent: "center", alignItems: "center"
        }}>
            <div style={{ position: "relative", width: "100%", paddingTop: adPaddingTop, background: '#000', flexGrow: 1 }}>
                <div style={imageWrapperStyle}>
                    {/* ここも標準imgタグ */}
                    <img
                        src={FALLBACK_CONFIG.imageUrl}
                        alt={FALLBACK_CONFIG.altText}
                        loading="lazy"
                        style={{
                            maxWidth: isLandscape ? scaleFactor : '100%',
                            maxHeight: isLandscape ? scaleFactor : '100%',
                            width: isLandscape ? 'auto' : '100%',
                            height: isLandscape ? 'auto' : '100%',
                            objectFit: 'contain',
                            display: 'block',
                            border: 'none',
                        }}
                    />
                </div>
            </div>
            <div style={{ padding: "10px 12px", background: "#111", borderTop: "1px solid #222", flexShrink: 0 }}>
                <h3 style={{ margin: 0, fontSize: "0.85rem", color: '#fff', textAlign: 'center', fontWeight: 'normal' }}>
                    {FALLBACK_CONFIG.altText}
                </h3>
            </div>
        </li>
    );
};

// GAM Ad Card
const AdCard = ({ type }) => {
  const adUnit = type === 'land' ? AD_PATHS.long : AD_PATHS.shorts;
  const divId = `div-gpt-ad-${type}-first`;
  return (
    <li style={{
      display: "flex", flexDirection: "column", height: '100%',
      position: 'relative',
      border: "1px solid #333", borderRadius: "8px", overflow: "hidden",
      backgroundColor: '#000', boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
      justifyContent: "center", alignItems: "center"
    }}>
      <div style={{ width: '100%', height: '100%', minHeight: '250px', position: 'relative' }}>
        <DynamicAdSlot divId={divId} adUnitPath={adUnit} disableFallback={true} />
      </div>
    </li>
  );
};

// Grid System
const VideoGrid = ({ items, isLandscape }) => {
    const listItems = useMemo(() => {
        const result = [];
        let adCount = 0;
        result.push(<AdCard key={`gam-ad-first`} type={isLandscape ? 'land' : 'vert'} />);

        items.forEach((video, idx) => {
            result.push(<VideoCard key={`video-${video.slug}-${idx}`} video={video} isLandscape={isLandscape} />);
            if ((idx + 1) % HOUSE_AD_INTERVAL === 0 && (idx + 1) < items.length) {
                result.push(<HouseAdCard key={`house-ad-${adCount}`} isLandscape={isLandscape} />);
                adCount++;
            }
        });
        return result;
    }, [items, isLandscape]);

  // ★ここだけは最新の修正（モバイル2列化）を維持
  const minWidth = isLandscape ? "280px" : "150px"; 
  const gapSize = "12px"; 

  return (
    <ul style={{
      listStyle: "none", 
      padding: 0, 
      display: "grid",
      gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}, 1fr))`,
      gap: gapSize, 
      maxWidth: "1200px", 
      margin: "0 auto"
    }}>
      {listItems}
    </ul>
  );
};

// Load More
const LoadMoreButton = ({ onClick, label, loading }) => (
  <div style={{ textAlign: "center", margin: "30px 0" }}>
    <button onClick={onClick} disabled={loading} style={{
      padding: "10px 30px", fontSize: "0.9rem", background: "#222", color: "#fff",
      border: "1px solid #444", borderRadius: "30px", cursor: loading ? "wait" : "pointer", opacity: loading ? 0.7 : 1
    }}>
      {loading ? "Loading..." : label}
    </button>
  </div>
);

// ===============================================
// Main Page Component
// ===============================================
export default function VideoListPage({ initialVideos, initialPageInfo, endpoint }) {
  useEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    if (typeof window.googletag !== 'undefined' && window.googletag.cmd) {
      window.googletag.cmd.push(function() {
        window.googletag.pubads().enableSingleRequest();
        window.googletag.pubads().collapseEmptyDivs();
        window.googletag.enableServices();
      });
    }
  }, []);

  const initPools = (videos) => {
    const v = [];
    const l = [];
    videos.forEach(item => {
      const isL = item.mapped.width >= item.mapped.height;
      if (isL) l.push(item); else v.push(item);
    });
    return { v, l };
  };

  const [pools, setPools] = useState(() => initPools(initialVideos));
  const [vertDisplayCount, setVertDisplayCount] = useState(DISPLAY_BATCH_SIZE);
  const [landDisplayCount, setLandDisplayCount] = useState(DISPLAY_BATCH_SIZE);
  const [pageInfo, setPageInfo] = useState(initialPageInfo);
  const [loading, setLoading] = useState(false);

  const fetchMoreFromServer = async () => {
    if (!pageInfo.hasNextPage) return;
    setLoading(true);
    try {
      const client = new GraphQLClient(endpoint);
      const data = await client.request(GET_VIDEO_LIST, {
        first: FETCH_BATCH_SIZE, after: pageInfo.endCursor
      });
      const newProcessed = processData(data.portfolios.nodes);
      const { v, l } = initPools(newProcessed);
      setPools(prev => ({ v: [...prev.v, ...v], l: [...prev.l, ...l] }));
      setPageInfo(data.portfolios.pageInfo);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const loadMoreShorts = async () => {
    const nextCount = vertDisplayCount + DISPLAY_BATCH_SIZE;
    setVertDisplayCount(nextCount);
    if (pools.v.length <= nextCount + 4 && pageInfo.hasNextPage) await fetchMoreFromServer();
  };

  const loadMoreLandscape = async () => {
    const nextCount = landDisplayCount + DISPLAY_BATCH_SIZE;
    setLandDisplayCount(nextCount);
    if (pools.l.length <= nextCount + 4 && pageInfo.hasNextPage) await fetchMoreFromServer();
  };

  const visibleVertical = pools.v.slice(0, vertDisplayCount);
  const visibleLandscape = pools.l.slice(0, landDisplayCount);
  const showShortsBtn = (pools.v.length > vertDisplayCount) || pageInfo.hasNextPage;
  const showLandscapeBtn = (pools.l.length > landDisplayCount) || pageInfo.hasNextPage;

  return (
    <div style={{ padding: '10px 10px 40px', color: '#fff', fontFamily: 'sans-serif', minHeight: '100vh' }}>
      <h1 style={{ textAlign: "center", marginTop: '0', marginBottom: '10px' }}>HQ Portfolio</h1>

      <div style={{textAlign:'center', marginBottom: '20px', minHeight: '90px', position:'relative', maxWidth:'1200px', margin:'0 auto 20px'}}>
        <DynamicAdSlot divId="div-gpt-ad-header-below" adUnitPath={AD_PATHS.header} />
      </div>

      <section style={{ marginBottom: '60px' }}>
        <h2 style={{ textAlign: 'center', borderBottom: '1px solid #444', paddingBottom: '10px', color: '#66cfff', margin: '0 auto 30px', maxWidth: '1200px' }}>Portrait / Shorts</h2>
        <VideoGrid items={visibleVertical} isLandscape={false} />
        {showShortsBtn && <LoadMoreButton onClick={loadMoreShorts} label="Load More Shorts" loading={loading} />}
      </section>

      <section style={{ marginBottom: '60px' }}>
        <h2 style={{ textAlign: 'center', borderBottom: '1px solid #444', paddingBottom: '10px', color: '#ffcc00', margin: '0 auto 30px', maxWidth: '1200px' }}>Landscape / Cinematic</h2>
        <VideoGrid items={visibleLandscape} isLandscape={true} />
        {showLandscapeBtn && <LoadMoreButton onClick={loadMoreLandscape} label="Load More Videos" loading={loading} />}
      </section>
    </div>
  );
}

// ===============================================
// SSG
// ===============================================
export async function getStaticProps() {
  const endpoint = process.env.WORDPRESS_GRAPHQL_ENDPOINT;
  const client = new GraphQLClient(endpoint);
  try {
    const data = await client.request(GET_VIDEO_LIST, {
      first: FETCH_BATCH_SIZE,
      after: null
    });
    const processedNodes = processData(data.portfolios.nodes);
    return {
      props: {
        initialVideos: processedNodes,
        initialPageInfo: data.portfolios.pageInfo,
        endpoint
      },
      revalidate: 60
    };
  } catch (err) {
    console.error("GQL fetch error in /videos:", err);
    // endpointを渡す代わりに、その値（文字列）自体を渡すか、
    // あるいは undefined を null に置き換えます。
    const safeEndpoint = endpoint || null; 

    return { 
        props: { 
            initialVideos: [], 
            initialPageInfo: { hasNextPage: false, endCursor: null }, // 安全な初期値
            endpoint: safeEndpoint 
        } 
    };
  }
}
