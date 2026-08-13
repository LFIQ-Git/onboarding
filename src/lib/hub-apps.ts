/**
 * The LFIQ app roster rendered on the Green Monster scoreboard.
 *
 * This hub is the front door for the whole portfolio. Every app is an equal
 * entry on the board, including the onboarding manual. Nothing here is a home
 * team, so no app gets extra chrome, extra stats, or a bigger tile.
 *
 * Every `href` was verified live on 2026-08-12 (DNS resolves and the URL
 * returns 200, counting a redirect to a sign-in page as live). Do not add an
 * app without checking it the same way. A dead link on this page is worse than
 * an app that is not listed.
 */

export type GameStatus = 'live' | 'scheduled';

export interface HubApp {
  /** Three-letter code, the way a scoreboard abbreviates a club. */
  code: string;
  name: string;
  /** What the app is for, in an operator's words. */
  blurb: string;
  /** The host as shown on the board. Null when nothing is deployed. */
  host: string | null;
  /** Null when there is nothing live to link to yet. */
  href: string | null;
  status: GameStatus;
  /** Shown in the status column instead of an invented score. */
  note: string;
}

/**
 * Live apps first, then anything not yet deployed. No other ranking is
 * implied and none should be added.
 */
export const APPS: HubApp[] = [
  {
    code: 'BRK',
    name: 'Brick',
    blurb: 'Portfolio, leasing, collections, repairs',
    host: 'hub.lfiq.app',
    href: 'https://hub.lfiq.app',
    status: 'live',
    note: 'Live',
  },
  {
    code: 'BK9',
    name: 'Back9',
    blurb: 'Repair and maintenance client management',
    host: 'client.back9trades.com',
    href: 'https://client.back9trades.com',
    status: 'live',
    note: 'Live',
  },
  {
    code: 'LFC',
    name: 'Left Field Corp',
    blurb: 'Left Field Investments corporate',
    host: 'leftfieldinv.com',
    href: 'https://leftfieldinv.com',
    status: 'live',
    note: 'Live',
  },
  {
    code: 'LIQ',
    name: 'Left Field IQ',
    blurb: 'Left Field IQ product site',
    host: 'lfiq.app',
    href: 'https://lfiq.app',
    status: 'live',
    note: 'Live',
  },
  {
    code: 'ONB',
    name: 'Onboarding',
    blurb: 'The manual for the whole LFIQ stack',
    host: 'onboarding.lfiq.app',
    href: '/docs',
    status: 'live',
    note: 'Live',
  },
  {
    code: 'TAX',
    name: 'Tax',
    blurb: 'Personal tax ledger',
    host: null,
    // Intentionally null. `tax.lfiq.app` is NXDOMAIN and the app has never
    // been deployed; its code sits on an unmerged branch. Listed as a
    // scheduled game rather than linked to a host that does not exist.
    href: null,
    status: 'scheduled',
    note: 'Not deployed',
  },
];
