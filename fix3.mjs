import { readFileSync, writeFileSync } from 'fs';

// The file contains Windows-1252 mojibake stored as valid UTF-8 codepoints.
// Strategy: convert each char back to its Windows-1252 byte value, 
// then decode the resulting byte sequence as UTF-8.

// Windows-1252 to Unicode mapping for the special 0x80-0x9F range
const win1252Map = {
  0x80: 0x20AC, // €
  0x82: 0x201A, // ‚
  0x83: 0x0192, // ƒ
  0x84: 0x201E, // „
  0x85: 0x2026, // …
  0x86: 0x2020, // †
  0x87: 0x2021, // ‡
  0x88: 0x02C6, // ˆ
  0x89: 0x2030, // ‰
  0x8A: 0x0160, // Š
  0x8B: 0x2039, // ‹
  0x8C: 0x0152, // Œ
  0x8E: 0x017D, // Ž
  0x91: 0x2018, // '
  0x92: 0x2019, // '
  0x93: 0x201C, // "
  0x94: 0x201D, // "
  0x95: 0x2022, // •
  0x96: 0x2013, // –
  0x97: 0x2014, // —
  0x98: 0x02DC, // ˜
  0x99: 0x2122, // ™
  0x9A: 0x0161, // š
  0x9B: 0x203A, // ›
  0x9C: 0x0153, // œ
  0x9E: 0x017E, // ž
  0x9F: 0x0178, // Ÿ
};

// Reverse map: Unicode codepoint -> Windows-1252 byte
const reverseMap = {};
for (const [byte, cp] of Object.entries(win1252Map)) {
  reverseMap[cp] = parseInt(byte);
}
// Also add direct Latin-1 mappings for 0xA0-0xFF
for (let i = 0xA0; i <= 0xFF; i++) {
  reverseMap[i] = i;
}
// And plain ASCII
for (let i = 0x00; i <= 0x7F; i++) {
  reverseMap[i] = i;
}

const content = readFileSync('src/components/NeighborhoodMap.tsx', 'utf8');

// Convert string to Windows-1252 bytes then re-decode as UTF-8
const chars = [...content]; // spread handles surrogate pairs
const bytes = [];
let canConvert = true;

for (const ch of chars) {
  const cp = ch.codePointAt(0);
  if (cp in reverseMap) {
    bytes.push(reverseMap[cp]);
  } else if (cp <= 0x7F) {
    bytes.push(cp);
  } else {
    // Can't map - keep as-is by encoding as UTF-8
    const encoded = Buffer.from(ch, 'utf8');
    for (const b of encoded) bytes.push(b);
  }
}

const buf = Buffer.from(bytes);

// Try to decode as UTF-8
try {
  const fixed = buf.toString('utf8');
  writeFileSync('src/components/NeighborhoodMap.tsx', fixed, 'utf8');
  console.log('Done! Saved fixed file.');
  
  // Verify line 27
  const lines = fixed.split('\n');
  console.log('Line 27:', lines[26]);
  
  // Count broken sequences remaining
  const broken = (fixed.match(/\u00f0\u0178/g) || []).length;
  console.log('Remaining broken sequences:', broken);
} catch(e) {
  console.error('UTF-8 decode failed:', e.message);
  // Save partial info
  console.log('First 20 bytes:', buf.slice(0, 20).toString('hex'));
}
