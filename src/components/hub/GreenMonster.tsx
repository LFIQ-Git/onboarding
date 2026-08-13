import Link from 'next/link';
import { APPS, type HubApp } from '@/lib/hub-apps';

/**
 * The LFIQ Hub cover: Fenway's left field wall, with every app in the
 * portfolio as a club on the scoreboard. Every row is the same size and every
 * row links out. No app is the home team.
 *
 * Palette is the wall itself. Hub's sage brand (#55624d) sits close enough to
 * Fenway green that the two read as the same family.
 */

const WALL = '#0d4d2b';
const WALL_DEEP = '#0a3d22';
const SEAM = '#07301b';
const CREAM = '#f2efe4';
const YELLOW = '#f2c14e';
const MUTED = 'rgba(242,239,228,0.62)';

/**
 * Fenway hides Morse for the Yawkeys' initials in the scoreboard's vertical
 * stripes. Ours spells LFIQ.
 */
const MORSE_LFIQ = ['.-..', '..-.', '..', '--.-'];

function MorseStripe({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`flex flex-col items-center gap-[6px] py-4 ${className}`}
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

/** One club on the board. Identical treatment for every app. */
function ScoreRow({ app }: { app: HubApp }) {
  const linked = app.href !== null;

  const body = (
    <div className="flex items-center gap-4">
      <span
        className="font-hub flex h-12 w-12 shrink-0 items-center justify-center rounded-sm text-sm font-extrabold tracking-widest"
        style={{
          background: linked ? CREAM : 'rgba(242,239,228,0.18)',
          color: linked ? WALL_DEEP : 'rgba(242,239,228,0.6)',
        }}
      >
        {app.code}
      </span>

      <div className="min-w-0 flex-1">
        <p
          className="font-hub text-lg font-bold uppercase tracking-[0.1em]"
          style={{ color: linked ? CREAM : 'rgba(242,239,228,0.6)' }}
        >
          {app.name}
        </p>
        <p className="text-sm" style={{ color: MUTED }}>
          {app.blurb}
        </p>
        {app.host && (
          <p
            className="mt-0.5 font-mono text-xs"
            style={{ color: 'rgba(242,239,228,0.4)' }}
          >
            {app.host}
          </p>
        )}
      </div>

      <span
        className="shrink-0 rounded-sm px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em]"
        style={{
          background: SEAM,
          color: app.status === 'live' ? YELLOW : 'rgba(242,239,228,0.5)',
        }}
      >
        {app.note}
      </span>
    </div>
  );

  const shell = 'block rounded-sm p-4 sm:p-5';
  const shellStyle = {
    background: WALL_DEEP,
    border: `1px solid ${SEAM}`,
  };

  if (!linked) {
    return (
      <li>
        <div className={shell} style={{ ...shellStyle, opacity: 0.72 }}>
          {body}
        </div>
      </li>
    );
  }

  // Internal routes stay in the tab; everything else opens out.
  const external = app.href!.startsWith('http');

  return (
    <li>
      {external ? (
        <a
          href={app.href!}
          target="_blank"
          rel="noopener noreferrer"
          className={`${shell} transition-colors hover:brightness-125`}
          style={shellStyle}
        >
          {body}
        </a>
      ) : (
        <Link
          href={app.href!}
          className={`${shell} transition-colors hover:brightness-125`}
          style={shellStyle}
        >
          {body}
        </Link>
      )}
    </li>
  );
}

export function GreenMonster() {
  return (
    <div
      className="min-h-screen w-full px-4 py-12 sm:px-6 lg:px-8"
      style={{
        background: `linear-gradient(180deg, ${WALL_DEEP} 0%, ${WALL} 42%, ${WALL_DEEP} 100%)`,
      }}
    >
      <div className="mx-auto w-full max-w-4xl">
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
            className="max-w-sm text-sm leading-relaxed"
            style={{ color: 'rgba(242,239,228,0.72)' }}
          >
            The whole portfolio on one wall. Every app is a club on the board.
            Pick one.
          </p>
        </header>

        <Rivets />

        <section
          className="flex"
          style={{ background: WALL }}
          aria-labelledby="scoreboard"
        >
          <MorseStripe className="hidden w-8 shrink-0 sm:flex" />

          <div className="min-w-0 flex-1 px-5 py-7 sm:px-8">
            <h2
              id="scoreboard"
              className="mb-4 text-xs font-bold uppercase tracking-[0.3em]"
              style={{ color: YELLOW }}
            >
              Scoreboard
            </h2>

            <ul className="space-y-2">
              {APPS.map((app) => (
                <ScoreRow key={app.code} app={app} />
              ))}
            </ul>
          </div>
        </section>

        <Rivets />

        <footer
          className="px-5 py-5 text-xs sm:px-8"
          style={{ background: WALL_DEEP, color: 'rgba(242,239,228,0.5)' }}
        >
          Tax has no link because it is not deployed yet.
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
