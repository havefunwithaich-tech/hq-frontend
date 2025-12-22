import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import dynamic from "next/dynamic";
import Script from "next/script";

const VIDEO_BASE_URL = "https://cdn.havefunwithaich.com/landscape";
const GAM_UNIT_PATH = "/23326444898/video_detail";
const HQ_ADS_PLAYLIST = ["/hq-ads/ad01.mp4", "/hq-ads/ad02.mp4", "/hq-ads/ad03.mp4"];

const formatTitle = (slug) => {
  if (!slug) return "";
  return slug.replace(/-/g, " ").replace(/_/g, " ").toUpperCase();
};

const useVideoController = (slug) => {
  const videoRef = useRef(null);
  const router = useRouter();
  
  // 亡霊を排除: 最初から待機状態にはしない
  const [status, setStatus] = useState({ isPlaying: false, isEnded: false, isWaiting: false, error: false });
  const [config, setConfig] = useState({ isMuted: true, isLoop: true, isTheater: false });

  const videoSrc = useMemo(() => {
    if (!slug) return "";
    return `${VIDEO_BASE_URL}/${slug}_720.mp4`;
  }, [slug]);

  useEffect(() => {
    setStatus({ isPlaying: false, isEnded: false, isWaiting: false, error: false });
  }, [slug]);

  const handlers = {
    onPlay: () => setStatus(s => ({ ...s, isPlaying: true, isEnded: false, isWaiting: false })),
    onPause: () => setStatus(s => ({ ...s, isPlaying: false })),
    onEnded: () => setStatus(s => ({ ...s, isPlaying: false, isEnded: true })),
    onWaiting: () => setStatus(s => ({ ...s, isWaiting: true })),
    onPlaying: () => setStatus(s => ({ ...s, isWaiting: false, isPlaying: true })),
    onError: (e) => {
      console.error(`[Video Error] ${videoSrc}`, e);
      setStatus(s => ({ ...s, isWaiting: false, error: true }));
    },
    onVolumeChange: () => {
      if (videoRef.current) {
        const currentMuted = videoRef.current.muted || videoRef.current.volume === 0;
        if (currentMuted !== config.isMuted) setConfig(c => ({ ...c, isMuted: currentMuted }));
      }
    }
  };

  const actions = {
    togglePlay: useCallback(() => {
      const v = videoRef.current;
      if (!v) return;
      v.paused ? v.play().catch(() => {}) : v.pause();
    }, []),
    toggleMute: useCallback((e) => { e.stopPropagation(); setConfig(c => ({ ...c, isMuted: !c.isMuted })); }, []),
    toggleLoop: useCallback((e) => { e.stopPropagation(); setConfig(c => ({ ...c, isLoop: !c.isLoop })); }, []),
    toggleTheater: useCallback((e) => { e.stopPropagation(); setConfig(c => ({ ...c, isTheater: !c.isTheater })); }, []),
    replay: useCallback(() => {
      const v = videoRef.current;
      if (!v) return;
      v.currentTime = 0;
      v.play().catch(() => {});
      setStatus(s => ({ ...s, isEnded: false, isWaiting: false }));
    }, [])
  };

  useEffect(() => {
    const handleRouteChange = () => { if (videoRef.current) videoRef.current.pause(); };
    router.events.on('routeChangeStart', handleRouteChange);
    return () => { router.events.off('routeChangeStart', handleRouteChange); };
  }, [router.events]);

  // 除霊完了: v.src の割り当てのみ
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !videoSrc) return;
    v.src = videoSrc;
  }, [videoSrc]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = config.isMuted;
  }, [config.isMuted]);

  return { videoRef, videoSrc, status, config, handlers, actions };
};

const GamAdUnit = ({ divId }) => {
  useEffect(() => {
    if (typeof window === "undefined" || !window.googletag) return;
    window.googletag.cmd.push(() => {
      const gpt = window.googletag;
      const pubads = gpt.pubads();
      const existing = pubads.getSlots().find(s => s.getSlotElementId() === divId);
      if (existing) gpt.destroySlots([existing]);
      gpt.defineSlot(GAM_UNIT_PATH, [[480, 320], [336, 280], [300, 250]], divId).addService(pubads);
      gpt.enableServices();
      gpt.display(divId);
    });
  }, [divId]);
  return (
    <div className="gam-container">
      <div className="ad-label">AD</div>
      <div id={divId}></div>
      <style jsx>{`
        .gam-container { width: 480px; height: 320px; margin: 0 auto; position: relative; }
        .ad-label { position: absolute; top: 0; left: 0; background: rgba(0,0,0,0.5); color: #fff; font-size: 10px; padding: 3px 8px; z-index: 10; pointer-events: none; font-weight: bold; }
        :global(#${divId}), :global(#${divId} > div), :global(#${divId} iframe) { width: 480px !important; height: 320px !important; display: block !important; border: 0 !important; }
      `}</style>
    </div>
  );
};
const DynamicGamAd = dynamic(() => Promise.resolve(GamAdUnit), { ssr: false, loading: () => <div style={{width:480, height:320, background:"#111"}}/> });

const HqPromoAd = () => {
  const [index, setIndex] = useState(0);
  return (
    <div style={{ width: "100%", height: "100%", position: "relative", background: "#000" }}>
      <div style={{position:"absolute", top:0, left:0, background:"rgba(0,0,0,0.5)", color:"#fff", fontSize:10, padding:"3px 8px", zIndex:10, pointerEvents:"none", fontWeight:"bold"}}>AD</div>
      <video
        key={HQ_ADS_PLAYLIST[index]} src={HQ_ADS_PLAYLIST[index]}
        muted playsInline autoPlay onEnded={() => setIndex((prev) => (prev + 1) % HQ_ADS_PLAYLIST.length)}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
    </div>
  );
};

const BTN_STYLE = {
  background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "50%",
  width: "42px", height: "42px", display: "flex", alignItems: "center", justifyContent: "center",
  fontSize: "1.2rem", color: "#fff", cursor: "pointer", backdropFilter: "blur(4px)",
  transition: "background 0.2s", pointerEvents: "auto"
};

const ControlDeck = ({ config, actions }) => {
  return (
    <div style={{ position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '12px', zIndex: 100 }}>
      <div onClick={actions.toggleTheater} style={BTN_STYLE}>{config.isTheater ? '×' : '□'}</div>
      <div onClick={actions.toggleMute} style={BTN_STYLE}>{config.isMuted ? '🔇' : '🔊'}</div>
      <div onClick={actions.toggleLoop} style={BTN_STYLE}>{config.isLoop ? "🔁" : "🔂"}</div>
    </div>
  );
};

export default function LandscapePlayer() {
  const router = useRouter();
  const { slug } = router.query;
  const title = useMemo(() => formatTitle(slug), [slug]);
  const { videoRef, videoSrc, status, config, handlers, actions } = useVideoController(slug);

  if (!router.isReady) return null;

  return (
    <div className="page-wrapper">
      <Head><title>{title ? `${title} | HQ` : "HQ Player"}</title></Head>
      <Script src="https://securepubads.g.doubleclick.net/tag/js/gpt.js" strategy="afterInteractive" />
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-PG1S76T9QW" strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-PG1S76T9QW');`}</Script>
      
      <div className="video-main-container">
        <div className={`video-container-wrapper ${config.isTheater ? 'theater-mode' : ''}`}>
          {status.isWaiting && !status.isPlaying && !status.error && <div className="loading-overlay">Loading...</div>}
          {status.error && <div className="loading-overlay"><h2>Video Not Found</h2></div>}
          {!status.isPlaying && !status.isWaiting && !status.isEnded && !status.error && (
             <div onClick={actions.togglePlay} className="play-button-overlay">▶</div>
          )}
          <video
            ref={videoRef} playsInline autoPlay
            loop={config.isLoop} muted={config.isMuted}
            className="main-video" onClick={actions.togglePlay}
            onContextMenu={(e) => e.preventDefault()}
            {...handlers}
          />
          <ControlDeck config={config} actions={actions} />
          {status.isEnded && !config.isLoop && (
            <div className="ended-overlay">
              <button onClick={actions.replay} style={{ background: "none", border: "1px solid #fff", color: "#fff", padding: "10px 20px", borderRadius: "8px", cursor: "pointer" }}>Replay</button>
            </div>
          )}
        </div>
      </div>
      
      {!config.isTheater && (
        <div className="details-section">
          <div className="content-block title-block">
             <h1 style={{ margin: "0", fontSize: "1.6rem", textAlign: "center", color: "#ffcc00", letterSpacing:"2px" }}>{title}</h1>
          </div>
          <div className="content-block ad-block"><DynamicGamAd divId="video-detail-ad-middle" /></div>
          <div className="content-block ad-block"><div className="hq-bunker"><HqPromoAd /></div></div>
        </div>
      )}
      <style jsx>{`
        .page-wrapper { width: 100%; min-height: 100vh; background: #000; color: #fff; overflow-x: hidden; display: flex; flex-direction: column; }
        .video-main-container { width: 100%; max-width: 1000px; margin: 0 auto; }
        .video-container-wrapper { width: 100%; aspect-ratio: 16/9; background: #000; display: flex; justify-content: center; align-items: center; z-index: 20; overflow: hidden; position: relative; }
        .video-container-wrapper.theater-mode { position: fixed; top: 0; left: 0; width: 100%; height: 100dvh; z-index: 9999; aspect-ratio: auto; }
        .main-video { width: 100%; height: 100%; object-fit: contain; cursor: pointer; }
        .loading-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 20; color: #fff; }
        .play-button-overlay { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 25; cursor: pointer; background: rgba(0,0,0,0.4); border-radius: 50%; padding: 20px; font-size: 3rem; }
        .ended-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 40; }
        .details-section { max-width: 1000px; margin: 0 auto; padding: 20px; width: 100%; }
        .content-block { width: 100%; margin-bottom: 50px; }
        .ad-block { display: flex; justify-content: center; }
        .hq-bunker { width: 480px; height: 320px; border: 1px solid #222; overflow: hidden; }
      `}</style>
    </div>
  );
}