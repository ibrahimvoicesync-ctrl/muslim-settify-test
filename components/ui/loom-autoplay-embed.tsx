"use client";

import { useEffect, useRef, useState } from "react";

import { LiteEmbed } from "@/components/ui/lite-embed";
import { UnmuteOverlay } from "@/components/ui/unmute-overlay";
import { markHeroVideoReady } from "@/lib/media-priority";

type LoomAutoplayEmbedProps = {
  id: string;
  title: string;
  thumbnailUrl?: string;
  className?: string;
};

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

/** Gap between Loom's load event and the first painted frame. */
const SETTLE_MS = 900;

function buildSrc(id: string, muted: boolean, startAt: number): string {
  const params = new URLSearchParams({
    autoplay: "1",
    muted: muted ? "true" : "false",
    hide_owner: "true",
    hide_share: "true",
    hide_title: "true",
    hideEmbedTopBar: "true",
  });
  if (!muted && startAt > 0) {
    params.set("t", String(startAt));
  }
  return `https://www.loom.com/embed/${id}?${params.toString()}`;
}

/**
 * Loom plays muted from the first paint, with the same unmute panel the
 * testimonial grid uses. Loom exposes no JS volume control to an embedding
 * page, so unmuting reloads the player with sound — `t` drops the viewer back
 * roughly where the muted preview had reached instead of restarting.
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
  const [ready, setReady] = useState(false);
  const [startAt, setStartAt] = useState(0);
  const startedAt = useRef<number | null>(null);

  // Constrained clients drop back to the poster on the first client pass.
  useEffect(() => {
    if (prefersReducedData()) {
      setAutoplay(false);
    }
  }, []);

  // Hard cap: a player that never loads must not sit behind a blurred poster
  // forever, and the rest of the page is waiting on this signal.
  useEffect(() => {
    if (!autoplay || ready) {
      return;
    }
    const timer = window.setTimeout(() => setReady(true), 6000);
    return () => window.clearTimeout(timer);
  }, [autoplay, ready]);

  // Everything downstream of the poster starts once the video is up.
  useEffect(() => {
    if (ready) {
      markHeroVideoReady();
    }
  }, [ready]);

  function handleLoad() {
    if (startedAt.current === null) {
      startedAt.current = Date.now();
    }
    if (unmuted) {
      // The remount already has picture behind it — no second blur pass.
      setReady(true);
      return;
    }
    // Loom's load event fires with the player chrome, not the first frame.
    // Hold the blurred poster over that gap so the reveal happens in one go
    // instead of flashing an empty player.
    window.setTimeout(() => setReady(true), SETTLE_MS);
  }

  function handleUnmute() {
    const elapsed =
      startedAt.current === null
        ? 0
        : Math.max(0, Math.floor((Date.now() - startedAt.current) / 1000) - 1);
    setStartAt(elapsed);
    setUnmuted(true);
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
        // Remounting is the only way to flip Loom's audio on.
        key={unmuted ? "sound" : "muted"}
        className={`absolute inset-0 w-full h-full transition-[opacity,filter] duration-700 ease-out ${
          ready ? "opacity-100 blur-0" : "opacity-0 blur-md"
        } ${unmuted ? "" : "pointer-events-none"}`}
        title={title}
        src={buildSrc(id, !unmuted, startAt)}
        onLoad={handleLoad}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />

      {!unmuted && <UnmuteOverlay title={title} onUnmute={handleUnmute} size="large" />}
    </div>
  );
}
