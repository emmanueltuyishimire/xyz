/**
 * educationalVideos.ts
 * Central registry and utility helpers for Seniors Audit educational videos.
 * 
 * Manages video metadata, automated YouTube URL extraction, thumbnail resolution,
 * ISO duration parsing, and relational mapping to Seniors Audit guides and tools.
 */

export interface EducationalVideo {
  id: string; // Unique internal slug
  youtubeUrl: string;
  youtubeId: string;
  title: string;
  duration: string; // e.g. "9:29"
  durationIso: string; // e.g. "PT9M29S"
  category: 'Retirement & Taxes' | 'Medicare Costs' | 'Medicare vs Medicaid' | 'Social Security';
  editorialSummary: string; // Plain-English original overview
  whoShouldWatch: string; // Target audience description
  keyQuestionAnswered: string; // Core user question resolved
  relatedPageUrl: string; // Canonical Seniors Audit page
  relatedPageTitle: string; // Label for related page
  relatedToolUrl?: string; // Canonical tool URL
  relatedToolTitle?: string; // Label for related tool
  publishedDate: string; // YYYY-MM-DD
}

export const SENIORS_AUDIT_YOUTUBE_CHANNEL = 'https://www.youtube.com/@SeniorsAudit';
export const SENIORS_AUDIT_YOUTUBE_SUBSCRIBE_URL = 'https://www.youtube.com/@SeniorsAudit?sub_confirmation=1';

/**
 * Extracts a clean 11-character YouTube video ID from any valid YouTube URL or raw ID.
 */
export function extractYouTubeId(urlOrId: string): string {
  if (!urlOrId) return '';
  const trimmed = urlOrId.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  const match = trimmed.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
  return (match && match[1]) ? match[1] : trimmed;
}

/**
 * Generates official high-quality YouTube thumbnail URLs.
 */
export function getYouTubeThumbnailUrl(id: string, quality: 'hq' | 'maxres' = 'hq'): string {
  const cleanId = extractYouTubeId(id);
  return quality === 'maxres'
    ? `https://i.ytimg.com/vi/${cleanId}/maxresdefault.jpg`
    : `https://i.ytimg.com/vi/${cleanId}/hqdefault.jpg`;
}

/**
 * Generates a standard, policy-compliant YouTube embed URL.
 *
 * Conforms to:
 * - YouTube Terms of Service and embedded-player requirements
 * - YouTube Partner Program monetization policies
 * - Phase 14: Privacy-enhanced mode via youtube-nocookie.com (default)
 *
 * @param id              - YouTube video ID or URL
 * @param autoplay        - Whether to pass autoplay=1. Default FALSE.
 *                          Set to TRUE only when the user has deliberately clicked Play
 *                          (e.g. in the VideoPlayerCard facade click handler), so that the
 *                          video starts immediately without requiring a second click inside
 *                          the iframe. NEVER use autoplay=1 for page-load or scroll-triggered
 *                          iframes — that would violate Phases 3, 5, and 21.
 * @param startTime       - Optional start offset in seconds.
 * @param privacyEnhanced - Whether to use youtube-nocookie.com (default TRUE).
 *                          Reduces cookie-based tracking while remaining fully compatible
 *                          with YouTube Analytics and monetization per Phase 14.
 */
export function getYouTubeEmbedUrl(
  id: string,
  autoplay: boolean = false,
  startTime?: number,
  privacyEnhanced: boolean = true,
): string {
  const cleanId = extractYouTubeId(id);
  const host = privacyEnhanced
    ? 'https://www.youtube-nocookie.com/embed'
    : 'https://www.youtube.com/embed';
  const params = new URLSearchParams({
    rel: '0',   // Show only Seniors Audit channel-related suggestions
    loop: '0',  // No automatic looping (Phase 6 compliance)
  });
  if (autoplay) params.set('autoplay', '1');
  if (startTime) params.set('start', startTime.toString());
  return `${host}/${cleanId}?${params.toString()}`;
}

/**
 * Generates canonical YouTube watch URL.
 */
export function getYouTubeWatchUrl(id: string): string {
  const cleanId = extractYouTubeId(id);
  return `https://www.youtube.com/watch?v=${cleanId}`;
}

/**
 * Converts standard duration string "MM:SS" or "HH:MM:SS" into schema ISO 8601 duration "PT#H#M#S".
 */
export function formatDurationIso(durationStr: string): string {
  if (!durationStr) return 'PT0M';
  const parts = durationStr.split(':').map(p => parseInt(p, 10));
  if (parts.length === 2) {
    const [min, sec] = parts;
    return `PT${min}M${sec}S`;
  } else if (parts.length === 3) {
    const [hr, min, sec] = parts;
    return `PT${hr}H${min}M${sec}S`;
  }
  return 'PT0M';
}

/**
 * Initial registry of 5 Seniors Audit educational videos.
 */
export const EDUCATIONAL_VIDEOS: EducationalVideo[] = [
  {
    id: 'rmd-age-73-penalty-rules',
    youtubeUrl: 'https://www.youtube.com/watch?v=lyvEsghvn5E',
    youtubeId: 'lyvEsghvn5E',
    title: 'Turning 73? The IRS Forces You to Withdraw This Much (Or You Pay a 25% Penalty)',
    duration: '9:29',
    durationIso: 'PT9M29S',
    category: 'Retirement & Taxes',
    editorialSummary: 'A step-by-step breakdown of statutory SECURE 2.0 rules governing mandatory retirement distributions at age 73. Explains how the IRS Uniform Lifetime Table calculates minimum withdrawals, how the December 31 deadline works, and how to avoid the 25% penalty under 26 U.S. Code § 4974.',
    whoShouldWatch: 'Retirees turning age 72 or 73 who hold tax-deferred Traditional IRAs, 401(k)s, 403(b)s, or SEP IRAs.',
    keyQuestionAnswered: 'How much does the IRS force you to withdraw at age 73, and what happens if you miss the withdrawal deadline?',
    relatedPageUrl: '/tools/rmd-calculator/',
    relatedPageTitle: 'RMD Calculator by Age (2026 Tables)',
    relatedToolUrl: '/tools/rmd-calculator/',
    relatedToolTitle: 'Free RMD Calculator by Age',
    publishedDate: '2026-06-15',
  },
  {
    id: 'medicare-part-b-2026-cost-coverage',
    youtubeUrl: 'https://www.youtube.com/watch?v=iws8zHeazTo',
    youtubeId: 'iws8zHeazTo',
    title: 'Medicare Part B: The Real 2026 Cost and What It Actually Covers',
    duration: '53:37',
    durationIso: 'PT53M37S',
    category: 'Medicare Costs',
    editorialSummary: 'An in-depth guide to 2026 Medicare Part B medical insurance, covering the $202.90 standard monthly base premium, the $283 annual deductible, and the 20% coinsurance obligation. Clarifies critical hospital coverage rules, including observation status vs. inpatient admission.',
    whoShouldWatch: 'Adults approaching age 65 or Medicare beneficiaries seeking to understand outpatient doctor bills, preventive care, and high-income IRMAA tiers.',
    keyQuestionAnswered: 'What does Medicare Part B cover, what are the exact out-of-pocket costs in 2026, and why is observation status a financial risk?',
    relatedPageUrl: '/medicare/what-does-medicare-part-a-and-b-cover/',
    relatedPageTitle: 'What Medicare Part A & B Cover: 2026 Guide',
    relatedToolUrl: '/tools/medicare-premium-calculator/',
    relatedToolTitle: 'Medicare Premium Calculator',
    publishedDate: '2026-06-20',
  },
  {
    id: 'medicare-vs-medicaid-differences',
    youtubeUrl: 'https://www.youtube.com/watch?v=5CPqguafeq0',
    youtubeId: '5CPqguafeq0',
    title: 'Medicare and Medicaid Are NOT the Same Thing (Here\'s What Nobody Tells You)',
    duration: '51:25',
    durationIso: 'PT51M25S',
    category: 'Medicare vs Medicaid',
    editorialSummary: 'Clears up the widespread confusion between federal Medicare and joint state-federal Medicaid. Explains income and asset thresholds, dual eligibility, Medicare Savings Programs (QMB/SLMB), and how Medicaid pays for long-term custodial nursing home care while Medicare does not.',
    whoShouldWatch: 'Seniors, retirees, and family caregivers seeking government assistance for healthcare costs, prescription copays, or nursing home planning.',
    keyQuestionAnswered: 'What is the real difference between Medicare and Medicaid, and how can low-income seniors qualify for both programs?',
    relatedPageUrl: '/medicare/medicare-vs-medicaid/',
    relatedPageTitle: 'Medicare vs. Medicaid: Which Covers You?',
    relatedToolUrl: '/tools/medicare-savings-estimator/',
    relatedToolTitle: 'Medicare Savings Estimator',
    publishedDate: '2026-07-01',
  },
  {
    id: 'medicare-costs-2026-parts-a-b-c-d',
    youtubeUrl: 'https://www.youtube.com/watch?v=oFZF1sLZEKI',
    youtubeId: 'oFZF1sLZEKI',
    title: 'How Much Does Medicare Really Cost in 2026 Parts A, B, C, D',
    duration: '14:02',
    durationIso: 'PT14M2S',
    category: 'Medicare Costs',
    editorialSummary: 'A comprehensive walkthrough of all 2026 out-of-pocket Medicare expenses across Parts A, B, C, and D. Details the $1,736 Part A inpatient deductible, $202.90 Part B premium, Medicare Advantage cost structures, and the new $2,100 Part D prescription drug out-of-pocket cap.',
    whoShouldWatch: 'Retirees budgeting healthcare costs for 2026 and older adults comparing Original Medicare with Medigap against Medicare Advantage.',
    keyQuestionAnswered: 'What is your total out-of-pocket financial exposure across every part of Medicare in 2026?',
    relatedPageUrl: '/medicare/costs/',
    relatedPageTitle: 'Medicare Costs 2026: Complete Pillar Guide',
    relatedToolUrl: '/tools/original-medicare-medigap-part-d-cost-estimator/',
    relatedToolTitle: 'Original Medicare + Medigap + Part D Cost Estimator',
    publishedDate: '2026-07-10',
  },
  {
    id: 'social-security-full-retirement-age-by-birth-year',
    youtubeUrl: 'https://www.youtube.com/watch?v=1DMf1t5i_v0',
    youtubeId: '1DMf1t5i_v0',
    title: 'What Is Your Full Retirement Age? Comment Your Birth Year to Find Out',
    duration: '6:56',
    durationIso: 'PT6M56S',
    category: 'Social Security',
    editorialSummary: 'Explains statutory Social Security Full Retirement Age (FRA) by birth year under Section 216(l) of the Social Security Act. Shows how claiming early at age 62 permanently reduces your monthly benefit by up to 30%, while delaying past FRA earns 8% annual delayed retirement credits up to age 70.',
    whoShouldWatch: 'Anyone born between 1955 and 1960 or later who is deciding whether to claim Social Security early, at FRA, or wait until age 70.',
    keyQuestionAnswered: 'What is your exact Full Retirement Age by birth year, and how much money do you forfeit by claiming early at 62?',
    relatedPageUrl: '/tools/social-security-full-retirement-age-calculator/',
    relatedPageTitle: 'Social Security Full Retirement Age Calculator',
    relatedToolUrl: '/tools/social-security-full-retirement-age-calculator/',
    relatedToolTitle: 'Free Full Retirement Age Calculator',
    publishedDate: '2026-07-15',
  }
];

/**
 * Lookup video by either internal slug or YouTube ID.
 */
export function getVideo(slugOrYoutubeId: string): EducationalVideo | undefined {
  const cleanId = extractYouTubeId(slugOrYoutubeId);
  return EDUCATIONAL_VIDEOS.find(
    v => v.id === slugOrYoutubeId || v.youtubeId === cleanId
  );
}
