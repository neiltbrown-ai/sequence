"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Hero video with a required voiceover.
 *
 * Browsers block autoplay WITH sound, so the clip loops muted as ambient
 * motion and a "Play with sound" control unmutes + restarts it from the top.
 * Clicking the mute button returns it to the silent ambient loop.
 *
 * Vertical framing is controlled by FOCUS_Y (object-position Y, in %).
 * Lower = shows more of the top / crops more off the bottom.
 * Visit /?tune to drag a slider and find the value, then bake it in here.
 */
const FOCUS_Y = 70;

export default function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const [soundOn, setSoundOn] = useState(false);
  const [focusY, setFocusY] = useState(FOCUS_Y);
  const [tune, setTune] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (v) {
      v.muted = true;
      v.play().catch(() => {});
    }
    if (typeof window !== "undefined") {
      setTune(new URLSearchParams(window.location.search).has("tune"));
    }
  }, []);

  const enableSound = () => {
    const v = ref.current;
    if (!v) return;
    v.muted = false;
    v.currentTime = 0;
    v.play().catch(() => {});
    setSoundOn(true);
  };

  const mute = () => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    setSoundOn(false);
    v.play().catch(() => {});
  };

  const handleEnded = () => {
    const v = ref.current;
    if (!v) return;
    v.currentTime = 0;
    v.muted = true;
    v.play().catch(() => {});
    setSoundOn(false);
  };

  return (
    <div className="hero-video-wrap">
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        ref={ref}
        className="hero-video"
        src="/videos/hero-temi-coker.mp4"
        poster="/videos/hero-temi-coker-poster.jpg"
        playsInline
        loop={false}
        preload="metadata"
        style={{ objectPosition: `center ${focusY}%` }}
        onEnded={handleEnded}
        onClick={() => (soundOn ? mute() : enableSound())}
      />

      {!soundOn ? (
        <button
          type="button"
          className="hero-video-ctrl hero-video-ctrl--play"
          onClick={enableSound}
          aria-label="Play with sound"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </svg>
          Play with sound
        </button>
      ) : (
        <button
          type="button"
          className="hero-video-ctrl hero-video-ctrl--mute"
          onClick={mute}
          aria-label="Mute"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        </button>
      )}

      {tune && (
        <div className="hero-video-tune">
          <span>object-position Y: {focusY}%</span>
          <input
            type="range"
            min={0}
            max={100}
            value={focusY}
            onChange={(e) => setFocusY(Number(e.target.value))}
          />
        </div>
      )}
    </div>
  );
}
