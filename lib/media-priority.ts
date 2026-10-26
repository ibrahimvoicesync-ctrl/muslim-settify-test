/**
 * The hero video gets the network to itself until it is up.
 *
 * Ten muted YouTube players and a thumbnail prefetch would otherwise open
 * their connections while the main video is still buffering, and the one video
 * everybody actually watches is the one that stalls.
 */
let ready = false;
const listeners = new Set<() => void>();

export function markHeroVideoReady(): void {
  if (ready) {
    return;
  }
  ready = true;
  for (const listener of listeners) {
    listener();
  }
  listeners.clear();
}

/**
 * Runs `callback` once the hero video is up, or after `timeoutMs` — pages
 * without a hero, and heroes that never load, must not block everything else.
 */
export function whenHeroVideoReady(callback: () => void, timeoutMs = 4000): () => void {
  if (ready) {
    callback();
    return () => {};
  }

  let done = false;
  const run = () => {
    if (done) {
      return;
    }
    done = true;
    listeners.delete(run);
    window.clearTimeout(timer);
    callback();
  };

  const timer = window.setTimeout(run, timeoutMs);
  listeners.add(run);

  return () => {
    done = true;
    listeners.delete(run);
    window.clearTimeout(timer);
  };
}
