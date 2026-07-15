# Seniors Audit – Master SEO, E-E-A-T & Technical Optimization Specification

## WEBSITE PURPOSE & BRANDING
- **Brand Name:** Seniors Audit
- **Website URL:** https://www.seniorsaudit.com
- **Support Email:** support@seniorsaudit.com
- **Platform/Tech Stack:** Astro, TypeScript, React Islands (where necessary), GitHub, Netlify, Decap CMS, Static Site Generation (SSG).
- **Core Mission:** Educational resource for Medicare, Social Security, Retirement, IRS notices, Federal taxes, Government benefits, and retirement planning.
- **Strict Constraint:** Do NOT provide legal, tax, financial, or medical advice. Everything must be educational.

## TARGET AUDIENCE GUIDELINES (Seniors 60+, Caregivers)
- Focus on reducing anxiety, ensuring maximum readability, using clear & simple plain English, and avoiding condescending tone.
- Avoid scary/intimidating words without offering immediate pathways to solutions.

## E-E-A-T REQUIREMENTS
- **Experience:** Show practical examples, step-by-step walkthroughs, and realistic dollar-amount scenarios.
- **Expertise:** Cite official government sources directly (e.g. ssa.gov, irs.gov, medicare.gov).
- **Authorship:** 
  - **T. Emmanuel** (TUYISHIMIRE Emmanuel) - Founder, Lead Researcher, Developer, and Content Author
  - **U. Simon James** (UWUMUKIZA Simon James) - Co-Founder, Educational Researcher, Content Reviewer, and Content Author
  - Every article must display Author, Last Updated, Reading Time, Sources, Related Articles, and Related Tools.

## TECHNICAL SEO & METADATA
- Every page must generate unique title, meta description, canonical URL, robots meta, Open Graph, Twitter cards, Breadcrumbs, Language attribute (`en`), theme color, and sitemap/RSS links.
- URLs must be lowercase, hyphen-separated, short, and permanent.
- **Structured Data (JSON-LD):**
  - Homepage: Organization, WebSite (SearchAction)
  - About: AboutPage, Organization
  - Contact: ContactPage, Organization
  - Authors: Person
  - Articles: Article, BreadcrumbList, Person, Organization
  - Calculators: SoftwareApplication / WebApplication, FAQPage, BreadcrumbList, WebPage

## ACCESSIBILITY & PERFORMANCE
- Meet WCAG 2.2 AA standards (18-20px body font, high contrast, keyboard navigation, clear focus rings).
- Target Lighthouse scores of 95+ (Performance), 100 (Accessibility), 100 (SEO), 100 (Best Practices).
- Ensure fast page loads (<2.5s) and optimize code structure.

## EDITORIAL & ARTICLE ARCHITECTURE RULES

Every article published on seniorsaudit.com must follow these guidelines:

### 1. The Core Editorial Standard
- Peer-to-peer knowledge sharing tone (use "we" language, e.g. "We looked into this"). Not professor to student.
- Treat the reader as an intelligent adult who deserves the full truth about a complex system.
- **Banned Words List:** Do not use: "it is important to note", "it is worth noting", "it is crucial to understand", "it goes without saying", "in conclusion", "to summarize", "let us dive in", "without further ado", "in the realm of", "at the end of the day", "some might argue", "it remains to be seen", "leverage", "delve", "comprehensive", "robust", "holistic", "optimize", "game changer", "paradigm shift".

### 2. Technical Metadata Block
At the top of the markdown body, include:
- **Primary Keyword:** Replaced in slug, H1, meta description, and first 100 words.
- **Secondary Keywords:** 4-6 related terms.
- **Natural Language AI Query Variants:** 4 natural questions typed/spoken to AIs/search engines.
- **URL Slug:** Lowecase, hyphenated, ≤60 characters, no stop words.
- **Meta Title:** ≤60 characters, primary keyword in first 40 characters, ended with `| Seniors Audit`.
- **Meta Description:** 140 to 155 characters.
- **Last Reviewed Date:** Visible at top: `Last reviewed by the Seniors Audit research team on [MONTH YEAR]`.
- **Primary Source Citations List:** Acceptable sources: `.gov`, `.mil`, Cornell Law CFR, KFF, and PubMed. No news outlets or secondary content sites.

### 3. AEO Opening Structure
1. **Quick Answer Block:** Under 60 words, visually distinct callout (`background-color: #0A3D3A; color: #FFFFFF; border-left: 5px solid #C9933A;`), labeled with "Quick Answer" in senior gold (`#C9933A`).
2. **Problem Statement Paragraph:** 80-100 words in peer tone, validating the complexity.
3. **What This Article Covers:** Bulleted list of 4-6 questions.

### 4. Article Body Structure
- **H2 Section 1 — Understanding [SPECIFIC TOPIC]: What the Official Rules Actually Say:** Core rules explained with exact official terminology on first reference with plain English in parentheses. Include a concrete numerical example. (250-350 words)
  - **H3 Section: The Plain English Version:** Max 5 bullet points, one sentence each, jargon-free.
- **H2 Section 2 — Who This Applies To: The Eligibility Rules:** Organize by eligibility scenarios, using H3 sub-headings starting with a clear Yes/No/It depends. (300-400 words)
- **H2 Section 3 — The Numbers: Specific Amounts, Dates, and Calculations:** Numeric figures, percentages, dates, thresholds, and calculations. Include a two-column HTML table with Deep Authority Teal headers. (300-450 words)
- **H2 Section 4 — What Most Sources Don't Tell You: The Research Finding:** Net information gain element based on research (OIG audit reports, POMS instructions, etc.). (200-300 words)
- **H2 Section 5 — What You Can Do: The Specific Action Steps:** Actionable numbered list containing form numbers, phone numbers, URLs, and deadlines. Ends with SHIP counselor resource. (250-350 words)
- **H2 Section 6 — Common Questions: Frequently Asked Questions:** 5 to 10 PAA FAQ pairs. H3 headings, answers strictly 40-60 words.
- **H2 Section 7 — State Variations and Individual Circumstances:** Governing body differences (federal vs. state). Teal callout box. (150-250 words)

### 5. Closing Structure
1. **Summary Checklist:** Teal box labeled "Your [TOPIC] Action Checklist" with 4-6 actionable items.
2. **Educational Disclaimer:** Standard Midnight Navy box (`background-color: #08111F`) with white text.
3. **Primary Sources Reference List:** "Sources Used in This Article" list of links.
4. **Related Articles Navigation:** "Related Articles You May Find Useful" with 3-4 links and descriptions.

