"use client";

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

type UnmuteOverlayProps = {
  /** Used for the accessible label, e.g. the video title. */
  title: string;
  onUnmute: () => void;
  /** Bigger type for the hero, where the panel has far more room. */
  size?: "default" | "large";
};

/** The click-to-unmute panel shared by every muted-autoplay player. */
export function UnmuteOverlay({ title, onUnmute, size = "default" }: UnmuteOverlayProps) {
  const large = size === "large";

  return (
    <button
      type="button"
      onClick={onUnmute}
      aria-label={`Unmute video: ${title}`}
      className="group absolute inset-0 w-full h-full grid place-items-center cursor-pointer"
    >
      {/* Scrim: keeps the white copy legible over bright footage. */}
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-black/20" />

      {/* Ambient wash: the pulse spills past the panel into the frame. */}
      <span
        aria-hidden="true"
        className="ambient-breathe pointer-events-none absolute left-1/2 top-1/2 h-[92%] w-[96%] -translate-x-1/2 -translate-y-1/2 rounded-[28px] bg-[radial-gradient(ellipse_at_center,rgba(0,102,255,0.55),rgba(0,102,255,0.18)_45%,transparent_72%)] blur-xl"
      />

      <span
        className={`relative flex flex-col items-center justify-center gap-2 md:gap-3 rounded-xl border-2 border-white/70 bg-[#0066FF]/35 backdrop-blur-[1px] px-3 text-center transition-colors duration-300 group-hover:bg-[#0066FF]/45 ${
          large ? "w-[62%] h-[52%] max-w-[560px]" : "w-[84%] h-[76%]"
        }`}
      >
        <span className="relative grid place-items-center">
          {/* Rings leaving the speaker, so the glow around it keeps moving. */}
          <span
            aria-hidden="true"
            className={`ambient-ring pointer-events-none absolute rounded-full border border-white/60 ${
              large ? "h-16 w-16 md:h-20 md:w-20" : "h-12 w-12 md:h-14 md:w-14"
            }`}
          />
          <span
            aria-hidden="true"
            className={`ambient-ring ambient-ring-2 pointer-events-none absolute rounded-full border border-white/45 ${
              large ? "h-16 w-16 md:h-20 md:w-20" : "h-12 w-12 md:h-14 md:w-14"
            }`}
          />
          <RisingVolumeIcon
            className={`relative text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.45)] ${
              large ? "w-10 h-10 md:w-14 md:h-14" : "w-8 h-8 md:w-10 md:h-10"
            }`}
          />
        </span>
        <span
          className={`font-bold leading-tight text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.45)] ${
            large ? "text-xl md:text-3xl" : "text-base md:text-2xl"
          }`}
        >
          Your Video Is Playing
          <br />
          Click To Unmute
        </span>
      </span>
    </button>
  );
}
