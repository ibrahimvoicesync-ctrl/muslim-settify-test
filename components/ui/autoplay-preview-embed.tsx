"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type AutoplayPreviewEmbedProps = {
  id: string;
  title: string;
  className?: string;
  /** Mount the player straight away instead of waiting for the scroll. */
  eager?: boolean;
};

const YT_ORIGIN = "https://www.youtube-nocookie.com";
/** Start loading well before the card reaches the viewport. */
const MOUNT_MARGIN = "1200px 0px";

function prefersReducedData(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
    return true;
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
 * Speaker whose arcs climb on a loop. The video underneath is already playing
 * muted, so a static icon reads as decoration — a rising level reads as sound.
 */
function RisingVolumeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
      <path className="volume-arc" d="M13.2 10.4a2.2 2.2 0 0 1 0 3.2" />
      <path className="volume-arc volume-arc-2" d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path className="volume-arc volume-arc-3" d="M18.07 5.93a8.5 8.5 0 0 1 0 12.14" />
    </svg>
  );
}

export function AutoplayPreviewEmbed({
  id,
  title,
  className,
  eager = false,
}: AutoplayPreviewEmbedProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const [unmuted, setUnmuted] = useState(false);

  const posterUrl = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

  const command = useCallback((func: string, args: unknown[] = []) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func, args }),
      YT_ORIGIN
    );
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1) Mount the player early (1200px ahead of the scroll) so it is already
  //    running by the time the card is on screen.
  // 2) Track real visibility separately, so off-screen players pause instead
  //    of burning CPU on ten decoders at once.
  useEffect(() => {
    const node = containerRef.current;
    if (!node) {
      return;
    }

    if (prefersReducedData()) {
      return;
    }

    if (eager) {
      setShouldLoad(true);
    }

    const loadObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          loadObserver.disconnect();
        }
      },
      { rootMargin: MOUNT_MARGIN }
    );

    const playObserver = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
      },
      { threshold: 0.25 }
    );

    loadObserver.observe(node);
    playObserver.observe(node);

    return () => {
      loadObserver.disconnect();
      playObserver.disconnect();
    };
  }, [eager]);

  // The player reports its state over postMessage once enablejsapi is on.
  // First playing frame = time to fade the blurred poster out.
  useEffect(() => {
    if (!shouldLoad) {
      return;
    }

    function onMessage(event: MessageEvent) {
      if (event.origin !== YT_ORIGIN) {
        return;
      }
      if (event.source !== iframeRef.current?.contentWindow) {
        return;
      }

      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        const state = data?.info?.playerState;
        if (data?.event === "onReady" || state === 1) {
          setReady(true);
        }
      } catch {
        // Non-JSON chatter from the player — ignore.
      }
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [shouldLoad]);

  // Pause what nobody is looking at; resume on the way back in.
  useEffect(() => {
    if (!shouldLoad || unmuted) {
      return;
    }
    command(visible ? "playVideo" : "pauseVideo");
  }, [visible, shouldLoad, unmuted, command]);

  // Safety net: if the player never reports back, stop hiding the video.
  useEffect(() => {
    if (!shouldLoad || ready) {
      return;
    }
    const timer = window.setTimeout(() => setReady(true), 2500);
    return () => window.clearTimeout(timer);
  }, [shouldLoad, ready]);

  function handleUnmute() {
    command("unMute");
    command("setVolume", [100]);
    command("playVideo");
    setUnmuted(true);
  }

  const origin = mounted ? `&origin=${encodeURIComponent(window.location.origin)}` : "";
  const src =
    `${YT_ORIGIN}/embed/${id}` +
    `?autoplay=1&mute=1&loop=1&playlist=${id}&controls=1&enablejsapi=1` +
    `&modestbranding=1&rel=0&playsinline=1&iv_load_policy=3${origin}`;

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className ?? "w-full h-full"}`}>
      {/* BLURRED POSTER - fades out once the first frame is playing */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={posterUrl}
        alt=""
        fetchPriority={eager ? "high" : "auto"}
        decoding="async"
        className={`absolute inset-0 w-full h-full object-cover scale-110 blur-lg transition-opacity duration-700 ease-out ${
          ready ? "opacity-0" : "opacity-100"
        }`}
      />

      {shouldLoad && (
        <iframe
          ref={iframeRef}
          className={`absolute inset-0 w-full h-full transition-[opacity,filter] duration-700 ease-out ${
            ready ? "opacity-100 blur-0" : "opacity-0 blur-md"
          } ${unmuted ? "" : "pointer-events-none"}`}
          title={title}
          src={src}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      )}

      {/* UNMUTE OVERLAY - video keeps playing underneath */}
      {!unmuted && (
        <button
          type="button"
          onClick={handleUnmute}
          aria-label={`Unmute video: ${title}`}
          className="group absolute inset-0 w-full h-full grid place-items-center cursor-pointer"
        >
          {/* Ambient wash: the pulse spills past the panel into the frame. */}
          <span
            aria-hidden="true"
            className="ambient-breathe pointer-events-none absolute left-1/2 top-1/2 h-[92%] w-[96%] -translate-x-1/2 -translate-y-1/2 rounded-[28px] bg-[radial-gradient(ellipse_at_center,rgba(0,102,255,0.55),rgba(0,102,255,0.18)_45%,transparent_72%)] blur-xl"
          />

          <span className="relative flex flex-col items-center justify-center gap-2 md:gap-3 w-[84%] h-[76%] rounded-xl border-2 border-white/70 bg-[#0066FF]/35 backdrop-blur-[1px] px-3 text-center transition-colors duration-300 group-hover:bg-[#0066FF]/45">
            <span className="relative grid place-items-center">
              {/* Rings leaving the speaker, so the glow around it keeps moving. */}
              <span
                aria-hidden="true"
                className="ambient-ring pointer-events-none absolute h-12 w-12 rounded-full border border-white/60 md:h-14 md:w-14"
              />
              <span
                aria-hidden="true"
                className="ambient-ring ambient-ring-2 pointer-events-none absolute h-12 w-12 rounded-full border border-white/45 md:h-14 md:w-14"
              />
              <RisingVolumeIcon className="relative w-8 h-8 md:w-10 md:h-10 text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.45)]" />
            </span>
            <span className="text-base md:text-2xl font-bold leading-tight text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.45)]">
              Your Video Is Playing
              <br />
              Click To Unmute
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
