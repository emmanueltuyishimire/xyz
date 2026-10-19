/**
 * Differential Testing between src/lib/engine.ts and tests/reference.mjs
 * Runs 5,000 randomized test vectors with +/- $1 tolerance within the modeled tax brackets.
 */

import {
  taxableSS as engineTaxableSS,
  calculateTaxableIncome as engineCalculateTaxableIncome,
  federalTax as engineFederalTax,
} from '../src/lib/engine.ts';
import { refRun } from './reference.mjs';

const TOTAL_VECTORS = 5000;
let passed = 0;
let failed = 0;
const failures: Array<{
  index: number;
  inputs: any;
  engine: any;
  ref: any;
  deltas: string[];
}> = [];

// Seeded pseudo-random generator for reproducibility
let seed = 123456789;
function rand(): number {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
}

function randInt(min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

console.log(`Starting Differential Test: ${TOTAL_VECTORS} vectors between engine.ts and reference.mjs...`);

let i = 0;
while (i < TOTAL_VECTORS) {
  const isMFJ = rand() > 0.5;
  const st: 'single' | 'mfj' = isMFJ ? 'mfj' : 'single';
  const n65 = isMFJ ? randInt(0, 2) : randInt(0, 1);

  // ss benefits up to $60k single, $100k mfj
  const ss = randInt(0, isMFJ ? 100000 : 60000);

  // other income within modeled range so taxable income <= cutoff (201775 single / 403550 mfj)
  const maxOther = isMFJ ? 350000 : 160000;
  const other = randInt(0, maxOther);

  // Run reference
  const refOut = refRun({ ss, other, st, n65 });

  // Run engine
  const ssRes = engineTaxableSS({ ss, otherAGI: other, status: st });
  const agi = other + ssRes.taxableSS;

  const incNo = engineCalculateTaxableIncome({
    agi,
    status: st,
    numAgedBlind: n65,
    applySeniorDeduction: false,
  });

  const incWith = engineCalculateTaxableIncome({
    agi,
    status: st,
    numAgedBlind: n65,
    applySeniorDeduction: true,
    numEligibleSenior: n65,
  });

  // Check if within modeled cap (both ref and engine are valid up to cutoff)
  const cutoff = isMFJ ? 403550 : 201775;
  if (incNo.taxableIncome > cutoff) {
    continue; // generate next vector within modeled bounds
  }

  i++;

  const engTaxNo = engineFederalTax(incNo.taxableIncome, st);
  const engTaxWith = engineFederalTax(incWith.taxableIncome, st);

  const engOut = {
    taxableSS: Math.round(ssRes.taxableSS),
    agi: Math.round(agi),
    taxWithoutSeniorDed: engTaxNo,
    taxWithSeniorDed: engTaxWith,
  };

  const deltas: string[] = [];

  if (Math.abs(engOut.taxableSS - refOut.taxableSS) > 1) {
    deltas.push(`taxableSS: eng=${engOut.taxableSS}, ref=${refOut.taxableSS}`);
  }
  if (Math.abs(engOut.agi - refOut.agi) > 1) {
    deltas.push(`agi: eng=${engOut.agi}, ref=${refOut.agi}`);
  }
  if (engOut.taxWithoutSeniorDed === null || Math.abs(engOut.taxWithoutSeniorDed - refOut.taxWithoutSeniorDed) > 1) {
    deltas.push(`taxWithoutSeniorDed: eng=${engOut.taxWithoutSeniorDed}, ref=${refOut.taxWithoutSeniorDed}`);
  }
  if (engOut.taxWithSeniorDed === null || Math.abs(engOut.taxWithSeniorDed - refOut.taxWithSeniorDed) > 1) {
    deltas.push(`taxWithSeniorDed: eng=${engOut.taxWithSeniorDed}, ref=${refOut.taxWithSeniorDed}`);
  }

  if (deltas.length === 0) {
    passed++;
  } else {
    failed++;
    if (failures.length < 10) {
      const prov = other + 0.5 * ss;
      failures.push({
        index: i,
        inputs: { ss, other, st, n65, prov },
        engine: engOut,
        ref: refOut,
        deltas,
      });
    }
  }
}

console.log('-----------------------------------------------------------------------------');
console.log(`Differential Test Results: Passed: ${passed} / ${TOTAL_VECTORS} | Failed: ${failed}`);
console.log('-----------------------------------------------------------------------------');

if (failed > 0) {
  console.error(`FAILED: ${failed} vectors exceeded +/- $1 tolerance.`);
  console.error('First 10 failures:');
  failures.forEach((f, idx) => {
    console.error(`Failure #${idx + 1} (Vector ${f.index}):`);
    console.error(`  Inputs:       st=${f.inputs.st}, ss=${f.inputs.ss}, other=${f.inputs.other}, n65=${f.inputs.n65}, prov=${f.inputs.prov}`);
    console.error(`  Engine:       taxableSS=${f.engine.taxableSS}, agi=${f.engine.agi}, taxNoSenior=${f.engine.taxWithoutSeniorDed}, taxSenior=${f.engine.taxWithSeniorDed}`);
    console.error(`  Reference:    taxableSS=${f.ref.taxableSS}, agi=${f.ref.agi}, taxNoSenior=${f.ref.taxWithoutSeniorDed}, taxSenior=${f.ref.taxWithSeniorDed}`);
    console.error(`  Deltas:       ${f.deltas.join('; ')}`);
  });
  process.exit(1);
} else {
  console.log(`SUCCESS: 5,000 / 5,000 vectors matched within +/- $1 tolerance.`);
}
