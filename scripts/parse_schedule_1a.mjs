import fs from 'fs';
import zlib from 'zlib';

const buf = fs.readFileSync('data/sources/f1040s1a.pdf');
let pos = 0;
while (true) {
  const start = buf.indexOf(Buffer.from('stream\r\n'), pos);
  if (start === -1) break;
  const sStart = start + 8;
  const end = buf.indexOf(Buffer.from('\r\nendstream'), sStart);
  if (end === -1) break;
  const slice = buf.subarray(sStart, end);
  try {
    const unzipped = zlib.inflateSync(slice).toString('utf-8');
    if (unzipped.includes('Enhanced Deduction for Seniors')) {
      const regex = /<speak[^>]*>(.*?)<\/speak>/gs;
      let m;
      while ((m = regex.exec(unzipped)) !== null) {
        const text = m[1].replace(/\s+/g, ' ').trim();
        if (text && !text.startsWith('Part I.') && !text.startsWith('Part II.') && !text.startsWith('Part III.') && !text.startsWith('Part IV.')) {
          console.log(text);
        }
      }
    }
  } catch (e) {}
  pos = end + 11;
}
