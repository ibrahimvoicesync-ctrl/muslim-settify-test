"use client";

import { useEffect } from "react";

import { YOUTUBE_VIDEO_IDS } from "@/components/video-testimonials";

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
    const slow = isSlowConnection(connection);
    const effectiveType = connection?.effectiveType ?? "";
    const allowExternal = !slow && (effectiveType === "" || effectiveType === "4g");

    scheduleIdle(() => {
      // Video poster thumbnails (cache-warm for when sections/iframes mount).
      if (allowExternal) {
        for (const id of YOUTUBE_VIDEO_IDS) {
          prefetchImage(`https://i.ytimg.com/vi/${id}/hqdefault.jpg`);
        }
      }
    });
  }, []);

  return null;
}


