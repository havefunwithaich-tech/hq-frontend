// pages/videos/[slug].js

import { GraphQLClient, gql } from "graphql-request";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";

const IMAGE_BASE_URL = "https://hq.havefunwithaich.com/images";

const TIP_LINKS = {
  tier1: { url: "https://buy.stripe.com/dRm5kvaiLaAF1SPeuX4Vy02?locale=en", label: "$1.00", emoji: "💰" },
  tier2: { url: "https://buy.stripe.com/5kQ28j2QjbEJ1SPbiL4Vy03?locale=en", label: "$2.00", emoji: "☕" },
  tier3: { url: "https://buy.stripe.com/5kQcMX3Un249fJFcmP4Vy04?locale=en", label: "I Love You!!!", price: "$5.00", emoji: "❤️" },
};

const AD_UNIT_PATH = "/23326444898/video_detail";
const HQ_ADS_LIST = ["/hq-ads/ad01.mp4", "/hq-ads/ad02.mp4", "/hq-ads/ad03.mp4"];

// ===============================================
// GAM Ad Component (Zero Reset)
// ===============================================
const AdSlotComponent = ({ divId }) => {
  useEffect(() => {
    if (typeof window === "undefined" || !window.googletag) return;

    window.googletag.cmd.push(() => {
      requestAnimationFrame(() => {
        const gpt = window.googletag;
        const pubads = gpt.pubads();

        const existing = pubads.getSlots().find(s => s.getSlotElementId() === divId);
        if (existing) gpt.destroySlots([existing]);

       gpt.defineSlot(AD_UNIT_PATH, [[480, 320], [336, 280], [300, 250]], divId)
   .addService(pubads);

        gpt.enableServices();
        gpt.display(divId);
      });
    });
  }, [divId]);

  return (
    <div className="gam-wrapper-reset">
       {/* ADバッジ */}
       <div className="ad-badge">AD</div>

       {/* GAMスロット本体 */}
       <div id={divId}></div>
       
       {/* ★ここが修正の核心
         :global() を使うことで、Next.jsが管理外とする
         「GAMが後から注入してくるiframe」に対してもスタイルを強制適用します。
       */}
       <style jsx global>{`
         /* コンテナ自体の余白を抹殺 */
         .gam-wrapper-reset {
           width: 480px;
           height: 320px;
           margin: 0 auto;
           position: relative;
           background: transparent;
           /* フレックスや行間による「謎の隙間」を排除 */
           display: block;
           line-height: 0; 
           font-size: 0;
         }

         .ad-badge {
           position: absolute;
           top: 0;
           left: 0;
           background: rgba(0, 0, 0, 0.5);
           color: rgba(255, 255, 255, 0.9);
           font-size: 10px; /* ここだけ文字サイズ復活 */
           line-height: 1.2;
           font-weight: bold;
           padding: 3px 8px;
           z-index: 10;
           pointer-events: none;
         }

         /* ID指定でGAM内部を強制リセット */
         #${divId} {
           width: 480px;
           height: 320px;
           display: block;
           margin: 0;
           padding: 0;
           border: none;
         }

         /* ★最重要: 注入されたiframeの「枠」と「余白」を物理削除 */
         #${divId} > div,
         #${divId} iframe {
           margin: 0 !important;
           padding: 0 !important;
           border: 0 !important;
           outline: none !important;
           vertical-align: top !important; /* ベースラインのズレ防止 */
           display: block !important;
           width: 480px !important;
           height: 320px !important;
         }
       `}</style>
    </div>
  );
};

// プレースホルダー（固定サイズ）
const AdPlaceholder = () => (
  <div style={{ 
      width: "480px", height: "320px",
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "transparent",
      margin: "0 auto"
  }} />
);

const DynamicAdSlot = dynamic(
  () => Promise.resolve(AdSlotComponent), 
  { ssr: false, loading: () => <AdPlaceholder /> }
);

// ===============================================
// HQ Video Ad Component (Rotation Playlist + AD Badge)
// ===============================================
const HQVideoAd = () => { // propsは不要になりました（定数リストを直接使います）
  const [currentIdx, setCurrentIdx] = useState(0);

  // 動画が終わったら次のインデックスへ（最後までいったら0に戻るループ）
  const handleEnded = () => {
    setCurrentIdx((prev) => (prev + 1) % HQ_ADS_LIST.length);
  };

  return (
    <div style={{ 
        width: "100%", 
        height: "100%", 
        position: "relative", 
        background: "#000" 
    }}>
      {/* GAMと同じ左上のADバッジ */}
      <div style={{
           position: "absolute",
           top: 0,
           left: 0,
           background: "rgba(0, 0, 0, 0.5)",
           color: "rgba(255, 255, 255, 0.9)",
           fontSize: "10px",
           fontWeight: "bold",
           padding: "3px 8px",
           zIndex: 10,
           pointerEvents: "none"
      }}>
        AD
      </div>

      <video
        // keyを変えることで、src変更時に確実にリロードさせる
        key={HQ_ADS_LIST[currentIdx]} 
        src={HQ_ADS_LIST[currentIdx]}
        autoPlay 
        muted 
        playsInline
        // loopは削除（loopするとonEndedが発火しないため）
        onEnded={handleEnded} 
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
    </div>
  );
};

const buildVideoUrl = (slug, type, isLandscape) => {
  let clean = slug.replace(/^\[f\]/i, "");
  const folder = isLandscape ? "landscape" : "portrait";
  const base = `${process.env.NEXT_PUBLIC_VIDEO_BASE_URL}/videos/${folder}/`;
  if (type === "FHD") return `${base}${clean}_1080.mp4`;
  if (type === "4K") return `${base}${clean}_2160.mp4`;
  return `${base}${clean}_720.mp4`;
};

const GET_BY_SLUG = gql`
query ($slug: String!) {
  portfolioBy(slug: $slug) {
    title, content, slug, date
    featuredImage { node { sourceUrl, mediaDetails { width height } } }
  }
}
`;

const GET_ALL = gql`
query {
  portfolios(first: 1000, where: { orderby: { field: DATE, order: DESC } }) {
    nodes { slug, featuredImage { node { mediaDetails { width height } } } }
  }
}
`;

const LikeButtonOverlay = ({ slug, title }) => {
  const [liked, setLiked] = useState(false);
  useEffect(() => { if (localStorage.getItem(`liked_${slug}`)) setLiked(true); }, [slug]);
  const handleLike = (e) => {
    e.stopPropagation();
    if (liked) return;
    setLiked(true);
    localStorage.setItem(`liked_${slug}`, "true");
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'like_video', { 'event_category': 'Engagement', 'event_label': title, 'video_slug': slug });
    }
  };
  return (
    <button onClick={handleLike} style={{
        background: liked ? "rgba(233, 30, 99, 0.2)" : "rgba(0,0,0,0.15)", border: "none", borderRadius: "50%", width: "45px", height: "45px",
        cursor: liked ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: liked ? "#e91e63" : "#fff",
        fontSize: "1.5rem", marginBottom: "0px", backdropFilter: "blur(2px)", transition: "transform 0.1s", textShadow: "0 1px 3px rgba(0,0,0,0.5)"
      }}>👍</button>
  );
};

export default function VideoDetailPage({ post, neighbors, adVideoUrl }) {
  const router = useRouter();
  if (!post) return <div style={{ padding: "30px", color: "#fff", textAlign:"center" }}>Loading...</div>;

  const imgWidth = post.featuredImage?.node?.mediaDetails?.width ?? 0;
  const imgHeight = post.featuredImage?.node?.mediaDetails?.height ?? 0;
  const isLandscape = imgWidth >= imgHeight;
  const cleanSlug = post.slug.replace(/^\[f\]/i, "");
  const posterUrl = `${IMAGE_BASE_URL}/${cleanSlug}.webp`;

  const [quality, setQuality] = useState("HD");
  const [isLooping, setIsLooping] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isTheater, setIsTheater] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const [isCurrentlyMuted, setIsCurrentlyMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef(null);

  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50;
  const onTouchStart = (e) => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX); };
  const onTouchMove = (e) => { setTouchEnd(e.targetTouches[0].clientX); };
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance && neighbors.next) router.push(`/videos/${neighbors.next}`);
    if (distance < -minSwipeDistance && neighbors.prev) router.push(`/videos/${neighbors.prev}`);
  };

  const handleEnded = () => { setVideoEnded(true); if (isLooping) setVideoEnded(false); setIsPlaying(false); }

  useEffect(() => {
    if (videoRef.current) {
        videoRef.current.load();
        const p = videoRef.current.play();
        if(p) p.then(() => setIsPlaying(true)).catch(e => { console.log("Autoplay blocked", e); setIsPlaying(false); });
    }
  }, [post.slug]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const handleWaiting = () => setIsLoading(true);
    const handlePlaying = () => { setIsLoading(false); setVideoEnded(false); setIsPlaying(true); };
    const handlePause = () => { setIsPlaying(false); };
    const handleVolumeChange = () => { if(el) setIsCurrentlyMuted(el.muted || el.volume === 0); };
    el.addEventListener('waiting', handleWaiting); el.addEventListener('playing', handlePlaying); el.addEventListener('pause', handlePause);
    el.addEventListener('ended', handleEnded); el.addEventListener('volumechange', handleVolumeChange);
    setIsCurrentlyMuted(el.muted || el.volume === 0);
    return () => {
        el.removeEventListener('waiting', handleWaiting); el.removeEventListener('playing', handlePlaying); el.removeEventListener('pause', handlePause);
        el.removeEventListener('ended', handleEnded); el.removeEventListener('volumechange', handleVolumeChange);
    };
  }, [post.slug, isLooping]);

  const handleChangeQuality = (q) => {
    if (quality === q) return;
    setIsLoading(true); setQuality(q);
    const isPaused = videoRef.current ? videoRef.current.paused : false;
    const newUrl = buildVideoUrl(post.slug, q, isLandscape);
    if (videoRef.current) {
      videoRef.current.src = newUrl; videoRef.current.load();
      if (!isPaused) videoRef.current.play().catch(() => {}); else setIsPlaying(false);
    }
  };

  const cycleQuality = (e) => { e.stopPropagation(); const options = ["HD", "FHD", "4K"]; const nextIndex = (options.indexOf(quality) + 1) % options.length; handleChangeQuality(options[nextIndex]); };
  const toggleLoop = (e) => { e.stopPropagation(); setIsLooping(!isLooping); };
  const toggleTheaterMode = (e) => { e.stopPropagation(); setIsTheater(prev => !prev); };
  const toggleMute = (e) => { e.stopPropagation(); if(videoRef.current) { const newState = !isCurrentlyMuted; videoRef.current.muted = newState; videoRef.current.volume = newState ? 0 : 1; setIsCurrentlyMuted(newState); } };
  const togglePlayPause = () => { if(!videoRef.current) return; if(videoRef.current.paused) videoRef.current.play(); else videoRef.current.pause(); };

  const { prev, next } = neighbors;
  const hudButtonStyle = { background: "rgba(0,0,0,0.15)", border: "none", borderRadius: "50%", width: "45px", height: "45px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "1.2rem", backdropFilter: "blur(2px)", cursor: "pointer", textShadow: "0 1px 3px rgba(0,0,0,0.5)", textDecoration: "none" };
  const controlDeckButtonStyle = { background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "50%", width: "42px", height: "42px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "1.2rem", backdropFilter: "blur(4px)", cursor: "pointer", pointerEvents: "auto" };

  return (
    <div className="page-wrapper" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>

      <div className={`video-container-wrapper ${isTheater ? 'theater-mode' : ''}`}>
        {isLoading && <div className="loading-overlay">Loading...</div>}
        {!isPlaying && !isLoading && !videoEnded && <div onClick={togglePlayPause} className="play-button-overlay">▶</div>}

        <video
          ref={videoRef}
          src={buildVideoUrl(post.slug, quality, isLandscape)}
          poster={posterUrl}
          playsInline autoPlay muted={isCurrentlyMuted} loop={isLooping} controlsList="nodownload"
          onClick={togglePlayPause} onContextMenu={(e) => e.preventDefault()}
          className="main-video"
        />

        <div className="control-deck">
            <div onClick={(e) => { e.stopPropagation(); toggleTheaterMode(e); }} style={controlDeckButtonStyle}>{isTheater ? '×' : '□'}</div>
            <div onClick={(e) => { e.stopPropagation(); toggleMute(e); }} style={controlDeckButtonStyle}>{isCurrentlyMuted ? '🔇' : '🔊'}</div>
            <div onClick={(e) => { e.stopPropagation(); cycleQuality(e); }} style={{...controlDeckButtonStyle, color: quality === "4K" ? "#ffcc00" : "#fff", fontWeight: quality === "4K" ? "bold" : "normal", fontSize: "0.8rem"}}>{quality}</div>
            <div onClick={(e) => { e.stopPropagation(); toggleLoop(e); }} style={{...controlDeckButtonStyle, color: isLooping ? "#4caf50" : "#fff"}}>🔁</div>
            {prev ? <Link href={`/videos/${prev}`} legacyBehavior><a style={{ textDecoration: "none" }}><div style={controlDeckButtonStyle}>◁</div></a></Link> : <div style={{width:"42px"}}></div>}
            {next ? <Link href={`/videos/${next}`} legacyBehavior><a style={{ textDecoration: "none" }}><div style={{...controlDeckButtonStyle, fontWeight: "bold"}}>▷</div></a></Link> : <div style={{width:"42px"}}></div>}
        </div>

        {videoEnded && !isLooping && (
            <div className="ended-overlay">
                <h2 style={{color:"#fff", marginBottom:"30px", fontSize:"1.8rem"}}>Did the AI Soul Resonate?</h2>
                <div style={{display:"flex", gap:"20px", marginBottom:"40px"}}>
                    <LikeButtonOverlay slug={post.slug} title={post.title} />
                    <a href={TIP_LINKS.tier1.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }} onClick={(e)=>e.stopPropagation()}><div style={{ background: "rgba(0,0,0,0.5)", border: "2px solid rgba(255,255,255,0.4)", borderRadius: "50%", width: "60px", height: "60px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "1.5rem", backdropFilter: "blur(4px)" }}>{TIP_LINKS.tier1.emoji}</div></a>
                    {next && <Link href={`/videos/${next}`} legacyBehavior><a style={{ background: "#ffcc00", borderRadius: "50%", width: "60px", height: "60px", display: "flex", alignItems: "center", justifyContent: "center", color: "#000", fontSize: "1.5rem", fontWeight:"bold", textDecoration:"none"}}>→</a></Link>}
                </div>
                <button onClick={() => { videoRef.current.play(); setVideoEnded(false); }} style={{ background: "none", border: "1px solid #fff", color: "#fff", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontSize:"1rem" }}>Replay</button>
            </div>
        )}

        <div className="hud-controls">
            <LikeButtonOverlay slug={post.slug} title={post.title} />
            <a href={TIP_LINKS.tier1.url} target="_blank" rel="noopener noreferrer" style={hudButtonStyle} onClick={(e)=>e.stopPropagation()}>{TIP_LINKS.tier1.emoji}</a>
            <a href={TIP_LINKS.tier2.url} target="_blank" rel="noopener noreferrer" style={hudButtonStyle} onClick={(e)=>e.stopPropagation()}>{TIP_LINKS.tier2.emoji}</a>
            <a href={TIP_LINKS.tier3.url} target="_blank" rel="noopener noreferrer" style={{...hudButtonStyle, background: "linear-gradient(45deg, rgba(121,40,202,0.3), rgba(255,0,128,0.3))"}} onClick={(e)=>e.stopPropagation()}>{TIP_LINKS.tier3.emoji}</a>
        </div>
      </div>

      {!isTheater && (
          <div className="details-section">
            
            <div className="content-block article-block">
                <div style={{ marginBottom: "20px" }}>
                    <h1 style={{ margin: "0", fontSize: "1.4rem", lineHeight: "1.3", color: isLandscape ? "#ffcc00" : "#66cfff" }}>{post.title}</h1>
                    <div style={{ fontSize: "0.8rem", color: "#666", marginTop:"5px" }}>{post.date?.substring(0,10)}</div>
                </div>
                <div style={{ lineHeight: "1.8", color: "#ddd", fontSize: "1rem" }} dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>

            {/* GAM広告（Fluidを捨て、固定サイズ+Scaleで表示） */}
            <div className="content-block ad-block">
                <div className="ad-bunker">
                    <DynamicAdSlot divId="video-detail-ad-middle" />
                </div>
            </div>

            {/* 自社広告（自動ローテーション） */}
            <div className="content-block ad-block">
                <div className="ad-bunker hq-bunker">
                    <HQVideoAd />
                </div>
            </div>

            <div className="footer-spacer"></div>
          </div>
      )}
      
      <style jsx>{`
        .page-wrapper { width: 100%; min-height: 100vh; background: #000; color: #fff; overflow-x: hidden; display: flex; flex-direction: column; }
        .video-container-wrapper { position: relative; width: 100%; height: auto; max-height: 85vh; background: #000; display: block; z-index: 20; }
        .video-container-wrapper.theater-mode { position: fixed; top: 0; left: 0; width: 100%; height: 100dvh; max-height: none; display: flex; justify-content: center; align-items: center; z-index: 9999; }
        .main-video { width: 100%; height: auto; max-height: 85vh; display: block; object-fit: contain; cursor: pointer; }
        .theater-mode .main-video { height: 100%; }
        
        .loading-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 20; pointer-events: none; color: #fff; font-weight: bold; }
        .play-button-overlay { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 25; cursor: pointer; background: rgba(0,0,0,0.4); border-radius: 50%; padding: 20px; backdrop-filter: blur(4px); font-size: 3rem; color: #fff; }
        .control-deck { position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%); display: flex; align-items: center; justify-content: center; gap: 12px; width: 100%; max-width: 400px; padding: 0 10px; z-index: 35; pointer-events: none; }
        .ended-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; flexDirection: column; justify-content: center; align-items: center; z-index: 40; padding: 20px; text-align: center; backdrop-filter: blur(2px); }
        .hud-controls { position: absolute; right: 10px; bottom: 100px; display: flex; flexDirection: column; alignItems: center; gap: 8px; z-index: 30; }

        .details-section { max-width: 800px; margin: 0 auto; padding: 20px; background: linear-gradient(to bottom, #050505, #111); position: relative; z-index: 10; }
        
        .content-block {
            width: 100%;
            margin-bottom: 60px; 
        }

        .ad-block {
            display: flex;
            justify-content: center;
        }

        /* ★GAM/HQ共通: 480x320固定。スマホでは中身ごと縮小(CSS Scale)される */
        .ad-bunker {
            width: 480px; 
            height: 320px; /* 固定 */
            display: flex; justify-content: center; align-items: center; 
            background: transparent; 
            overflow: visible; /* はみ出しOKにしておき、scaleで制御 */
            position: relative;
        }
        
        .hq-bunker { 
            box-shadow: 0 10px 30px rgba(0,0,0,0.5); 
            overflow: hidden; /* Videoは念のため隠す */
        }

        .footer-spacer { margin-top: 50px; border-top: 1px solid #333; padding-top: 20px; }
      `}</style>
    </div>
  );
}

export async function getStaticProps({ params }) {
  const endpoint = process.env.WORDPRESS_GRAPHQL_ENDPOINT;
  const client = new GraphQLClient(endpoint);
  const slug = decodeURIComponent(params.slug);
  const data = await client.request(GET_BY_SLUG, { slug });
  const post = data?.portfolioBy;
  if (!post) {
      const fSlug = `[f]${slug}`;
      const fData = await client.request(GET_BY_SLUG, { slug: fSlug });
      if (!fData?.portfolioBy) return { notFound: true };
      var finalPost = fData.portfolioBy;
  } else { var finalPost = post; }

  const all = await client.request(GET_ALL);
  const list = all.portfolios.nodes.map((n) => {
    let s = n.slug.replace(/^\[f\]/, "");
    const isLandscape = n.featuredImage?.node?.mediaDetails?.width >= n.featuredImage?.node?.mediaDetails?.height;
    return { slug: s, isLandscape };
  });

  const me = list.findIndex((v) => v.slug === slug);
  if (me !== -1) {
      const myType = list[me].isLandscape;
      const same = list.filter((v) => v.isLandscape === myType);
      const idx = same.findIndex((v) => v.slug === slug);
      var prev = idx > 0 ? same[idx - 1].slug : null;
      var next = idx < same.length - 1 ? same[idx + 1].slug : null;
  } else { var prev = null; var next = null; }

  const adVideoUrl = HQ_ADS_LIST[Math.floor(Math.random() * HQ_ADS_LIST.length)];

  return { props: { post: finalPost, neighbors: { prev, next }, adVideoUrl }, revalidate: 60 };
}

export async function getStaticPaths() {
  const endpoint = process.env.WORDPRESS_GRAPHQL_ENDPOINT;
  const client = new GraphQLClient(endpoint);
  const data = await client.request(GET_ALL);
  const paths = data.portfolios.nodes.map((n) => {
    let s = n.slug.replace(/^\[f\]/, "");
    return { params: { slug: s } };
  });
  return { paths, fallback: "blocking" };
}

