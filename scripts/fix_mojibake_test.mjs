// CP1252 mapping for characters 0x80 - 0x9F
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

function fixMojibake(str) {
  const bytes = [];
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code < 128) {
      bytes.push(code);
    } else if (code in cp1252Map) {
      bytes.push(cp1252Map[code]);
    } else if (code <= 255) {
      bytes.push(code);
    } else {
      // Unmapped character (e.g. already decoded UTF-8 or other Unicode)
      // Represent as UTF-8 bytes so it's not destroyed
      const charBuf = Buffer.from(str[i], 'utf8');
      for (const b of charBuf) bytes.push(b);
    }
  }
  return Buffer.from(bytes).toString('utf8');
}

const tests = [
  'â€”', // em dash —
  'â†’', // arrow →
  'â‰ˆ', // approx ≈
  'âˆ’', // minus −
  'ðŸ• ', // clock 🕐
  'ðŸ’µ', // dollar 💵
  'ðŸ‘«', // couple 👫
  'ðŸ’¼', // briefcase 💼
  'â™¿', // wheelchair ♿
  'ðŸ“Š', // chart 📊
  'What decision are you facing today?',
];

for (const t of tests) {
  console.log(t, '===>', fixMojibake(t));
}
