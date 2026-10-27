export const nowPlayingLabel = "font-mono text-[10px] tracking-[0.08em] text-muted-foreground uppercase";

/**
 * The rail's now playing card before the clock is read (PRD §12: a
 * placeholder on the first frame), and the whole card while
 * content/music.ts is empty. In the first load; the live card is not.
 */
export function NowPlayingPlaceholder({ empty = false }: { empty?: boolean }) {
  return (
    <section aria-label="Now playing" className="shrink-0 rounded-[14px] border border-line bg-surface px-3 py-2.5">
      <p className={nowPlayingLabel}>Now playing</p>
      {empty ? (
        <p className="mt-1 truncate text-[13px] text-text">Nothing playing</p>
      ) : (
        <p className="mt-1.5 h-3 w-2/3 rounded-full bg-raised" aria-hidden="true" />
      )}
      <div className="mt-2 h-0.5 rounded-full bg-line" aria-hidden="true" />
    </section>
  );
}
