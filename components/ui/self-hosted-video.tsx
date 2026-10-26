"use client";

import { useEffect, useRef, useState } from "react";

import { UnmuteOverlay } from "@/components/ui/unmute-overlay";
import { markHeroVideoReady } from "@/lib/media-priority";

type SelfHostedVideoProps = {
  src: string;
  poster: string;
  title: string;
  className?: string;
};

function prefersReducedData(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  const nav = navigator as unknown as {
    connection?: { saveData?: boolean; effectiveType?: string };
  };
  const connection = nav.connection;
  if (!connection) {
    return false;
  }
  if (connection.saveData) {
    return true;
  }
  const t = connection.effectiveType ?? "";
  return t === "slow-2g" || t === "2g" || t === "3g";
}

/**
 * The main video, served from our own origin as a plain <video>.
 *
 * Loom's embed could not start before its player had booted — a few seconds of
 * third-party JS ahead of the first video byte. This element is in the
 * server-rendered HTML, so the browser starts fetching the file while it is
 * still parsing the page, and the poster it shows is the video's own first
 * frame rather than a remote thumbnail.
 *
 * Save-Data and slow connections get the poster and a manual play, so nobody
 * on a metered connection pays for a video they did not ask for.
 */
export function SelfHostedVideo({ src, poster, title, className }: SelfHostedVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [unmuted, setUnmuted] = useState(false);
  const [held, setHeld] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    if (prefersReducedData()) {
      video.autoplay = false;
      video.preload = "none";
      video.pause();
      // Metered connection: swap the panel over to a manual play.
      queueMicrotask(() => setHeld(true));
      return;
    }

    // The element is server-rendered, so it can already be playing by the time
    // React hydrates — those first `loadeddata`/`playing` events fired with
    // nobody listening. Read the state instead of waiting for them.
    if (video.readyState >= 2 || !video.paused) {
      markHeroVideoReady();
    }

    // Autoplay can still be refused; the overlay then starts playback itself.
    void video.play().catch(() => setHeld(true));
  }, []);

  function handleStart() {
    const video = videoRef.current;
    if (!video) {
      return;
    }
    video.muted = false;
    video.volume = 1;
    video.controls = true;
    setUnmuted(true);
    setHeld(false);
    void video.play();
  }

  return (
    <div className={`relative overflow-hidden ${className ?? "w-full h-full"}`}>
      {/* No JS gate on the reveal: the poster attribute holds the frame until
          the first one decodes, and it is that same frame, so there is nothing
          to cross-fade. Hiding it behind hydration only delayed the picture. */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        src={src}
        poster={poster}
        title={title}
        autoPlay
        muted
        playsInline
        preload="auto"
        controls={unmuted}
        onPlaying={markHeroVideoReady}
        onLoadedData={markHeroVideoReady}
      />

      {!unmuted && (
        <UnmuteOverlay
          title={title}
          onUnmute={handleStart}
          size="large"
          label={held ? "tap-to-play" : "click-to-unmute"}
        />
      )}
    </div>
  );
}
