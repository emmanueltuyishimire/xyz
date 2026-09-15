# Seniors Audit — Master 301 Redirect Map (Living Document)
Last updated: September 13, 2026

Per Rule 2 of the URL Integrity & Audit Protocol:
> Keep a simple, permanent record of every URL change ever made on the site: old URL, new URL, date changed, and reason for the change.
> Before making any future content or navigation update, check this map first — this prevents accidentally re-linking to a long-retired URL out of habit or copy-paste from old material.
> Never delete a 301 redirect once created, even years later, unless you are certain no external backlinks or bookmarks still point to the old URL.

---

## Active 301 Redirect Inventory & Routing Map

| # | Old URL (Source) | Final Destination URL (Target) | Date Changed | Type | Reason / Optimization Goal | Internal Links Audited & Cleaned? |
|---|---|---|---|---|---|---|
| 1 | `https://seniorsaudit.com/*` | `https://www.seniorsaudit.com/:splat` | 2026-01-15 | 301 (Force) | Canonical domain enforcement (non-www → www) | N/A (Domain level) |
| 2 | `/about/emmanuel-t/` | `/about/emmanuel-tuyishimire/` | 2026-08-15 | 301 | Full legal name authorship E-E-A-T canonical URL | Yes — all internal links target `/about/emmanuel-tuyishimire/` |
| 3 | `/about/emmanuel-t` | `/about/emmanuel-tuyishimire/` | 2026-08-15 | 301 | Trailing slash / alias canonicalization | Yes |
| 4 | `/about/emmanuel-t/*` | `/about/emmanuel-tuyishimire/` | 2026-08-15 | 301 | Wildcard catch-all for old author URL | Yes |
| 5 | `/tools/medicare-part-b-premium-calculator/` | `/tools/medicare-premium-calculator/` | 2026-09-01 | 301 | Merged Part A + B into unified Medicare Premium Calculator | Yes |
| 6 | `/tools/part-d-late-enrollment-penalty-calculator/` | `/tools/medicare-part-d-late-enrollment-penalty-calculator/` | 2026-09-01 | 301 | Keyword prefix alignment to include 'medicare-' | Yes |
| 7 | `/irs/cp2000-underreporter-notice/` | `/irs/what-is-a-cp2000-notice/` | 2026-08-10 | 301 | Canonical article slug matching natural search queries | Yes |
| 8 | `/tools/irs-cp2000-response-guide/` | `/tools/cp2000-response-letter-sample/` | 2026-08-20 | 301 | Tool renamed to emphasize letter sample utility | Yes |
| 9 | `/tools/irs-cp14-notice-decoder/` | `/tools/cp14-notice/` | 2026-08-10 | 301 | Simplified concise slug matching user search intent | Yes |
| 10 | `/tools/irs-cp504-notice-decoder/` | `/tools/cp504-notice/` | 2026-08-10 | 301 | Simplified concise slug matching user search intent | Yes |
| 11 | `/tools/rmd-calculator-by-age/` | `/tools/rmd-calculator/` | 2026-09-15 | 301 (Force) | Canonical intent restoration (rmd-calculator owns primary search demand) | Yes — internal links cleaned |
| 12 | `/tools/social-security-benefit-cap-calculator/` | `/tools/social-security-benefit-cap-proposal/` | 2026-08-15 | 301 | Reflects statutory trust fund cap legislative proposal | Yes |
| 13 | `/social-security/social-security-benefit-cap-proposal/` | `/tools/social-security-benefit-cap-proposal/` | 2026-08-15 | 301 | Category consolidation (moved to /tools/ section) | Yes |
| 14 | `/tools/social-security-cola-estimator/` | `/tools/social-security-cola-calculator/` | 2026-09-05 | 301 (Force) | Terminology migration ('calculator' beats 'estimator' in SERPs) | Yes — retired .astro removed, netlify forced |
| 15 | `/articles/*` | `/blog/` | 2026-06-01 | 301 | Legacy section migration to /blog/ | Yes |
| 16 | `/learning/*` | `/blog/` | 2026-06-01 | 301 | Legacy section migration to /blog/ | Yes |
| 17 | `/senior-health/*` | `/blog/` | 2026-06-01 | 301 | Topic cluster merged into blog section | Yes |
| 18 | `/memory-and-cognitive-health/*` | `/blog/` | 2026-06-01 | 301 | Topic cluster merged into blog section | Yes |
| 19 | `/fall-prevention/*` | `/tools/fall-risk-home-safety-checklist/` | 2026-07-01 | 301 | Content consolidated into CDC STEADI checklist tool | Yes |
| 20 | `/heart-health/*` | `/blog/` | 2026-06-01 | 301 | Topic cluster merged into blog section | Yes |
| 21 | `/tools/medicaid-eligibility-checker/*` | `/tools/medicare-savings-estimator/` | 2026-07-15 | 301 | Consolidated Medicaid savings check to single tool | Yes |
| 22 | `/retirement/irs-life-expectancy-tables/*` | `/tools/rmd-calculator/` | 2026-09-13 | 301 | Collapsed redirect chain (previously hopped to /rmd-calculator/) | Yes — direct single hop |
| 23 | `/medicaid/medicare-savings-programs/*` | `/medicare/medicare-savings-programs/` | 2026-07-20 | 301 | Section reclassification (MSP belongs under Medicare) | Yes |
| 24 | `/tools/magi-calculator/*` | `/tools/magi-for-medicare-calculator/` | 2026-08-01 | 301 | Specificity upgrade (MAGI specifically for Medicare/IRMAA) | Yes |
| 25 | `/taxes/pension-tax-rules/*` | `/tools/retirement-tax-withholding-calculator/` | 2026-08-05 | 301 | Pension tax content mapped to withholding calculator | Yes |
| 26 | `/tools/tax-document-comparison/*` | `/tools/cp2000-response-letter-sample/` | 2026-09-13 | 301 | Collapsed redirect chain (previously hopped to /irs-cp2000-response-guide/) | Yes — direct single hop |
| 27 | `/medicaid/qmb-program-overview/*` | `/medicare/medicare-savings-programs/` | 2026-07-20 | 301 | Consolidated QMB program into main MSP guide | Yes |
| 28 | `/tools/irmaa-calculator/*` | `/tools/medicare-irmaa-calculator/` | 2026-08-20 | 301 | Aligned with 'medicare-irmaa-calculator' naming convention | Yes — internal links in resources/ cleaned |
| 29 | `/tools/social-security-benefits-estimator/` | `/tools/social-security-benefits-calculator/` | 2026-09-15 | 301 (Force) | Ahrefs/GSC search intent alignment (calculator dominates >10k) | Yes |
| 30 | `/tools/retirement-tax-estimator/` | `/tools/retirement-tax-calculator/` | 2026-09-15 | 301 (Force) | Ahrefs/GSC search intent alignment (calculator dominates demand) | Yes |

---

## Operating Protocols & Maintenance Checklist

1. **Before modifying any slug:** Check this table to confirm the target URL is not an old alias.
2. **When creating a new redirect:** Always add direct single-hop mapping (no chains). Set `status = 301`. Add `force = true` if legacy static assets could collide.
3. **Internal link sweeps:** Run a sitewide grep for the retired slug across `src/` and replace all occurrences with the live URL.
4. **Sitemap validation:** Confirm the old URL does not appear in `src/pages/sitemap.xml.ts`.
5. **Canonical check:** Confirm the new page's canonical tag points to itself, not the old URL.
