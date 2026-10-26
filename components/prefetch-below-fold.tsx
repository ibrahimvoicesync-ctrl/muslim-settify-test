"use client";

import { useEffect } from "react";

import { TESTIMONIAL_POSTERS } from "@/components/video-testimonials";
import { whenHeroVideoReady } from "@/lib/media-priority";

type NetworkInformationLike = {
  saveData?: boolean;
  effectiveType?: string;
};

function getConnection(): NetworkInformationLike | undefined {
  const nav = navigator as unknown as { connection?: NetworkInformationLike };
  return nav.connection;
}

function isSlowConnection(connection?: NetworkInformationLike): boolean {
  if (!connection) {
    return false;
  }
  if (connection.saveData) {
    return true;
  }
  const t = connection.effectiveType ?? "";
  return t === "slow-2g" || t === "2g";
}

function prefetchImage(url: string) {
  const img = new Image();
  img.decoding = "async";
  img.src = url;
}

function scheduleIdle(work: () => void) {
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(() => work(), { timeout: 2500 });
    return;
  }
  window.setTimeout(work, 1200);
}

export function PrefetchBelowFold() {
  useEffect(() => {
    // Only in the browser.
    const connection = getConnection();
    if (isSlowConnection(connection)) {
      return;
    }

    // The hero video eats first; these are only poster images, and they are
    // same-origin now that the result cards play our own clips.
    const cancel = whenHeroVideoReady(() => {
      scheduleIdle(() => {
        for (const poster of TESTIMONIAL_POSTERS) {
          prefetchImage(poster);
        }
      });
    });

    return cancel;
  }, []);

  return null;
}


