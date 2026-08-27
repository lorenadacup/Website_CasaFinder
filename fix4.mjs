import { readFileSync, writeFileSync } from 'fs';

// Windows-1252 special chars (0x80-0x9F range) -> their Unicode codepoints
const win1252Special = {
  0x80: 0x20AC, 0x82: 0x201A, 0x83: 0x0192, 0x84: 0x201E,
  0x85: 0x2026, 0x86: 0x2020, 0x87: 0x2021, 0x88: 0x02C6,
  0x89: 0x2030, 0x8A: 0x0160, 0x8B: 0x2039, 0x8C: 0x0152,
  0x8E: 0x017D, 0x91: 0x2018, 0x92: 0x2019, 0x93: 0x201C,
  0x94: 0x201D, 0x95: 0x2022, 0x96: 0x2013, 0x97: 0x2014,
  0x98: 0x02DC, 0x99: 0x2122, 0x9A: 0x0161, 0x9B: 0x203A,
  0x9C: 0x0153, 0x9E: 0x017E, 0x9F: 0x0178,
};

// Build reverse: Unicode cp -> byte value
const cpToByte = new Map();
for (const [byte, cp] of Object.entries(win1252Special)) {
  cpToByte.set(cp, parseInt(byte));
}
// Latin-1 supplement 0xA0-0xFF maps directly
for (let b = 0xA0; b <= 0xFF; b++) cpToByte.set(b, b);
// ASCII 0x00-0x7F maps directly  
for (let b = 0x00; b <= 0x7F; b++) cpToByte.set(b, b);

const content = readFileSync('src/components/NeighborhoodMap.tsx', 'utf8');

const bytes = [];
let pos = 0;
while (pos < content.length) {
  const cp = content.codePointAt(pos);
  const charLen = cp > 0xFFFF ? 2 : 1; // surrogate pair check
  
  if (cpToByte.has(cp)) {
    bytes.push(cpToByte.get(cp));
  } else {
    // Character not in Windows-1252 — encode as UTF-8 bytes directly
    // (this handles actual emoji that were already correct)
    const encoded = Buffer.from(String.fromCodePoint(cp), 'utf8');
    for (const b of encoded) bytes.push(b);
  }
  pos += charLen;
}

const buf = Buffer.from(bytes);

try {
  const fixed = buf.toString('utf8');
  
  // Sanity check: make sure we have proper emojis now
  const hasPinEmoji = fixed.includes('📍');
  const hasGradEmoji = fixed.includes('🎓');
  const hasPhp = fixed.includes('₱');
  console.log('Has 📍:', hasPinEmoji);
  console.log('Has 🎓:', hasGradEmoji);
  console.log('Has ₱:', hasPhp);
  
  if (hasPinEmoji && hasGradEmoji) {
    writeFileSync('src/components/NeighborhoodMap.tsx', fixed, 'utf8');
    console.log('SUCCESS! File saved.');
    const lines = fixed.split('\n');
    console.log('Line 27:', lines[26]);
  } else {
    console.log('Emojis not found after fix, aborting save.');
    // Show what we got instead
    const idx = fixed.indexOf('Brgy. Tabing Dagat');
    console.log('Around line:', fixed.slice(idx - 15, idx + 30));
  }
} catch(e) {
  console.error('UTF-8 decode error:', e.message);
  // Show problematic bytes
  for (let i = 0; i < bytes.length && i < 2000; i++) {
    if (bytes[i] > 0x7F) {
      console.log(`Byte at ${i}: 0x${bytes[i].toString(16)} (previous: 0x${bytes[i-1]?.toString(16)})`);
    }
  }
}
