import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  X, Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  RotateCcw, RotateCw, Loader2
} from 'lucide-react';
import './SecureVideoPlayer.css';

interface SecureVideoPlayerProps {
  videoUrl: string;
  title: string;
  isOpen: boolean;
  onClose: () => void;
}

function formatTime(secs: number): string {
  if (!isFinite(secs) || isNaN(secs)) return '0:00';
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export const SecureVideoPlayer: React.FC<SecureVideoPlayerProps> = ({
  videoUrl, title, isOpen, onClose
}) => {
  const videoRef      = useRef<HTMLVideoElement>(null);
  const canvasRef     = useRef<HTMLCanvasElement>(null);
  const containerRef  = useRef<HTMLDivElement>(null);
  const progressRef   = useRef<HTMLDivElement>(null);
  const rafRef        = useRef<number>(0);
  const hideTimerRef  = useRef<ReturnType<typeof setTimeout>>();
  const isDraggingRef = useRef(false);

  const [isPlaying,    setIsPlaying]    = useState(false);
  const [isMuted,      setIsMuted]      = useState(false);
  const [volume,       setVolume]       = useState(1);
  const [currentTime,  setCurrentTime]  = useState(0);
  const [duration,     setDuration]     = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading,    setIsLoading]    = useState(true);
  const [isBuffering,  setIsBuffering]  = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  /* ── Canvas renderer: draws video frames → protects from screen recording ── */
  const startDrawing = useCallback(() => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      if (video.readyState >= 2) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width  = video.videoWidth  || 1280;
          canvas.height = video.videoHeight || 720;
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
  }, []);

  const stopDrawing = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
  }, []);

  /* ── Auto-hide controls ── */
  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  }, [isPlaying]);

  /* ── Setup video events ── */
  useEffect(() => {
    if (!isOpen) return;
    const video = videoRef.current;
    if (!video) return;

    const onCanPlay   = () => { setIsLoading(false); setIsBuffering(false); };
    const onWaiting   = () => setIsBuffering(true);
    const onPlaying   = () => { setIsBuffering(false); setIsPlaying(true); startDrawing(); };
    const onPause     = () => { setIsPlaying(false); stopDrawing(); };
    const onEnded     = () => { setIsPlaying(false); stopDrawing(); setShowControls(true); };
    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onDuration   = () => setDuration(video.duration);
    const onLoadedData = () => { setIsLoading(false); setDuration(video.duration); };

    video.addEventListener('canplay',    onCanPlay);
    video.addEventListener('waiting',    onWaiting);
    video.addEventListener('playing',    onPlaying);
    video.addEventListener('pause',      onPause);
    video.addEventListener('ended',      onEnded);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('durationchange', onDuration);
    video.addEventListener('loadeddata', onLoadedData);

    return () => {
      video.removeEventListener('canplay',    onCanPlay);
      video.removeEventListener('waiting',    onWaiting);
      video.removeEventListener('playing',    onPlaying);
      video.removeEventListener('pause',      onPause);
      video.removeEventListener('ended',      onEnded);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('durationchange', onDuration);
      video.removeEventListener('loadeddata', onLoadedData);
      stopDrawing();
    };
  }, [isOpen, startDrawing, stopDrawing]);

  /* ── Fullscreen change event ── */
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  /* ── Keyboard shortcuts ── */
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      const video = videoRef.current;
      if (!video) return;
      switch (e.code) {
        case 'Space':
        case 'KeyK':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          e.preventDefault();
          video.currentTime = Math.min(video.currentTime + 10, video.duration);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          video.currentTime = Math.max(video.currentTime - 10, 0);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(v => { const nv = Math.min(v + 0.1, 1); if (video) video.volume = nv; return nv; });
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(v => { const nv = Math.max(v - 0.1, 0); if (video) video.volume = nv; return nv; });
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;
        case 'Escape':
          if (!document.fullscreenElement) onClose();
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, isPlaying]);

  /* ── Prevent context-menu (right-click) on canvas ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const prevent = (e: MouseEvent) => e.preventDefault();
    canvas.addEventListener('contextmenu', prevent);
    return () => canvas.removeEventListener('contextmenu', prevent);
  }, []);

  /* ── Reset state when closed ── */
  useEffect(() => {
    if (!isOpen) {
      stopDrawing();
      const video = videoRef.current;
      if (video) { video.pause(); video.currentTime = 0; }
      setIsPlaying(false);
      setCurrentTime(0);
      setIsLoading(true);
    }
  }, [isOpen, stopDrawing]);

  /* ────────────── Handlers ────────────── */

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) { video.play(); }
    else              { video.pause(); }
    resetHideTimer();
  }, [resetHideTimer]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen();
    }
  }, []);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    const video = videoRef.current;
    if (!video) return;
    video.volume = v;
    setIsMuted(v === 0);
    video.muted  = v === 0;
  };

  /* ── Progress bar seek ── */
  const seekTo = useCallback((e: React.MouseEvent<HTMLDivElement> | MouseEvent) => {
    const bar = progressRef.current;
    const video = videoRef.current;
    if (!bar || !video || !duration) return;
    const rect  = bar.getBoundingClientRect();
    const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    video.currentTime = ratio * duration;
  }, [duration]);

  const handleProgressMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    seekTo(e);
    const onMove = (ev: MouseEvent) => { if (isDraggingRef.current) seekTo(ev); };
    const onUp   = () => { isDraggingRef.current = false; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  /* ── Touch seek ── */
  const seekToTouch = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    const bar = progressRef.current;
    const video = videoRef.current;
    if (!bar || !video || !duration) return;
    const rect  = bar.getBoundingClientRect();
    const touch = e.touches[0] || e.changedTouches[0];
    const ratio = Math.min(Math.max((touch.clientX - rect.left) / rect.width, 0), 1);
    video.currentTime = ratio * duration;
  }, [duration]);

  const skipSeconds = (secs: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(Math.max(video.currentTime + secs, 0), video.duration);
    resetHideTimer();
  };

  if (!isOpen) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="svp-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div
        ref={containerRef}
        className={`svp-container ${isFullscreen ? 'svp-fullscreen' : ''}`}
        onMouseMove={resetHideTimer}
        onTouchStart={resetHideTimer}
      >
        {/* Hidden real video element – only canvas is visible */}
        <video
          ref={videoRef}
          src={videoUrl}
          className="svp-hidden-video"
          playsInline
          preload="metadata"
          crossOrigin={videoUrl.includes('cloudinary.com') ? 'anonymous' : 'use-credentials'}
          controlsList="nodownload nofullscreen noremoteplayback"
          disablePictureInPicture
        />

        {/* Canvas – visible output (screen-recording protection) */}
        <canvas
          ref={canvasRef}
          className="svp-canvas"
          onClick={togglePlay}
        />

        {/* Loading / Buffering overlay */}
        {(isLoading || isBuffering) && (
          <div className="svp-loading">
            <Loader2 className="svp-spinner" size={48} />
          </div>
        )}

        {/* Header bar */}
        <div className={`svp-header ${showControls ? 'svp-visible' : 'svp-hidden'}`}>
          <span className="svp-title" title={title}>{title}</span>
          <button className="svp-close-btn" onClick={onClose} aria-label="Close">
            <X size={22} />
          </button>
        </div>

        {/* Center play/pause tap indicator */}
        {!isLoading && (
          <div
            className="svp-center-tap"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {!isPlaying && (
              <div className="svp-big-play">
                <Play size={56} fill="white" />
              </div>
            )}
          </div>
        )}

        {/* Controls bar */}
        <div className={`svp-controls ${showControls ? 'svp-visible' : 'svp-hidden'}`}>

          {/* Progress bar */}
          <div
            ref={progressRef}
            className="svp-progress-bar"
            onMouseDown={handleProgressMouseDown}
            onTouchStart={seekToTouch}
            onTouchMove={seekToTouch}
          >
            <div className="svp-progress-bg">
              <div className="svp-progress-fill" style={{ width: `${progress}%` }} />
              <div className="svp-progress-thumb" style={{ left: `${progress}%` }} />
            </div>
          </div>

          {/* Bottom row */}
          <div className="svp-controls-row">
            {/* Left: play/pause, skip, time */}
            <div className="svp-left-controls">
              <button className="svp-btn" onClick={() => skipSeconds(-10)} aria-label="Back 10s">
                <RotateCcw size={20} />
                <span className="svp-skip-label">10</span>
              </button>

              <button className="svp-btn svp-play-btn" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>

              <button className="svp-btn" onClick={() => skipSeconds(10)} aria-label="Forward 10s">
                <RotateCw size={20} />
                <span className="svp-skip-label">10</span>
              </button>

              <span className="svp-time">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            {/* Right: volume, fullscreen */}
            <div className="svp-right-controls">
              <div
                className="svp-volume-group"
                onMouseEnter={() => setShowVolumeSlider(true)}
                onMouseLeave={() => setShowVolumeSlider(false)}
              >
                <button className="svp-btn" onClick={toggleMute} aria-label="Mute">
                  {isMuted || volume === 0 ? <VolumeX size={22} /> : <Volume2 size={22} />}
                </button>
                {showVolumeSlider && (
                  <div className="svp-volume-slider-wrap">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.02"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="svp-volume-slider"
                    />
                  </div>
                )}
              </div>

              <button className="svp-btn" onClick={toggleFullscreen} aria-label="Fullscreen">
                {isFullscreen ? <Minimize size={22} /> : <Maximize size={22} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
