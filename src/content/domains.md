# Domains

Every primary domain the company owns or controls. Subdomains are not listed here; each app's own page covers the host it runs on.

Verified 2026-08-19 against the Vercel domain registry (`vercel domains ls`) and live nameserver lookups. Anything not on this list is not ours, no matter how much it looks like it should be.

## Primary Domains

| Domain | Used for | Registrar | DNS | Renews |
|--------|----------|-----------|-----|--------|
| `lfiq.app` | The BRICK app fleet. Every internal app is a subdomain here | External | Cloudflare and Vercel (see below) | — |
| `leftfieldiq.com` | Public marketing site and investor materials | Cloudflare | Cloudflare | — |
| `leftfieldinv.com` | Left Field Investments corporate email and identity | External | Cloudflare | — |
| `lfihub.com` | Reserved | Vercel | Vercel | Aug 18 2027 |
| `lfigallery.com` | Reserved | Vercel | Vercel | Mar 22 2027 |
| `lfi.app` | Reserved. Not currently pointed at us | External | Sedo parking | — |
| `mosser.app` | Mosser-facing tooling | External | Cloudflare | — |
| `backninetrades.com` | Back9 Trades, canonical domain | Vercel | Vercel | May 06 2027 |
| `back9trades.com` | Back9 Trades, second spelling. Serves the same site | Vercel | Vercel | Jun 12 2027 |
| `singerscott.io` | Singer & Scott, prospect engagement | Vercel | Vercel | Jul 27 2027 |
| `7base.io` | Reserved | Vercel | Cloudflare | Aug 18 2027 |
| `fahq.app` | Reserved | Vercel | Vercel | Mar 22 2027 |
| `leftfield.app` | Reserved. Registered Aug 2026, not yet configured | External | None resolving | — |
| `fridgeart.app` | Fridgeart. Registrar parking page today | External | Registrar lander | — |
| `pushinp.app` | Reserved | External | Cloudflare | — |

"External" means the domain is registered somewhere other than Vercel. Vercel manages the registration for the rest, which is why those rows carry a renewal date.

Four of these serve a live site today: `lfiq.app` (the app fleet), `backninetrades.com` and `back9trades.com` (both resolve to Back9 Trades), and `singerscott.io`. The ones marked reserved are registered and return a 404 at the apex. `leftfieldiq.com` is meant to be live and is not; see Known Issues.

## Where They Live

Registration and DNS are split across three places, and the split does not follow any single rule. Check both before you change a record.

- **Vercel (team `lfiq`).** Registrar of record for seven domains and the DNS provider for eight. `vercel domains ls --scope=lfiq` is the authoritative inventory.
- **Cloudflare.** Registrar for `leftfieldiq.com` and DNS for `leftfieldinv.com`, `mosser.app`, `pushinp.app`, `7base.io`, and part of `lfiq.app`.
- **Elsewhere.** `lfi.app` and `fridgeart.app` sit on parking nameservers, so neither is currently serving anything of ours.

`leftfield.app` is registered under the personal Vercel team (`sato-hobby`), not the company team. Everything else on this list is under `lfiq`.

## Known Issues

Three things on this list are broken or ambiguous. They are documented rather than quietly omitted so nobody rediscovers them the hard way.

**`lfiq.app` is delegated to two providers at once.** The domain currently answers with four nameservers: `arvind.ns.cloudflare.com`, `daniella.ns.cloudflare.com`, `ns1.vercel-dns.com`, and `ns2.vercel-dns.com`. Split delegation means a resolver can land on either zone, and the two zones do not have to agree. Any record you add lands in one of them, so a change can appear to work for you and not for anyone else. Do not edit `lfiq.app` DNS until the delegation is consolidated to one provider.

**`leftfieldiq.com` returns HTTP 525.** Cloudflare cannot complete a TLS handshake with the origin. The marketing site is effectively down at the apex.

**`lfi.app` resolves to Sedo parking.** Vercel still lists it under the team, but the nameservers are a domain-sale parking service and the apex does not respond. Confirm the registration is still live before treating it as an asset.

## Rules

- Internal apps go on `<app>.lfiq.app`. Nothing else. The fleet shares one Clerk instance, and Clerk only moves a session between hosts that are siblings under the same apex. An app on any other domain loses shared sign-on.
- Do not register a new domain for an internal tool. Add a subdomain to `lfiq.app`.
- New registrations go on the `lfiq` Vercel team, not a personal account.
- Public and client-facing properties are the exception and keep their own domains, which is why `leftfieldiq.com`, `backninetrades.com`, and `singerscott.io` exist.
