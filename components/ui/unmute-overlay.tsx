"use client";

import { useSyncExternalStore } from "react";

/**
 * Speaker whose arcs climb on a loop. The video underneath is already playing
 * muted, so a static icon reads as decoration — a rising level reads as sound.
 */
function RisingVolumeIcon({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
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
      style={style}
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
      <path className="volume-arc" d="M13.2 10.4a2.2 2.2 0 0 1 0 3.2" />
      <path className="volume-arc volume-arc-2" d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path className="volume-arc volume-arc-3" d="M18.07 5.93a8.5 8.5 0 0 1 0 12.14" />
    </svg>
  );
}

type UnmuteOverlayProps = {
  /** Used for the accessible label, e.g. the video title. */
  title: string;
  onUnmute: () => void;
  /** Bigger type for the hero, where the panel has far more room. */
  size?: "default" | "large";
  /** Autoplay refused, or held back on a metered connection. */
  label?: "click-to-unmute" | "tap-to-play";
};

/**
 * Everything here is sized in `cqw` — a percentage of the PLAYER's width, not
 * the viewport's. The same panel sits in a 1150px hero and a 345px phone card,
 * and viewport breakpoints got that wrong in both directions: the hero's
 * `text-xl` overflowed a 214px-wide box on a phone and clipped the icon.
 * Container units make the panel one shape that simply scales.
 */
const PANEL = {
  large: {
    width: "min(70cqw, 560px)",
    padding: "clamp(0.75rem, 3.4cqw, 1.75rem) clamp(0.75rem, 3cqw, 1.5rem)",
    gap: "clamp(0.4rem, 1.8cqw, 0.75rem)",
    icon: "clamp(1.6rem, 7cqw, 3.5rem)",
    ring: "clamp(2.6rem, 11cqw, 5rem)",
    text: "clamp(0.95rem, 4.2cqw, 1.875rem)",
    radius: "clamp(0.5rem, 1.6cqw, 0.75rem)",
  },
  default: {
    width: "min(84cqw, 420px)",
    padding: "clamp(0.6rem, 4cqw, 1.5rem) clamp(0.6rem, 3.5cqw, 1.25rem)",
    gap: "clamp(0.35rem, 2cqw, 0.75rem)",
    icon: "clamp(1.4rem, 8cqw, 2.5rem)",
    ring: "clamp(2.2rem, 12cqw, 3.5rem)",
    text: "clamp(0.8rem, 4.8cqw, 1.5rem)",
    radius: "clamp(0.5rem, 1.8cqw, 0.75rem)",
  },
} as const;

/**
 * True on a touch device. "Click To Unmute" is the wrong instruction on a
 * phone, and the phone is where this panel gets tapped most.
 *
 * Subscribed rather than read once: the server has no pointer to report, so it
 * answers `false` and the client corrects it after hydration — which also
 * covers a tablet switching between its touchscreen and a trackpad.
 */
const COARSE = "(pointer: coarse)";

function subscribeToPointer(onChange: () => void): () => void {
  const query = window.matchMedia(COARSE);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function useTouchPointer(): boolean {
  return useSyncExternalStore(
    subscribeToPointer,
    () => window.matchMedia(COARSE).matches,
    () => false
  );
}

/** The click-to-unmute panel shared by every muted-autoplay player. */
export function UnmuteOverlay({
  title,
  onUnmute,
  size = "default",
  label = "click-to-unmute",
}: UnmuteOverlayProps) {
  const held = label === "tap-to-play";
  const panel = PANEL[size];

  const verb = useTouchPointer() ? "Tap" : "Click";

  return (
    <button
      type="button"
      onClick={onUnmute}
      aria-label={`${held ? "Play" : "Unmute"} video: ${title}`}
      className="group absolute inset-0 w-full h-full grid place-items-center cursor-pointer @container"
    >
      {/* Scrim: keeps the white copy legible over bright footage. */}
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-black/20" />

      {/* Ambient wash: the pulse spills past the panel into the frame. */}
      <span
        aria-hidden="true"
        className="ambient-breathe pointer-events-none absolute left-1/2 top-1/2 h-[92%] w-[96%] -translate-x-1/2 -translate-y-1/2 rounded-[28px] bg-[radial-gradient(ellipse_at_center,rgba(0,102,255,0.55),rgba(0,102,255,0.18)_45%,transparent_72%)] blur-xl"
      />

      <span
        className="relative flex flex-col items-center justify-center border-2 border-white/70 bg-[#0066FF]/35 backdrop-blur-[1px] text-center transition-colors duration-300 group-hover:bg-[#0066FF]/45"
        style={{
          width: panel.width,
          padding: panel.padding,
          gap: panel.gap,
          borderRadius: panel.radius,
        }}
      >
        <span className="relative grid place-items-center">
          {/* Rings leaving the speaker, so the glow around it keeps moving. */}
          <span
            aria-hidden="true"
            className="ambient-ring pointer-events-none absolute rounded-full border border-white/60"
            style={{ height: panel.ring, width: panel.ring }}
          />
          <span
            aria-hidden="true"
            className="ambient-ring ambient-ring-2 pointer-events-none absolute rounded-full border border-white/45"
            style={{ height: panel.ring, width: panel.ring }}
          />
          <RisingVolumeIcon
            className="relative text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.45)]"
            style={{ height: panel.icon, width: panel.icon }}
          />
        </span>
        <span
          className="font-bold leading-tight text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.45)] text-balance"
          style={{ fontSize: panel.text }}
        >
          {held ? "Watch This Video" : "Your Video Is Playing"}
          <br />
          {held ? `${verb} To Play` : `${verb} To Unmute`}
        </span>
      </span>
    </button>
  );
}
