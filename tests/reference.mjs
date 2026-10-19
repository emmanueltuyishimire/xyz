// tests/reference.mjs: independent 2026 reference (IRC §86, Rev. Proc. 2025-32, IRS Pub. 6142)
const B = {
  single: [[12400, 0.10], [50400, 0.12], [105700, 0.22], [201775, 0.24]],
  mfj:    [[24800, 0.10], [100800, 0.12], [211400, 0.22], [403550, 0.24]],
};
const STD = { single: 16100, mfj: 32200 };
const ADD = { single: 2050, mfj: 1650 };           // per person 65+

export function refTax(ti, st) {                   // valid up to the last cutoff
  let t = 0, prev = 0;
  for (const [top, rate] of B[st]) {
    if (ti > prev) t += (Math.min(ti, top) - prev) * rate;
    prev = top;
  }
  return Math.round(t);
}

export function refTaxableSS(ss, other, st) {
  const [b1, b2] = st === "mfj" ? [32000, 44000] : [25000, 34000];
  const prov = other + 0.5 * ss;
  let t;
  if (prov <= b1) t = 0;
  else if (prov <= b2) t = 0.5 * (prov - b1);
  else t = 0.85 * (prov - b2) + Math.min(0.5 * (b2 - b1), 0.5 * ss);
  return Math.min(t, 0.85 * ss);
}

export function refSenior(magi, st, nEligible) {   // OBBBA 2025–2028; MFS not eligible
  const start = st === "mfj" ? 150000 : 75000;
  return Math.max(0, 6000 * nEligible - 0.06 * Math.max(0, magi - start));
}

export function refRun({ ss, other, st, n65 }) {
  const t = refTaxableSS(ss, other, st);
  const agi = other + t;
  const sd = STD[st] + ADD[st] * n65;
  const sen = refSenior(agi, st, n65);
  return {
    taxableSS: Math.round(t),
    agi: Math.round(agi),
    taxWithoutSeniorDed: refTax(Math.max(0, agi - sd), st),
    taxWithSeniorDed: refTax(Math.max(0, agi - sd - sen), st),
  };
}
