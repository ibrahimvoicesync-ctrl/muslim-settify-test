"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { LiteEmbed } from "@/components/ui/lite-embed";
import { UnmuteOverlay } from "@/components/ui/unmute-overlay";
import { markHeroVideoReady } from "@/lib/media-priority";

type LoomAutoplayEmbedProps = {
  id: string;
  title: string;
  thumbnailUrl?: string;
  className?: string;
};

const LOOM_ORIGIN = "https://www.loom.com";
/** Loom's player speaks player.js, so we can drive it instead of reloading it. */
const PLAYER_JS = { context: "player.js", version: "0.0.11" } as const;
/** If the player never reports in, stop hiding the video behind the poster. */
const REVEAL_CAP_MS = 6000;

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

function buildSrc(id: string, muted: boolean): string {
  const params = new URLSearchParams({
    autoplay: "1",
    muted: muted ? "true" : "false",
    hide_owner: "true",
    hide_share: "true",
    hide_title: "true",
    hideEmbedTopBar: "true",
  });
  return `${LOOM_ORIGIN}/embed/${id}?${params.toString()}`;
}

/**
 * Loom plays muted from the first paint, behind the same unmute panel the
 * testimonial grid uses.
 *
 * The player answers the player.js protocol, which buys two things: the poster
 * lifts on the first `timeupdate` carrying real playback rather than on a
 * guessed delay, and unmuting is a message to the running player instead of a
 * reload. The reload path is kept for the case where the handshake never
 * lands.
 *
 * Save-Data, slow connections and reduced motion fall back to the lightweight
 * click-to-play poster.
 */
export function LoomAutoplayEmbed({
  id,
  title,
  thumbnailUrl,
  className,
}: LoomAutoplayEmbedProps) {
  // Starts true so the player is in the server-rendered HTML — waiting for
  // hydration to mount it cost the main video a second and a half.
  const [autoplay, setAutoplay] = useState(true);
  const [unmuted, setUnmuted] = useState(false);
  const [reloadUnmuted, setReloadUnmuted] = useState(false);
  const [ready, setReady] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const playerLive = useRef(false);

  const send = useCallback((method: string, value?: unknown) => {
    const target = iframeRef.current?.contentWindow;
    if (!target) {
      return;
    }
    target.postMessage(
      JSON.stringify({ ...PLAYER_JS, method, ...(value === undefined ? {} : { value }) }),
      LOOM_ORIGIN
    );
  }, []);

  // Constrained clients drop back to the poster on the first client pass.
  useEffect(() => {
    if (prefersReducedData()) {
      setAutoplay(false);
    }
  }, []);

  useEffect(() => {
    if (!autoplay) {
      return;
    }

    function onMessage(event: MessageEvent) {
      if (event.origin !== LOOM_ORIGIN) {
        return;
      }
      if (event.source !== iframeRef.current?.contentWindow) {
        return;
      }

      let data: { event?: string; value?: { seconds?: number } };
      try {
        data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
      } catch {
        return;
      }

      if (data?.event === "ready") {
        playerLive.current = true;
        send("addEventListener", "timeupdate");
        send("addEventListener", "play");
        return;
      }

      // Real frames are on screen — lift the poster in one pass.
      if (data?.event === "play") {
        setReady(true);
        return;
      }
      if (data?.event === "timeupdate" && (data.value?.seconds ?? 0) > 0) {
        setReady(true);
      }
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [autoplay, send]);

  // Backstop: a player that never reports in must not sit behind a blurred
  // poster forever, and the rest of the page is queued behind this signal.
  useEffect(() => {
    if (!autoplay || ready) {
      return;
    }
    const timer = window.setTimeout(() => setReady(true), REVEAL_CAP_MS);
    return () => window.clearTimeout(timer);
  }, [autoplay, ready]);

  // Everything downstream of the hero starts once the video is up.
  useEffect(() => {
    if (ready) {
      markHeroVideoReady();
    }
  }, [ready]);

  function handleUnmute() {
    setUnmuted(true);

    if (playerLive.current) {
      send("unmute");
      send("setVolume", 100);
      send("play");
      return;
    }

    // No handshake — reload the player with sound as the fallback.
    setReloadUnmuted(true);
  }

  // Save-Data, slow connections and reduced motion keep the lightweight
  // poster-plus-play-button embed.
  if (!autoplay) {
    return (
      <LiteEmbed
        provider="loom"
        id={id}
        thumbnailUrl={thumbnailUrl}
        title={title}
        className={className}
        loading="eager"
      />
    );
  }

  return (
    <div className={`relative overflow-hidden ${className ?? "w-full h-full"}`}>
      {thumbnailUrl && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={thumbnailUrl}
          alt=""
          fetchPriority="high"
          decoding="async"
          className={`absolute inset-0 w-full h-full object-cover scale-110 blur-lg transition-opacity duration-700 ease-out ${
            ready ? "opacity-0" : "opacity-100"
          }`}
        />
      )}

      <iframe
        ref={iframeRef}
        // Only the fallback path remounts; the player.js route keeps playing.
        key={reloadUnmuted ? "sound" : "muted"}
        className={`absolute inset-0 w-full h-full transition-[opacity,filter] duration-700 ease-out ${
          ready ? "opacity-100 blur-0" : "opacity-0 blur-md"
        } ${unmuted ? "" : "pointer-events-none"}`}
        title={title}
        src={buildSrc(id, !reloadUnmuted)}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />

      {!unmuted && <UnmuteOverlay title={title} onUnmute={handleUnmute} size="large" />}
    </div>
  );
}
