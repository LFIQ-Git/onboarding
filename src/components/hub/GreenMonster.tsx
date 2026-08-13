import Link from 'next/link';
import { HOME_GAME, OUT_OF_TOWN } from '@/lib/hub-apps';

/**
 * The LFIQ Hub cover: Fenway's left field wall, with the app you are in shown
 * as the game at this park and every other LFIQ app as a club on the
 * out-of-town board. Each out-of-town row links out.
 *
 * Palette is the wall itself. Hub's sage brand (#55624d) sits close enough to
 * Fenway green that the two read as the same family.
 */

const WALL = '#0d4d2b';
const WALL_DEEP = '#0a3d22';
const SEAM = '#07301b';
const CREAM = '#f2efe4';
const YELLOW = '#f2c14e';

/**
 * Fenway hides Morse for the Yawkeys' initials in the scoreboard's vertical
 * stripes. Ours spells LFIQ.
 */
const MORSE_LFIQ: string[] = [
  '.-..', // L
  '..-.', // F
  '..', // I
  '--.-', // Q
];

function MorseStripe({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`flex flex-col items-center gap-[6px] py-3 ${className}`}
      style={{ background: WALL_DEEP }}
    >
      {MORSE_LFIQ.map((letter, li) => (
        <div key={li} className="flex flex-col items-center gap-[5px]">
          {letter.split('').map((mark, mi) => (
            <span
              key={mi}
              style={{
                background: YELLOW,
                opacity: 0.75,
                width: 3,
                height: mark === '-' ? 13 : 3,
                borderRadius: 1,
                display: 'block',
              }}
            />
          ))}
          <span style={{ height: 5 }} />
        </div>
      ))}
    </div>
  );
}

/** The riveted seam between wall panels. */
function Rivets() {
  return (
    <div
      aria-hidden="true"
      className="flex justify-between px-2 py-1"
      style={{ background: SEAM }}
    >
      {Array.from({ length: 14 }).map((_, i) => (
        <span
          key={i}
          className="rounded-full"
          style={{
            width: 4,
            height: 4,
            background: 'rgba(242,239,228,0.22)',
            boxShadow: 'inset 0 1px 0 rgba(0,0,0,0.4)',
          }}
        />
      ))}
    </div>
  );
}

export function GreenMonster() {
  return (
    <div
      className="min-h-[calc(100vh-4rem)] w-full px-4 py-10 sm:px-6 lg:px-8"
      style={{
        background: `linear-gradient(180deg, ${WALL_DEEP} 0%, ${WALL} 42%, ${WALL_DEEP} 100%)`,
      }}
    >
      <div className="mx-auto w-full max-w-5xl">
        {/* Yellow rail along the top of the wall */}
        <div
          aria-hidden="true"
          className="h-2 w-full rounded-t"
          style={{ background: YELLOW }}
        />

        <header
          className="flex flex-wrap items-end justify-between gap-4 px-5 py-6 sm:px-8"
          style={{ background: WALL_DEEP, borderBottom: `2px solid ${SEAM}` }}
        >
          <div>
            <h1
              className="font-hub text-3xl font-extrabold uppercase leading-none tracking-[0.18em] sm:text-4xl"
              style={{ color: CREAM }}
            >
              LFIQ Hub
            </h1>
            <p
              className="mt-2 text-xs uppercase tracking-[0.28em]"
              style={{ color: YELLOW }}
            >
              Left Field Investments
            </p>
          </div>
          <p
            className="max-w-xs text-sm leading-relaxed"
            style={{ color: 'rgba(242,239,228,0.72)' }}
          >
            Every LFIQ app on one wall. The game at this park is the onboarding
            manual. Everything else is out of town.
          </p>
        </header>

        <Rivets />

        {/* The game at this park */}
        <section
          className="px-5 py-7 sm:px-8"
          style={{ background: WALL }}
          aria-labelledby="at-the-park"
        >
          <h2
            id="at-the-park"
            className="mb-4 text-xs font-bold uppercase tracking-[0.3em]"
            style={{ color: YELLOW }}
          >
            At this park
          </h2>

          <Link
            href={HOME_GAME.href}
            className="group block rounded-sm p-5 transition-colors sm:p-6"
            style={{ background: WALL_DEEP, border: `1px solid ${SEAM}` }}
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span
                  className="font-hub flex h-14 w-14 shrink-0 items-center justify-center rounded-sm text-base font-extrabold tracking-widest"
                  style={{ background: CREAM, color: WALL_DEEP }}
                >
                  {HOME_GAME.code}
                </span>
                <div>
                  <p
                    className="font-hub text-2xl font-bold uppercase tracking-[0.12em]"
                    style={{ color: CREAM }}
                  >
                    {HOME_GAME.name}
                  </p>
                  <p
                    className="mt-1 text-sm"
                    style={{ color: 'rgba(242,239,228,0.7)' }}
                  >
                    {HOME_GAME.blurb}
                  </p>
                </div>
              </div>

              {/* Real counts, not decoration */}
              <div className="flex gap-2">
                {HOME_GAME.line.map((cell) => (
                  <div
                    key={cell.label}
                    className="min-w-[68px] rounded-sm px-3 py-2 text-center"
                    style={{ background: SEAM }}
                  >
                    <div
                      className="font-hub text-2xl font-bold tabular-nums"
                      style={{ color: CREAM }}
                    >
                      {cell.value}
                    </div>
                    <div
                      className="mt-0.5 text-[10px] uppercase tracking-[0.18em]"
                      style={{ color: 'rgba(242,239,228,0.55)' }}
                    >
                      {cell.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p
              className="mt-5 text-sm font-semibold uppercase tracking-[0.16em] transition-transform group-hover:translate-x-1"
              style={{ color: YELLOW }}
            >
              Read the manual →
            </p>
          </Link>
        </section>

        <Rivets />

        {/* Out-of-town board */}
        <section
          className="flex"
          style={{ background: WALL }}
          aria-labelledby="out-of-town"
        >
          <MorseStripe className="hidden w-8 shrink-0 sm:flex" />

          <div className="min-w-0 flex-1 px-5 py-7 sm:px-8">
            <h2
              id="out-of-town"
              className="mb-4 text-xs font-bold uppercase tracking-[0.3em]"
              style={{ color: YELLOW }}
            >
              Out of town
            </h2>

            <ul className="space-y-2">
              {OUT_OF_TOWN.map((app) => {
                const inner = (
                  <div className="flex items-center gap-4">
                    <span
                      className="font-hub flex h-11 w-11 shrink-0 items-center justify-center rounded-sm text-sm font-extrabold tracking-widest"
                      style={{
                        background: app.href ? CREAM : 'rgba(242,239,228,0.18)',
                        color: app.href ? WALL_DEEP : 'rgba(242,239,228,0.6)',
                      }}
                    >
                      {app.code}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p
                        className="font-hub text-lg font-bold uppercase tracking-[0.1em]"
                        style={{
                          color: app.href ? CREAM : 'rgba(242,239,228,0.6)',
                        }}
                      >
                        {app.name}
                      </p>
                      <p
                        className="text-sm"
                        style={{ color: 'rgba(242,239,228,0.62)' }}
                      >
                        {app.blurb}
                      </p>
                    </div>

                    <span
                      className="shrink-0 rounded-sm px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em]"
                      style={{
                        background: SEAM,
                        color:
                          app.status === 'live'
                            ? YELLOW
                            : 'rgba(242,239,228,0.5)',
                      }}
                    >
                      {app.note}
                    </span>
                  </div>
                );

                return (
                  <li key={app.code}>
                    {app.href ? (
                      <a
                        href={app.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-sm p-4 transition-colors hover:brightness-125"
                        style={{
                          background: WALL_DEEP,
                          border: `1px solid ${SEAM}`,
                        }}
                      >
                        {inner}
                      </a>
                    ) : (
                      <div
                        className="block rounded-sm p-4"
                        style={{
                          background: WALL_DEEP,
                          border: `1px solid ${SEAM}`,
                          opacity: 0.72,
                        }}
                      >
                        {inner}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <Rivets />

        <footer
          className="px-5 py-5 text-xs sm:px-8"
          style={{ background: WALL_DEEP, color: 'rgba(242,239,228,0.5)' }}
        >
          Links open in a new tab. Tax has no link because it is not deployed
          yet.
        </footer>

        <div
          aria-hidden="true"
          className="h-3 w-full rounded-b"
          style={{ background: SEAM }}
        />
      </div>
    </div>
  );
}
