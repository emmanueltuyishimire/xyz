/**
 * rehype-inline-ads
 * Inserts Adsterra banners between sections of long Markdown articles, so ads sit in natural breaks
 * (before an H2), never inside lists, tables, callouts or the first screen.
 *
 *   before the 3rd H2: 728x90 on desktop (>=768px) or 320x50 on mobile
 *   before the 6th H2: 468x60 on desktop only (only in articles with 8+ sections)
 *
 * Only the matching device loads its ad script. Plain hast element nodes are used (no raw HTML),
 * and any failure leaves the article untouched.
 */
const KEYS = {
  '728x90': { key: '5bea7139343325df7bc749e2116064c3', w: 728, h: 90 },
  '468x60': { key: 'aa202c92923dd8900f1cf6003c25e9a5', w: 468, h: 60 },
  '320x50': { key: '2632eb88ddaae4c17cb7af3038fe1516', w: 320, h: 50 },
};

const script = (text) => ({ type: 'element', tagName: 'script', properties: {}, children: [{ type: 'text', value: text }] });

function slot(unit, device, cls) {
  const u = KEYS[unit];
  const mq = device === 'desktop' ? '(min-width: 768px)' : '(max-width: 767px)';
  const opts = `{'key' : '${u.key}', 'format' : 'iframe', 'height' : ${u.h}, 'width' : ${u.w}, 'params' : {}}`;
  const code =
    `if (window.matchMedia('${mq}').matches) { atOptions = ${opts}; ` +
    `document.write('<scr' + 'ipt src="https://bauval.org/22/${u.key}"></scr' + 'ipt>'); }`;
  return {
    type: 'element',
    tagName: 'aside',
    properties: {
      className: ['ad-banner-container', 'inline-ad', cls],
      ariaLabel: 'Advertisement',
      style: `--ad-w: ${u.w}px; --ad-h: ${u.h}px; display:flex; flex-direction:column; align-items:center; margin-block:1.5rem; min-height:${u.h}px; max-width:100%; overflow:hidden;`,
    },
    children: [
      {
        type: 'element',
        tagName: 'p',
        properties: { style: 'font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:.08em; color:var(--color-text-muted,#999); margin:0 0 4px 0; text-align:center;' },
        children: [{ type: 'text', value: 'Advertisement' }],
      },
      { type: 'element', tagName: 'div', properties: { style: `width:${u.w}px; max-width:100%; min-height:${u.h}px; display:flex; align-items:center; justify-content:center; overflow:hidden;` }, children: [script(code)] },
    ],
  };
}

export function rehypeInlineAds() {
  return (tree) => {
    try {
      const kids = tree.children;
      const h2 = [];
      kids.forEach((n, i) => { if (n.type === 'element' && n.tagName === 'h2') h2.push(i); });
      if (h2.length < 4) return;
      const plan = [[h2[2], [slot('728x90', 'desktop', 'inline-ad-d'), slot('320x50', 'mobile', 'inline-ad-m')]]];
      if (h2.length >= 8) plan.push([h2[5], [slot('468x60', 'desktop', 'inline-ad-d2')]]);
      for (const [idx, nodes] of plan.reverse()) kids.splice(idx, 0, ...nodes);
    } catch {
      /* never break the build over an ad slot */
    }
  };
}
