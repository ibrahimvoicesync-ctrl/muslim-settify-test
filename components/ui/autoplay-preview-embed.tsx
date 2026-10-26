"use client";

import { useEffect, useRef, useState } from "react";

import { UnmuteOverlay } from "@/components/ui/unmute-overlay";
import { whenHeroVideoReady } from "@/lib/media-priority";

type AutoplayPreviewEmbedProps = {
  /** Short silent loop we host ourselves — what the card actually autoplays. */
  clip: string;
  /** The clip's own first frame. */
  poster: string;
  /** The full video on YouTube, loaded only once someone clicks. */
  youtubeId: string;
  title: string;
  className?: string;
  /** Fetch the clip straight away instead of waiting for the scroll. */
  eager?: boolean;
};

const YT_ORIGIN = "https://www.youtube-nocookie.com";
/** Start loading before the card reaches the viewport, but not a screen early. */
const MOUNT_MARGIN = "600px 0px";

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
 * A student-result card: our own clip loops muted, YouTube takes over on click.
 *
 * Ten YouTube iframes could not start before ten copies of the player had
 * booted, and iOS declines muted iframe autoplay often enough that phones never
 * saw the preview move at all. A same-origin `<video muted playsInline loop>`
 * has neither problem — and at ~20 silent seconds per card it is a fraction of
 * what the players cost. The real video, full length and with sound, is one
 * click away and only then does any third-party JS load.
 */
export function AutoplayPreviewEmbed({
  clip,
  poster,
  youtubeId,
  title,
  className,
  eager = false,
}: AutoplayPreviewEmbedProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [visible, setVisible] = useState(false);
  /** Autoplay refused, or held back on a metered connection. */
  const [held, setHeld] = useState(false);
  /** Clicked: the clip is done and the real player is in. */
  const [opened, setOpened] = useState(false);

  // 1) Fetch the clip early (600px ahead of the scroll) so it is already
  //    running by the time the card is on screen.
  // 2) Track real visibility separately, so off-screen clips pause instead of
  //    burning a phone's battery on ten decoders at once.
  useEffect(() => {
    const node = containerRef.current;
    if (!node) {
      return;
    }

    if (prefersReducedData()) {
      // Metered connection: swap the panel over to a manual play.
      queueMicrotask(() => setHeld(true));
      return;
    }

    // Queue behind the hero video: these only claim bandwidth once the main one
    // is playing (or has had its 4s head start).
    let cancelPriority = () => {};
    const allow = () => {
      cancelPriority = whenHeroVideoReady(() => setShouldLoad(true));
    };

    if (eager) {
      allow();
    }

    const loadObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          allow();
          loadObserver.disconnect();
        }
      },
      { rootMargin: MOUNT_MARGIN }
    );

    const playObserver = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.25 }
    );

    loadObserver.observe(node);
    playObserver.observe(node);

    return () => {
      cancelPriority();
      loadObserver.disconnect();
      playObserver.disconnect();
    };
  }, [eager]);

  // Play what is on screen, pause what is not. A refused play() means the
  // browser wants a gesture — the panel then asks for one.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldLoad || opened) {
      return;
    }
    if (visible) {
      video.play().then(
        () => setHeld(false),
        () => setHeld(true)
      );
    } else {
      video.pause();
    }
  }, [visible, shouldLoad, opened]);

  /** Hand off to the full video: YouTube, with sound, from the top. */
  function handleOpen() {
    videoRef.current?.pause();
    setOpened(true);
  }

  // Only read when `opened`, which cannot happen before a click — so there is
  // no server render of this URL to disagree with.
  const playerSrc = () =>
    `${YT_ORIGIN}/embed/${youtubeId}` +
    `?autoplay=1&controls=1&modestbranding=1&rel=0&playsinline=1&iv_load_policy=3` +
    `&origin=${encodeURIComponent(window.location.origin)}`;

  return (
    <div ref={containerRef} className={`relative overflow-hidden bg-[#0B1220] ${className ?? "w-full h-full"}`}>
      {!opened && (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          // No src until the card is in range: ten clips at once would undo the
          // point of hosting them.
          src={shouldLoad ? clip : undefined}
          poster={poster}
          title={title}
          muted
          loop
          playsInline
          preload={shouldLoad ? "auto" : "none"}
          // Decorative until clicked; the real player carries the content.
          tabIndex={-1}
          aria-hidden="true"
        />
      )}

      {opened && (
        <iframe
          className="absolute inset-0 w-full h-full"
          title={title}
          src={playerSrc()}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      )}

      {!opened && (
        <UnmuteOverlay
          title={title}
          onUnmute={handleOpen}
          label={held ? "tap-to-play" : "click-to-unmute"}
        />
      )}
    </div>
  );
}
