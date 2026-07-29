import { headers } from "next/headers";
import { redirect } from "next/navigation";

const MUSLIMSETTIFY_TYPEFORM_URL = "https://form.typeform.com/to/ztBUiWgs";
const SETTIFYOWTP_TYPEFORM_URL = "https://form.typeform.com/to/jR36nOwS";
const SETTIFYHAQQAN_TYPEFORM_URL = "https://form.typeform.com/to/t5UXUG8L";
const H_MUSLIMSETTIFY_TYPEFORM_URL =
  "https://form.typeform.com/to/PLACEHOLDER_H_MUSLIMSETTIFY";

function normalizeHost(host: string): string {
  return host.trim().toLowerCase().split(":")[0] ?? "";
}

function resolveTypeformUrl(host: string): string | null {
  const normalizedHost = normalizeHost(host);

  // This exact-match check MUST come before the muslimsettify.com subdomain
  // fallback below: "h.muslimsettify.com" satisfies the parent brand's
  // `.endsWith(".muslimsettify.com")` check, so without this ordering the
  // 4th brand would be silently swallowed by the parent brand's form.
  if (normalizedHost === "h.muslimsettify.com") {
    return H_MUSLIMSETTIFY_TYPEFORM_URL;
  }

  // Hard-protect the main domain so it can never "accidentally" point elsewhere.
  if (
    normalizedHost === "muslimsettify.com" ||
    normalizedHost.endsWith(".muslimsettify.com")
  ) {
    return MUSLIMSETTIFY_TYPEFORM_URL;
  }

  // Hard-protect the other two sites as well. We match loosely (includes)
  // because Vercel preview + custom domains can vary, but the host usually
  // includes the site slug.
  if (
    normalizedHost === "settifyhaqqan.com" ||
    normalizedHost.endsWith(".settifyhaqqan.com") ||
    normalizedHost.includes("settifyhaqqan")
  ) {
    return SETTIFYHAQQAN_TYPEFORM_URL;
  }

  if (
    normalizedHost === "settifyowtp.com" ||
    normalizedHost.endsWith(".settifyowtp.com") ||
    normalizedHost.includes("settifyowtp")
  ) {
    return SETTIFYOWTP_TYPEFORM_URL;
  }

  const configured = process.env.TYPEFORM_URL?.trim();

  return configured || null;
}

export default async function ApplyPage() {
  const h = await headers();
  const host = h.get("host") ?? "";
  const resolved = resolveTypeformUrl(host);

  if (resolved) {
    redirect(resolved);
  }

  const safeHost = normalizeHost(host) || "(unknown host)";

  return (
    <main
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "48px 24px",
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji"',
      }}
    >
      <h1 style={{ fontSize: 28, lineHeight: 1.2, margin: "0 0 12px" }}>
        Apply link misconfigured
      </h1>
      <p style={{ margin: "0 0 16px", color: "#334155" }}>
        This deployment isn’t configured with the correct Typeform URL for{" "}
        <strong>{safeHost}</strong>.
      </p>
      <p style={{ margin: 0, color: "#334155" }}>
        Set the appropriate env var in Vercel and redeploy:
      </p>
      <ul style={{ margin: "12px 0 0", paddingLeft: 18, color: "#334155" }}>
        <li>
          <code>TYPEFORM_URL</code> as a fallback for other hosts
        </li>
      </ul>
    </main>
  );
}


