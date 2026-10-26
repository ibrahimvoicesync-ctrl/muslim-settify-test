type LiteEmbedProps =
  | {
      provider: "youtube";
      id: string;
      title: string;
      className?: string;
      loading?: "eager" | "lazy";
    }
  | {
      provider: "loom";
      id: string;
      title: string;
      thumbnailUrl?: string;
      className?: string;
      loading?: "eager" | "lazy";
    };

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function LiteEmbed(props: LiteEmbedProps) {
  const loading = props.loading ?? "lazy";
  const title = props.title;
  const escapedTitle = escapeHtml(title);

  const { src, posterUrl } =
    props.provider === "youtube"
      ? {
          src: `https://www.youtube-nocookie.com/embed/${props.id}?autoplay=1`,
          posterUrl: `https://i.ytimg.com/vi/${props.id}/hqdefault.jpg`,
        }
      : {
          src: `https://www.loom.com/embed/${props.id}?autoplay=1`,
          posterUrl: props.thumbnailUrl,
        };

  const srcDoc = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      *{padding:0;margin:0}
      html,body{height:100%}
      a{display:block;position:relative;height:100%;background:#0B1220}
      img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
      .overlay{position:absolute;inset:0;display:grid;place-items:center;background:linear-gradient(0deg,rgba(0,0,0,.35),rgba(0,0,0,.05))}
      .stage{position:relative;display:grid;place-items:center;width:72px;height:72px}
      .halo{position:absolute;width:150px;height:150px;border-radius:9999px;background:radial-gradient(circle,rgba(255,255,255,.4),rgba(0,102,255,.18) 45%,transparent 70%);filter:blur(14px);animation:breathe 2.8s ease-in-out infinite}
      .ring{position:absolute;width:72px;height:72px;border-radius:9999px;border:2px solid rgba(255,255,255,.6);animation:ripple 2.8s cubic-bezier(.2,.6,.3,1) infinite}
      .ring2{border-color:rgba(255,255,255,.45);animation-delay:.95s}
      .play{position:relative;width:72px;height:72px;border-radius:9999px;background:rgba(255,255,255,.92);display:grid;place-items:center;animation:beat 2.8s ease-in-out infinite}
      .play svg{width:28px;height:28px;margin-left:3px;fill:#0B1220}
      @keyframes ripple{0%{opacity:.6;transform:scale(.72)}70%,100%{opacity:0;transform:scale(1.75)}}
      @keyframes breathe{0%,100%{opacity:.3;transform:scale(.92)}50%{opacity:.65;transform:scale(1.06)}}
      @keyframes beat{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
      @media (prefers-reduced-motion: reduce){.halo,.ring,.play{animation:none}.ring{opacity:0}}
      .label{position:absolute;left:16px;bottom:14px;font:600 14px/1.2 ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:rgba(255,255,255,.92);text-shadow:0 1px 6px rgba(0,0,0,.45)}
    </style>
  </head>
  <body>
    <a href="${src}">
      ${
        posterUrl
          ? `<img src="${posterUrl}" alt="${escapedTitle}" loading="lazy" decoding="async" />`
          : ""
      }
      <div class="overlay">
        <div class="stage" aria-hidden="true">
          <div class="halo"></div>
          <div class="ring"></div>
          <div class="ring ring2"></div>
          <div class="play">
            <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
              <path d="M8 5v14l11-7z"></path>
            </svg>
          </div>
        </div>
      </div>
      <div class="label">Tap to play</div>
    </a>
  </body>
</html>`;

  return (
    <iframe
      className={props.className ?? "w-full h-full"}
      title={title}
      loading={loading}
      // Keep the initial embed lightweight; load the real player on tap via srcDoc link.
      src="about:blank"
      srcDoc={srcDoc}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      referrerPolicy="strict-origin-when-cross-origin"
    />
  );
}


