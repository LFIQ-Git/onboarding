/**
 * The LFIQ app roster rendered on the Green Monster scoreboard.
 *
 * Every `href` here was verified live on 2026-08-12 (DNS resolves and the URL
 * returns 200, counting a redirect to a sign-in page as live). Do not add an
 * app without checking it the same way. A dead link on the hub page is worse
 * than an app that is not listed.
 */

export type GameStatus = 'live' | 'scheduled';

export interface HubApp {
  /** Three-letter code, the way a scoreboard abbreviates a club. */
  code: string;
  name: string;
  /** What the app is for, in an operator's words. */
  blurb: string;
  /** Null when there is nothing live to link to yet. */
  href: string | null;
  status: GameStatus;
  /** Shown in the status column instead of an invented score. */
  note: string;
}

/** The game being played at this park: the app you are currently in. */
export const HOME_GAME = {
  code: 'ONB',
  name: 'Onboarding',
  blurb: 'The manual for the whole LFIQ stack. Start here on day one.',
  href: '/docs',
  /**
   * Real counts, not decoration. Update these when the manual changes.
   * Pages = entries in the sidebar nav. Apps = per-app guides under
   * Applications. Sources = live external feeds documented in Data Ingestion.
   */
  line: [
    { label: 'Pages', value: '26' },
    { label: 'Apps', value: '8' },
    { label: 'Sources', value: '27' },
  ],
} as const;

/** Everyone else, the out-of-town scoreboard. */
export const OUT_OF_TOWN: HubApp[] = [
  {
    code: 'BRK',
    name: 'Brick',
    blurb: 'Portfolio, leasing, collections, repairs',
    href: 'https://hub.lfiq.app',
    status: 'live',
    note: 'Live',
  },
  {
    code: 'BK9',
    name: 'Back9',
    blurb: 'Repair and maintenance client management',
    href: 'https://client.back9trades.com',
    status: 'live',
    note: 'Live',
  },
  {
    code: 'LFC',
    name: 'Left Field Corp',
    blurb: 'Left Field Investments corporate',
    href: 'https://leftfieldinv.com',
    status: 'live',
    note: 'Live',
  },
  {
    code: 'TAX',
    name: 'Tax',
    blurb: 'Personal tax ledger',
    // Intentionally null. `tax.lfiq.app` is NXDOMAIN and the app has never
    // been deployed; its code sits on an unmerged branch. Listed as a
    // scheduled game rather than linked to a host that does not exist.
    href: null,
    status: 'scheduled',
    note: 'Not deployed',
  },
];
