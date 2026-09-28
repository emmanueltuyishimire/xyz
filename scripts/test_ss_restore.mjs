import fs from 'fs';

// Map of CP1252 extended characters back to byte values
const cp1252Map = {
  0x20ac: 0x80, // €
  0x201a: 0x82, // ‚
  0x0192: 0x83, // ƒ
  0x201e: 0x84, // „
  0x2026: 0x85, // …
  0x2020: 0x86, // †
  0x2021: 0x87, // ‡
  0x02c6: 0x88, // ˆ
  0x2030: 0x89, // ‰
  0x0160: 0x8a, // Š
  0x2039: 0x8b, // ‹
  0x0152: 0x8c, // Œ
  0x017d: 0x8e, // Ž
  0x2018: 0x91, // ‘
  0x2019: 0x92, // ’
  0x201c: 0x93, // “
  0x201d: 0x94, // ”
  0x2022: 0x95, // •
  0x2013: 0x96, // –
  0x2014: 0x97, // —
  0x02dc: 0x98, // ˜
  0x2122: 0x99, // ™
  0x0161: 0x9a, // š
  0x203a: 0x9b, // ›
  0x0153: 0x9c, // œ
  0x017e: 0x9e, // ž
  0x0178: 0x9f, // Ÿ
};

function restoreMojibake(content) {
  // Common specific replacements for double-encoded sequences
  // Let's replace well-known mojibake patterns directly for 100% precision
  const directReplacements = [
    // Em dash, en dash, quotes
    [/â€”/g, '—'],
    [/â€“/g, '–'],
    [/â€œ/g, '"'],
    [/â€\u009d/g, '"'],
    [/â€\u009c/g, '"'],
    [/â€/g, '"'],
    [/â€˜/g, "'"],
    [/â€™/g, "'"],
    [/â€¢/g, '•'],
    [/â€¦/g, '…'],
    [/â€º/g, '›'],
    [/â€¹/g, '‹'],
    [/Â·/g, '·'],
    [/Â /g, ' '],
    [/Â©/g, '©'],
    [/Â®/g, '®'],
    [/Â°/g, '°'],
    [/Â±/g, '±'],
    [/â†’/g, '→'],
    [/â†/g, '←'],
    [/â‰ˆ/g, '≈'],
    [/â‰¥/g, '≥'],
    [/â‰¤/g, '≤'],
    [/âˆ’/g, '−'],
    [/âœ”/g, '✔'],
    [/âœ”/g, '✔'],
    [/âœ…/g, '✅'],
    [/â Œ/g, '❌'],
    [/âš ï¸ /g, '⚠️'],
    [/âš /g, '⚠️'],
    [/âœ ï¸ /g, '✏️'],
    [/âž¡ï¸ /g, '➡️'],
    [/âž¡/g, '➡️'],
    [/â”€/g, '─'],
    [/â• /g, '═'],
    [/â™¿/g, '♿'],
    [/ðŸ• /g, '🕐'],
    [/ðŸ’µ/g, '💵'],
    [/ðŸ‘«/g, '👫'],
    [/ðŸ’¼/g, '💼'],
    [/ðŸ“Š/g, '📊'],
    [/ðŸ”/g, '🔍'],
    [/ðŸ“‹/g, '📋'],
    [/ðŸ“œ/g, '📜'],
    [/ðŸ’¡/g, '💡'],
    [/ðŸ“±/g, '📱'],
    [/ðŸŒ/g, '🌐'],
    [/ðŸ’¬/g, '💬'],
    [/ðŸ“§/g, '📧'],
    [/ðŸ“ž/g, '📞'],
    [/ðŸ“Œ/g, '📌'],
    [/ðŸ“…/g, '📅'],
    [/ðŸ—“ï¸ /g, '🗓️'],
    [/ðŸ—“/g, '🗓️'],
    [/ðŸ”’/g, '🔒'],
    [/ðŸ”“/g, '🔓'],
    [/ðŸ§‘â€âš•ï¸ /g, '🧑‍⚕️'],
    [/ðŸ¥/g, '🏥'],
    [/ðŸ’Š/g, '💊'],
    [/ðŸ‘¨â€ðŸ‘©â€ðŸ‘§â€ðŸ‘¦/g, '👨‍👩‍👧‍👦'],
    [/ðŸ /g, '🏠'],
    [/ðŸ“£/g, '📢'],
    [/ðŸ”§/g, '🔧'],
    [/ðŸ›¡ï¸ /g, '🛡️'],
    [/ðŸ›¡/g, '🛡️'],
  ];

  let res = content;
  for (const [pattern, repl] of directReplacements) {
    res = res.replace(pattern, repl);
  }
  return res;
}

// Test on social-security/index.astro
const filePath = 'src/pages/social-security/index.astro';
const raw = fs.readFileSync(filePath, 'utf8');
const cleaned = restoreMojibake(raw);

// Check remaining â or ð
const remaining = cleaned.match(/[âð]/g);
console.log('Remaining â or ð in social-security/index.astro:', remaining ? remaining.length : 0);
if (remaining) {
  const sample = cleaned.split('\n').filter(l => l.match(/[âð]/));
  console.log('Remaining sample lines (first 5):', sample.slice(0, 5));
}
