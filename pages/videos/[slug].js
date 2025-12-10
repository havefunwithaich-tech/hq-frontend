import { GraphQLClient, gql } from "graphql-request";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";

// ===============================================
// 設定：画像サーバー (WebP用)
// ===============================================
const IMAGE_BASE_URL = "https://hq.havefunwithaich.com/images";

// ===============================================
// 設定：Stripeリンク
// ===============================================
const TIP_LINKS = {
  tier1: { url: "https://buy.stripe.com/dRm5kvaiLaAF1SPeuX4Vy02?locale=en", label: "$1.00", emoji: "💰" },
  tier2: { url: "https://buy.stripe.com/5kQ28j2QjbEJ1SPbiL4Vy03?locale=en", label: "$2.00", emoji: "☕" },
  tier3: { url: "https://buy.stripe.com/5kQcMX3Un249fJFcmP4Vy04?locale=en", label: "I Love You!!!", price: "$5.00", emoji: "❤️" },
};

// ===============================================
// 広告設定
// ===============================================
const AD_UNIT_PATH = "/23326444898/video_detail";
const AdSlotComponent = ({ divId }) => {
  useEffect(() => {
    if (typeof window === "undefined" || !window.googletag) return;
    window.googletag.cmd.push(() => {
      window.googletag.defineSlot(AD_UNIT_PATH, [[300, 250], "fluid"], divId).addService(window.googletag.pubads());
      window.googletag.enableServices();
      window.googletag.display(divId);
    });
  }, [divId]);
  return <div style={{ width: "100%", textAlign: "center", margin: "20px 0" }}><div id={divId} style={{ minHeight: "250px" }}></div></div>;
};
const DynamicAdSlot = dynamic(() => Promise.resolve(AdSlotComponent), { ssr: false });

// ===============================================
// URL Builder
// ===============================================
const buildVideoUrl = (slug, type, isLandscape) => {
  let clean = slug.replace(/^\[f\]/i, "");
  const folder = isLandscape ? "landscape" : "portrait";
  const base = `https://hq.havefunwithaich.com/videos/${folder}/`;
  if (type === "FHD") return `${base}${clean}_1080.mp4`;
  if (type === "4K") return `${base}${clean}_2160.mp4`;
  return `${base}${clean}_720.mp4`;
};

// ===============================================
// GraphQL Queries
// ===============================================
const GET_BY_SLUG = gql`
  query ($slug: String!) {
    portfolioBy(slug: $slug) {
      title
      content
      slug
      date
      featuredImage {
        node {
          sourceUrl
          mediaDetails { width height }
        }
      }
    }
  }
`;

const GET_ALL = gql`
  query {
    portfolios(first: 1000, where: { orderby: { field: DATE, order: DESC } }) {
      nodes {
        slug
        featuredImage {
          node { mediaDetails { width height } }
        }
      }
    }
  }
`;

// ===============================================
// Like Button Overlay Component
// ===============================================
const LikeButtonOverlay = ({ slug, title }) => {
  const [liked, setLiked] = useState(false);
  useEffect(() => {
    const key = `liked_${slug}`;
    if (localStorage.getItem(key)) setLiked(true);
  }, [slug]);

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
        background: liked ? "rgba(233, 30, 99, 0.2)" : "rgba(0,0,0,0.15)",
        border: "none",
        borderRadius: "50%",
        width: "45px", height: "45px",
        cursor: liked ? "default" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: liked ? "#e91e63" : "#fff",
        fontSize: "1.5rem",
        marginBottom: "0px",
        backdropFilter: "blur(2px)",
        transition: "transform 0.1s",
        textShadow: "0 1px 3px rgba(0,0,0,0.5)"
      }}>
      👍
    </button>
  );
};

// ===============================================
// Main Component
// ===============================================
export default function VideoDetailPage({ post, neighbors }) {
  const router = useRouter();
  if (!post) return <div style={{ padding: "30px", color: "#fff", textAlign:"center" }}>Loading...</div>;

  const width = post.featuredImage?.node?.mediaDetails?.width ?? 0;
  const height = post.featuredImage?.node?.mediaDetails?.height ?? 0;
  const isLandscape = width >= height;

  // ★修正: WebP画像のURL生成
  // [f]などのプレフィックスを除去し、画像サーバーのパスと結合
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

  // SWIPE LOGIC
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

  const handleEnded = () => {
      setVideoEnded(true);
      if (isLooping) setVideoEnded(false);
      setIsPlaying(false);
  }

  // 初期ロードとイベントリスナー設定
  useEffect(() => {
    if (videoRef.current) {
        videoRef.current.load();
        const p = videoRef.current.play();
        if(p) {
            p.then(() => setIsPlaying(true))
             .catch(e => { console.log("Autoplay blocked", e); setIsPlaying(false); });
        }
    }
  }, [post.slug]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const handleWaiting = () => setIsLoading(true);
    const handlePlaying = () => { setIsLoading(false); setVideoEnded(false); setIsPlaying(true); };
    const handlePause = () => { setIsPlaying(false); };
    const handleVolumeChange = () => {
        if(el) {
            setIsCurrentlyMuted(el.muted || el.volume === 0);
        }
    };

    el.addEventListener('waiting', handleWaiting);
    el.addEventListener('playing', handlePlaying);
    el.addEventListener('pause', handlePause);
    el.addEventListener('ended', handleEnded);
    el.addEventListener('volumechange', handleVolumeChange);

    setIsCurrentlyMuted(el.muted || el.volume === 0);

    return () => {
        el.removeEventListener('waiting', handleWaiting);
        el.removeEventListener('playing', handlePlaying);
        el.removeEventListener('pause', handlePause);
        el.removeEventListener('ended', handleEnded);
        el.removeEventListener('volumechange', handleVolumeChange);
    };
  }, [post.slug, isLooping]);

  const handleChangeQuality = (q) => {
    if (quality === q) return;
    setIsLoading(true);
    setQuality(q);
    const currentTime = videoRef.current ? videoRef.current.currentTime : 0;
    const isPaused = videoRef.current ? videoRef.current.paused : false;
    const newUrl = buildVideoUrl(post.slug, q, isLandscape);

    if (videoRef.current) {
      videoRef.current.src = newUrl;
      videoRef.current.load();
      videoRef.current.currentTime = currentTime;
      if (!isPaused) {
          videoRef.current.play().catch(() => {});
      } else {
          setIsPlaying(false);
      }
    }
  };

  const cycleQuality = (e) => {
      e.stopPropagation();
      const options = ["HD", "FHD", "4K"];
      const nextIndex = (options.indexOf(quality) + 1) % options.length;
      handleChangeQuality(options[nextIndex]);
  };

  const toggleLoop = (e) => {
      e.stopPropagation();
      setIsLooping(!isLooping);
  };

  const toggleTheaterMode = (e) => {
      e.stopPropagation();
      setIsTheater(prev => !prev);
  };

  const toggleMute = (e) => {
      e.stopPropagation();
      if(videoRef.current) {
          const newState = !isCurrentlyMuted;
          videoRef.current.muted = newState;
          videoRef.current.volume = newState ? 0 : 1;
          setIsCurrentlyMuted(newState);
      }
  };

  const togglePlayPause = () => {
      if(!videoRef.current) return;
      if(videoRef.current.paused) {
          videoRef.current.play();
      } else {
          videoRef.current.pause();
      }
  };

  const { prev, next } = neighbors;

  // ★共通ボタンスタイル（右側HUD用：枠線なし）
  const hudButtonStyle = {
      background: "rgba(0,0,0,0.15)",
      border: "none",
      borderRadius: "50%",
      width: "45px",
      height: "45px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      fontSize: "1.2rem",
      backdropFilter: "blur(2px)",
      cursor: "pointer",
      textShadow: "0 1px 3px rgba(0,0,0,0.5)",
      textDecoration: "none"
  };

  // ★共通ボタンスタイル（下段コントロールデッキ用：枠線あり・半透明黒統一）
  const controlDeckButtonStyle = {
      background: "rgba(0,0,0,0.4)", // すべてこの背景色で統一
      border: "1px solid rgba(255,255,255,0.3)",
      borderRadius: "50%",
      width: "42px", height: "42px",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff",
      fontSize: "1.2rem",
      backdropFilter: "blur(4px)",
      cursor: "pointer",
      pointerEvents: "auto"
  };

  return (
    <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
            width: "100%",
            minHeight: "100vh",
            background: "#000",
            color: "#fff",
            overflowX: "hidden",
            overflowY: isTheater ? 'hidden' : 'auto',
            position: isTheater ? 'fixed' : 'static',
            top: 0,
            left: 0,
            zIndex: isTheater ? 9999 : 'auto',
        }}
    >

      {/* ================== VIDEO SECTION ================== */}
      <div
          className="video-container"
          style={{
            position: "relative",
            width: "100%",
            height: isTheater ? "100dvh" : "auto",
            maxHeight: isTheater ? "none" : "85vh",
            background: "#000",
            display: isTheater ? "flex" : "block",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 20,
      }}>

        {isLoading && (
            <div style={{
                position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
                background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center",
                zIndex: 20, pointerEvents: "none"
            }}>
                <div style={{ color: "#fff", fontWeight: "bold" }}>Loading...</div>
            </div>
        )}

        {/* Play/Pause Icon Overlay */}
        {!isPlaying && !isLoading && !videoEnded && (
            <div
                onClick={togglePlayPause}
                style={{
                position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                zIndex: 25, cursor: "pointer", pointerEvents: "auto",
                background: "rgba(0,0,0,0.4)", borderRadius: "50%", padding: "20px", backdropFilter: "blur(4px)"
            }}>
                <div style={{ fontSize: "3rem", color: "#fff", marginLeft: "5px" }}>▶</div>
            </div>
        )}

        <video
          ref={videoRef}
          src={buildVideoUrl(post.slug, quality, isLandscape)}
          poster={posterUrl} // ★修正: 生成したWebP URLを使用
          playsInline
          autoPlay
          muted={isCurrentlyMuted}
          loop={isLooping}
          controlsList="nodownload"
          onClick={togglePlayPause}
          onContextMenu={(e) => e.preventDefault()}
          style={{
            width: "100%",
            height: isTheater ? "100%" : "auto",
            maxHeight: isTheater ? "none" : "85vh",
            display: "block",
            objectFit: "contain",
            cursor: "pointer"
          }}
        />

        {/* ========== ★ New Control Deck (Bottom) ========== */}
        {/* Order: □ 🔊 HD 🔁 ◁ ▷ */}
        <div style={{
            position: "absolute",
            bottom: "40px",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            width: "100%",
            maxWidth: "400px",
            padding: "0 10px",
            zIndex: 35,
            pointerEvents: "none"
        }}>

            {/* 1. Theater (□) */}
            <div onClick={(e) => { e.stopPropagation(); toggleTheaterMode(e); }} style={controlDeckButtonStyle}>
                {isTheater ? '×' : '□'}
            </div>

            {/* 2. Mute (🔊) */}
            <div onClick={(e) => { e.stopPropagation(); toggleMute(e); }} style={controlDeckButtonStyle}>
                {isCurrentlyMuted ? '🔇' : '🔊'}
            </div>

            {/* 3. Quality (HD) */}
            <div onClick={(e) => { e.stopPropagation(); cycleQuality(e); }} style={{
                ...controlDeckButtonStyle,
                color: quality === "4K" ? "#ffcc00" : "#fff", // 4Kなら文字を金に
                fontWeight: quality === "4K" ? "bold" : "normal",
                fontSize: "0.8rem"
            }}>
                {quality}
            </div>

            {/* 4. Loop (🔁) */}
            <div onClick={(e) => { e.stopPropagation(); toggleLoop(e); }} style={{
                ...controlDeckButtonStyle,
                // 背景色は変更せず、文字色だけ変える
                color: isLooping ? "#4caf50" : "#fff"
            }}>
                🔁
            </div>

            {/* 5. Prev (◁) */}
            {prev ? (
                 <Link href={`/videos/${prev}`} legacyBehavior>
                    <a style={{ textDecoration: "none" }}>
                         <div style={controlDeckButtonStyle}>◁</div>
                    </a>
                </Link>
            ) : <div style={{width:"42px"}}></div>}

            {/* 6. Next (▷) */}
            {next ? (
                <Link href={`/videos/${next}`} legacyBehavior>
                    <a style={{ textDecoration: "none" }}>
                         <div style={{...controlDeckButtonStyle, fontWeight: "bold"}}>▷</div>
                    </a>
                </Link>
            ) : <div style={{width:"42px"}}></div>}

        </div>
        {/* ======================================================= */}


        {/* ========== 動画終了時のCTA ========== */}
        {videoEnded && !isLooping && (
            <div style={{
                position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
                background: "rgba(0,0,0,0.8)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
                zIndex: 40, padding: "20px", textAlign: "center", backdropFilter: "blur(2px)"
            }}>
                <h2 style={{color:"#fff", marginBottom:"30px", fontSize:"1.8rem"}}>Did the AI Soul Resonate?</h2>
                <div style={{display:"flex", gap:"20px", marginBottom:"40px"}}>

                    <LikeButtonOverlay slug={post.slug} title={post.title} />

                    <a href={TIP_LINKS.tier1.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }} onClick={(e)=>e.stopPropagation()}>
                        <div style={{ background: "rgba(0,0,0,0.5)", border: "2px solid rgba(255,255,255,0.4)", borderRadius: "50%", width: "60px", height: "60px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "1.5rem", backdropFilter: "blur(4px)" }}>{TIP_LINKS.tier1.emoji}</div>
                    </a>

                    {next && (
                        <Link href={`/videos/${next}`} legacyBehavior>
                            <a style={{ background: "#ffcc00", borderRadius: "50%", width: "60px", height: "60px", display: "flex", alignItems: "center", justifyContent: "center", color: "#000", fontSize: "1.5rem", fontWeight:"bold", textDecoration:"none"}}>
                                →
                            </a>
                        </Link>
                    )}
                </div>

                <button onClick={() => { videoRef.current.play(); setVideoEnded(false); }} style={{ background: "none", border: "1px solid #fff", color: "#fff", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontSize:"1rem" }}>
                    Replay
                </button>
            </div>
        )}

        {/* ========== HUD (Right Side) - Action Only ========== */}
        <div style={{
            position: "absolute",
            right: "10px",
            bottom: "100px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
            zIndex: 30
        }}>

            {/* LIKE */}
            <LikeButtonOverlay slug={post.slug} title={post.title} />

            {/* TIPS */}
            <a href={TIP_LINKS.tier1.url} target="_blank" rel="noopener noreferrer" style={hudButtonStyle} onClick={(e)=>e.stopPropagation()}>
                {TIP_LINKS.tier1.emoji}
            </a>
            <a href={TIP_LINKS.tier2.url} target="_blank" rel="noopener noreferrer" style={hudButtonStyle} onClick={(e)=>e.stopPropagation()}>
                {TIP_LINKS.tier2.emoji}
            </a>
            <a href={TIP_LINKS.tier3.url} target="_blank" rel="noopener noreferrer" style={{
                ...hudButtonStyle,
                background: "linear-gradient(45deg, rgba(121,40,202,0.3), rgba(255,0,128,0.3))"
            }} onClick={(e)=>e.stopPropagation()}>
                {TIP_LINKS.tier3.emoji}
            </a>

        </div>

      </div>

      {/* ================== INFO AREA ================== */}
      {!isTheater && (
          <div style={{
              maxWidth: "900px", margin: "0 auto", padding: "20px", background: "linear-gradient(to bottom, #050505, #111)",
              minHeight: "50vh", position: "relative", zIndex: 10,
              marginTop: "0",
          }}>

            <div style={{ marginBottom: "20px" }}>
                <h1 style={{ margin: "0", fontSize: "1.4rem", lineHeight: "1.3", color: isLandscape ? "#ffcc00" : "#66cfff" }}>
                    {post.title}
                </h1>
                <div style={{ fontSize: "0.8rem", color: "#666", marginTop:"5px" }}>{post.date?.substring(0,10)}</div>
            </div>

            <DynamicAdSlot divId="video-detail-ad" />

            <div style={{ marginTop: "30px", lineHeight: "1.8", color: "#ddd", fontSize: "1rem" }}>
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "50px", borderTop:"1px solid #333", paddingTop:"20px" }}>
            </div>
          </div>
      )}
    </div>
  );
}

// SSG部分は変更なし
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

  return { props: { post: finalPost, neighbors: { prev, next } }, revalidate: 60 };
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
