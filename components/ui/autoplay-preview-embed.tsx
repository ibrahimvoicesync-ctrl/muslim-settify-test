"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { UnmuteOverlay } from "@/components/ui/unmute-overlay";

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
      {!unmuted && <UnmuteOverlay title={title} onUnmute={handleUnmute} />}

    </div>
  );
}
