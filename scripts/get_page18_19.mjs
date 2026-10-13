import fs from 'fs';
import zlib from 'zlib';

const buf = fs.readFileSync('data/sources/rp-25-32.pdf');
let pos = 0;
let streamIndex = 0;

while (true) {
  const start = buf.indexOf(Buffer.from('stream\r\n'), pos);
  if (start === -1) break;
  const sStart = start + 8;
  const end = buf.indexOf(Buffer.from('\r\nendstream'), sStart);
  if (end === -1) break;
  const slice = buf.subarray(sStart, end);
  try {
    const unzipped = zlib.inflateSync(slice).toString('latin1');
    if (unzipped.includes('.14  Standard Deduction') || unzipped.includes('aged or the blind')) {
      console.log('--- FOUND STREAM index:', streamIndex);
      // Extract text strings
      const tj = unzipped.match(/\((.*?)\)\s*Tj/g) || [];
      console.log(tj.map(s => s.replace(/^\(/, '').replace(/\)\s*Tj$/, '')).join(' '));
    }
  } catch (e) {}
  streamIndex++;
  pos = end + 11;
}
