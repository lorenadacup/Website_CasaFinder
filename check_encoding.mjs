import { readFileSync } from 'fs';
const raw = readFileSync('src/components/NeighborhoodMap.tsx');
// Find the first emoji area - search for the GUMACA_LANDMARKS section
const str = raw.toString('utf8');
const idx = str.indexOf('Brgy. Tabing Dagat');
const snippet = str.slice(idx - 10, idx + 40);
console.log('Around "Brgy. Tabing Dagat":', JSON.stringify(snippet));
// Also check for any 0xc3 0xb1 sequence which is UTF-8 for ñ (correct)
// vs 0xc3 0x83 0xc2 0xb1 which is double-encoded
const buf = raw.slice(idx - 10, idx + 40);
console.log('Raw hex:', buf.toString('hex').match(/.{1,2}/g).join(' '));
